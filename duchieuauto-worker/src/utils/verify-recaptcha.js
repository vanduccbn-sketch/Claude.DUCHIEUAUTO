// Port từ duchieuauto-backend/utils/verify-recaptcha.js (Phase 13) - đã dùng fetch() thuần, chỉ
// thêm tham số `env` (xem gotcha process.env trong docs Phase 13).
export async function verifyRecaptcha(token, env) {
    const secret = env.RECAPTCHA_SECRET_KEY;
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
