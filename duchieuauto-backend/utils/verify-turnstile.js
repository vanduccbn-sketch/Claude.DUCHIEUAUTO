// Xác thực Cloudflare Turnstile phía server - dùng chung cho mọi form công khai (liên hệ/đặt lịch/
// nhắc bảo dưỡng, đánh giá sản phẩm). Thay cho Google reCAPTCHA (2026-08) - site đã chạy toàn bộ
// trên Cloudflare nên quản lý khoá ngay trong cùng dashboard, không cần đoán/tra khoá bí mật của
// Google nữa (reCAPTCHA cũ liên tục bị từ chối "invalid-input-response" dù đã đối chiếu đúng ghi
// chú xoay khoá trong docs - không có quyền truy cập Google reCAPTCHA Admin Console để xác nhận
// chắc chắn khoá nào đúng). CHỈ kiểm tra thật khi đã cấu hình TURNSTILE_SECRET_KEY - nếu chưa cấu
// hình thì bỏ qua (không chặn form hoạt động bình thường), tránh trường hợp deploy code này trước
// khi kịp điền biến môi trường làm gãy toàn bộ form công khai của site.
async function verifyTurnstile(token) {
    const secret = process.env.TURNSTILE_SECRET_KEY;
    if (!secret) return true;
    if (!token) return false;

    try {
        const params = new URLSearchParams({ secret, response: token });
        const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: params
        });
        const data = await res.json();
        if (!data.success) {
            console.warn("[Turnstile-tu-choi]", JSON.stringify(data));
        }
        return !!data.success;
    } catch (err) {
        console.error("[loi-turnstile]", err.message);
        return false;
    }
}

module.exports = { verifyTurnstile };
