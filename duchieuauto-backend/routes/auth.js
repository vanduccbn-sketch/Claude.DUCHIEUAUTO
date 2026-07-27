const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcryptjs"); // JS thuần, không cần biên dịch native (xem models/db.js)
const jwt = require("jsonwebtoken");
const db = require("../models/db");
const { requireRole } = require("../middleware/auth");
const { sendEmail } = require("../utils/mailer");

const router = express.Router();

// Chặn brute-force đơn giản (theo IP, lưu tạm trong bộ nhớ). Đây chỉ là lớp bảo vệ tối thiểu
// cho Phase 3 - Phase 6 nên thay bằng express-rate-limit + lưu trữ bền vững (Redis/DB) vì bộ
// nhớ này sẽ mất khi server restart và không dùng được khi chạy nhiều instance.
const failedAttempts = new Map(); // ip -> { count, lockedUntil }
const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const ip = req.ip;

    if (!username || !password) {
        return res.status(400).json({ error: "Thiếu username hoặc password" });
    }

    const record = failedAttempts.get(ip);
    if (record && record.lockedUntil && record.lockedUntil > Date.now()) {
        const minutesLeft = Math.ceil((record.lockedUntil - Date.now()) / 60000);
        return res.status(429).json({ error: `Đăng nhập sai quá nhiều lần, thử lại sau ${minutesLeft} phút` });
    }

    const admin = await db.prepare("SELECT * FROM admins WHERE username = ?").get(username);
    const passwordOk = admin && bcrypt.compareSync(password, admin.password_hash);

    if (!passwordOk) {
        const current = failedAttempts.get(ip) || { count: 0 };
        current.count += 1;
        if (current.count >= MAX_ATTEMPTS) {
            current.lockedUntil = Date.now() + LOCK_MINUTES * 60000;
            current.count = 0;
        }
        failedAttempts.set(ip, current);
        return res.status(401).json({ error: "Sai tên đăng nhập hoặc mật khẩu" });
    }

    failedAttempts.delete(ip);

    const token = jwt.sign(
        { id: admin.id, username: admin.username, role: admin.role },
        process.env.JWT_SECRET,
        { expiresIn: "8h" }
    );

    res.json({ token, id: admin.id, username: admin.username, role: admin.role });
});

// PUT /api/auth/change-password - admin tự đổi mật khẩu của chính mình, cần đúng mật khẩu hiện tại
router.put("/change-password", requireRole(), async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: "Thiếu mật khẩu hiện tại hoặc mật khẩu mới" });
    }
    if (newPassword.length < 8) {
        return res.status(400).json({ error: "Mật khẩu mới phải có ít nhất 8 ký tự" });
    }

    const admin = await db.prepare("SELECT * FROM admins WHERE id = ?").get(req.admin.id);
    if (!bcrypt.compareSync(currentPassword, admin.password_hash)) {
        return res.status(401).json({ error: "Mật khẩu hiện tại không đúng" });
    }

    const newHash = bcrypt.hashSync(newPassword, 12);
    await db.prepare("UPDATE admins SET password_hash = ? WHERE id = ?").run(newHash, admin.id);
    await db.logActivity(req.admin, "change_own_password", null);
    res.json({ ok: true });
});

// GET /api/auth/me - thông tin tài khoản đang đăng nhập (JWT không mang theo email nên cần route
// riêng để trang "Tài Khoản" hiển thị email hiện tại)
router.get("/me", requireRole(), async (req, res) => {
    const admin = await db.prepare("SELECT id, username, role, email FROM admins WHERE id = ?").get(req.admin.id);
    if (!admin) return res.status(404).json({ error: "Không tìm thấy tài khoản" });
    res.json(admin);
});

