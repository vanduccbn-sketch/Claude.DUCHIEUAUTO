/**
 * Import dữ liệu sản phẩm tĩnh từ assets/js/catalog-data.js (Phase 1) vào database thật (Phase 7).
 * Chạy 1 lần: node scripts/migrate-catalog-data.js
 *
 * catalog-data.js là file JS chạy trên trình duyệt (biến global CATALOG, không phải module
 * CommonJS) - dùng vm.runInContext để nạp đúng y hệt cách trình duyệt hiểu, tránh phải viết lại
 * dữ liệu bằng tay (dễ gõ sai/thiếu so với 242 sản phẩm thật).
 */
require("dotenv").config();
const vm = require("vm");
const fs = require("fs");
const path = require("path");
const db = require("../models/db");

function loadCatalogData() {
    const filePath = path.join(__dirname, "..", "..", "assets", "js", "catalog-data.js");
    const code = fs.readFileSync(filePath, "utf8");
    const sandbox = { window: {} };
    vm.createContext(sandbox);
    vm.runInContext(code, sandbox);
    return sandbox.window.CATALOG;
}

async function importProduct(prodId, categoryId, brandId, brandTypeId, sortOrder, productsDict, counters) {
    const p = productsDict[prodId];
    if (!p) {
        console.warn(`CẢNH BÁO: không tìm thấy dữ liệu sản phẩm cho id "${prodId}" (tham chiếu từ ${categoryId}/${brandId})`);
        counters.missing++;
        return;
    }

    await db.prepare(`
        INSERT INTO products (id, category_id, brand_id, brand_type_id, name, price, description, image, hidden, sort_order)
        VALUES (@id, @category_id, @brand_id, @brand_type_id, @name, @price, @description, @image, @hidden, @sort_order)
    `).run({
        id: prodId,
        category_id: categoryId,
        brand_id: brandId,
        brand_type_id: brandTypeId,
        name: p.name,
        price: p.price || null,
        description: p.desc || null,
        image: p.image || null,
        hidden: p.hidden ? 1 : 0,
        sort_order: sortOrder
    });
    counters.products++;

    if (p.specs && p.specs.length) {
        for (let i = 0; i < p.specs.length; i++) {
            const [key, value] = p.specs[i];
            await db.prepare(
                "INSERT INTO product_specs (product_id, spec_key, spec_value, sort_order) VALUES (?, ?, ?, ?)"
            ).run(prodId, key, value, i);
            counters.specs++;
        }
    }
}

(async () => {
    await db.ready;
    const CATALOG = loadCatalogData();
    if (!CATALOG) throw new Error("Không nạp được CATALOG từ catalog-data.js");

    const counters = { categories: 0, sections: 0, brands: 0, types: 0, products: 0, specs: 0, missing: 0 };

    for (let catIdx = 0; catIdx < CATALOG.categories.length; catIdx++) {
        const cat = CATALOG.categories[catIdx];
        const seo = cat.seo || {};

        await db.prepare(`
            INSERT INTO categories (id, name, poster, sort_order, seo_title, seo_meta_description, seo_image, seo_image_caption, seo_intro)
            VALUES (@id, @name, @poster, @sort_order, @seo_title, @seo_meta_description, @seo_image, @seo_image_caption, @seo_intro)
        `).run({
            id: cat.id,
            name: cat.name,
            poster: cat.poster || null,
            sort_order: catIdx,
            seo_title: seo.title || null,
            seo_meta_description: seo.metaDescription || null,
            seo_image: seo.image || null,
            seo_image_caption: seo.imageCaption || null,
            seo_intro: seo.intro || null
        });
        counters.categories++;

        for (let i = 0; i < (seo.sections || []).length; i++) {
            const s = seo.sections[i];
            await db.prepare(
                "INSERT INTO category_sections (category_id, heading, body, sort_order) VALUES (?, ?, ?, ?)"
            ).run(cat.id, s.heading, s.body, i);
            counters.sections++;
        }

        for (let bIdx = 0; bIdx < cat.brands.length; bIdx++) {
            const brand = cat.brands[bIdx];

            await db.prepare(`
                INSERT INTO brands (category_id, id, name, logo, hidden, sort_order)
                VALUES (@category_id, @id, @name, @logo, @hidden, @sort_order)
            `).run({
                category_id: cat.id,
                id: brand.id,
                name: brand.name,
                logo: brand.logo || null,
                hidden: brand.hidden ? 1 : 0,
                sort_order: bIdx
            });
            counters.brands++;

            if (brand.types) {
                for (let tIdx = 0; tIdx < brand.types.length; tIdx++) {
                    const type = brand.types[tIdx];
                    await db.prepare(`
                        INSERT INTO brand_types (category_id, brand_id, id, name, logo, sort_order)
                        VALUES (@category_id, @brand_id, @id, @name, @logo, @sort_order)
                    `).run({
                        category_id: cat.id,
                        brand_id: brand.id,
                        id: type.id,
                        name: type.name,
                        logo: type.logo || null,
                        sort_order: tIdx
                    });
                    counters.types++;

                    for (let pIdx = 0; pIdx < (type.products || []).length; pIdx++) {
                        await importProduct(type.products[pIdx], cat.id, brand.id, type.id, pIdx, CATALOG.products, counters);
                    }
                }
            } else if (brand.products) {
                for (let pIdx = 0; pIdx < brand.products.length; pIdx++) {
                    await importProduct(brand.products[pIdx], cat.id, brand.id, null, pIdx, CATALOG.products, counters);
                }
            }
        }
    }

    const totalStaticProducts = Object.keys(CATALOG.products).length;
    console.log("\n=== KẾT QUẢ IMPORT ===");
    console.log(`Danh mục: ${counters.categories}`);
    console.log(`Đoạn nội dung SEO (category_sections): ${counters.sections}`);
    console.log(`Thương hiệu/nhóm sản phẩm (brands): ${counters.brands}`);
    console.log(`Loại/thương hiệu con (brand_types): ${counters.types}`);
    console.log(`Sản phẩm đã import: ${counters.products}`);
    console.log(`Thông số kỹ thuật (product_specs): ${counters.specs}`);
    console.log(`Tham chiếu bị thiếu dữ liệu: ${counters.missing}`);
    console.log(`\nĐối chiếu: catalog-data.js có ${totalStaticProducts} sản phẩm trong từ điển "products".`);
    console.log(
        counters.products === totalStaticProducts && counters.missing === 0
            ? "=> KHỚP 100% - import thành công."
            : "=> CẢNH BÁO: số lượng KHÔNG khớp, cần kiểm tra lại trước khi dùng dữ liệu này."
    );
})();
