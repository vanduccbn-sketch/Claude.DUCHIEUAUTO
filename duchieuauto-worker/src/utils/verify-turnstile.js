// Port từ duchieuauto-backend/utils/verify-turnstile.js (Phase 13) - đã dùng fetch() thuần, chỉ
// thêm tham số `env` (xem gotcha process.env trong docs Phase 13). Xem giải thích đầy đủ lý do
// chuyển từ Google reCAPTCHA sang Cloudflare Turnstile ở file gốc.
export async function verifyTurnstile(token, env) {
    const secret = env.TURNSTILE_SECRET_KEY;
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
