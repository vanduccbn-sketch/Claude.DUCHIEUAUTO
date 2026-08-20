/* =========================================================
   Route SSR cho bot (Phase 12) - xem giải thích đầy đủ ở utils/ssr-render.js.
   Public, không cần đăng nhập (bot không có token) - chỉ đọc dữ liệu ĐÃ công khai (products.hidden=0,
   posts.published=1), không lộ gì hơn những gì API public /api/products, /api/posts đã trả sẵn.
   ========================================================= */
const express = require("express");
const db = require("../models/db");
const { renderProductHtml, renderCategoryHtml, renderBrandHtml, renderPostHtml, notFoundHtml } = require("../utils/ssr-render");

const router = express.Router();

// Trùng đúng quy tắc thương hiệu đã có ở routes/products.js (CATEGORIES_WITH_PRODUCT_GROUPS) - không
// import chéo giữa 2 route file để tránh phụ thuộc vòng, chỉ là 1 hàm nhỏ nên chấp nhận lặp lại.
const CATEGORIES_WITH_PRODUCT_GROUPS = ["do-ban-tai"];
async function resolveBrandName(categoryId, brandId, brandTypeId) {
    if (brandTypeId && CATEGORIES_WITH_PRODUCT_GROUPS.includes(categoryId)) {
        const t = await db.prepare("SELECT name FROM brand_types WHERE category_id = ? AND brand_id = ? AND id = ?").get(categoryId, brandId, brandTypeId);
        if (t) return t.name;
    }
    const b = await db.prepare("SELECT name FROM brands WHERE category_id = ? AND id = ?").get(categoryId, brandId);
    return b ? b.name : brandTypeId || brandId;
}
function productImagePath(id, image) {
    return image || `assets/images/products/${id}/anh-1.webp`;
}

router.get("/product", async (req, res) => {
    const id = req.query.id;
    if (!id) return res.status(400).type("html").send(notFoundHtml("Thiếu id sản phẩm"));

    const p = await db.prepare(`
        SELECT products.*, categories.name as category_name
        FROM products JOIN categories ON categories.id = products.category_id
        WHERE products.id = ? AND products.hidden = 0
    `).get(id);
    if (!p) return res.status(404).type("html").send(notFoundHtml("Không tìm thấy sản phẩm"));

    const specs = await db.prepare("SELECT spec_key, spec_value FROM product_specs WHERE product_id = ? ORDER BY sort_order").all(id);
    const brandName = await resolveBrandName(p.category_id, p.brand_id, p.brand_type_id);

    const html = renderProductHtml({
        ...p,
        image: productImagePath(p.id, p.image),
        brand: brandName,
        specs: specs.map(s => [s.spec_key, s.spec_value])
    });
    res.type("html").send(html);
});

router.get("/brand", async (req, res) => {
    const catId = req.query.id;
    const brandId = req.query.brand;
    const typeId = req.query.loai;
    if (!catId || !brandId) return res.status(400).type("html").send(notFoundHtml("Thiếu id danh mục hoặc thương hiệu"));

    const [cat, brand, type] = await Promise.all([
        db.prepare("SELECT * FROM categories WHERE id = ?").get(catId),
        db.prepare("SELECT * FROM brands WHERE category_id = ? AND id = ? AND hidden = 0").get(catId, brandId),
        typeId ? db.prepare("SELECT * FROM brand_types WHERE category_id = ? AND brand_id = ? AND id = ?").get(catId, brandId, typeId) : Promise.resolve(null)
    ]);
    if (!cat || !brand) return res.status(404).type("html").send(notFoundHtml("Không tìm thấy thương hiệu"));
    if (typeId && !type) return res.status(404).type("html").send(notFoundHtml("Không tìm thấy loại sản phẩm"));

    const types = !typeId
        ? await db.prepare("SELECT * FROM brand_types WHERE category_id = ? AND brand_id = ? ORDER BY sort_order").all(catId, brandId)
        : [];

    const products = (typeId || !types.length)
        ? (typeId
            ? await db.prepare("SELECT id, name, price FROM products WHERE category_id = ? AND brand_id = ? AND brand_type_id = ? AND hidden = 0 ORDER BY sort_order").all(catId, brandId, typeId)
            : await db.prepare("SELECT id, name, price FROM products WHERE category_id = ? AND brand_id = ? AND hidden = 0 ORDER BY sort_order").all(catId, brandId))
        : [];

    const html = renderBrandHtml({ cat, brand, type, types, products });
    res.type("html").send(html);
});

router.get("/category", async (req, res) => {
    const id = req.query.id;
    if (!id) return res.status(400).type("html").send(notFoundHtml("Thiếu id danh mục"));

    const cat = await db.prepare("SELECT * FROM categories WHERE id = ?").get(id);
    if (!cat) return res.status(404).type("html").send(notFoundHtml("Không tìm thấy danh mục"));

    const sections = await db.prepare("SELECT heading, body FROM category_sections WHERE category_id = ? ORDER BY sort_order").all(id);
    const faqs = await db.prepare("SELECT question, answer FROM category_faqs WHERE category_id = ? ORDER BY sort_order").all(id);

    const html = renderCategoryHtml(cat, sections, faqs);
    res.type("html").send(html);
});

router.get("/post", async (req, res) => {
    const slug = req.query.slug;
    if (!slug) return res.status(400).type("html").send(notFoundHtml("Thiếu slug bài viết"));

    const post = await db.prepare("SELECT * FROM posts WHERE slug = ? AND published = 1").get(slug);
    if (!post) return res.status(404).type("html").send(notFoundHtml("Không tìm thấy bài viết"));

    const html = renderPostHtml(post);
    res.type("html").send(html);
});

module.exports = router;
