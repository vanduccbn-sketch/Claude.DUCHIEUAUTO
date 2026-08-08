/**
 * Port từ duchieuauto-backend/routes/auth.js sang Hono (Phase 13). Giữ nguyên toàn bộ logic/thông
 * điệp lỗi. 2 khác biệt thật sự:
 * 1. Khoá đăng nhập sai: Map trong bộ nhớ (mất khi Worker restart/không dùng chung giữa isolate) ->
 *    Cloudflare KV (BRUTE_FORCE_KV), có expirationTtl tự dọn, bọc try/catch không để lỗi KV (VD hết
 *    hạn mức ghi/ngày của gói Free) làm sập cả route đăng nhập.
 * 2. bcrypt.hashSync cost 12 -> 10 (xác nhận bằng spike test thật: cost 12 luôn vượt giới hạn CPU
 *    10ms/request của Workers Free - xem docs/nhat-ky-phat-trien-duc-hieu-auto-2026-07-06.md Phase
 *    13.0). Mật khẩu 2 tài khoản admin hiện có đã được hash lại sang cost 10 riêng (script
 *    scripts/rehash-cost10.mjs) - không đổi mật khẩu, chỉ đổi cách lưu.
 */
import { Hono } from "hono";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { requireRole } from "../middleware/auth.js";
import { sendEmail } from "../utils/mailer.js";

const BCRYPT_COST = 10; // xem giải thích ở đầu file - đã xác nhận bằng spike test thật, không phải đoán
const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 giờ

const app = new Hono();

function clientIp(c) {
    return c.req.header("CF-Connecting-IP") || "unknown";
}

async function getLockRecord(c, ip) {
    try {
        const raw = await c.env.BRUTE_FORCE_KV.get(`login-lock:${ip}`);
        return raw ? JSON.parse(raw) : null;
    } catch (err) {
        console.error("[brute-force-kv] Lỗi đọc KV, bỏ qua kiểm tra khoá:", err.message);
        return null;
    }
}

async function setLockRecord(c, ip, record) {
    try {
        await c.env.BRUTE_FORCE_KV.put(`login-lock:${ip}`, JSON.stringify(record), { expirationTtl: LOCK_MINUTES * 60 });
    } catch (err) {
        console.error("[brute-force-kv] Lỗi ghi KV, bỏ qua bookkeeping khoá:", err.message);
    }
}

async function clearLockRecord(c, ip) {
    try {
        await c.env.BRUTE_FORCE_KV.delete(`login-lock:${ip}`);
    } catch (err) {
        console.error("[brute-force-kv] Lỗi xoá KV:", err.message);
    }
}

app.post("/login", async (c) => {
    const { username, password } = await c.req.json();
    const ip = clientIp(c);

    if (!username || !password) {
        return c.json({ error: "Thiếu username hoặc password" }, 400);
    }

    const record = await getLockRecord(c, ip);
    if (record && record.lockedUntil && record.lockedUntil > Date.now()) {
        const minutesLeft = Math.ceil((record.lockedUntil - Date.now()) / 60000);
        return c.json({ error: `Đăng nhập sai quá nhiều lần, thử lại sau ${minutesLeft} phút` }, 429);
    }

    const db = c.get("db");
    const admin = await db.prepare("SELECT * FROM admins WHERE username = ?").get(username);
    const passwordOk = admin && bcrypt.compareSync(password, admin.password_hash);

    if (!passwordOk) {
        const current = record || { count: 0 };
        current.count += 1;
        if (current.count >= MAX_ATTEMPTS) {
            current.lockedUntil = Date.now() + LOCK_MINUTES * 60000;
            current.count = 0;
            try {
                await c.get("db").logSecurityEvent("brute_force_lockout", `IP ${ip} bị khoá ${LOCK_MINUTES} phút (username thử: ${username})`);
            } catch (err) {
                console.error("[loi-ghi-log-bao-mat]", err.message);
            }
        }
        await setLockRecord(c, ip, current);
        return c.json({ error: "Sai tên đăng nhập hoặc mật khẩu" }, 401);
    }

    await clearLockRecord(c, ip);

    const token = jwt.sign(
        { id: admin.id, username: admin.username, role: admin.role },
        c.env.JWT_SECRET,
        { expiresIn: "8h" }
    );

    return c.json({ token, id: admin.id, username: admin.username, role: admin.role });
});

