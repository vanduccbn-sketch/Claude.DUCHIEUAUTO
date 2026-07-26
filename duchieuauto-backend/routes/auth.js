const express = require("express");
const bcrypt = require("bcryptjs"); // JS thuần, không cần biên dịch native (xem models/db.js)
const jwt = require("jsonwebtoken");
const db = require("../models/db");
const { requireRole } = require("../middleware/auth");

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

// Quên mật khẩu: KHÔNG gửi email tự động (Render free tier chặn hết kết nối SMTP đi ra ngoài -
// đã thử cổng 465/587, ép IPv4, vẫn "Connection timeout" ở tầng mạng, không phải lỗi cấu hình).
// Thay vào đó dùng cách đơn giản: Super Admin tự đặt lại mật khẩu trực tiếp cho tài khoản bị quên
// qua trang "Tài Khoản" (xem PUT /api/admins/:id/reset-password) - không phụ thuộc email.

module.exports = router;
