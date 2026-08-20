/**
 * Audit ảnh thiếu thẻ alt trong nội dung rich-text (Quill HTML) lưu ở Turso - CHỈ ĐỌC, không sửa
 * dữ liệu. Quét 3 cột: posts.content, products.detail_content, categories.seo_intro - đúng 3 nơi
 * admin chèn ảnh qua trình soạn thảo (xem qeCropImageBeforeUpload/qeInterceptImagePaste trong
 * admin/assets/quill-enhancements.js), khác với ảnh sản phẩm/danh mục chính (products.image,
 * categories.poster) vốn đã luôn có alt do render.js/catalog-render.js tự gắn.
 *
 * Chạy: node scripts/audit-image-alt.js
 */
require("dotenv").config();
const db = require("../models/db");

// Bắt mọi thẻ <img ...> (không phân biệt hoa/thường, có thể nhiều dòng do Quill format).
const IMG_TAG_RE = /<img\b[^>]*>/gi;
// alt="" (rỗng) hoặc alt='' đều coi là THIẾU (Quill mặc định chèn alt="" khi người dùng bỏ qua
// hộp thoại nhập mô tả ảnh - xem qeAskImageAlt), chỉ alt có nội dung thật mới tính là đã có.
const ALT_ATTR_RE = /\balt\s*=\s*(["'])(.*?)\1/i;

function findMissingAlt(html) {
    if (!html) return [];
    const missing = [];
    const imgTags = html.match(IMG_TAG_RE) || [];
    for (const tag of imgTags) {
        const m = tag.match(ALT_ATTR_RE);
        const altValue = m ? m[2].trim() : null;
        if (!altValue) {
            const srcMatch = tag.match(/\bsrc\s*=\s*["']([^"']*)["']/i);
            missing.push(srcMatch ? srcMatch[1] : tag.slice(0, 80));
        }
    }
    return missing;
}

async function run() {
    const report = [];

    const posts = await db.prepare("SELECT id, slug, title, content FROM posts").all();
    for (const p of posts) {
        const missing = findMissingAlt(p.content);
        if (missing.length) report.push({ table: "posts", id: p.id, label: `${p.title} (${p.slug})`, missing });
    }

    const products = await db.prepare("SELECT id, name, detail_content FROM products WHERE hidden = 0").all();
    for (const p of products) {
        const missing = findMissingAlt(p.detail_content);
        if (missing.length) report.push({ table: "products", id: p.id, label: p.name, missing });
    }

    const categories = await db.prepare("SELECT id, name, seo_intro FROM categories").all();
    for (const c of categories) {
        const missing = findMissingAlt(c.seo_intro);
        if (missing.length) report.push({ table: "categories", id: c.id, label: c.name, missing });
    }

    const totalMissingImgs = report.reduce((sum, r) => sum + r.missing.length, 0);
    console.log(`=== Audit alt ảnh - ${new Date().toISOString().slice(0, 10)} ===`);
    console.log(`Tổng: ${report.length} bản ghi có ảnh thiếu alt, ${totalMissingImgs} ảnh thiếu alt.\n`);

    for (const r of report) {
        console.log(`[${r.table}] #${r.id} - ${r.label} (${r.missing.length} ảnh thiếu alt)`);
        r.missing.forEach(src => console.log(`    - ${src}`));
    }

    if (!report.length) console.log("Không có ảnh nào thiếu alt.");
}

run();
