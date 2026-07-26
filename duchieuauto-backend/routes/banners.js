const express = require("express");
const db = require("../models/db");
const { requireRole } = require("../middleware/auth");

const router = express.Router();

// Chỉ Ads admin (hoặc super_admin) được quản lý banner - đúng phạm vi công việc, Content admin
// không đụng tới banner/quảng cáo.
const canManageBanners = requireRole("ads", "super_admin");

// GET /api/banners - public, chỉ trả banner đang trong khoảng hiển thị (start_date/end_date),
// dùng cho slider/banner ở trang công khai (Phase 5+).
router.get("/", async (req, res) => {
    const banners = await db.prepare(`
        SELECT * FROM banners
        WHERE (start_date IS NULL OR start_date = '' OR date(start_date) <= date('now'))
          AND (end_date IS NULL OR end_date = '' OR date(end_date) >= date('now'))
        ORDER BY sort_order ASC, id DESC
    `).all();
    res.json(banners);
});

// GET /api/banners/admin/all - tất cả banner kể cả hết hạn/chưa tới ngày (cần đăng nhập, chỉ
// Ads/super_admin - dùng cho trang quản trị).
router.get("/admin/all", canManageBanners, async (req, res) => {
    const banners = await db.prepare("SELECT * FROM banners ORDER BY sort_order ASC, id DESC").all();
    res.json(banners);
});

// POST /api/banners - tạo banner mới
router.post("/", canManageBanners, async (req, res) => {
    const { title, image, link, sort_order, start_date, end_date } = req.body;
    if (!title || !image) {
        return res.status(400).json({ error: "Thiếu title hoặc image" });
    }

    const info = await db.prepare(`
        INSERT INTO banners (title, image, link, sort_order, start_date, end_date)
        VALUES (@title, @image, @link, @sort_order, @start_date, @end_date)
    `).run({
        title,
        image,
        link: link || null,
        sort_order: Number.isFinite(sort_order) ? sort_order : 0,
        start_date: start_date || null,
        end_date: end_date || null
    });

    await db.logActivity(req.admin, "create_banner", `banner:${info.lastInsertRowid}`);
    res.status(201).json({ id: info.lastInsertRowid });
});

// PUT /api/banners/:id - sửa banner
router.put("/:id", canManageBanners, async (req, res) => {
    const existing = await db.prepare("SELECT * FROM banners WHERE id = ?").get(req.params.id);
    if (!existing) return res.status(404).json({ error: "Không tìm thấy banner" });

    const merged = {
        title: req.body.title ?? existing.title,
        image: req.body.image ?? existing.image,
        link: req.body.link ?? existing.link,
        sort_order: req.body.sort_order !== undefined ? req.body.sort_order : existing.sort_order,
        start_date: req.body.start_date !== undefined ? req.body.start_date : existing.start_date,
        end_date: req.body.end_date !== undefined ? req.body.end_date : existing.end_date,
        id: existing.id
    };
    await db.prepare(`
        UPDATE banners SET title=@title, image=@image, link=@link, sort_order=@sort_order,
        start_date=@start_date, end_date=@end_date WHERE id=@id
    `).run(merged);

    await db.logActivity(req.admin, "update_banner", `banner:${existing.id}`);
    res.json({ ok: true });
});

// DELETE /api/banners/:id
router.delete("/:id", canManageBanners, async (req, res) => {
    const existing = await db.prepare("SELECT id FROM banners WHERE id = ?").get(req.params.id);
    if (!existing) return res.status(404).json({ error: "Không tìm thấy banner" });

    await db.prepare("DELETE FROM banners WHERE id = ?").run(req.params.id);
    await db.logActivity(req.admin, "delete_banner", `banner:${existing.id}`);
    res.json({ ok: true });
});

module.exports = router;
