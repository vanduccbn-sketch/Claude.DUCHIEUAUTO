/**
 * Port từ duchieuauto-backend/routes/banners.js sang Hono (Phase 13). Giữ nguyên 100% logic.
 */
import { Hono } from "hono";
import { requireRole } from "../middleware/auth.js";

const canManageBanners = requireRole("ads", "super_admin");

const app = new Hono();

app.get("/", async (c) => {
    const db = c.get("db");
    const banners = await db.prepare(`
        SELECT * FROM banners
        WHERE (start_date IS NULL OR start_date = '' OR date(start_date) <= date('now'))
          AND (end_date IS NULL OR end_date = '' OR date(end_date) >= date('now'))
        ORDER BY sort_order ASC, id DESC
    `).all();
    return c.json(banners);
});

app.get("/admin/all", ...canManageBanners, async (c) => {
    const db = c.get("db");
    const banners = await db.prepare("SELECT * FROM banners ORDER BY sort_order ASC, id DESC").all();
    return c.json(banners);
});

app.post("/", ...canManageBanners, async (c) => {
    const { title, image, link, sort_order, start_date, end_date } = await c.req.json();
    if (!title || !image) {
        return c.json({ error: "Thiếu title hoặc image" }, 400);
    }

    const db = c.get("db");
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

    await db.logActivity(c.get("admin"), "create_banner", `banner:${info.lastInsertRowid}`);
    return c.json({ id: info.lastInsertRowid }, 201);
});

app.put("/:id", ...canManageBanners, async (c) => {
    const db = c.get("db");
    const id = c.req.param("id");
    const existing = await db.prepare("SELECT * FROM banners WHERE id = ?").get(id);
    if (!existing) return c.json({ error: "Không tìm thấy banner" }, 404);

    const body = await c.req.json();
    const merged = {
        title: body.title ?? existing.title,
        image: body.image ?? existing.image,
        link: body.link ?? existing.link,
        sort_order: body.sort_order !== undefined ? body.sort_order : existing.sort_order,
        start_date: body.start_date !== undefined ? body.start_date : existing.start_date,
        end_date: body.end_date !== undefined ? body.end_date : existing.end_date,
        id: existing.id
    };
    await db.prepare(`
        UPDATE banners SET title=@title, image=@image, link=@link, sort_order=@sort_order,
        start_date=@start_date, end_date=@end_date WHERE id=@id
    `).run(merged);

    await db.logActivity(c.get("admin"), "update_banner", `banner:${existing.id}`);
    return c.json({ ok: true });
});

app.delete("/:id", ...canManageBanners, async (c) => {
    const db = c.get("db");
    const id = c.req.param("id");
    const existing = await db.prepare("SELECT id FROM banners WHERE id = ?").get(id);
    if (!existing) return c.json({ error: "Không tìm thấy banner" }, 404);

    await db.prepare("DELETE FROM banners WHERE id = ?").run(id);
    await db.logActivity(c.get("admin"), "delete_banner", `banner:${existing.id}`);
    return c.json({ ok: true });
});

export default app;
