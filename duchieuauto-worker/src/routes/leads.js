/**
 * Port từ duchieuauto-backend/routes/leads.js sang Hono (Phase 13). 2 khác biệt kỹ thuật:
 * 1. Raw body cho HMAC: Express cần middleware riêng (`verify` option của express.json()) để giữ
 *    lại byte gốc trước khi parse JSON. Hono/Web Request đơn giản hơn - đọc `c.req.text()` 1 lần
 *    (dùng cho cả xác minh chữ ký VÀ tự JSON.parse() luôn, không cần đọc body 2 lần).
 * 2. "Trả lời trước, xử lý sau" (Facebook cần phản hồi 200 nhanh, xử lý Graph API lookup sau) -
 *    Express cứ để code chạy tiếp sau res.sendStatus() bình thường; Workers có thể tắt isolate
 *    ngay sau khi trả Response nếu không khai báo rõ - phải dùng `c.executionCtx.waitUntil()` để
 *    đảm bảo phần xử lý nền (gọi Graph API + ghi DB) chạy xong trước khi Worker có thể bị dừng.
 */
import { Hono } from "hono";
import crypto from "node:crypto";

function verifyFacebookSignature(signatureHeader, rawBody, appSecret) {
    if (!signatureHeader || !appSecret || !rawBody) return false;
    const expected = "sha256=" + crypto.createHmac("sha256", appSecret).update(rawBody).digest("hex");
    try {
        return crypto.timingSafeEqual(Buffer.from(signatureHeader), Buffer.from(expected));
    } catch (err) {
        return false;
    }
}

async function saveFacebookLead(leadgenId, db, env) {
    const token = env.FB_PAGE_ACCESS_TOKEN;
    if (!token) {
        console.error("[loi-webhook-facebook-lead] Thiếu FB_PAGE_ACCESS_TOKEN, không lấy được chi tiết lead:", leadgenId);
        return;
    }

    const res = await fetch(`https://graph.facebook.com/v19.0/${leadgenId}?access_token=${encodeURIComponent(token)}`);
    const data = await res.json();
    if (!res.ok) {
        console.error("[loi-webhook-facebook-lead] Graph API lỗi:", data.error || data);
        return;
    }

    const fields = {};
    (data.field_data || []).forEach(f => { fields[f.name] = (f.values || [])[0] || ""; });

    const name = fields.full_name || fields.first_name || fields.name || "Khách từ Facebook Lead Ads";
    const phone = fields.phone_number || fields.phone || "";
    const email = fields.email || null;

    await db.prepare(`
        INSERT INTO contacts (type, name, phone, email, message)
        VALUES ('facebook_lead', ?, ?, ?, ?)
    `).run(name, phone, email, JSON.stringify(fields));

    console.log(`[lead-facebook] Đã lưu lead mới: ${name} - ${phone}`);
}

const app = new Hono();

app.get("/facebook", (c) => {
    const mode = c.req.query("hub.mode");
    const token = c.req.query("hub.verify_token");
    const challenge = c.req.query("hub.challenge");

    if (mode === "subscribe" && token && c.env.FB_VERIFY_TOKEN && token === c.env.FB_VERIFY_TOKEN) {
        return c.text(challenge, 200);
    }
    return c.body(null, 403);
});

app.post("/facebook", async (c) => {
    const rawBody = await c.req.text();
    const signature = c.req.header("x-hub-signature-256");

    if (!verifyFacebookSignature(signature, rawBody, c.env.FB_APP_SECRET)) {
        return c.body(null, 403);
    }

    let body;
    try {
        body = JSON.parse(rawBody);
    } catch (err) {
        body = {};
    }

    const db = c.get("db");
    const env = c.env;
    c.executionCtx.waitUntil((async () => {
        try {
            const entries = body.entry || [];
            for (const entry of entries) {
                for (const change of entry.changes || []) {
                    if (change.field === "leadgen" && change.value && change.value.leadgen_id) {
                        await saveFacebookLead(change.value.leadgen_id, db, env);
                    }
                }
            }
        } catch (err) {
            console.error("[loi-webhook-facebook-lead]", err);
        }
    })());

    return c.body(null, 200);
});

app.get("/tiktok", (c) => {
    const challenge = c.req.query("challenge") || c.req.query("hub.challenge");
    const token = c.req.query("verify_token") || c.req.query("hub.verify_token");
    if (token && c.env.TIKTOK_VERIFY_TOKEN && token === c.env.TIKTOK_VERIFY_TOKEN) {
        return c.text(challenge, 200);
    }
    return c.body(null, 403);
});

app.post("/tiktok", async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const db = c.get("db");
    c.executionCtx.waitUntil((async () => {
        try {
            await db.prepare(`
                INSERT INTO contacts (type, name, phone, message)
                VALUES ('tiktok_lead', 'Khách từ TikTok Lead Ads (chưa tách field)', '', ?)
            `).run(JSON.stringify(body));
            console.log("[lead-tiktok] Đã lưu 1 payload thô, cần tách field sau khi đối chiếu tài liệu thật.");
        } catch (err) {
            console.error("[loi-webhook-tiktok-lead]", err);
        }
    })());
    return c.body(null, 200);
});

export default app;
