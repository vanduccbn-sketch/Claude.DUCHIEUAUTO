const express = require("express");
const crypto = require("crypto");
const db = require("../models/db");

const router = express.Router();

/* =========================================================
   PHASE 10 - Hướng B: nhận lead từ quảng cáo "điền form ngay trên Facebook/TikTok" (không dẫn
   khách về site) - khác hẳn form liên hệ/đặt lịch tự viết trên site (đã có sẵn ở contacts.js).
   Facebook/TikTok chủ động POST dữ liệu lead mới về đây ngay khi khách gửi form quảng cáo.
   Lưu vào CHUNG bảng "contacts" (đúng bản chất "khách để lại thông tin, admin theo dõi/liên hệ
   lại" như đã làm với "maintenance") - không tạo bảng riêng.
   ========================================================= */

// GET /api/leads/facebook - Facebook gọi 1 lần duy nhất lúc admin bấm "Verify and Save" trong
// Facebook App Dashboard để xác minh URL webhook này thuộc quyền kiểm soát của mình - phải trả
// đúng nguyên văn "hub.challenge" nếu "hub.verify_token" khớp giá trị bí mật đã cấu hình.
router.get("/facebook", (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token && process.env.FB_VERIFY_TOKEN && token === process.env.FB_VERIFY_TOKEN) {
        return res.status(200).send(challenge);
    }
    res.sendStatus(403);
});

// Xác minh request POST thật sự đến từ Facebook (không phải ai đó tự gửi giả POST vào đúng URL
// công khai này) - Facebook ký mọi request bằng HMAC-SHA256 với App Secret, gửi kèm header
// "X-Hub-Signature-256". BẮT BUỘC cần req.rawBody (byte gốc trước khi Express parse JSON) - xem
// server.js đã thêm option "verify" vào express.json() để lưu lại rawBody cho việc này.
function verifyFacebookSignature(req) {
    const signature = req.headers["x-hub-signature-256"];
    if (!signature || !process.env.FB_APP_SECRET || !req.rawBody) return false;
    const expected = "sha256=" + crypto.createHmac("sha256", process.env.FB_APP_SECRET).update(req.rawBody).digest("hex");
    try {
        return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
    } catch (err) {
        return false; // độ dài chuỗi khác nhau cũng ném lỗi ở timingSafeEqual - coi như không khớp
    }
}

// POST /api/leads/facebook - Facebook POST tới đây mỗi khi có lead mới, nhưng payload CHỈ có
// "leadgen_id" (không có tên/SĐT khách trực tiếp) - phải gọi ngược lại Facebook Graph API bằng
// Page Access Token để lấy đủ dữ liệu form. Luôn trả 200 thật nhanh trước (Facebook coi mọi mã
// khác 200 là gửi thất bại và sẽ thử gửi lại nhiều lần, kể cả khi lỗi chỉ ở bước gọi Graph API
// phía sau) - xử lý lấy chi tiết lead sau khi đã phản hồi xong.
router.post("/facebook", async (req, res) => {
    if (!verifyFacebookSignature(req)) return res.sendStatus(403);
    res.sendStatus(200);

    try {
        const entries = req.body.entry || [];
        for (const entry of entries) {
            for (const change of entry.changes || []) {
                if (change.field === "leadgen" && change.value && change.value.leadgen_id) {
                    await saveFacebookLead(change.value.leadgen_id);
                }
            }
        }
    } catch (err) {
        console.error("[loi-webhook-facebook-lead]", err);
    }
});

async function saveFacebookLead(leadgenId) {
    const token = process.env.FB_PAGE_ACCESS_TOKEN;
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

    // field_data trả về dạng [{name: "full_name", values: ["Nguyễn Văn A"]}, ...] - tên field phụ
    // thuộc câu hỏi admin tự đặt lúc tạo form quảng cáo trên Facebook, không cố định 100% nên gom
    // hết vào object rồi thử khớp vài tên phổ biến nhất thay vì chỉ tin đúng 1 tên duy nhất.
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

// GET /api/leads/tiktok - xác minh webhook, dùng chung kiểu challenge-response phổ biến (TikTok
// cũng dùng cơ chế tương tự Facebook cho hầu hết webhook của họ) - CẦN ĐỐI CHIẾU LẠI với tài liệu
// TikTok for Business thật khi user tạo app xong, vì chi tiết chính xác (tên tham số, có ký HMAC
// hay không, có mã hoá field PII hay không) tuỳ theo đúng sản phẩm/phiên bản API TikTok cấp lúc
// đó - phần này viết sẵn khung để không phải làm lại từ đầu, KHÔNG coi là chắc chắn đúng 100%.
router.get("/tiktok", (req, res) => {
    const challenge = req.query.challenge || req.query["hub.challenge"];
    const token = req.query.verify_token || req.query["hub.verify_token"];
    if (token && process.env.TIKTOK_VERIFY_TOKEN && token === process.env.TIKTOK_VERIFY_TOKEN) {
        return res.status(200).send(challenge);
    }
    res.sendStatus(403);
});

// POST /api/leads/tiktok - lưu TẠM TOÀN BỘ payload thô vào cột "message" (không parse cụ thể) -
// an toàn hơn là đoán sai cấu trúc rồi mất dữ liệu. Sẽ tách đúng field name/phone/email khi có
// payload thật để đối chiếu (cần tạo TikTok App + đăng ký webhook thật mới biết chính xác).
router.post("/tiktok", async (req, res) => {
    res.sendStatus(200);
    try {
        await db.prepare(`
            INSERT INTO contacts (type, name, phone, message)
            VALUES ('tiktok_lead', 'Khách từ TikTok Lead Ads (chưa tách field)', '', ?)
        `).run(JSON.stringify(req.body));
        console.log("[lead-tiktok] Đã lưu 1 payload thô, cần tách field sau khi đối chiếu tài liệu thật.");
    } catch (err) {
        console.error("[loi-webhook-tiktok-lead]", err);
    }
});

module.exports = router;
