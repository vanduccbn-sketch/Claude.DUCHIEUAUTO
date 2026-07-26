const express = require("express");
const db = require("../models/db");
const { requireRole } = require("../middleware/auth");

const router = express.Router();

// Quản lý sản phẩm/danh mục/thương hiệu gộp chung vào việc "viết nội dung web" - giao cho Content
// admin (giống bài viết), Ads admin không có quyền này (đúng phạm vi công việc: Ads quản
// banner/tracking, không đụng dữ liệu sản phẩm).
const canEditCatalog = requireRole("content", "super_admin");

function productImagePath(id, image) {
    return image || `assets/images/products/${id}/anh-1.jpg`;
}

/* =========================================================
   PUBLIC - đọc dữ liệu cho frontend
   ========================================================= */

// GET /api/products/catalog - toàn bộ cây danh mục -> brand -> type -> sản phẩm (rút gọn field,
// đủ dùng để render lưới sản phẩm mà không cần gọi thêm request nào khác).
router.get("/catalog", async (req, res) => {
    const categories = await db.prepare("SELECT * FROM categories ORDER BY sort_order").all();
    const brands = await db.prepare("SELECT * FROM brands WHERE hidden = 0 ORDER BY sort_order").all();
    const types = await db.prepare("SELECT * FROM brand_types ORDER BY sort_order").all();
    const products = await db.prepare(
        "SELECT id, category_id, brand_id, brand_type_id, name, price, image, sort_order FROM products WHERE hidden = 0 ORDER BY sort_order"
    ).all();
    const sections = await db.prepare("SELECT * FROM category_sections ORDER BY category_id, sort_order").all();

    const result = categories.map(cat => {
        const catBrands = brands.filter(b => b.category_id === cat.id).map(brand => {
            const brandTypes = types.filter(t => t.category_id === cat.id && t.brand_id === brand.id);
            const brandProducts = products.filter(p => p.category_id === cat.id && p.brand_id === brand.id);

            const brandOut = { id: brand.id, name: brand.name, logo: brand.logo };
            if (brandTypes.length) {
                brandOut.types = brandTypes.map(t => ({
                    id: t.id,
                    name: t.name,
                    logo: t.logo,
                    products: brandProducts
                        .filter(p => p.brand_type_id === t.id)
                        .map(p => ({ id: p.id, name: p.name, price: p.price, image: productImagePath(p.id, p.image) }))
                }));
            } else {
                brandOut.products = brandProducts
                    .filter(p => !p.brand_type_id)
                    .map(p => ({ id: p.id, name: p.name, price: p.price, image: productImagePath(p.id, p.image) }));
            }
            return brandOut;
        });

        return {
            id: cat.id,
            name: cat.name,
            poster: cat.poster,
            seo: {
                title: cat.seo_title,
                metaDescription: cat.seo_meta_description,
                image: cat.seo_image,
                imageCaption: cat.seo_image_caption,
                intro: cat.seo_intro,
                sections: sections.filter(s => s.category_id === cat.id).map(s => ({ heading: s.heading, body: s.body }))
            },
            brands: catBrands
        };
    });

    res.json(result);
});

// GET /api/products/:id - chi tiết 1 sản phẩm (public, dùng cho trang chi tiết sản phẩm)
router.get("/:id", async (req, res) => {
    const p = await db.prepare("SELECT * FROM products WHERE id = ? AND hidden = 0").get(req.params.id);
    if (!p) return res.status(404).json({ error: "Không tìm thấy sản phẩm" });

    const specs = await db.prepare("SELECT spec_key, spec_value FROM product_specs WHERE product_id = ? ORDER BY sort_order").all(req.params.id);

    // Tên thương hiệu hiển thị: nếu sản phẩm có brand_type_id (VD Đồ Bán Tải: brand_id là NHÓM
    // sản phẩm, brand_type_id mới là thương hiệu thật) thì lấy tên từ brand_types, ngược lại lấy
    // thẳng từ brands (trường hợp thường: brand_id đã là thương hiệu thật).
    const brandName = p.brand_type_id
        ? (await db.prepare("SELECT name FROM brand_types WHERE category_id = ? AND brand_id = ? AND id = ?").get(p.category_id, p.brand_id, p.brand_type_id))?.name
        : (await db.prepare("SELECT name FROM brands WHERE category_id = ? AND id = ?").get(p.category_id, p.brand_id))?.name;

    res.json({
        ...p,
        image: productImagePath(p.id, p.image),
        brand: brandName || p.brand_type_id || p.brand_id,
        specs: specs.map(s => [s.spec_key, s.spec_value])
    });
});

/* =========================================================
   ADMIN - quản lý (chỉ content/super_admin)
   ========================================================= */

