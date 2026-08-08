/**
 * Port từ duchieuauto-backend/routes/contacts.js sang Hono (Phase 13). Giữ nguyên 100% logic.
 */
import { Hono } from "hono";
import { requireRole } from "../middleware/auth.js";
import { verifyRecaptcha } from "../utils/verify-recaptcha.js";

const canViewContacts = requireRole();

const BOOKING_SLOTS = [
    "8:00 - 9:30",
    "9:30 - 11:00",
    "11:00 - 12:30",
    "13:30 - 15:00",
    "15:00 - 16:30",
    "16:30 - 18:00"
];
const DEFAULT_SLOT_CAPACITY = 2;

async function getSlotCapacity(db) {
    const row = await db.prepare("SELECT value FROM settings WHERE key = 'booking_slot_capacity'").get();
    const n = parseInt(row && row.value, 10);
    return Number.isFinite(n) && n > 0 ? n : DEFAULT_SLOT_CAPACITY;
}

const app = new Hono();

app.get("/availability", async (c) => {
    const date = c.req.query("date");
    if (!date) return c.json({ error: "Thiếu ngày cần kiểm tra" }, 400);

    const db = c.get("db");
    const capacity = await getSlotCapacity(db);
    const rows = await db.prepare(
        "SELECT preferred_time, COUNT(*) as booked FROM contacts WHERE type = 'booking' AND preferred_date = ? GROUP BY preferred_time"
    ).all(date);
    const bookedMap = {};
    rows.forEach(r => { bookedMap[r.preferred_time] = r.booked; });

    return c.json({
        capacity,
        slots: BOOKING_SLOTS.map(slot => ({
            slot,
            booked: bookedMap[slot] || 0,
            full: (bookedMap[slot] || 0) >= capacity
        }))
    });
});

app.post("/", async (c) => {
    const { type, name, phone, email, service, preferred_date, preferred_time, message, recaptcha_token } = await c.req.json();

    if (!name || !phone) {
        return c.json({ error: "Thiếu họ tên hoặc số điện thoại" }, 400);
    }

    if (!(await verifyRecaptcha(recaptcha_token, c.env))) {
        return c.json({ error: "Xác thực reCAPTCHA thất bại, vui lòng thử lại" }, 400);
    }

    const db = c.get("db");
    const isBooking = type === "booking";
    const VALID_TYPES = ["booking", "contact", "maintenance", "facebook_lead", "tiktok_lead"];
    const resolvedType = VALID_TYPES.includes(type) ? type : "contact";

    if (isBooking && preferred_date && preferred_time) {
        if (!BOOKING_SLOTS.includes(preferred_time)) {
            return c.json({ error: "Khung giờ không hợp lệ" }, 400);
        }
        const capacity = await getSlotCapacity(db);
        const current = await db.prepare(
            "SELECT COUNT(*) as c FROM contacts WHERE type = 'booking' AND preferred_date = ? AND preferred_time = ?"
        ).get(preferred_date, preferred_time);
        if (current.c >= capacity) {
            return c.json({ error: "Khung giờ này vừa đầy chỗ, vui lòng chọn khung giờ khác" }, 409);
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

    return c.json({ id: info.lastInsertRowid }, 201);
});

app.get("/", ...canViewContacts, async (c) => {
    const db = c.get("db");
    const contacts = await db.prepare("SELECT * FROM contacts ORDER BY created_at DESC").all();
    return c.json(contacts);
});

app.put("/:id/status", ...canViewContacts, async (c) => {
    const { status } = await c.req.json();
    if (!["new", "contacted", "done"].includes(status)) {
        return c.json({ error: "status không hợp lệ" }, 400);
    }
    const db = c.get("db");
    const id = c.req.param("id");
    const info = await db.prepare("UPDATE contacts SET status = ? WHERE id = ?").run(status, id);
    if (info.changes === 0) return c.json({ error: "Không tìm thấy" }, 404);

    await db.logActivity(c.get("admin"), "update_contact_status", `contact:${id}:${status}`);
    return c.json({ ok: true });
});

app.delete("/:id", ...canViewContacts, async (c) => {
    const db = c.get("db");
    const id = c.req.param("id");
    const info = await db.prepare("DELETE FROM contacts WHERE id = ?").run(id);
    if (info.changes === 0) return c.json({ error: "Không tìm thấy" }, 404);

    await db.logActivity(c.get("admin"), "delete_contact", `contact:${id}`);
    return c.json({ ok: true });
});

export default app;
