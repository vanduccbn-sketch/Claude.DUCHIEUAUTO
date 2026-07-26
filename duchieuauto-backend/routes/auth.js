const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcryptjs"); // JS thuần, không cần biên dịch native (xem models/db.js)
const jwt = require("jsonwebtoken");
const db = require("../models/db");
const { requireRole } = require("../middleware/auth");
const { sendMail } = require("../utils/mailer");

const router = express.Router();

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 giờ

function hashToken(token) {
    // Token reset là chuỗi ngẫu nhiên 256-bit, chỉ dùng 1 lần trong thời gian ngắn - băm nhanh
    // bằng sha256 là đủ an toàn (khác mật khẩu - không cần băm chậm chống brute-force vì token
    // dài/ngẫu nhiên hơn nhiều so với mật khẩu người dùng tự đặt).
    return crypto.createHash("sha256").update(token).digest("hex");
}

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

// GET /api/auth/me - thông tin tài khoản đang đăng nhập (mọi vai trò, chỉ xem được của chính mình)
router.get("/me", requireRole(), async (req, res) => {
    const admin = await db.prepare("SELECT id, username, email, role, created_at FROM admins WHERE id = ?").get(req.admin.id);
    if (!admin) return res.status(404).json({ error: "Không tìm thấy tài khoản" });
    res.json(admin);
});

// PUT /api/auth/my-email - admin tự cập nhật email của chính mình (dùng để nhận link quên mật
// khẩu) - tách riêng khỏi /api/admins vì route đó chỉ super_admin dùng được, còn đây mọi vai trò
// đều cần để tự thiết lập email của mình.
router.put("/my-email", requireRole(), async (req, res) => {
    const { email } = req.body;
    await db.prepare("UPDATE admins SET email = ? WHERE id = ?").run(email || null, req.admin.id);
    await db.logActivity(req.admin, "update_own_email", null);
    res.json({ ok: true });
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

// POST /api/auth/forgot-password - public, gửi email đặt lại mật khẩu nếu tài khoản tồn tại và
// có email. LUÔN trả lời chung chung (không tiết lộ tài khoản/email có tồn tại hay không) - tránh
// lộ thông tin cho người dò quét username.
router.post("/forgot-password", async (req, res) => {
    const { username } = req.body;
    const genericMessage = { message: "Nếu tài khoản tồn tại và có email, hướng dẫn đặt lại mật khẩu đã được gửi." };

    if (!username) return res.json(genericMessage);

    const admin = await db.prepare("SELECT * FROM admins WHERE username = ? OR email = ?").get(username, username);
    if (!admin || !admin.email) return res.json(genericMessage);

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + RESET_TOKEN_TTL_MS).toISOString();
    await db.prepare("UPDATE admins SET reset_token = ?, reset_token_expires = ? WHERE id = ?")
        .run(hashToken(token), expires, admin.id);

    const resetUrl = `${process.env.ADMIN_BASE_URL || ""}/admin/dat-lai-mat-khau.html?token=${token}`;
    try {
        await sendMail({
            to: admin.email,
            subject: "Đặt lại mật khẩu - Đức Hiếu Auto Admin",
            text: `Xin chào ${admin.username},\n\nCó yêu cầu đặt lại mật khẩu cho tài khoản admin của bạn. Bấm vào link sau (hết hạn sau 1 giờ):\n${resetUrl}\n\nNếu không phải bạn yêu cầu, hãy bỏ qua email này.`,
            html: `<p>Xin chào <strong>${admin.username}</strong>,</p><p>Có yêu cầu đặt lại mật khẩu cho tài khoản admin của bạn. Bấm vào link sau (hết hạn sau 1 giờ):</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>Nếu không phải bạn yêu cầu, hãy bỏ qua email này.</p>`
        });
    } catch (err) {
        console.error("Gửi email đặt lại mật khẩu thất bại:", err.message);
        // Vẫn trả lời chung chung như bình thường - không lộ lỗi kỹ thuật ra ngoài cho client.
    }

    res.json(genericMessage);
});

// POST /api/auth/reset-password - public, đặt mật khẩu mới bằng token nhận qua email
router.post("/reset-password", async (req, res) => {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
        return res.status(400).json({ error: "Thiếu token hoặc mật khẩu mới" });
    }
    if (newPassword.length < 8) {
        return res.status(400).json({ error: "Mật khẩu mới phải có ít nhất 8 ký tự" });
    }

    const admin = await db.prepare("SELECT * FROM admins WHERE reset_token = ?").get(hashToken(token));
    if (!admin || !admin.reset_token_expires || new Date(admin.reset_token_expires) < new Date()) {
        return res.status(400).json({ error: "Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn" });
    }

    const newHash = bcrypt.hashSync(newPassword, 12);
    await db.prepare("UPDATE admins SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?")
        .run(newHash, admin.id);
    await db.logActivity(admin, "reset_password_via_email", null);
    res.json({ ok: true });
});

module.exports = router;