// GET /api/products/admin/list - danh sách đầy đủ cho trang quản trị, hỗ trợ lọc + tìm kiếm
router.get("/admin/list", canEditCatalog, async (req, res) => {
    const { category, brand, q } = req.query;
    // brand_name ưu tiên lấy từ brand_types nếu sản phẩm có brand_type_id (VD Đồ Bán Tải: cột
    // brand_id trên products là NHÓM sản phẩm chứ không phải thương hiệu thật) - xem cùng logic ở
    // GET /:id bên dưới.
    let sql = `
        SELECT p.*, c.name as category_name, b.name as group_name,
               COALESCE(bt.name, b.name) as brand_name
        FROM products p
        JOIN categories c ON c.id = p.category_id
        JOIN brands b ON b.category_id = p.category_id AND b.id = p.brand_id
        LEFT JOIN brand_types bt ON bt.category_id = p.category_id AND bt.brand_id = p.brand_id AND bt.id = p.brand_type_id
        WHERE 1=1
    `;
    const args = [];
    if (category) { sql += " AND p.category_id = ?"; args.push(category); }
    if (brand) { sql += " AND p.brand_id = ?"; args.push(brand); }
    if (q) { sql += " AND p.name LIKE ?"; args.push(`%${q}%`); }
    sql += " ORDER BY p.updated_at DESC";

    const products = await db.prepare(sql).all(...args);
    res.json(products);
});

// GET /api/products/admin/categories - danh sách danh mục + brand + type, dùng cho dropdown chọn
// trong form thêm/sửa sản phẩm (kể cả brand/type ẩn, khác /catalog vốn chỉ trả phần công khai)
router.get("/admin/categories", canEditCatalog, async (req, res) => {
    const categories = await db.prepare("SELECT id, name FROM categories ORDER BY sort_order").all();
    const brands = await db.prepare("SELECT category_id, id, name, hidden FROM brands ORDER BY sort_order").all();
    const types = await db.prepare("SELECT category_id, brand_id, id, name FROM brand_types ORDER BY sort_order").all();

    const result = categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        brands: brands.filter(b => b.category_id === cat.id).map(b => ({
            id: b.id,
            name: b.name,
            hidden: !!b.hidden,
            types: types.filter(t => t.category_id === cat.id && t.brand_id === b.id).map(t => ({ id: t.id, name: t.name }))
        }))
    }));
    res.json(result);
});

// GET /api/products/admin/id/:id - chi tiết 1 sản phẩm cho form sửa (kể cả sản phẩm đang ẩn)
router.get("/admin/id/:id", canEditCatalog, async (req, res) => {
    const p = await db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id);
    if (!p) return res.status(404).json({ error: "Không tìm thấy sản phẩm" });
    const specs = await db.prepare("SELECT spec_key, spec_value FROM product_specs WHERE product_id = ? ORDER BY sort_order").all(req.params.id);
    res.json({ ...p, specs: specs.map(s => [s.spec_key, s.spec_value]) });
});

function slugifyId(str) {
    return str
        .toLowerCase()
        .normalize("NFD").replace(/[̀-ͯ]/g, "")
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

async function saveSpecs(productId, specs) {
    await db.prepare("DELETE FROM product_specs WHERE product_id = ?").run(productId);
    if (!Array.isArray(specs)) return;
    for (let i = 0; i < specs.length; i++) {
        const [key, value] = specs[i];
        if (!key) continue;
        await db.prepare(
            "INSERT INTO product_specs (product_id, spec_key, spec_value, sort_order) VALUES (?, ?, ?, ?)"
        ).run(productId, key, value || "", i);
    }
}

// POST /api/products - tạo sản phẩm mới
router.post("/", canEditCatalog, async (req, res) => {
    const { category_id, brand_id, brand_type_id, name, price, description, image, specs } = req.body;
    if (!category_id || !brand_id || !name) {
        return res.status(400).json({ error: "Thiếu category_id, brand_id hoặc name" });
    }

    const brand = await db.prepare("SELECT id FROM brands WHERE category_id = ? AND id = ?").get(category_id, brand_id);
    if (!brand) return res.status(400).json({ error: "Danh mục/thương hiệu không hợp lệ" });

    let id = slugifyId(name);
    const exists = await db.prepare("SELECT id FROM products WHERE id = ?").get(id);
    if (exists) id = `${id}-${Date.now()}`;

    await db.prepare(`
        INSERT INTO products (id, category_id, brand_id, brand_type_id, name, price, description, image, hidden, sort_order)
        VALUES (@id, @category_id, @brand_id, @brand_type_id, @name, @price, @description, @image, 0, 0)
    `).run({
        id, category_id, brand_id,
        brand_type_id: brand_type_id || null,
        name,
        price: price || null,
        description: description || null,
        image: image || null
    });

    await saveSpecs(id, specs);
    await db.logActivity(req.admin, "create_product", `product:${id}`);
    res.status(201).json({ id });
});

// PUT /api/products/:id - sửa sản phẩm
router.put("/:id", canEditCatalog, async (req, res) => {
    const existing = await db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id);
    if (!existing) return res.status(404).json({ error: "Không tìm thấy sản phẩm" });

    const merged = {
        category_id: req.body.category_id ?? existing.category_id,
        brand_id: req.body.brand_id ?? existing.brand_id,
        brand_type_id: req.body.brand_type_id !== undefined ? req.body.brand_type_id : existing.brand_type_id,
        name: req.body.name ?? existing.name,
        price: req.body.price !== undefined ? req.body.price : existing.price,
        description: req.body.description !== undefined ? req.body.description : existing.description,
        image: req.body.image !== undefined ? req.body.image : existing.image,
        hidden: req.body.hidden === undefined ? existing.hidden : (req.body.hidden ? 1 : 0),
        updated_at: new Date().toISOString(),
        id: existing.id
    };

    await db.prepare(`
        UPDATE products SET category_id=@category_id, brand_id=@brand_id, brand_type_id=@brand_type_id,
        name=@name, price=@price, description=@description, image=@image, hidden=@hidden,
        updated_at=@updated_at WHERE id=@id
    `).run(merged);

    if (req.body.specs !== undefined) await saveSpecs(existing.id, req.body.specs);
    await db.logActivity(req.admin, "update_product", `product:${existing.id}`);
    res.json({ ok: true });
});