app.put("/change-password", ...requireRole(), async (c) => {
    const { currentPassword, newPassword } = await c.req.json();
    if (!currentPassword || !newPassword) {
        return c.json({ error: "Thiếu mật khẩu hiện tại hoặc mật khẩu mới" }, 400);
    }
    if (newPassword.length < 8) {
        return c.json({ error: "Mật khẩu mới phải có ít nhất 8 ký tự" }, 400);
    }

    const db = c.get("db");
    const admin = await db.prepare("SELECT * FROM admins WHERE id = ?").get(c.get("admin").id);
    if (!bcrypt.compareSync(currentPassword, admin.password_hash)) {
        return c.json({ error: "Mật khẩu hiện tại không đúng" }, 401);
    }

    const newHash = bcrypt.hashSync(newPassword, BCRYPT_COST);
    await db.prepare("UPDATE admins SET password_hash = ? WHERE id = ?").run(newHash, admin.id);
    await db.logActivity(c.get("admin"), "change_own_password", null);
    return c.json({ ok: true });
});

app.get("/me", ...requireRole(), async (c) => {
    const db = c.get("db");
    const admin = await db.prepare("SELECT id, username, role, email FROM admins WHERE id = ?").get(c.get("admin").id);
    if (!admin) return c.json({ error: "Không tìm thấy tài khoản" }, 404);
    return c.json(admin);
});

app.put("/my-email", ...requireRole(), async (c) => {
    const { email } = await c.req.json();
    const db = c.get("db");
    await db.prepare("UPDATE admins SET email = ? WHERE id = ?").run(email || null, c.get("admin").id);
    await db.logActivity(c.get("admin"), "update_own_email", null);
    return c.json({ ok: true });
});

function hashToken(rawToken) {
    return crypto.createHash("sha256").update(rawToken).digest("hex");
}

app.post("/forgot-password", async (c) => {
    const { email } = await c.req.json();
    const genericMessage = "Nếu email này khớp với 1 tài khoản, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu.";

    if (!email) {
        return c.json({ error: "Thiếu email" }, 400);
    }

    const db = c.get("db");
    const admin = await db.prepare("SELECT * FROM admins WHERE email = ?").get(email);
    if (admin) {
        const rawToken = crypto.randomBytes(32).toString("hex");
        const expires = new Date(Date.now() + RESET_TOKEN_TTL_MS).toISOString();
        await db.prepare("UPDATE admins SET reset_token = ?, reset_token_expires = ? WHERE id = ?")
            .run(hashToken(rawToken), expires, admin.id);

        const resetUrl = `${c.env.ADMIN_BASE_URL || "http://localhost:4000"}/dat-lai-mat-khau.html?token=${rawToken}`;
        await sendEmail({
            to: admin.email,
            subject: "Đặt lại mật khẩu quản trị Đức Hiếu Auto",
            html: `
                <p>Xin chào ${admin.username},</p>
                <p>Có yêu cầu đặt lại mật khẩu cho tài khoản quản trị của bạn. Nhấn vào link bên dưới để đặt mật khẩu mới (link có hiệu lực trong 1 giờ):</p>
                <p><a href="${resetUrl}">${resetUrl}</a></p>
                <p>Nếu bạn không yêu cầu việc này, hãy bỏ qua email này - mật khẩu của bạn vẫn an toàn.</p>
            `
        }, c.env);
    }

    return c.json({ ok: true, message: genericMessage });
});

app.post("/reset-password", async (c) => {
    const { token, newPassword } = await c.req.json();
    if (!token || !newPassword) {
        return c.json({ error: "Thiếu token hoặc mật khẩu mới" }, 400);
    }
    if (newPassword.length < 8) {
        return c.json({ error: "Mật khẩu mới phải có ít nhất 8 ký tự" }, 400);
    }

    const db = c.get("db");
    const admin = await db.prepare("SELECT * FROM admins WHERE reset_token = ?").get(hashToken(token));
    if (!admin || !admin.reset_token_expires || new Date(admin.reset_token_expires).getTime() < Date.now()) {
        return c.json({ error: "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn" }, 400);
    }

    const newHash = bcrypt.hashSync(newPassword, BCRYPT_COST);
    await db.prepare("UPDATE admins SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?")
        .run(newHash, admin.id);
    await db.logActivity(admin, "reset_own_password_via_email", null);

    return c.json({ ok: true });
});

export default app;
