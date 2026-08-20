/**
 * Port từ duchieuauto-backend/routes/render.js sang Hono (Phase 13). Dùng c.html() (Hono có sẵn)
 * thay res.type("html").send(). Logic 100% giữ nguyên.
 */
import { Hono } from "hono";
import { renderProductHtml, renderCategoryHtml, renderBrandHtml, renderPostHtml, notFoundHtml } from "../utils/ssr-render.js";

const CATEGORIES_WITH_PRODUCT_GROUPS = ["do-ban-tai"];
async function resolveBrandName(db, categoryId, brandId, brandTypeId) {
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

const app = new Hono();

app.get("/product", async (c) => {
    const id = c.req.query("id");
    if (!id) return c.html(notFoundHtml("Thiếu id sản phẩm"), 400);

    const db = c.get("db");
    const p = await db.prepare(`
        SELECT products.*, categories.name as category_name
        FROM products JOIN categories ON categories.id = products.category_id
        WHERE products.id = ? AND products.hidden = 0
    `).get(id);
    if (!p) return c.html(notFoundHtml("Không tìm thấy sản phẩm"), 404);

    const specs = await db.prepare("SELECT spec_key, spec_value FROM product_specs WHERE product_id = ? ORDER BY sort_order").all(id);
    const brandName = await resolveBrandName(db, p.category_id, p.brand_id, p.brand_type_id);

    const html = renderProductHtml({
        ...p,
        image: productImagePath(p.id, p.image),
        brand: brandName,
        specs: specs.map(s => [s.spec_key, s.spec_value])
    });
    return c.html(html);
});

app.get("/brand", async (c) => {
    const catId = c.req.query("id");
    const brandId = c.req.query("brand");
    const typeId = c.req.query("loai");
    if (!catId || !brandId) return c.html(notFoundHtml("Thiếu id danh mục hoặc thương hiệu"), 400);

    const db = c.get("db");
    const [cat, brand, type] = await Promise.all([
        db.prepare("SELECT * FROM categories WHERE id = ?").get(catId),
        db.prepare("SELECT * FROM brands WHERE category_id = ? AND id = ? AND hidden = 0").get(catId, brandId),
        typeId ? db.prepare("SELECT * FROM brand_types WHERE category_id = ? AND brand_id = ? AND id = ?").get(catId, brandId, typeId) : Promise.resolve(null)
    ]);
    if (!cat || !brand) return c.html(notFoundHtml("Không tìm thấy thương hiệu"), 404);
    if (typeId && !type) return c.html(notFoundHtml("Không tìm thấy loại sản phẩm"), 404);

    const types = !typeId
        ? await db.prepare("SELECT * FROM brand_types WHERE category_id = ? AND brand_id = ? ORDER BY sort_order").all(catId, brandId)
        : [];

    const products = (typeId || !types.length)
        ? (typeId
            ? await db.prepare("SELECT id, name, price FROM products WHERE category_id = ? AND brand_id = ? AND brand_type_id = ? AND hidden = 0 ORDER BY sort_order").all(catId, brandId, typeId)
            : await db.prepare("SELECT id, name, price FROM products WHERE category_id = ? AND brand_id = ? AND hidden = 0 ORDER BY sort_order").all(catId, brandId))
        : [];

    const html = renderBrandHtml({ cat, brand, type, types, products });
    return c.html(html);
});

app.get("/category", async (c) => {
    const id = c.req.query("id");
    if (!id) return c.html(notFoundHtml("Thiếu id danh mục"), 400);

    const db = c.get("db");
    const cat = await db.prepare("SELECT * FROM categories WHERE id = ?").get(id);
    if (!cat) return c.html(notFoundHtml("Không tìm thấy danh mục"), 404);

    const sections = await db.prepare("SELECT heading, body FROM category_sections WHERE category_id = ? ORDER BY sort_order").all(id);
    const faqs = await db.prepare("SELECT question, answer FROM category_faqs WHERE category_id = ? ORDER BY sort_order").all(id);

    const html = renderCategoryHtml(cat, sections, faqs);
    return c.html(html);
});

app.get("/post", async (c) => {
    const slug = c.req.query("slug");
    if (!slug) return c.html(notFoundHtml("Thiếu slug bài viết"), 400);

    const db = c.get("db");
    const post = await db.prepare("SELECT * FROM posts WHERE slug = ? AND published = 1").get(slug);
    if (!post) return c.html(notFoundHtml("Không tìm thấy bài viết"), 404);

    const html = renderPostHtml(post);
    return c.html(html);
});

export default app;
