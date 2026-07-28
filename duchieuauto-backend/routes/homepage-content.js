const express = require("express");
const db = require("../models/db");
const { requireRole } = require("../middleware/auth");

const router = express.Router();

// Content admin (không phải Ads admin) sửa phần này - đúng phạm vi "viết nội dung" khác với
// routes/settings.js (mã tracking/SEO mặc định, thuộc Ads admin).
const canEditContent = requireRole("content", "super_admin");

// Danh sách key hợp lệ - chặn client gửi key lạ vào bảng. Public GET vẫn trả đủ key này (giá trị
// rỗng nếu chưa cấu hình) để trang chủ công khai và form admin luôn khớp nhau.
const ALLOWED_KEYS = [
    // Hero
    "hero_subtitle", "hero_title_line1", "hero_title_line2", "hero_description", "hero_poster_image",
    // Giới Thiệu
    "about_badge", "about_slogan_line1", "about_slogan_line2", "about_description",
    "about_stat1_number", "about_stat1_label",
    "about_stat2_number", "about_stat2_label",
    "about_stat3_number", "about_stat3_label",
    "about_image_main", "about_image_detail1", "about_image_detail2",
    // Dịch Vụ (chỉ tiêu đề mục - thẻ dịch vụ tự render theo danh mục)
    "service_section_title",
    // Đặt Lịch Hẹn / Nhắc Bảo Dưỡng
    "quick_actions_section_title",
    "quick_actions_cta1_label", "quick_actions_cta1_title", "quick_actions_cta1_desc",
    "quick_actions_cta2_label", "quick_actions_cta2_title", "quick_actions_cta2_desc",
    // Sản Phẩm Chiến Lược (chỉ tiêu đề mục + CTA - thẻ sản phẩm quản lý riêng ở /api/homepage)
    "product_section_title", "product_cta_label", "product_cta_title", "product_cta_desc",
    // Giải Mã Công Nghệ (chỉ tiêu đề/mô tả mục - thẻ công nghệ quản lý riêng ở /api/homepage)
    "tech_eyebrow", "tech_section_title", "tech_intro",
    // Liên Hệ
    "contact_eyebrow", "contact_title_main", "contact_title_accent", "contact_intro",
    "contact_channel1_title", "contact_channel1_desc",
    "contact_channel2_title", "contact_channel2_desc",
    "contact_channel3_title", "contact_channel3_desc",
    "contact_channel4_title", "contact_channel4_desc",
    "contact_form_title", "contact_form_desc",
    // Footer
    "footer_brand_desc", "footer_col1_title", "footer_col2_title", "footer_col3_title", "footer_copyright"
];

// GET /api/homepage-content - public (trang chủ cần đọc để hiển thị, không có gì nhạy cảm)
router.get("/", async (req, res) => {
    const rows = await db.prepare("SELECT key, value FROM homepage_content").all();
    const map = {};
    ALLOWED_KEYS.forEach(k => { map[k] = ""; });
    rows.forEach(r => { if (ALLOWED_KEYS.includes(r.key)) map[r.key] = r.value || ""; });
    res.json(map);
});

// PUT /api/homepage-content - cập nhật hàng loạt (chỉ Content admin/super_admin), body: { key: value, ... }
// Bỏ trống 1 field (chuỗi rỗng) nghĩa là "dùng lại chữ mặc định" - trang chủ tự hiểu quy ước này.
router.put("/", canEditContent, async (req, res) => {
    const upsert = db.prepare(`
        INSERT INTO homepage_content (key, value, updated_at) VALUES (@key, @value, @updated_at)
        ON CONFLICT(key) DO UPDATE SET value = @value, updated_at = @updated_at
    `);
    const now = new Date().toISOString();
    for (const key of ALLOWED_KEYS) {
        if (Object.prototype.hasOwnProperty.call(req.body, key)) {
            await upsert.run({ key, value: req.body[key] ?? "", updated_at: now });
        }
    }

    await db.logActivity(req.admin, "update_homepage_content", null);
    res.json({ ok: true });
});

module.exports = router;
