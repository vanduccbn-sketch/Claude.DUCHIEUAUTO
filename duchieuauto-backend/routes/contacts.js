const express = require("express");
const db = require("../models/db");
const { requireRole } = require("../middleware/auth");
const { verifyRecaptcha } = require("../utils/verify-recaptcha");

const router = express.Router();

// Không giới hạn vai trò - cả Content admin lẫn Ads admin đều cần xem được liên hệ/đặt lịch
// (Ads admin cần số liệu này để đo hiệu quả quảng cáo, theo đúng mô hình 2 admin đã chốt).
const canViewContacts = requireRole();

// Khung giờ đặt lịch cố định - khớp với giờ làm việc thực tế (8h-12h sáng, 13h30-18h chiều).
// Định nghĩa 1 chỗ duy nhất, dùng chung cho cả API availability lẫn kiểm tra khi tạo lịch mới -
// tránh lệch dữ liệu nếu sau này đổi khung giờ chỉ cần sửa đúng 1 nơi.
const BOOKING_SLOTS = [
    "8:00 - 9:30",
    "9:30 - 11:00",
    "11:00 - 12:30",
    "13:30 - 15:00",
    "15:00 - 16:30",
    "16:30 - 18:00"
];
const DEFAULT_SLOT_CAPACITY = 2; // Số lịch hẹn tối đa/khung giờ nếu chưa cấu hình riêng trong Cấu Hình

async function getSlotCapacity() {
    const row = await db.prepare("SELECT value FROM settings WHERE key = 'booking_slot_capacity'").get();
    const n = parseInt(row && row.value, 10);
    return Number.isFinite(n) && n > 0 ? n : DEFAULT_SLOT_CAPACITY;
}

// GET /api/contacts/availability?date=YYYY-MM-DD - public, cho trang đặt lịch biết khung giờ nào
// còn chỗ trước khi khách chọn, tránh nhiều khách chọn trùng 1 khung giờ đã đầy.
router.get("/availability", async (req, res) => {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: "Thiếu ngày cần kiểm tra" });

    const capacity = await getSlotCapacity();
    const rows = await db.prepare(
        "SELECT preferred_time, COUNT(*) as booked FROM contacts WHERE type = 'booking' AND preferred_date = ? GROUP BY preferred_time"
    ).all(date);
    const bookedMap = {};
    rows.forEach(r => { bookedMap[r.preferred_time] = r.booked; });

    res.json({
        capacity,
        slots: BOOKING_SLOTS.map(slot => ({
            slot,
            booked: bookedMap[slot] || 0,
            full: (bookedMap[slot] || 0) >= capacity
        }))
    });
});

// POST /api/contacts - nhận form liên hệ / đặt lịch hẹn từ frontend (public)
router.post("/", async (req, res) => {
    const { type, name, phone, email, service, preferred_date, preferred_time, message, recaptcha_token } = req.body;

    if (!name || !phone) {
        return res.status(400).json({ error: "Thiếu họ tên hoặc số điện thoại" });
    }

    if (!(await verifyRecaptcha(recaptcha_token))) {
        return res.status(400).json({ error: "Xác thực reCAPTCHA thất bại, vui lòng thử lại" });
    }

    const isBooking = type === "booking";
    // "maintenance" = đăng ký nhắc bảo dưỡng định kỳ - tái dùng nguyên bảng/API contacts (cùng bản
    // chất "khách để lại thông tin, admin theo dõi/liên hệ lại") thay vì tạo bảng riêng gần như
    // giống hệt. Hiện chưa có cơ chế TỰ ĐỘNG gửi nhắc (email/SMS) - admin xem danh sách và chủ động
    // gọi lại theo đúng thời điểm, xem huong-dan-viet-content-nhan-vien.md.
    const VALID_TYPES = ["booking", "contact", "maintenance", "facebook_lead", "tiktok_lead"];
    const resolvedType = VALID_TYPES.includes(type) ? type : "contact";

    // Chặn trùng lịch ngay ở server (không chỉ dựa vào UI đã disable) - phòng trường hợp 2 khách
    // cùng gửi gần như đồng thời trước khi UI kịp cập nhật lại trạng thái đầy chỗ.
    if (isBooking && preferred_date && preferred_time) {
        if (!BOOKING_SLOTS.includes(preferred_time)) {
            return res.status(400).json({ error: "Khung giờ không hợp lệ" });
        }
        const capacity = await getSlotCapacity();
        const current = await db.prepare(
            "SELECT COUNT(*) as c FROM contacts WHERE type = 'booking' AND preferred_date = ? AND preferred_time = ?"
        ).get(preferred_date, preferred_time);
        if (current.c >= capacity) {
            return res.status(409).json({ error: "Khung giờ này vừa đầy chỗ, vui lòng chọn khung giờ khác" });
        }
    }

    const info = await db.prepare(`
        INSERT INTO contacts (type, name, phone, email, service, preferred_date, preferred_time, message)
        VALUES (@type, @name, @phone, @email, @service, @preferred_date, @preferred_time, @message)
    `).run({
        type: resolvedType,
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

// DELETE /api/contacts/:id - xoá hẳn 1 liên hệ/đặt lịch/đăng ký nhắc bảo dưỡng (VD dữ liệu test,
// spam) - trước đây chưa có endpoint này nên không xoá được, chỉ đổi trạng thái.
router.delete("/:id", canViewContacts, async (req, res) => {
    const info = await db.prepare("DELETE FROM contacts WHERE id = ?").run(req.params.id);
    if (info.changes === 0) return res.status(404).json({ error: "Không tìm thấy" });

    await db.logActivity(req.admin, "delete_contact", `contact:${req.params.id}`);
    res.json({ ok: true });
});

module.exports = router;
