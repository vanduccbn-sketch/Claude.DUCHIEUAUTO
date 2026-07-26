const express = require("express");
const db = require("../models/db");
const { requireRole } = require("../middleware/auth");

const router = express.Router();

// Chỉ Ads admin (hoặc super_admin) được sửa cấu hình chung - đúng phạm vi công việc của Ads admin
// (mã tracking, social links, SEO mặc định), Content admin không đụng tới phần này.
const canEditSettings = requireRole("ads", "super_admin");

// Danh sách key hợp lệ - chặn client gửi key lạ vào bảng settings (VD tránh ghi đè field không
// mong muốn). Public GET vẫn trả đúng các key này (giá trị rỗng nếu chưa cấu hình) để trang quản
// trị hiển thị đủ form, đồng thời trang công khai (Phase 5) đọc để chèn mã GA/Pixel.
const ALLOWED_KEYS = [
    "google_analytics_id",
    "google_search_console_verification",
    "facebook_pixel_id",
    "social_facebook",
    "social_zalo",
    "social_youtube",
    "seo_default_title",
    "seo_default_description"
];

// GET /api/settings - public (trang công khai cần đọc mã GA/Pixel/social links để hiển thị,
// không có gì nhạy cảm trong các giá trị này - đều sẽ hiện ra HTML công khai)
router.get("/", async (req, res) => {
    const rows = await db.prepare("SELECT key, value FROM settings").all();
    const map = {};
    ALLOWED_KEYS.forEach(k => { map[k] = ""; });
    rows.forEach(r => { if (ALLOWED_KEYS.includes(r.key)) map[r.key] = r.value || ""; });
    res.json(map);
});

// PUT /api/settings - cập nhật hàng loạt (chỉ Ads admin/super_admin), body: { key: value, ... }
router.put("/", canEditSettings, async (req, res) => {
    const upsert = db.prepare(`
        INSERT INTO settings (key, value, updated_at) VALUES (@key, @value, @updated_at)
        ON CONFLICT(key) DO UPDATE SET value = @value, updated_at = @updated_at
    `);
    const now = new Date().toISOString();
    for (const key of ALLOWED_KEYS) {
        if (Object.prototype.hasOwnProperty.call(req.body, key)) {
            await upsert.run({ key, value: req.body[key] ?? "", updated_at: now });
        }
    }

    await db.logActivity(req.admin, "update_settings", null);
    res.json({ ok: true });
});

module.exports = router;
