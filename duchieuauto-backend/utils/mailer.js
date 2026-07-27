// Gửi email qua Resend HTTP API (thay cho Gmail SMTP cũ - Render free tier chặn hết SMTP đi ra
// ngoài, xem giải thích lịch sử trong routes/auth.js). Đây là API HTTPS bình thường nên không bị
// chặn.

const RESEND_API_URL = "https://api.resend.com/emails";
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "Đức Hiếu Auto <noreply@duchieuauto.vn>";

// Trả về true nếu gửi thành công. Cố tình "fail-open" khi thiếu RESEND_API_KEY (chỉ log cảnh báo,
// không throw) để không làm sập cả route gọi nó nếu biến môi trường chưa kịp cấu hình trên Render.
async function sendEmail({ to, subject, html }) {
    if (!process.env.RESEND_API_KEY) {
        console.warn("[mailer] Thiếu RESEND_API_KEY, bỏ qua gửi email:", subject);
        return false;
    }

    try {
        const res = await fetch(RESEND_API_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ from: FROM_EMAIL, to, subject, html })
        });

        if (!res.ok) {
            console.error("[mailer] Gửi email thất bại:", res.status, await res.text());
            return false;
        }
        return true;
    } catch (err) {
        console.error("[mailer] Lỗi khi gọi Resend API:", err.message);
        return false;
    }
}

module.exports = { sendEmail };
