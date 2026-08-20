/**
 * Sinh lại sitemap.xml từ dữ liệu THẬT trong Turso (danh mục/thương hiệu/sản phẩm/bài viết) thay
 * vì file viết tay chỉ có 18 URL cố định - phát hiện lúc đánh giá ảnh hưởng SEO khi chuyển sản
 * phẩm/bài viết sang quản lý qua CMS: sitemap cũ hoàn toàn THIẾU 239 trang sản phẩm và hầu hết
 * trang thương hiệu/phân loại vì được viết tay 1 lần trước khi Phase 7 (CMS sản phẩm) tồn tại,
 * không tự cập nhật theo dữ liệu admin thêm/sửa/xoá.
 *
 * Đây KHÔNG phải cơ chế tự động hoàn toàn (site tĩnh trên GitHub Pages, không sinh sitemap theo
 * từng request được) - cần CHẠY LẠI + commit/push file sitemap.xml mỗi khi thêm/xoá nhiều sản
 * phẩm hoặc bài viết. Xem ghi chú trong huong-dan-viet-content-nhan-vien.md.
 *
 * Chạy: node scripts/generate-sitemap.js
 */
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const db = require("../models/db");

const SITE_URL = "https://duchieuauto.vn";
const OUTPUT_PATH = path.join(__dirname, "..", "..", "sitemap.xml");

// Cùng công thức fallback ảnh sản phẩm lặp lại ở nhiều file khác (xem CLAUDE.md - "quy ước fallback
// lặp lại ở NHIỀU file", sitemap.xml là chỗ thứ 7 dùng công thức này, sửa đuôi/quy ước tên ảnh phải
// nhớ sửa cả chỗ này). products.image trong DB thường NULL với sản phẩm gốc chưa upload lại qua CMS.
function productImagePath(id, image) {
    return image || `assets/images/products/${id}/anh-1.webp`;
}

// XML yêu cầu escape 5 ký tự đặc biệt trong text node (không chỉ riêng "&" như urlTag() ở dưới xử lý
// cho <loc>) - <image:loc> cũng là text node URL nên escape giống hệt.
function escapeXml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

