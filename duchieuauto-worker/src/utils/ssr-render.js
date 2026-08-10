/* =========================================================
   Port từ duchieuauto-backend/utils/ssr-render.js sang Workers (Phase 13) - ZERO thay đổi logic,
   chỉ đổi module.exports -> export (hàm thuần, không phụ thuộc Node nào cả, xác nhận từ Phase 12).
   Xem giải thích đầy đủ về mục đích SSR-cho-bot trong file gốc/nhật ký phát triển Phase 12.
   ========================================================= */

const SITE_URL = "https://duchieuauto.vn";
const SITE_NAME = "Đức Hiếu Auto";

function escapeHtml(str) {
    return String(str === undefined || str === null ? "" : str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function absoluteUrl(pathOrUrl) {
    if (!pathOrUrl) return undefined;
    if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
    return `${SITE_URL}/${pathOrUrl}`;
}

const BASE_STYLE = `
body{font-family:system-ui,-apple-system,"Segoe UI",Arial,sans-serif;max-width:860px;margin:0 auto;padding:24px;line-height:1.6;color:#222}
h1{font-size:1.6rem;margin-bottom:.3em}
h2{font-size:1.2rem;margin-top:1.6em}
nav{font-size:.9rem;color:#666;margin-bottom:1em}
nav a{color:#666}
table{border-collapse:collapse;width:100%;margin:1em 0}
td,th{border:1px solid #ddd;padding:6px 10px;text-align:left;vertical-align:top}
img{max-width:100%;height:auto;border-radius:6px}
.price{font-size:1.3rem;font-weight:bold;color:#c0392b}
.faq-q{font-weight:bold;margin-top:1em;margin-bottom:.2em}
.notice{font-size:.85rem;color:#888;border-top:1px solid #eee;margin-top:2em;padding-top:1em}
`;

function htmlPage({ title, description, canonicalPath, ogImage, ogType, jsonLdList, bodyHtml }) {
    const canonicalUrl = `${SITE_URL}${canonicalPath}`;
    const jsonLdScripts = (jsonLdList || [])
        .filter(Boolean)
        .map(schema => `<script type="application/ld+json">${JSON.stringify(schema)}</script>`)
        .join("\n");

    return `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<link rel="canonical" href="${canonicalUrl}">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:type" content="${ogType || "website"}">
<meta property="og:url" content="${canonicalUrl}">
${ogImage ? `<meta property="og:image" content="${escapeHtml(ogImage)}">` : ""}
${jsonLdScripts}
<style>${BASE_STYLE}</style>
</head>
<body>
${bodyHtml}
<p class="notice">Trang xem trước dành cho công cụ tìm kiếm/AI. Xem bản đầy đủ tại <a href="${canonicalUrl}">${canonicalUrl}</a>.</p>
</body>
</html>`;
}

export function notFoundHtml(message) {
    return `<!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8"><title>Không tìm thấy | ${SITE_NAME}</title>
<meta name="robots" content="noindex"></head><body><p>${escapeHtml(message)}</p></body></html>`;
}

export function renderProductHtml(p) {
    const title = `${p.name} - ${p.brand} | ${SITE_NAME}`;
    const description = (p.description || "").slice(0, 155);
    const canonicalPath = `/san-pham-chi-tiet?id=${encodeURIComponent(p.id)}`;
    const canonicalUrl = `${SITE_URL}${canonicalPath}`;
    const absImg = absoluteUrl(p.image);
    const priceDigits = (p.price || "").replace(/[^\d]/g, "");

    const productSchema = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": p.name,
        "image": absImg,
        "description": p.description || "",
        "brand": { "@type": "Brand", "name": p.brand || SITE_NAME }
    };
    if (priceDigits) {
        productSchema.offers = {
            "@type": "Offer",
            "priceCurrency": "VND",
            "price": priceDigits,
            "availability": "https://schema.org/InStock",
            "url": canonicalUrl
        };
    }

    const breadcrumbItems = [
        { "@type": "ListItem", "position": 1, "name": "Trang chủ", "item": `${SITE_URL}/` },
        { "@type": "ListItem", "position": 2, "name": "Sản Phẩm", "item": `${SITE_URL}/product` }
    ];
    if (p.category_name) {
        breadcrumbItems.push({
            "@type": "ListItem", "position": 3, "name": p.category_name,
            "item": `${SITE_URL}/category-chi-tiet?id=${p.category_id}`
        });
    }
    breadcrumbItems.push({
        "@type": "ListItem", "position": breadcrumbItems.length + 1, "name": p.name, "item": canonicalUrl
    });
    const breadcrumbSchema = { "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": breadcrumbItems };

    const specsHtml = (p.specs && p.specs.length)
        ? `<table>${p.specs.map(([k, v]) => `<tr><th>${escapeHtml(k)}</th><td>${escapeHtml(v)}</td></tr>`).join("")}</table>`
        : "";

    const bodyHtml = `
<nav><a href="/">Trang chủ</a> &raquo; <a href="/product">Sản Phẩm</a> &raquo;
${p.category_name ? `<a href="/category-chi-tiet?id=${p.category_id}">${escapeHtml(p.category_name)}</a> &raquo;` : ""}
${escapeHtml(p.name)}</nav>
<h1>${escapeHtml(p.name)}</h1>
<p><strong>Thương hiệu:</strong> ${escapeHtml(p.brand)}</p>
${p.price ? `<p class="price">${escapeHtml(p.price)}</p>` : ""}
${absImg ? `<img src="${absImg}" alt="${escapeHtml(p.name)}">` : ""}
<p>${escapeHtml(p.description || "")}</p>
${specsHtml}
${p.detail_content ? `<h2>Mô tả chi tiết</h2>${p.detail_content}` : ""}
`;

    return htmlPage({
        title, description, canonicalPath,
        ogImage: absImg, ogType: "product",
        jsonLdList: [productSchema, breadcrumbSchema],
        bodyHtml
    });
}

export function renderCategoryHtml(cat, sections, faqs) {
    const title = cat.seo_title || `${cat.name} | ${SITE_NAME}`;
    const description = cat.seo_meta_description || `Dịch vụ ${cat.name} tại Đức Hiếu Auto, Buôn Ma Thuột, Đắk Lắk.`;
    const canonicalPath = `/category-chi-tiet?id=${encodeURIComponent(cat.id)}`;
    const canonicalUrl = `${SITE_URL}${canonicalPath}`;
    const posterUrl = absoluteUrl(cat.poster);

    const serviceSchema = {
        "@context": "https://schema.org",
        "@type": "Service",
        "serviceType": cat.name,
        "name": `${cat.name} - ${SITE_NAME}`,
        "description": description,
        "provider": { "@type": "AutoRepair", "name": SITE_NAME },
        "areaServed": ["Buôn Ma Thuột", "Đắk Lắk"],
        "url": canonicalUrl
    };
    const breadcrumbSchema = {
        "@context": "https://schema.org", "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Trang chủ", "item": `${SITE_URL}/` },
            { "@type": "ListItem", "position": 2, "name": "Sản Phẩm", "item": `${SITE_URL}/product` },
            { "@type": "ListItem", "position": 3, "name": cat.name, "item": canonicalUrl }
        ]
    };

    let faqSchema = null;
    let faqHtml = "";
    if (faqs && faqs.length) {
        faqSchema = {
            "@context": "https://schema.org", "@type": "FAQPage",
            "mainEntity": faqs.map(f => ({
                "@type": "Question", "name": f.question,
                "acceptedAnswer": { "@type": "Answer", "text": f.answer }
            }))
        };
        faqHtml = `<h2>Câu hỏi thường gặp</h2>` +
            faqs.map(f => `<p class="faq-q">${escapeHtml(f.question)}</p><p>${escapeHtml(f.answer)}</p>`).join("");
    }

    const sectionsHtml = (sections && sections.length)
        ? sections.map(s => `<h2>${escapeHtml(s.heading)}</h2><p>${escapeHtml(s.body)}</p>`).join("")
        : "";

    const bodyHtml = `
<nav><a href="/">Trang chủ</a> &raquo; <a href="/product">Sản Phẩm</a> &raquo; ${escapeHtml(cat.name)}</nav>
<h1>${escapeHtml(cat.seo_h1 || cat.name)}</h1>
${posterUrl ? `<img src="${posterUrl}" alt="${escapeHtml(cat.name)}">` : ""}
${cat.seo_intro ? cat.seo_intro : ""}
${sectionsHtml}
${faqHtml}
`;

    return htmlPage({
        title, description, canonicalPath,
        ogImage: posterUrl, ogType: "website",
        jsonLdList: [serviceSchema, breadcrumbSchema, faqSchema],
        bodyHtml
    });
}

