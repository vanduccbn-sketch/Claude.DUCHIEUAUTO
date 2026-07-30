const express = require("express");
const db = require("../models/db");
const { requireRole } = require("../middleware/auth");

const router = express.Router();

// Content admin (không phải Ads admin) sửa phần này - đúng phạm vi "viết nội dung" khác với
// routes/settings.js (mã tracking/SEO mặc định, thuộc Ads admin).
const canEditContent = requireRole("content", "super_admin");

// Khoá hợp lệ, GOM THEO KHỐI - vừa để chặn client gửi key lạ vào bảng (ALLOWED_KEYS bên dưới, gộp
// phẳng từ đây), vừa làm cơ sở cho phân quyền chi tiết theo khối (content_permissions): mỗi khối
// tương ứng đúng 1 phần trong admin/trang-chu.html (data-section="..." trên từng .settings-section).
const CONTENT_SECTIONS = {
    hero: ["hero_subtitle", "hero_title_line1", "hero_title_line2", "hero_description", "hero_poster_image"],
    about: [
        "about_badge", "about_slogan_line1", "about_slogan_line2", "about_description",
        "about_stat1_number", "about_stat1_label",
        "about_stat2_number", "about_stat2_label",
        "about_stat3_number", "about_stat3_label",
        "about_image_main", "about_image_detail1", "about_image_detail2"
    ],
    // Dịch Vụ: chỉ tiêu đề mục - thẻ dịch vụ tự render theo danh mục
    service: ["service_section_title"],
    quick_actions: [
        "quick_actions_section_title",
        "quick_actions_cta1_label", "quick_actions_cta1_title", "quick_actions_cta1_desc",
        "quick_actions_cta2_label", "quick_actions_cta2_title", "quick_actions_cta2_desc"
    ],
    // Sản Phẩm Chiến Lược: chỉ tiêu đề mục + CTA - thẻ sản phẩm quản lý riêng ở /api/homepage
    product: ["product_section_title", "product_cta_label", "product_cta_title", "product_cta_desc"],
    // Giải Mã Công Nghệ: chỉ tiêu đề/mô tả mục - thẻ công nghệ quản lý riêng ở /api/homepage
    tech: ["tech_eyebrow", "tech_section_title", "tech_intro"],
    contact: [
        "contact_eyebrow", "contact_title_main", "contact_title_accent", "contact_intro",
        "contact_channel1_title", "contact_channel1_desc",
        "contact_channel2_title", "contact_channel2_desc",
        "contact_channel3_title", "contact_channel3_desc",
        "contact_channel4_title", "contact_channel4_desc",
        "contact_form_title", "contact_form_desc"
    ],
    footer: ["footer_brand_desc", "footer_col1_title", "footer_col2_title", "footer_col3_title", "footer_copyright"],
    // Trang FAQ / Chính Sách / Đặt Lịch Hẹn - cùng cơ chế key-value này, chỉ tiêu đề/đoạn dẫn đầu
    // trang (nội dung chi tiết bên dưới - câu hỏi FAQ, điều khoản chính sách - vẫn quản lý riêng,
    // không đưa vào đây vì rủi ro sửa sai nội dung dài/pháp lý qua 1 ô text đơn giản).
    other_pages: ["faq_page_title", "faq_page_intro", "policy_page_title", "booking_page_title", "booking_page_intro"]
};

const ALLOWED_KEYS = Object.values(CONTENT_SECTIONS).flat();

function sectionOfKey(key) {
    return Object.keys(CONTENT_SECTIONS).find(section => CONTENT_SECTIONS[section].includes(key));
}

// Admin có 0 dòng trong content_permissions = KHÔNG bị giới hạn (tương thích ngược, mặc định mọi
// admin role "content" sửa được toàn bộ như trước khi có tính năng phân quyền này). super_admin
// luôn full quyền, không tra bảng.
async function getAllowedSections(admin) {
    if (admin.role === "super_admin") return null; // null = không giới hạn
    const rows = await db.prepare("SELECT section FROM content_permissions WHERE admin_id = ?").all(admin.id);
    if (rows.length === 0) return null;
    return rows.map(r => r.section);
}

// GET /api/homepage-content - public (trang chủ cần đọc để hiển thị, không có gì nhạy cảm)
router.get("/", async (req, res) => {
    const rows = await db.prepare("SELECT key, value FROM homepage_content").all();
    const map = {};
    ALLOWED_KEYS.forEach(k => { map[k] = ""; });
    rows.forEach(r => { if (ALLOWED_KEYS.includes(r.key)) map[r.key] = r.value || ""; });
    res.json(map);
});

// GET /api/homepage-content/my-permissions - admin đang đăng nhập tự hỏi mình sửa được khối nào,
// để admin/trang-chu.html ẩn/khoá đúng các khối không được gán. full:true = không giới hạn.
router.get("/my-permissions", canEditContent, async (req, res) => {
    const sections = await getAllowedSections(req.admin);
    res.json(sections === null ? { full: true } : { full: false, sections });
});

