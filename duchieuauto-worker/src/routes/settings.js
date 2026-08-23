/**
 * Port từ duchieuauto-backend/routes/settings.js sang Hono (Phase 13). Giữ nguyên 100% logic.
 */
import { Hono } from "hono";
import { requireRole } from "../middleware/auth.js";

const canEditSettings = requireRole("ads", "super_admin");

const ALLOWED_KEYS = [
    "google_analytics_id",
    "google_search_console_verification",
    "facebook_pixel_id",
    "social_facebook",
    "social_zalo",
    "social_youtube",
    "seo_default_title",
    "seo_default_description",
    "booking_slot_capacity",
    "wash_promo_slot_capacity"
];

const app = new Hono();

app.get("/", async (c) => {
    const db = c.get("db");
    const rows = await db.prepare("SELECT key, value FROM settings").all();
    const map = {};
    ALLOWED_KEYS.forEach(k => { map[k] = ""; });
    rows.forEach(r => { if (ALLOWED_KEYS.includes(r.key)) map[r.key] = r.value || ""; });
    return c.json(map);
});

app.put("/", ...canEditSettings, async (c) => {
    const db = c.get("db");
    const body = await c.req.json();
    const upsert = db.prepare(`
        INSERT INTO settings (key, value, updated_at) VALUES (@key, @value, @updated_at)
        ON CONFLICT(key) DO UPDATE SET value = @value, updated_at = @updated_at
    `);
    const now = new Date().toISOString();
    for (const key of ALLOWED_KEYS) {
        if (Object.prototype.hasOwnProperty.call(body, key)) {
            await upsert.run({ key, value: body[key] ?? "", updated_at: now });
        }
    }

    await db.logActivity(c.get("admin"), "update_settings", null);
    return c.json({ ok: true });
});

export default app;
