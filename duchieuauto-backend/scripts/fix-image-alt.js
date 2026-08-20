/**
 * Tự động điền alt cho ảnh thiếu alt trong products.detail_content - one-shot chạy tay sau khi
 * audit-image-alt.js xác nhận danh sách (không đụng posts/categories vì audit cho thấy 2 bảng đó
 * không thiếu alt). Mẫu alt: "<Tên SP> - <Tên danh mục> tại Đức Hiếu Auto - hình N" (N đếm theo
 * đúng thứ tự ảnh xuất hiện trong nội dung, kể cả ảnh đã có alt, để số thứ tự khớp thực tế).
 * CHỈ điền ảnh chưa có alt/alt rỗng - không đụng ảnh đã có alt do người dùng tự viết.
 *
 * Chạy: node scripts/fix-image-alt.js
 */
require("dotenv").config();
const db = require("../models/db");
const { sanitizeContent } = require("../utils/sanitize-content");

const IMG_TAG_RE = /<img\b[^>]*>/gi;
const ALT_ATTR_RE = /\balt\s*=\s*(["'])(.*?)\1/i;

function fillMissingAlt(html, productName, categoryName) {
    let n = 0;
    let filled = 0;
    const newHtml = html.replace(IMG_TAG_RE, (tag) => {
        n += 1;
        const m = tag.match(ALT_ATTR_RE);
        const altValue = m ? m[2].trim() : null;
        if (altValue) return tag;

        const altText = `${productName} - ${categoryName} tại Đức Hiếu Auto - hình ${n}`;
        filled += 1;
        if (m) {
            return tag.replace(ALT_ATTR_RE, `alt="${altText}"`);
        }
        return tag.replace(/^<img\b/i, `<img alt="${altText}"`);
    });
    return { newHtml, filled };
}

async function run() {
    const products = await db.prepare(`
        SELECT p.id, p.name, p.detail_content, c.name AS cat_name
        FROM products p JOIN categories c ON c.id = p.category_id
        WHERE p.hidden = 0
    `).all();

    const now = new Date().toISOString();
    let touchedProducts = 0;
    let touchedImages = 0;

    for (const p of products) {
        if (!p.detail_content) continue;
        const { newHtml, filled } = fillMissingAlt(p.detail_content, p.name, p.cat_name);
        if (filled === 0) continue;

        const sanitized = sanitizeContent(newHtml);
        await db.prepare("UPDATE products SET detail_content = @detail_content, updated_at = @updated_at WHERE id = @id")
            .run({ detail_content: sanitized, updated_at: now, id: p.id });

        touchedProducts += 1;
        touchedImages += filled;
        console.log(`[OK] ${p.id} (${p.name}) - điền ${filled} alt`);
    }

    console.log(`\nHoàn tất: ${touchedProducts} sản phẩm, ${touchedImages} ảnh đã được điền alt.`);
}

run();
