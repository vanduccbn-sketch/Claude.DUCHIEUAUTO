const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../models/db");
const { requireRole } = require("../middleware/auth");

const router = express.Router();

// Toàn bộ route trong file này chỉ super_admin được dùng - đúng yêu cầu "super admin có thêm
// phân quyền cho các admin khác", các vai trò khác (content/ads) không được xem/sửa tài khoản
// người khác, chỉ tự đổi mật khẩu của mình qua PUT /api/auth/change-password.
router.use(requireRole("super_admin"));

const VALID_ROLES = ["content", "ads", "super_admin"];

function publicAdmin(a) {
    // Không bao giờ trả password_hash/reset_token ra ngoài dù chỉ cho super_admin.
    return { id: a.id, username: a.username, email: a.email, role: a.role, created_at: a.created_at };
}

// GET /api/admins - danh sách toàn bộ tài khoản admin
router.get("/", async (req, res) => {
    const admins = await db.prepare("SELECT * FROM admins ORDER BY created_at").all();
    res.json(admins.map(publicAdmin));
});

// POST /api/admins - tạo tài khoản admin mới
router.post("/", async (req, res) => {
    const { username, email, password, role } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Thiếu username hoặc password" });
    if (password.length < 8) return res.status(400).json({ error: "Mật khẩu phải có ít nhất 8 ký tự" });
    if (role && !VALID_ROLES.includes(role)) return res.status(400).json({ error: "Vai trò không hợp lệ" });

    const exists = await db.prepare("SELECT id FROM admins WHERE username = ?").get(username);
    if (exists) return res.status(400).json({ error: "Tên đăng nhập đã tồn tại" });

    const hash = bcrypt.hashSync(password, 12);
    const info = await db.prepare(
        "INSERT INTO admins (username, password_hash, role, email) VALUES (?, ?, ?, ?)"
    ).run(username, hash, role || "content", email || null);

    await db.logActivity(req.admin, "create_admin", `admin:${username}`);
    res.status(201).json({ id: info.lastInsertRowid });
});

// PUT /api/admins/:id - sửa email/role của 1 tài khoản
router.put("/:id", async (req, res) => {
    const existing = await db.prepare("SELECT * FROM admins WHERE id = ?").get(req.params.id);
    if (!existing) return res.status(404).json({ error: "Không tìm thấy tài khoản" });

    const { role, email } = req.body;
    if (role && !VALID_ROLES.includes(role)) return res.status(400).json({ error: "Vai trò không hợp lệ" });

    // Không cho tự hạ quyền/đổi quyền chính mình qua trang này để tránh tự khoá mình khỏi quyền
    // super_admin trong lúc thao tác nhầm - muốn đổi vai trò bản thân phải nhờ super_admin khác.
    if (Number(req.params.id) === req.admin.id && role && role !== "super_admin") {
        return res.status(400).json({ error: "Không thể tự hạ quyền của chính mình" });
    }

    // Không cho hạ quyền super_admin cuối cùng xuống vai trò khác (tránh hệ thống mất hết
    // super_admin, không ai còn quyền quản lý tài khoản).
    if (existing.role === "super_admin" && role && role !== "super_admin") {
        const superAdminCount = (await db.prepare("SELECT COUNT(*) as c FROM admins WHERE role = 'super_admin'").get()).c;
        if (superAdminCount <= 1) {
            return res.status(400).json({ error: "Không thể hạ quyền super_admin cuối cùng trong hệ thống" });
        }
    }

    const merged = {
        role: role || existing.role,
        email: email !== undefined ? email : existing.email,
        id: existing.id
    };
    await db.prepare("UPDATE admins SET role = @role, email = @email WHERE id = @id").run(merged);

    await db.logActivity(req.admin, "update_admin", `admin:${existing.username}`);
    res.json({ ok: true });
});

// PUT /api/admins/:id/reset-password - super_admin đặt mật khẩu mới trực tiếp cho 1 tài khoản
// (không cần biết mật khẩu cũ) - dùng khi nhân viên quên mật khẩu và không nhận được/không có
// email khôi phục, hoặc cần cấp lại nhanh.
router.put("/:id/reset-password", async (req, res) => {
    const existing = await db.prepare("SELECT * FROM admins WHERE id = ?").get(req.params.id);
    if (!existing) return res.status(404).json({ error: "Không tìm thấy tài khoản" });

    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 8) {
        return res.status(400).json({ error: "Mật khẩu mới phải có ít nhất 8 ký tự" });
    }

    const hash = bcrypt.hashSync(newPassword, 12);
    await db.prepare("UPDATE admins SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?")
        .run(hash, existing.id);

    await db.logActivity(req.admin, "reset_admin_password", `admin:${existing.username}`);
    res.json({ ok: true });
});

// DELETE /api/admins/:id - xoá tài khoản admin
router.delete("/:id", async (req, res) => {
    const existing = await db.prepare("SELECT * FROM admins WHERE id = ?").get(req.params.id);
    if (!existing) return res.status(404).json({ error: "Không tìm thấy tài khoản" });

    if (Number(req.params.id) === req.admin.id) {
        return res.status(400).json({ error: "Không thể tự xoá tài khoản đang đăng nhập" });
    }
    if (existing.role === "super_admin") {
        const superAdminCount = (await db.prepare("SELECT COUNT(*) as c FROM admins WHERE role = 'super_admin'").get()).c;
        if (superAdminCount <= 1) {
            return res.status(400).json({ error: "Không thể xoá super_admin cuối cùng trong hệ thống" });
        }
    }

    await db.prepare("DELETE FROM admins WHERE id = ?").run(existing.id);
    await db.logActivity(req.admin, "delete_admin", `admin:${existing.username}`);
    res.json({ ok: true });
});

module.exports = router;
