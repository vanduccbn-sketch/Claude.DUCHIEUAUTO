/**
 * Port từ duchieuauto-backend/routes/contacts.js sang Hono (Phase 13). Giữ nguyên 100% logic.
 */
import { Hono } from "hono";
import { requireRole } from "../middleware/auth.js";
import { verifyTurnstile } from "../utils/verify-turnstile.js";

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

// Khuyến mãi "Trải nghiệm dịch vụ rửa xe miễn phí" (5 ngày đầu khai trương) - khung giờ RIÊNG,
// ngắn hơn (45 phút, khớp thời gian rửa 1 xe), chạy liên tục 8:00-18:00 KHÔNG nghỉ trưa. 600 phút /
// 45 phút = 13 khung tối đa, khung cuối kết thúc 17:45.
const WASH_PROMO_SLOTS = [
    "8:00 - 8:45", "8:45 - 9:30", "9:30 - 10:15", "10:15 - 11:00",
    "11:00 - 11:45", "11:45 - 12:30", "12:30 - 13:15", "13:15 - 14:00",
    "14:00 - 14:45", "14:45 - 15:30", "15:30 - 16:15", "16:15 - 17:00", "17:00 - 17:45"
];
const WASH_PROMO_START_DATE = "2026-09-15";
const WASH_PROMO_END_DATE = "2026-09-19";
const DEFAULT_WASH_PROMO_CAPACITY = 1;

function isWithinWashPromoWindow(date) {
    return date >= WASH_PROMO_START_DATE && date <= WASH_PROMO_END_DATE;
}

async function getCapacityFromSettings(db, key, defaultVal) {
    const row = await db.prepare("SELECT value FROM settings WHERE key = ?").get(key);
    const n = parseInt(row && row.value, 10);
    return Number.isFinite(n) && n > 0 ? n : defaultVal;
}
async function getSlotCapacity(db) { return getCapacityFromSettings(db, "booking_slot_capacity", DEFAULT_SLOT_CAPACITY); }
async function getWashPromoCapacity(db) { return getCapacityFromSettings(db, "wash_promo_slot_capacity", DEFAULT_WASH_PROMO_CAPACITY); }

const app = new Hono();

app.get("/availability", async (c) => {
    const date = c.req.query("date");
    const type = c.req.query("type");
    if (!date) return c.json({ error: "Thiếu ngày cần kiểm tra" }, 400);

    const isWashPromo = type === "wash_promo";
    if (isWashPromo && !isWithinWashPromoWindow(date)) {
        return c.json({ error: "Ngày ngoài khoảng thời gian khuyến mãi rửa xe miễn phí (15/09 - 19/09/2026)" }, 400);
    }

    const db = c.get("db");
    const slots = isWashPromo ? WASH_PROMO_SLOTS : BOOKING_SLOTS;
    const capacity = isWashPromo ? await getWashPromoCapacity(db) : await getSlotCapacity(db);
    const rows = await db.prepare(
        "SELECT preferred_time, COUNT(*) as booked FROM contacts WHERE type = 'booking' AND preferred_date = ? GROUP BY preferred_time"
    ).all(date);
    const bookedMap = {};
    rows.forEach(r => { bookedMap[r.preferred_time] = r.booked; });

    return c.json({
        capacity,
        slots: slots.map(slot => ({
            slot,
            booked: bookedMap[slot] || 0,
            full: (bookedMap[slot] || 0) >= capacity
        }))
    });
});

app.post("/", async (c) => {
    const { type, name, phone, email, service, preferred_date, preferred_time, car_brand, car_model, message, recaptcha_token, slot_type } = await c.req.json();

    if (!name || !phone) {
        return c.json({ error: "Thiếu họ tên hoặc số điện thoại" }, 400);
    }

    if (!(await verifyTurnstile(recaptcha_token, c.env))) {
        return c.json({ error: "Xác thực bảo mật thất bại, vui lòng thử lại" }, 400);
    }

    const db = c.get("db");
    const isBooking = type === "booking";
    const isWashPromo = slot_type === "wash_promo";
    const VALID_TYPES = ["booking", "contact", "maintenance", "facebook_lead", "tiktok_lead"];
    const resolvedType = VALID_TYPES.includes(type) ? type : "contact";

    if (isBooking && preferred_date && preferred_time) {
        const validSlots = isWashPromo ? WASH_PROMO_SLOTS : BOOKING_SLOTS;
        if (!validSlots.includes(preferred_time)) {
            return c.json({ error: "Khung giờ không hợp lệ" }, 400);
        }
        if (isWashPromo && !isWithinWashPromoWindow(preferred_date)) {
            return c.json({ error: "Ngày ngoài khoảng thời gian khuyến mãi rửa xe miễn phí (15/09 - 19/09/2026)" }, 400);
        }
        const capacity = isWashPromo ? await getWashPromoCapacity(db) : await getSlotCapacity(db);
        const current = await db.prepare(
            "SELECT COUNT(*) as c FROM contacts WHERE type = 'booking' AND preferred_date = ? AND preferred_time = ?"
        ).get(preferred_date, preferred_time);
        if (current.c >= capacity) {
            return c.json({ error: "Khung giờ này vừa đầy chỗ, vui lòng chọn khung giờ khác" }, 409);
        }
    }

    const info = await db.prepare(`
        INSERT INTO contacts (type, name, phone, email, service, preferred_date, preferred_time, car_brand, car_model, message)
        VALUES (@type, @name, @phone, @email, @service, @preferred_date, @preferred_time, @car_brand, @car_model, @message)
    `).run({
        type: resolvedType,
        name, phone,
        email: email || null,
        service: service || null,
        preferred_date: preferred_date || null,
        preferred_time: preferred_time || null,
        car_brand: car_brand || null,
        car_model: car_model || null,
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
