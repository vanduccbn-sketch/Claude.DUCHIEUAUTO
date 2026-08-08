/**
 * Port từ duchieuauto-backend/routes/admins.js sang Hono (Phase 13). Giữ nguyên 100% logic phân
 * quyền/validation - chỉ đổi cú pháp req/res -> c, và bcrypt cost 12 -> 10 (xem giải thích trong
 * routes/auth.js cùng thư mục).
 */
import { Hono } from "hono";
import bcrypt from "bcryptjs";
import { requireRole } from "../middleware/auth.js";

const BCRYPT_COST = 10;
const VALID_ROLES = ["content", "ads", "super_admin"];
const CONTENT_SECTIONS = ["hero", "about", "service", "quick_actions", "product", "tech", "contact", "footer", "other_pages"];

const app = new Hono();

// Toàn bộ route trong file này chỉ super_admin được dùng.
app.use("*", ...requireRole("super_admin"));

function publicAdmin(a) {
    return { id: a.id, username: a.username, email: a.email, role: a.role, created_at: a.created_at };
}

app.get("/", async (c) => {
    const db = c.get("db");
    const admins = await db.prepare("SELECT * FROM admins ORDER BY created_at").all();
    return c.json(admins.map(publicAdmin));
});

app.post("/", async (c) => {
    const { username, email, password, role } = await c.req.json();
    if (!username || !password) return c.json({ error: "Thiếu username hoặc password" }, 400);
    if (password.length < 8) return c.json({ error: "Mật khẩu phải có ít nhất 8 ký tự" }, 400);
    if (role && !VALID_ROLES.includes(role)) return c.json({ error: "Vai trò không hợp lệ" }, 400);

    const db = c.get("db");
    const exists = await db.prepare("SELECT id FROM admins WHERE username = ?").get(username);
    if (exists) return c.json({ error: "Tên đăng nhập đã tồn tại" }, 400);

    const hash = bcrypt.hashSync(password, BCRYPT_COST);
    const info = await db.prepare(
        "INSERT INTO admins (username, password_hash, role, email) VALUES (?, ?, ?, ?)"
    ).run(username, hash, role || "content", email || null);

    await db.logActivity(c.get("admin"), "create_admin", `admin:${username}`);
    return c.json({ id: info.lastInsertRowid }, 201);
});

app.put("/:id", async (c) => {
    const id = c.req.param("id");
    const db = c.get("db");
    const existing = await db.prepare("SELECT * FROM admins WHERE id = ?").get(id);
    if (!existing) return c.json({ error: "Không tìm thấy tài khoản" }, 404);

    const { role, email } = await c.req.json();
    if (role && !VALID_ROLES.includes(role)) return c.json({ error: "Vai trò không hợp lệ" }, 400);

    const currentAdmin = c.get("admin");
    if (Number(id) === currentAdmin.id && role && role !== "super_admin") {
        return c.json({ error: "Không thể tự hạ quyền của chính mình" }, 400);
    }

    if (existing.role === "super_admin" && role && role !== "super_admin") {
        const superAdminCount = (await db.prepare("SELECT COUNT(*) as c FROM admins WHERE role = 'super_admin'").get()).c;
        if (superAdminCount <= 1) {
            return c.json({ error: "Không thể hạ quyền super_admin cuối cùng trong hệ thống" }, 400);
        }
    }

    const merged = {
        role: role || existing.role,
        email: email !== undefined ? email : existing.email,
        id: existing.id
    };
    await db.prepare("UPDATE admins SET role = @role, email = @email WHERE id = @id").run(merged);

    await db.logActivity(currentAdmin, "update_admin", `admin:${existing.username}`);
    return c.json({ ok: true });
});

app.put("/:id/reset-password", async (c) => {
    const id = c.req.param("id");
    const db = c.get("db");
    const existing = await db.prepare("SELECT * FROM admins WHERE id = ?").get(id);
    if (!existing) return c.json({ error: "Không tìm thấy tài khoản" }, 404);

    const { newPassword } = await c.req.json();
    if (!newPassword || newPassword.length < 8) {
        return c.json({ error: "Mật khẩu mới phải có ít nhất 8 ký tự" }, 400);
    }

    const hash = bcrypt.hashSync(newPassword, BCRYPT_COST);
    await db.prepare("UPDATE admins SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?")
        .run(hash, existing.id);

    await db.logActivity(c.get("admin"), "reset_admin_password", `admin:${existing.username}`);
    return c.json({ ok: true });
});

app.get("/:id/content-permissions", async (c) => {
    const db = c.get("db");
    const rows = await db.prepare("SELECT section FROM content_permissions WHERE admin_id = ?").all(c.req.param("id"));
    return c.json({ sections: rows.map(r => r.section) });
});

app.put("/:id/content-permissions", async (c) => {
    const id = c.req.param("id");
    const db = c.get("db");
    const existing = await db.prepare("SELECT * FROM admins WHERE id = ?").get(id);
    if (!existing) return c.json({ error: "Không tìm thấy tài khoản" }, 404);

    const body = await c.req.json();
    const sections = Array.isArray(body.sections) ? body.sections : [];
    const invalid = sections.filter(s => !CONTENT_SECTIONS.includes(s));
    if (invalid.length > 0) return c.json({ error: `Khối không hợp lệ: ${invalid.join(", ")}` }, 400);

    await db.prepare("DELETE FROM content_permissions WHERE admin_id = ?").run(existing.id);
    const insert = db.prepare("INSERT INTO content_permissions (admin_id, section) VALUES (?, ?)");
    for (const section of sections) {
        await insert.run(existing.id, section);
    }

    await db.logActivity(c.get("admin"), "update_content_permissions", `admin:${existing.username}`);
    return c.json({ ok: true });
});

app.delete("/:id", async (c) => {
    const id = c.req.param("id");
    const db = c.get("db");
    const existing = await db.prepare("SELECT * FROM admins WHERE id = ?").get(id);
    if (!existing) return c.json({ error: "Không tìm thấy tài khoản" }, 404);

    const currentAdmin = c.get("admin");
    if (Number(id) === currentAdmin.id) {
        return c.json({ error: "Không thể tự xoá tài khoản đang đăng nhập" }, 400);
    }
    if (existing.role === "super_admin") {
        const superAdminCount = (await db.prepare("SELECT COUNT(*) as c FROM admins WHERE role = 'super_admin'").get()).c;
        if (superAdminCount <= 1) {
            return c.json({ error: "Không thể xoá super_admin cuối cùng trong hệ thống" }, 400);
        }
    }

    await db.prepare("DELETE FROM admins WHERE id = ?").run(existing.id);
    await db.logActivity(currentAdmin, "delete_admin", `admin:${existing.username}`);
    return c.json({ ok: true });
});

export default app;
