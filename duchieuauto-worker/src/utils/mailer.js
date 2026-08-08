/**
 * Port từ duchieuauto-backend/utils/mailer.js sang Workers (Phase 13) - đã dùng fetch() thuần từ
 * trước nên gần như không đổi gì, chỉ thêm tham số `env` (Workers không có process.env module-scope
 * đáng tin cậy, phải truyền vào theo request - xem gotcha ghi trong docs/nhat-ky-phat-trien... Phase 13).
 */
const RESEND_API_URL = "https://api.resend.com/emails";

export async function sendEmail({ to, subject, html }, env) {
    const fromEmail = env.RESEND_FROM_EMAIL || "Đức Hiếu Auto <noreply@duchieuauto.vn>";

    if (!env.RESEND_API_KEY) {
        console.warn("[mailer] Thiếu RESEND_API_KEY, bỏ qua gửi email:", subject);
        return false;
    }

    try {
        const res = await fetch(RESEND_API_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${env.RESEND_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ from: fromEmail, to, subject, html })
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