// Ảnh có thể là đường dẫn tương đối ("assets/images/...") hoặc URL Cloudinary tuyệt đối
// ("https://res.cloudinary.com/...") - image sitemap yêu cầu URL tuyệt đối, phải tự ghép domain cho
// trường hợp đầu, giữ nguyên cho trường hợp sau.
function absoluteImageUrl(image) {
    if (!image) return null;
    if (/^https?:\/\//.test(image)) return image;
    return `${SITE_URL}/${image}`;
}

// Trang tĩnh cố định - không đổi thường xuyên, không lấy được từ database.
const STATIC_PAGES = [
    { loc: "", priority: "1.0", changefreq: "weekly" },
    { loc: "product", priority: "0.9", changefreq: "weekly" },
    { loc: "tin-tuc.html", priority: "0.8", changefreq: "weekly" },
    { loc: "dat-lich-hen.html", priority: "0.8", changefreq: "monthly" },
    { loc: "nhac-bao-duong.html", priority: "0.6", changefreq: "monthly" },
    { loc: "faq.html", priority: "0.6", changefreq: "monthly" },
    { loc: "chinh-sach.html", priority: "0.4", changefreq: "yearly" }
];

function urlTag({ loc, priority, changefreq, lastmod, images }) {
    const lastmodTag = lastmod ? `\n    <lastmod>${lastmod.slice(0, 10)}</lastmod>` : "";
    // XML yêu cầu escape "&" thành "&amp;" trong <loc> - URL nhiều tham số (brand-san-pham?id=..&brand=..&loai=..) có ký tự này.
    const escapedLoc = `${SITE_URL}/${loc}`.replace(/&/g, "&amp;");
    // Image sitemap extension (xem xmlns:image ở urlset) - giúp Googlebot-Image khám phá ảnh nhanh
    // hơn vì ảnh sản phẩm/danh mục/bài viết được JS render động, không nằm sẵn trong HTML tĩnh mà
    // Googlebot đọc lúc crawl trang - trước đây sitemap hoàn toàn không khai báo ảnh nào.
    const imageTags = (images || [])
        .filter(Boolean)
        .map(img => `\n    <image:image>\n      <image:loc>${escapeXml(img.url)}</image:loc>${img.title ? `\n      <image:title>${escapeXml(img.title)}</image:title>` : ""}\n    </image:image>`)
        .join("");
    return `  <url>\n    <loc>${escapedLoc}</loc>${lastmodTag}\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>${imageTags}\n  </url>`;
}

async function run() {
    const urls = STATIC_PAGES.map(urlTag);

    const categories = await db.prepare("SELECT id, name, poster, seo_image, seo_image_caption, updated_at FROM categories ORDER BY sort_order").all();
    for (const cat of categories) {
        const posterUrl = absoluteImageUrl(cat.poster);
        const seoImgUrl = absoluteImageUrl(cat.seo_image);
        urls.push(urlTag({
            loc: `category-chi-tiet?id=${cat.id}`, priority: "0.7", changefreq: "monthly", lastmod: cat.updated_at,
            images: [
                posterUrl && { url: posterUrl, title: cat.name },
                // Không lặp lại nếu ảnh SEO minh hoạ trùng đúng ảnh đại diện (admin thường chỉ chọn 1 trong 2).
                seoImgUrl && seoImgUrl !== posterUrl && { url: seoImgUrl, title: cat.seo_image_caption || cat.name }
            ]
        }));
    }

    // Thương hiệu/nhóm sản phẩm - trang cuối có lưới sản phẩm thật là brand-san-pham.html, có
    // hoặc không kèm "loai" tuỳ brand có phân loại con (brand_types) hay không (đúng logic hiển
    // thị thật trong renderBrandProducts() ở catalog-render.js, không suy đoán riêng cho sitemap).
    const brands = await db.prepare("SELECT category_id, id FROM brands WHERE hidden = 0").all();
    for (const brand of brands) {
        const types = await db.prepare(
            "SELECT id FROM brand_types WHERE category_id = ? AND brand_id = ?"
        ).all(brand.category_id, brand.id);

        if (types.length) {
            for (const t of types) {
                urls.push(urlTag({
                    loc: `brand-san-pham?id=${brand.category_id}&brand=${brand.id}&loai=${t.id}`,
                    priority: "0.6", changefreq: "monthly"
                }));
            }
        } else {
            urls.push(urlTag({
                loc: `brand-san-pham?id=${brand.category_id}&brand=${brand.id}`,
                priority: "0.6", changefreq: "monthly"
            }));
        }
    }

    const products = await db.prepare("SELECT id, name, image, updated_at FROM products WHERE hidden = 0").all();
    for (const p of products) {
        const imgUrl = absoluteImageUrl(productImagePath(p.id, p.image));
        urls.push(urlTag({
            loc: `san-pham-chi-tiet?id=${p.id}`, priority: "0.5", changefreq: "monthly", lastmod: p.updated_at,
            images: [imgUrl && { url: imgUrl, title: p.name }]
        }));
    }

    const posts = await db.prepare("SELECT slug, title, cover_image, updated_at FROM posts WHERE published = 1").all();
    for (const post of posts) {
        const imgUrl = absoluteImageUrl(post.cover_image);
        urls.push(urlTag({
            loc: `bai-viet-chi-tiet.html?slug=${post.slug}`, priority: "0.6", changefreq: "monthly", lastmod: post.updated_at,
            images: [imgUrl && { url: imgUrl, title: post.title }]
        }));
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls.join("\n")}\n</urlset>\n`;
    fs.writeFileSync(OUTPUT_PATH, xml, "utf-8");

    console.log(`Đã ghi ${OUTPUT_PATH}`);
    console.log(`Tổng số URL: ${urls.length} (${STATIC_PAGES.length} trang tĩnh, ${categories.length} danh mục, ${brands.length} thương hiệu/nhóm, ${products.length} sản phẩm, ${posts.length} bài viết)`);
}

run();