export function renderPostHtml(post) {
    const title = `${post.meta_title || post.title} | ${SITE_NAME}`;
    const description = post.meta_description || post.excerpt || "";
    const canonicalPath = `/bai-viet-chi-tiet?slug=${encodeURIComponent(post.slug)}`;
    const canonicalUrl = `${SITE_URL}${canonicalPath}`;
    const coverUrl = absoluteUrl(post.cover_image);

    const articleSchema = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": post.title,
        "description": description,
        "image": coverUrl ? [coverUrl] : undefined,
        "datePublished": post.created_at,
        "dateModified": post.updated_at || post.created_at,
        "author": { "@type": "Organization", "name": SITE_NAME },
        "publisher": { "@type": "Organization", "name": SITE_NAME }
    };
    const breadcrumbSchema = {
        "@context": "https://schema.org", "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Trang chủ", "item": `${SITE_URL}/` },
            { "@type": "ListItem", "position": 2, "name": "Tin Tức", "item": `${SITE_URL}/tin-tuc.html` },
            { "@type": "ListItem", "position": 3, "name": post.title, "item": canonicalUrl }
        ]
    };

    const bodyHtml = `
<nav><a href="/">Trang chủ</a> &raquo; <a href="/tin-tuc.html">Tin Tức</a> &raquo; ${escapeHtml(post.title)}</nav>
<h1>${escapeHtml(post.title)}</h1>
${coverUrl ? `<img src="${coverUrl}" alt="${escapeHtml(post.title)}">` : ""}
${post.content || ""}
`;

    return htmlPage({
        title, description, canonicalPath,
        ogImage: coverUrl, ogType: "article",
        jsonLdList: [articleSchema, breadcrumbSchema],
        bodyHtml
    });
}