// PUT /api/homepage-content - cập nhật hàng loạt (chỉ Content admin/super_admin), body: { key: value, ... }
// Bỏ trống 1 field (chuỗi rỗng) nghĩa là "dùng lại chữ mặc định" - trang chủ tự hiểu quy ước này.
router.put("/", canEditContent, async (req, res) => {
    const allowedSections = await getAllowedSections(req.admin);
    if (allowedSections !== null) {
        const deniedKeys = Object.keys(req.body).filter(key => ALLOWED_KEYS.includes(key) && !allowedSections.includes(sectionOfKey(key)));
        if (deniedKeys.length > 0) {
            return res.status(403).json({ error: `Bạn không có quyền sửa khối chứa: ${deniedKeys.join(", ")}` });
        }
    }

    const upsert = db.prepare(`
        INSERT INTO homepage_content (key, value, updated_at) VALUES (@key, @value, @updated_at)
        ON CONFLICT(key) DO UPDATE SET value = @value, updated_at = @updated_at
    `);
    const insertHistory = db.prepare(
        "INSERT INTO homepage_content_history (key, old_value, changed_by, changed_at) VALUES (@key, @old_value, @changed_by, @changed_at)"
    );
    const now = new Date().toISOString();
    for (const key of ALLOWED_KEYS) {
        if (!Object.prototype.hasOwnProperty.call(req.body, key)) continue;
        const newValue = req.body[key] ?? "";

        // Chỉ ghi lịch sử khi giá trị THẬT SỰ đổi - tránh log rác mỗi lần bấm Lưu dù không sửa gì
        // (VD admin bấm Lưu cả khối dù chỉ sửa 1 trong 10 trường).
        const current = await db.prepare("SELECT value FROM homepage_content WHERE key = ?").get(key);
        const oldValue = current ? (current.value || "") : "";
        if (oldValue !== newValue) {
            await insertHistory.run({ key, old_value: oldValue, changed_by: req.admin.username, changed_at: now });
        }

        await upsert.run({ key, value: newValue, updated_at: now });
    }

    await db.logActivity(req.admin, "update_homepage_content", null);
    res.json({ ok: true });
});

// GET /api/homepage-content/history - 50 thay đổi gần nhất (mọi khoá gộp chung) để admin xem lại
// đã sửa gì, khi nào, ai sửa - và có dữ liệu để khôi phục qua POST /revert bên dưới.
router.get("/history", canEditContent, async (req, res) => {
    const rows = await db.prepare(
        "SELECT id, key, old_value, changed_by, changed_at FROM homepage_content_history ORDER BY id DESC LIMIT 50"
    ).all();
    res.json(rows);
});

// POST /api/homepage-content/revert - khôi phục 1 khoá về đúng giá trị cũ ghi trong 1 dòng lịch sử
// (id lấy từ GET /history). Tự ghi thêm 1 dòng lịch sử MỚI cho chính hành động khôi phục này (giá
// trị đang có trước khi khôi phục) - lỡ khôi phục nhầm vẫn khôi phục ngược lại được, không mất dữ liệu.
router.post("/revert", canEditContent, async (req, res) => {
    const { historyId } = req.body;
    const entry = await db.prepare("SELECT key, old_value FROM homepage_content_history WHERE id = ?").get(historyId);
    if (!entry) return res.status(404).json({ error: "Không tìm thấy mục lịch sử này" });
    if (!ALLOWED_KEYS.includes(entry.key)) return res.status(400).json({ error: "Khoá không hợp lệ" });

    const allowedSections = await getAllowedSections(req.admin);
    if (allowedSections !== null && !allowedSections.includes(sectionOfKey(entry.key))) {
        return res.status(403).json({ error: "Bạn không có quyền khôi phục khối này" });
    }

    const now = new Date().toISOString();
    const current = await db.prepare("SELECT value FROM homepage_content WHERE key = ?").get(entry.key);
    await db.prepare(
        "INSERT INTO homepage_content_history (key, old_value, changed_by, changed_at) VALUES (@key, @old_value, @changed_by, @changed_at)"
    ).run({ key: entry.key, old_value: current ? (current.value || "") : "", changed_by: req.admin.username, changed_at: now });

    await db.prepare(`
        INSERT INTO homepage_content (key, value, updated_at) VALUES (@key, @value, @updated_at)
        ON CONFLICT(key) DO UPDATE SET value = @value, updated_at = @updated_at
    `).run({ key: entry.key, value: entry.old_value || "", updated_at: now });

    await db.logActivity(req.admin, "revert_homepage_content", entry.key);
    res.json({ ok: true, key: entry.key, restoredValue: entry.old_value || "" });
});

module.exports = router;
