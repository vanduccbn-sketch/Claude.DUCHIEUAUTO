/**
 * Port từ duchieuauto-backend/routes/homepage.js sang Hono (Phase 13). Giữ nguyên 100% logic.
 */
import { Hono } from "hono";
import { requireRole } from "../middleware/auth.js";
import { sanitizeContent } from "../utils/sanitize-content.js";

const canEditHighlights = requireRole("content", "super_admin");
const VALID_SECTIONS = ["strategic", "tech"];
const CATEGORIES_WITH_PRODUCT_GROUPS = ["do-ban-tai"];

function productImagePath(id, image) {
    return image || `assets/images/products/${id}/anh-1.webp`;
}

const app = new Hono();

app.get("/", async (c) => {
    const db = c.get("db");
    const rows = await db.prepare(`
        SELECT h.*, p.name as product_name, p.price as product_price, p.image as product_image,
               p.brand_id, p.category_id, p.brand_type_id
        FROM homepage_highlights h
        JOIN products p ON p.id = h.product_id AND p.hidden = 0
        ORDER BY h.section, h.sort_order
    `).all();

    const brands = await db.prepare("SELECT category_id, id, name FROM brands").all();
    const types = await db.prepare("SELECT category_id, brand_id, id, name FROM brand_types").all();
    function brandName(r) {
        if (r.brand_type_id && CATEGORIES_WITH_PRODUCT_GROUPS.includes(r.category_id)) {
            const t = types.find(t => t.category_id === r.category_id && t.brand_id === r.brand_id && t.id === r.brand_type_id);
            if (t) return t.name;
        }
        const b = brands.find(b => b.category_id === r.category_id && b.id === r.brand_id);
        return b ? b.name : r.brand_id;
    }

    const toItem = (r) => ({
        id: r.id,
        productId: r.product_id,
        name: r.product_name,
        price: r.product_price,
        image: productImagePath(r.product_id, r.product_image),
        brand: brandName(r),
        badgeText: r.badge_text,
        priceTag: r.price_tag,
        tagText: r.tag_text,
        storyTitle: r.story_title,
        description: r.description
    });

    return c.json({
        strategic: rows.filter(r => r.section === "strategic").map(toItem),
        tech: rows.filter(r => r.section === "tech").map(toItem)
    });
});

app.get("/admin/all", ...canEditHighlights, async (c) => {
    const section = c.req.query("section");
    let sql = `
        SELECT h.*, p.name as product_name
        FROM homepage_highlights h
        JOIN products p ON p.id = h.product_id
    `;
    const args = [];
    if (section) { sql += " WHERE h.section = ?"; args.push(section); }
    sql += " ORDER BY h.section, h.sort_order";

    const db = c.get("db");
    const rows = await db.prepare(sql).all(...args);
    return c.json(rows);
});

app.post("/", ...canEditHighlights, async (c) => {
    const { section, product_id, badge_text, price_tag, tag_text, story_title, description } = await c.req.json();
    if (!VALID_SECTIONS.includes(section)) return c.json({ error: "section không hợp lệ" }, 400);
    if (!product_id) return c.json({ error: "Thiếu sản phẩm" }, 400);

    const db = c.get("db");
    const product = await db.prepare("SELECT id FROM products WHERE id = ?").get(product_id);
    if (!product) return c.json({ error: "Không tìm thấy sản phẩm" }, 404);

    const info = await db.prepare(`
        INSERT INTO homepage_highlights (section, product_id, badge_text, price_tag, tag_text, story_title, description, sort_order)
        VALUES (?, ?, ?, ?, ?, ?, ?, (SELECT COALESCE(MAX(sort_order), -1) + 1 FROM homepage_highlights WHERE section = ?))
    `).run(
        section, product_id,
        badge_text || null, price_tag || null, tag_text || null, story_title || null,
        description ? sanitizeContent(description) : null,
        section
    );

    await db.logActivity(c.get("admin"), "create_homepage_highlight", `${section}:${product_id}`);
    return c.json({ id: info.lastInsertRowid }, 201);
});

app.put("/:id", ...canEditHighlights, async (c) => {
    const db = c.get("db");
    const id = c.req.param("id");
    const existing = await db.prepare("SELECT * FROM homepage_highlights WHERE id = ?").get(id);
    if (!existing) return c.json({ error: "Không tìm thấy" }, 404);

    const { product_id, badge_text, price_tag, tag_text, story_title, description, sort_order } = await c.req.json();
    if (product_id) {
        const product = await db.prepare("SELECT id FROM products WHERE id = ?").get(product_id);
        if (!product) return c.json({ error: "Không tìm thấy sản phẩm" }, 404);
    }

    const merged = {
        product_id: product_id || existing.product_id,
        badge_text: badge_text !== undefined ? (badge_text || null) : existing.badge_text,
        price_tag: price_tag !== undefined ? (price_tag || null) : existing.price_tag,
        tag_text: tag_text !== undefined ? (tag_text || null) : existing.tag_text,
        story_title: story_title !== undefined ? (story_title || null) : existing.story_title,
        description: description !== undefined ? (description ? sanitizeContent(description) : null) : existing.description,
        sort_order: sort_order !== undefined ? sort_order : existing.sort_order,
        id: existing.id
    };
    await db.prepare(`
        UPDATE homepage_highlights SET product_id=@product_id, badge_text=@badge_text, price_tag=@price_tag,
        tag_text=@tag_text, story_title=@story_title, description=@description, sort_order=@sort_order
        WHERE id=@id
    `).run(merged);

    await db.logActivity(c.get("admin"), "update_homepage_highlight", `highlight:${existing.id}`);
    return c.json({ ok: true });
});

app.delete("/:id", ...canEditHighlights, async (c) => {
    const db = c.get("db");
    const id = c.req.param("id");
    const info = await db.prepare("DELETE FROM homepage_highlights WHERE id = ?").run(id);
    if (info.changes === 0) return c.json({ error: "Không tìm thấy" }, 404);

    await db.logActivity(c.get("admin"), "delete_homepage_highlight", `highlight:${id}`);
    return c.json({ ok: true });
});

export default app;
