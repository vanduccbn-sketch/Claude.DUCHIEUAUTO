/**
 * Port từ duchieuauto-backend/middleware/auth.js sang Hono (Phase 13).
 * Giữ nguyên 100% thông điệp lỗi + logic phân quyền - chỉ đổi req.admin/res.status().json()
 * (Express) sang c.set("admin", ...)/c.get("admin") + c.json() (Hono).
 *
 * [Phase 6, giữ nguyên lý do] Không cần CSRF protection: JWT gửi qua header Authorization, không
 * dùng cookie/session nên trình duyệt không tự gắn token khi request từ site lạ.
 */
import jwt from "jsonwebtoken";

async function verifyToken(c, next) {
    const header = c.req.header("Authorization") || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
        return c.json({ error: "Thiếu token xác thực" }, 401);
    }

    try {
        const payload = jwt.verify(token, c.env.JWT_SECRET);
        c.set("admin", payload);
        await next();
    } catch (err) {
        return c.json({ error: "Token không hợp lệ hoặc đã hết hạn" }, 401);
    }
}

/**
 * requireRole() - không truyền vai trò nào = chỉ cần đăng nhập hợp lệ, không phân biệt vai trò.
 * requireRole('content', 'super_admin') - chỉ các vai trò được liệt kê mới được phép.
 *
 * Dùng trực tiếp trong route: app.post('/', ...requireRole('content'), handler)
 */
export function requireRole(...roles) {
    return [
        verifyToken,
        async (c, next) => {
            const admin = c.get("admin");
            if (roles.length === 0 || roles.includes(admin.role)) {
                return next();
            }
            return c.json({ error: "Tài khoản của bạn không có quyền thực hiện thao tác này" }, 403);
        }
    ];
}

// Giữ lại requireAdmin (= requireRole() không giới hạn vai trò) để tương thích ngược với code cũ.
export const requireAdmin = requireRole();
