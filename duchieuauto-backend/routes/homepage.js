const express = require("express");
const db = require("../models/db");
const { requireRole } = require("../middleware/auth");
const { sanitizeContent } = require("../utils/sanitize-content");

const router = express.Router();

// Cùng phạm vi quyền với quản lý sản phẩm/danh mục - đây là chọn sản phẩm thật để làm nổi bật ở
// trang chủ, thuộc về "nội dung sản phẩm" chứ không phải quảng cáo/tracking (Ads admin không cần).
const canEditHighlights = requireRole("content", "super_admin");
const VALID_SECTIONS = ["strategic", "tech"];

// Chỉ danh mục "Đồ Bán Tải" có brand_type_id LÀ thương hiệu thật - mọi danh mục khác brand_id đã
// là thương hiệu thật, brand_type_id chỉ là phân loại tính năng (VD JBL -> "Loa Sub"), KHÔNG PHẢI
// tên thương hiệu khác. Đúng quy tắc đã áp dụng ở routes/products.js (bug từng gặp: JBL hiện nhầm
// "Loa Sub" thay vì "JBL" khi coi mọi brand_type_id là thương hiệu thật).
const CATEGORIES_WITH_PRODUCT_GROUPS = ["do-ban-tai"];

function productImagePath(id, image) {
    return image || `assets/images/products/${id}/anh-1.jpg`;
}

// GET /api/homepage - public, trả về 2 danh sách đã join sẵn thông tin sản phẩm thật (tên/ảnh/giá/
// thương hiệu) - trang chủ chỉ cần render thẳng, không phải tự tra cứu thêm.
router.get("/", async (req, res) => {
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

    res.json({
        strategic: rows.filter(r => r.section === "strategic").map(toItem),
        tech: rows.filter(r => r.section === "tech").map(toItem)
    });
});

/* =========================================================
   ADMIN - quản lý (chỉ content/super_admin)
   ========================================================= */

// GET /api/homepage/admin/all?section=strategic|tech
router.get("/admin/all", canEditHighlights, async (req, res) => {
    const { section } = req.query;
    let sql = `
        SELECT h.*, p.name as product_name
        FROM homepage_highlights h
        JOIN products p ON p.id = h.product_id
    `;
    const args = [];
    if (section) { sql += " WHERE h.section = ?"; args.push(section); }
    sql += " ORDER BY h.section, h.sort_order";

    const rows = await db.prepare(sql).all(...args);
    res.json(rows);
});

// POST /api/homepage - thêm 1 sản phẩm vào khu vực nổi bật
router.post("/", canEditHighlights, async (req, res) => {
    const { section, product_id, badge_text, price_tag, tag_text, story_title, description } = req.body;
    if (!VALID_SECTIONS.includes(section)) return res.status(400).json({ error: "section không hợp lệ" });
    if (!product_id) return res.status(400).json({ error: "Thiếu sản phẩm" });

    const product = await db.prepare("SELECT id FROM products WHERE id = ?").get(product_id);
    if (!product) return res.status(404).json({ error: "Không tìm thấy sản phẩm" });

    const info = await db.prepare(`
        INSERT INTO homepage_highlights (section, product_id, badge_text, price_tag, tag_text, story_title, description, sort_order)
        VALUES (?, ?, ?, ?, ?, ?, ?, (SELECT COALESCE(MAX(sort_order), -1) + 1 FROM homepage_highlights WHERE section = ?))
    `).run(
        section, product_id,
        badge_text || null, price_tag || null, tag_text || null, story_title || null,
        description ? sanitizeContent(description) : null,
        section
    );

    await db.logActivity(req.admin, "create_homepage_highlight", `${section}:${product_id}`);
    res.status(201).json({ id: info.lastInsertRowid });
});

// PUT /api/homepage/:id - sửa 1 mục
router.put("/:id", canEditHighlights, async (req, res) => {
    const existing = await db.prepare("SELECT * FROM homepage_highlights WHERE id = ?").get(req.params.id);
    if (!existing) return res.status(404).json({ error: "Không tìm thấy" });

    const { product_id, badge_text, price_tag, tag_text, story_title, description, sort_order } = req.body;
    if (product_id) {
        const product = await db.prepare("SELECT id FROM products WHERE id = ?").get(product_id);
        if (!product) return res.status(404).json({ error: "Không tìm thấy sản phẩm" });
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

    await db.logActivity(req.admin, "update_homepage_highlight", `highlight:${existing.id}`);
    res.json({ ok: true });
});

// DELETE /api/homepage/:id
router.delete("/:id", canEditHighlights, async (req, res) => {
    const info = await db.prepare("DELETE FROM homepage_highlights WHERE id = ?").run(req.params.id);
    if (info.changes === 0) return res.status(404).json({ error: "Không tìm thấy" });

    await db.logActivity(req.admin, "delete_homepage_highlight", `highlight:${req.params.id}`);
    res.json({ ok: true });
});

module.exports = router;
