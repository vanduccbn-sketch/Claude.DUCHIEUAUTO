const jwt = require("jsonwebtoken");

// [Phase 6] Không cần CSRF protection: xác thực dùng JWT gửi qua header "Authorization: Bearer
// ..." (đọc ở verifyToken bên dưới), KHÔNG dùng cookie/session. CSRF khai thác việc trình duyệt tự
// động đính kèm cookie khi gửi request từ site khác - ở đây trình duyệt không tự gắn header
// Authorization, nên 1 form/script trên site lạ không thể mạo danh request có token hợp lệ. Chỉ
// cần đổi sang lưu token bằng cookie thì mới cần thêm CSRF token thật sự.
function verifyToken(req, res, next) {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
        return res.status(401).json({ error: "Thiếu token xác thực" });
    }

    try {
        req.admin = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (err) {
        return res.status(401).json({ error: "Token không hợp lệ hoặc đã hết hạn" });
    }
}

/**
 * requireRole() - không truyền vai trò nào = chỉ cần đăng nhập hợp lệ, không phân biệt vai trò
 * (dùng cho route mà mọi admin đều được phép, VD xem danh sách liên hệ/đặt lịch để đo hiệu quả
 * quảng cáo - cả Content admin lẫn Ads admin đều cần xem được).
 *
 * requireRole('content', 'super_admin') - chỉ các vai trò được liệt kê mới được phép (VD: quản
 * lý bài viết - Ads admin không được sửa/xoá bài viết theo đúng yêu cầu phân quyền).
 *
 * Trả về mảng middleware nên dùng trực tiếp trong route: router.post('/', requireRole('content'), handler)
 */
function requireRole(...roles) {
    return [
        verifyToken,
        (req, res, next) => {
            if (roles.length === 0 || roles.includes(req.admin.role)) {
                return next();
            }
            return res.status(403).json({ error: "Tài khoản của bạn không có quyền thực hiện thao tác này" });
        }
    ];
}

// Giữ lại requireAdmin (= requireRole() không giới hạn vai trò) để tương thích ngược với code cũ
const requireAdmin = requireRole();

module.exports = { requireAdmin, requireRole };
