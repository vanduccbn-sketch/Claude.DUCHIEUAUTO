/**
 * Port từ duchieuauto-backend/routes/homepage-content.js sang Hono (Phase 13). Giữ nguyên 100% logic.
 */
import { Hono } from "hono";
import { requireRole } from "../middleware/auth.js";

const canEditContent = requireRole("content", "super_admin");

const CONTENT_SECTIONS = {
    hero: ["hero_subtitle", "hero_title_line1", "hero_title_line2", "hero_description", "hero_poster_image"],
    about: [
        "about_badge", "about_slogan_line1", "about_slogan_line2", "about_description",
        "about_stat1_number", "about_stat1_label",
        "about_stat2_number", "about_stat2_label",
        "about_stat3_number", "about_stat3_label",
        "about_image_main", "about_image_detail1", "about_image_detail2"
    ],
    service: ["service_section_title"],
    quick_actions: [
        "quick_actions_section_title",
        "quick_actions_cta1_label", "quick_actions_cta1_title", "quick_actions_cta1_desc",
        "quick_actions_cta2_label", "quick_actions_cta2_title", "quick_actions_cta2_desc"
    ],
    product: ["product_section_title", "product_cta_label", "product_cta_title", "product_cta_desc"],
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
    other_pages: ["faq_page_title", "faq_page_intro", "policy_page_title", "booking_page_title", "booking_page_intro"]
};

const ALLOWED_KEYS = Object.values(CONTENT_SECTIONS).flat();

function sectionOfKey(key) {
    return Object.keys(CONTENT_SECTIONS).find(section => CONTENT_SECTIONS[section].includes(key));
}

async function getAllowedSections(db, admin) {
    if (admin.role === "super_admin") return null;
    const rows = await db.prepare("SELECT section FROM content_permissions WHERE admin_id = ?").all(admin.id);
    if (rows.length === 0) return null;
    return rows.map(r => r.section);
}

const app = new Hono();

app.get("/", async (c) => {
    const db = c.get("db");
    const rows = await db.prepare("SELECT key, value FROM homepage_content").all();
    const map = {};
    ALLOWED_KEYS.forEach(k => { map[k] = ""; });
    rows.forEach(r => { if (ALLOWED_KEYS.includes(r.key)) map[r.key] = r.value || ""; });
    return c.json(map);
});

app.get("/my-permissions", ...canEditContent, async (c) => {
    const db = c.get("db");
    const sections = await getAllowedSections(db, c.get("admin"));
    return c.json(sections === null ? { full: true } : { full: false, sections });
});

app.put("/", ...canEditContent, async (c) => {
    const db = c.get("db");
    const admin = c.get("admin");
    const allowedSections = await getAllowedSections(db, admin);
    const body = await c.req.json();
    if (allowedSections !== null) {
        const deniedKeys = Object.keys(body).filter(key => ALLOWED_KEYS.includes(key) && !allowedSections.includes(sectionOfKey(key)));
        if (deniedKeys.length > 0) {
            return c.json({ error: `Bạn không có quyền sửa khối chứa: ${deniedKeys.join(", ")}` }, 403);
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
        if (!Object.prototype.hasOwnProperty.call(body, key)) continue;
        const newValue = body[key] ?? "";

        const current = await db.prepare("SELECT value FROM homepage_content WHERE key = ?").get(key);
        const oldValue = current ? (current.value || "") : "";
        if (oldValue !== newValue) {
            await insertHistory.run({ key, old_value: oldValue, changed_by: admin.username, changed_at: now });
        }

        await upsert.run({ key, value: newValue, updated_at: now });
    }

    await db.logActivity(admin, "update_homepage_content", null);
    return c.json({ ok: true });
});

app.get("/history", ...canEditContent, async (c) => {
    const db = c.get("db");
    const rows = await db.prepare(
        "SELECT id, key, old_value, changed_by, changed_at FROM homepage_content_history ORDER BY id DESC LIMIT 50"
    ).all();
    return c.json(rows);
});

app.post("/revert", ...canEditContent, async (c) => {
    const db = c.get("db");
    const admin = c.get("admin");
    const { historyId } = await c.req.json();
    const entry = await db.prepare("SELECT key, old_value FROM homepage_content_history WHERE id = ?").get(historyId);
    if (!entry) return c.json({ error: "Không tìm thấy mục lịch sử này" }, 404);
    if (!ALLOWED_KEYS.includes(entry.key)) return c.json({ error: "Khoá không hợp lệ" }, 400);

    const allowedSections = await getAllowedSections(db, admin);
    if (allowedSections !== null && !allowedSections.includes(sectionOfKey(entry.key))) {
        return c.json({ error: "Bạn không có quyền khôi phục khối này" }, 403);
    }

    const now = new Date().toISOString();
    const current = await db.prepare("SELECT value FROM homepage_content WHERE key = ?").get(entry.key);
    await db.prepare(
        "INSERT INTO homepage_content_history (key, old_value, changed_by, changed_at) VALUES (@key, @old_value, @changed_by, @changed_at)"
    ).run({ key: entry.key, old_value: current ? (current.value || "") : "", changed_by: admin.username, changed_at: now });

    await db.prepare(`
        INSERT INTO homepage_content (key, value, updated_at) VALUES (@key, @value, @updated_at)
        ON CONFLICT(key) DO UPDATE SET value = @value, updated_at = @updated_at
    `).run({ key: entry.key, value: entry.old_value || "", updated_at: now });

    await db.logActivity(admin, "revert_homepage_content", entry.key);
    return c.json({ ok: true, key: entry.key, restoredValue: entry.old_value || "" });
});

export default app;
