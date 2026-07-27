// Xác thực reCAPTCHA v2 (checkbox "Tôi không phải người máy") phía server - dùng chung cho mọi
// form công khai (liên hệ/đặt lịch/nhắc bảo dưỡng, đánh giá sản phẩm). CHỈ kiểm tra thật khi đã
// cấu hình RECAPTCHA_SECRET_KEY - nếu chưa cấu hình thì bỏ qua (không chặn form hoạt động bình
// thường), tránh trường hợp deploy code này trước khi kịp điền biến môi trường làm gãy toàn bộ
// form công khai của site.
async function verifyRecaptcha(token) {
    const secret = process.env.RECAPTCHA_SECRET_KEY;
    if (!secret) return true;
    if (!token) return false;

    try {
        const params = new URLSearchParams({ secret, response: token });
        const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: params
        });
        const data = await res.json();
        return !!data.success;
    } catch (err) {
        console.error("[loi-recaptcha]", err.message);
        return false;
    }
}

module.exports = { verifyRecaptcha };