// PUT /api/auth/my-email - admin tự đặt/đổi email của chính mình (dùng để nhận email quên mật
// khẩu sau này) - không cần super_admin vì đây là dữ liệu của chính họ
router.put("/my-email", requireRole(), async (req, res) => {
    const { email } = req.body;
    await db.prepare("UPDATE admins SET email = ? WHERE id = ?").run(email || null, req.admin.id);
    await db.logActivity(req.admin, "update_own_email", null);
    res.json({ ok: true });
});

// Quên mật khẩu qua email: bản cũ dùng Gmail SMTP bị Render free tier chặn hết kết nối đi ra
// ngoài (đã thử cổng 465/587, ép IPv4, vẫn "Connection timeout" ở tầng mạng, không phải lỗi cấu
// hình) nên đã gỡ bỏ. Bản này dùng Resend (HTTPS API bình thường, không bị chặn) - xem
// utils/mailer.js. Nếu admin không có email hoặc RESEND_API_KEY chưa cấu hình, vẫn còn cách dự
// phòng: Super Admin tự đặt lại mật khẩu trực tiếp qua trang "Tài Khoản"
// (PUT /api/admins/:id/reset-password).

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 giờ

function hashToken(rawToken) {
    return crypto.createHash("sha256").update(rawToken).digest("hex");
}

// POST /api/auth/forgot-password - gửi email chứa link đặt lại mật khẩu nếu email khớp 1 tài khoản
router.post("/forgot-password", async (req, res) => {
    const { email } = req.body;
    // Luôn trả cùng 1 thông báo dù email có tồn tại hay không, để không lộ danh sách tài khoản/
    // email nào đang được dùng trong hệ thống (tránh dò email hợp lệ - user enumeration).
    const genericMessage = "Nếu email này khớp với 1 tài khoản, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu.";

    if (!email) {
        return res.status(400).json({ error: "Thiếu email" });
    }

    const admin = await db.prepare("SELECT * FROM admins WHERE email = ?").get(email);
    if (admin) {
        const rawToken = crypto.randomBytes(32).toString("hex");
        const expires = new Date(Date.now() + RESET_TOKEN_TTL_MS).toISOString();
        await db.prepare("UPDATE admins SET reset_token = ?, reset_token_expires = ? WHERE id = ?")
            .run(hashToken(rawToken), expires, admin.id);

        const resetUrl = `${process.env.ADMIN_BASE_URL || "http://localhost:4000"}/dat-lai-mat-khau.html?token=${rawToken}`;
        await sendEmail({
            to: admin.email,
            subject: "Đặt lại mật khẩu quản trị Đức Hiếu Auto",
            html: `
                <p>Xin chào ${admin.username},</p>
                <p>Có yêu cầu đặt lại mật khẩu cho tài khoản quản trị của bạn. Nhấn vào link bên dưới để đặt mật khẩu mới (link có hiệu lực trong 1 giờ):</p>
                <p><a href="${resetUrl}">${resetUrl}</a></p>
                <p>Nếu bạn không yêu cầu việc này, hãy bỏ qua email này - mật khẩu của bạn vẫn an toàn.</p>
            `
        });
    }

    res.json({ ok: true, message: genericMessage });
});

// POST /api/auth/reset-password - đặt mật khẩu mới bằng token nhận từ email
router.post("/reset-password", async (req, res) => {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
        return res.status(400).json({ error: "Thiếu token hoặc mật khẩu mới" });
    }
    if (newPassword.length < 8) {
        return res.status(400).json({ error: "Mật khẩu mới phải có ít nhất 8 ký tự" });
    }

    const admin = await db.prepare("SELECT * FROM admins WHERE reset_token = ?").get(hashToken(token));
    if (!admin || !admin.reset_token_expires || new Date(admin.reset_token_expires).getTime() < Date.now()) {
        return res.status(400).json({ error: "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn" });
    }

    const newHash = bcrypt.hashSync(newPassword, 12);
    await db.prepare("UPDATE admins SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?")
        .run(newHash, admin.id);
    await db.logActivity(admin, "reset_own_password_via_email", null);

    res.json({ ok: true });
});

module.exports = router;