// DELETE /api/products/:id
router.delete("/:id", canEditCatalog, async (req, res) => {
    const existing = await db.prepare("SELECT id FROM products WHERE id = ?").get(req.params.id);
    if (!existing) return res.status(404).json({ error: "Không tìm thấy sản phẩm" });

    await db.prepare("DELETE FROM product_specs WHERE product_id = ?").run(existing.id);
    await db.prepare("DELETE FROM products WHERE id = ?").run(existing.id);
    await db.logActivity(req.admin, "delete_product", `product:${existing.id}`);
    res.json({ ok: true });
});

// POST /api/products/admin/brands - tạo brand/nhóm sản phẩm mới trong 1 danh mục
router.post("/admin/brands", canEditCatalog, async (req, res) => {
    const { category_id, name } = req.body;
    if (!category_id || !name) return res.status(400).json({ error: "Thiếu category_id hoặc name" });

    const id = slugifyId(name);
    const exists = await db.prepare("SELECT id FROM brands WHERE category_id = ? AND id = ?").get(category_id, id);
    if (exists) return res.status(400).json({ error: "Thương hiệu này đã tồn tại trong danh mục" });

    await db.prepare(`
        INSERT INTO brands (category_id, id, name, logo, hidden, sort_order)
        VALUES (?, ?, ?, NULL, 0, (SELECT COALESCE(MAX(sort_order), -1) + 1 FROM brands WHERE category_id = ?))
    `).run(category_id, id, name, category_id);

    await db.logActivity(req.admin, "create_brand", `brand:${category_id}/${id}`);
    res.status(201).json({ id });
});

// POST /api/products/admin/brand-types - tạo loại/thương hiệu con mới trong 1 brand
router.post("/admin/brand-types", canEditCatalog, async (req, res) => {
    const { category_id, brand_id, name } = req.body;
    if (!category_id || !brand_id || !name) return res.status(400).json({ error: "Thiếu category_id, brand_id hoặc name" });

    const id = slugifyId(name);
    const exists = await db.prepare("SELECT id FROM brand_types WHERE category_id = ? AND brand_id = ? AND id = ?").get(category_id, brand_id, id);
    if (exists) return res.status(400).json({ error: "Loại này đã tồn tại trong thương hiệu" });

    await db.prepare(`
        INSERT INTO brand_types (category_id, brand_id, id, name, logo, sort_order)
        VALUES (?, ?, ?, ?, NULL, (SELECT COALESCE(MAX(sort_order), -1) + 1 FROM brand_types WHERE category_id = ? AND brand_id = ?))
    `).run(category_id, brand_id, id, name, category_id, brand_id);

    await db.logActivity(req.admin, "create_brand_type", `brand_type:${category_id}/${brand_id}/${id}`);
    res.status(201).json({ id });
});

// PUT /api/products/admin/categories/:id - sửa nội dung SEO của 1 danh mục (không tạo/xoá danh
// mục - 8 danh mục hiện có là cố định, đúng cấu trúc dịch vụ thật của cửa hàng)
router.put("/admin/categories/:id", canEditCatalog, async (req, res) => {
    const existing = await db.prepare("SELECT * FROM categories WHERE id = ?").get(req.params.id);
    if (!existing) return res.status(404).json({ error: "Không tìm thấy danh mục" });

    const merged = {
        name: req.body.name ?? existing.name,
        poster: req.body.poster !== undefined ? req.body.poster : existing.poster,
        seo_title: req.body.seo_title !== undefined ? req.body.seo_title : existing.seo_title,
        seo_meta_description: req.body.seo_meta_description !== undefined ? req.body.seo_meta_description : existing.seo_meta_description,
        seo_intro: req.body.seo_intro !== undefined ? req.body.seo_intro : existing.seo_intro,
        updated_at: new Date().toISOString(),
        id: existing.id
    };
    await db.prepare(`
        UPDATE categories SET name=@name, poster=@poster, seo_title=@seo_title,
        seo_meta_description=@seo_meta_description, seo_intro=@seo_intro, updated_at=@updated_at
        WHERE id=@id
    `).run(merged);

    await db.logActivity(req.admin, "update_category", `category:${existing.id}`);
    res.json({ ok: true });
});

module.exports = router;
