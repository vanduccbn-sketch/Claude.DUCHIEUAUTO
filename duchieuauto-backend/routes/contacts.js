const express = require("express");
const db = require("../models/db");
const { requireRole } = require("../middleware/auth");

const router = express.Router();

// Không giới hạn vai trò - cả Content admin lẫn Ads admin đều cần xem được liên hệ/đặt lịch
// (Ads admin cần số liệu này để đo hiệu quả quảng cáo, theo đúng mô hình 2 admin đã chốt).
const canViewContacts = requireRole();

// POST /api/contacts - nhận form liên hệ / đặt lịch hẹn từ frontend (public)
router.post("/", async (req, res) => {
    const { type, name, phone, email, service, preferred_date, preferred_time, message } = req.body;

    if (!name || !phone) {
        return res.status(400).json({ error: "Thiếu họ tên hoặc số điện thoại" });
    }

    const info = await db.prepare(`
        INSERT INTO contacts (type, name, phone, email, service, preferred_date, preferred_time, message)
        VALUES (@type, @name, @phone, @email, @service, @preferred_date, @preferred_time, @message)
    `).run({
        type: type === "booking" ? "booking" : "contact",
        name, phone,
        email: email || null,
        service: service || null,
        preferred_date: preferred_date || null,
        preferred_time: preferred_time || null,
        message: message || null
    });

    res.status(201).json({ id: info.lastInsertRowid });
});

// GET /api/contacts - danh sách liên hệ/đặt lịch (mọi admin đã đăng nhập)
router.get("/", canViewContacts, async (req, res) => {
    const contacts = await db.prepare("SELECT * FROM contacts ORDER BY created_at DESC").all();
    res.json(contacts);
});

// PUT /api/contacts/:id/status - cập nhật trạng thái xử lý (mọi admin đã đăng nhập)
router.put("/:id/status", canViewContacts, async (req, res) => {
    const { status } = req.body;
    if (!["new", "contacted", "done"].includes(status)) {
        return res.status(400).json({ error: "status không hợp lệ" });
    }
    const info = await db.prepare("UPDATE contacts SET status = ? WHERE id = ?").run(status, req.params.id);
    if (info.changes === 0) return res.status(404).json({ error: "Không tìm thấy" });

    await db.logActivity(req.admin, "update_contact_status", `contact:${req.params.id}:${status}`);
    res.json({ ok: true });
});

module.exports = router;
