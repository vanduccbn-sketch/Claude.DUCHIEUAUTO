/* =========================================================
   RENDER TIN TỨC / BLOG (Phase 5 - gọi API /api/posts thật thay vì dữ liệu tĩnh cũ)
   Cần nạp assets/js/api-config.js TRƯỚC file này để có biến API_BASE_URL.
   ========================================================= */
// Phase 9.4 - tự thêm hậu tố khu vực vào alt text ảnh bìa bài viết, không bắt viết tay (chuẩn SEO
// ảnh + GEO). Định nghĩa riêng ở đây (không dùng chung với catalog-render.js) vì 2 file phục vụ
// 2 nhóm trang khác nhau, không có bundler để chia sẻ hàm nhỏ này.
function seoAlt(name) {
    return `${name} - Đức Hiếu Auto Buôn Ma Thuột`;
}

// Liên kết chéo blog -> sản phẩm: field "category" của bài viết là danh sách chữ cố định do admin
// chọn từ dropdown (bai-viet-form.html), khớp tay 1 lần với đúng 8 danh mục sản phẩm thật (id lấy
// từ /api/products/catalog) - không cần đổi cấu trúc dữ liệu bài viết hiện có.
const BLOG_CATEGORY_TO_PRODUCT_CATEGORY = {
    "Màn Hình Ô Tô": "man-hinh-o-to",
    "Âm Thanh - Cách Âm": "am-thanh-cach-am-oto",
    "Android Box Ô Tô": "android-box-o-to",
    "Camera Hành Trình - 360": "camera-hanh-trinh",
    "Film Cách Nhiệt": "dan-phim-cach-nhiet",
    "PPF - Wrap Đổi Màu": "ppf-wrap-doi-mau",
    "Nâng Cấp Ánh Sáng": "do-den",
    "Đồ Bán Tải": "do-ban-tai"
};

// Gợi ý vài sản phẩm thật cùng danh mục với bài viết - tái dùng loadApiCatalog()/miniProductCardHtml()
// đã có sẵn trong catalog-render.js (cùng nạp trên trang bai-viet-chi-tiet.html, chia sẻ scope toàn cục).
async function renderBlogRelatedProducts(postCategory) {
    const categoryId = BLOG_CATEGORY_TO_PRODUCT_CATEGORY[postCategory];
    const section = document.getElementById("blogRelatedProductsSection");
    const grid = document.getElementById("blogRelatedProductsGrid");
    if (!categoryId || !section || !grid || typeof loadApiCatalog !== "function") return;

    try {
        const categories = await loadApiCatalog();
        const cat = categories.find(c => c.id === categoryId);
        if (!cat) return;

        const all = [];
        cat.brands.forEach(brand => {
            const items = brand.types ? brand.types.flatMap(t => t.products) : brand.products;
            all.push(...items);
        });
        // Xáo thứ tự nhẹ để mỗi lần ghé bài viết không luôn thấy đúng 4 sản phẩm đầu danh mục
        const picked = all.sort(() => Math.random() - 0.5).slice(0, 4);
        if (!picked.length) return;

        grid.innerHTML = picked.map(miniProductCardHtml).join("");
        section.hidden = false;
    } catch (err) { /* chỉ là gợi ý thêm - lỗi không chặn nội dung chính bài viết */ }
}

function formatBlogDate(sqlDateStr) {
    if (!sqlDateStr) return "";
    const d = new Date(sqlDateStr.replace(" ", "T") + "Z");
    return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function blogCardHtml(post) {
    const cover = post.cover_image || "assets/images/favicon.png";
    return `
        <a class="blog-card" href="bai-viet-chi-tiet.html?slug=${post.slug}">
            <div class="blog-card-img">
                <img src="${cover}" alt="${seoAlt(post.title)}" loading="lazy">
            </div>
            <div class="blog-card-body">
                <span class="blog-card-meta"><i class="fa-solid fa-tag"></i> ${post.category || "Tin tức"} <span>&middot;</span> ${formatBlogDate(post.created_at)}</span>
                <h3>${post.title}</h3>
                <p>${post.excerpt || ""}</p>
                <span class="blog-card-link">Đọc tiếp <i class="fa-solid fa-arrow-right"></i></span>
            </div>
        </a>`;
}

function blogSkeletonCardsHtml(count) {
    return Array.from({ length: count }).map(() => `
        <div class="skeleton-card">
            <div class="skeleton-block img"></div>
            <div class="skeleton-body">
                <div class="skeleton-block line w60"></div>
                <div class="skeleton-block line title"></div>
                <div class="skeleton-block line"></div>
                <div class="skeleton-block line"></div>
            </div>
        </div>`).join("");
}

async function renderBlogGrid(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    container.innerHTML = blogSkeletonCardsHtml(6);

    try {
        const res = await fetch(`${API_BASE_URL}/api/posts`);
        if (!res.ok) throw new Error("Không tải được danh sách bài viết");
        const posts = await res.json();

        if (posts.length === 0) {
            container.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:var(--text-muted);">Chưa có bài viết nào.</p>`;
            return;
        }
        container.innerHTML = posts.map(blogCardHtml).join("");
    } catch (err) {
        container.innerHTML = `
            <div class="blog-load-error" style="grid-column:1/-1;">
                <p>Không tải được danh sách bài viết. Vui lòng thử lại sau.</p>
                <button type="button" class="btn btn-secondary" onclick="renderBlogGrid('${containerSelector}')">Thử lại</button>
            </div>`;
    }
}

function blogDetailSkeletonHtml() {
    return `
        <div class="blog-detail-skeleton">
            <div class="skeleton-block title"></div>
            <div class="skeleton-block cover"></div>
            <div class="skeleton-block line"></div>
            <div class="skeleton-block line"></div>
            <div class="skeleton-block line short"></div>
        </div>`;
}

function setMetaTag(attr, key, content) {
    if (!content) return;
    let tag = document.querySelector(`meta[${attr}="${key}"]`);
    if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute(attr, key);
        document.head.appendChild(tag);
    }
    tag.setAttribute("content", content);
}

// Phase 9.6 - Article + BreadcrumbList schema cho trang chi tiết bài viết, cùng cơ chế với
// injectJsonLd() trong catalog-render.js nhưng định nghĩa riêng vì 2 file không dùng chung bundler.
function injectJsonLdBlog(id, schema) {
    let script = document.getElementById(id);
    if (!script) {
        script = document.createElement("script");
        script.type = "application/ld+json";
        script.id = id;
        document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(schema);
}

async function renderBlogDetail() {
    const wrap = document.querySelector(".blog-detail-wrap");
    if (!wrap) return;
    wrap.innerHTML = blogDetailSkeletonHtml();

    const params = new URLSearchParams(window.location.search);
    const slug = params.get("slug");
    if (!slug) {
        wrap.innerHTML = `<p style="text-align:center;color:var(--text-muted);">Không tìm thấy bài viết. <a href="tin-tuc.html">Quay lại Tin Tức</a></p>`;
        return;
    }

    try {
        const res = await fetch(`${API_BASE_URL}/api/posts/${encodeURIComponent(slug)}`);
        if (!res.ok) {
            wrap.innerHTML = `<p style="text-align:center;color:var(--text-muted);">Không tìm thấy bài viết. <a href="tin-tuc.html">Quay lại Tin Tức</a></p>`;
            return;
        }
        const post = await res.json();

        // Cập nhật SEO động (title/description/Open Graph) - lưu ý: vì trang render bằng JS,
        // các trình thu thập dữ liệu KHÔNG chạy JS (đa số bot chia sẻ mạng xã hội) sẽ chỉ thấy
        // được thẻ meta mặc định trong HTML gốc, không thấy bản cập nhật này. Google hiện tại có
        // chạy JS khi index nên vẫn đọc được. Nếu cần preview đẹp khi share Zalo/Facebook, cần
        // render phía server (ngoài phạm vi Phase 5 hiện tại).
        document.title = (post.meta_title || post.title) + " | Đức Hiếu Auto";
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute("content", post.meta_description || post.excerpt || "");
        setMetaTag("property", "og:title", post.meta_title || post.title);
        setMetaTag("property", "og:description", post.meta_description || post.excerpt || "");
        if (post.cover_image) setMetaTag("property", "og:image", new URL(post.cover_image, API_BASE_URL).href);
        setMetaTag("property", "og:type", "article");
        setMetaTag("property", "og:url", window.location.href);

        const breadcrumbCurrent = document.querySelector(".breadcrumb-current");
        if (breadcrumbCurrent) breadcrumbCurrent.textContent = post.title;

        injectJsonLdBlog("breadcrumbSchema", {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Trang chủ", "item": new URL("index.html", window.location.href).href },
                { "@type": "ListItem", "position": 2, "name": "Tin Tức", "item": new URL("tin-tuc.html", window.location.href).href },
                { "@type": "ListItem", "position": 3, "name": post.title, "item": window.location.href }
            ]
        });
        injectJsonLdBlog("articleSchema", {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": post.title,
            "description": post.meta_description || post.excerpt || "",
            "image": post.cover_image ? [new URL(post.cover_image, API_BASE_URL).href] : undefined,
            "datePublished": post.created_at,
            "dateModified": post.updated_at || post.created_at,
            "author": { "@type": "Organization", "name": "Đức Hiếu Auto" },
            "publisher": { "@type": "Organization", "name": "Đức Hiếu Auto" }
        });

        const ctaHtml = post.cta_text && post.cta_link ? `
            <a href="${post.cta_link}" class="view-all-cta blog-detail-cta">
                <div class="view-all-cta-text">
                    <span class="view-all-cta-label">Tìm hiểu thêm</span>
                    <h3>${post.cta_text}</h3>
                </div>
                <div class="view-all-cta-arrow"><i class="fa-solid fa-arrow-right"></i></div>
            </a>` : "";

        wrap.innerHTML = `
            <div class="blog-detail-meta"><i class="fa-solid fa-tag"></i> ${post.category || "Tin tức"} <span>&middot;</span> ${formatBlogDate(post.created_at)}</div>
            <h1 class="blog-detail-title">${post.title}</h1>
            ${post.cover_image ? `<div class="blog-detail-cover"><img src="${post.cover_image}" alt="${seoAlt(post.title)}"></div>` : ""}
            <div class="blog-detail-body">${post.content}</div>
            ${ctaHtml}
            <div class="related-products-section" id="blogRelatedProductsSection" hidden>
                <h2>Sản Phẩm Liên Quan</h2>
                <div class="product-grid-catalog" id="blogRelatedProductsGrid"></div>
            </div>`;

        renderBlogRelatedProducts(post.category);
    } catch (err) {
        wrap.innerHTML = `
            <div class="blog-load-error">
                <p>Không tải được bài viết. Vui lòng thử lại sau.</p>
                <button type="button" class="btn btn-secondary" onclick="renderBlogDetail()">Thử lại</button>
            </div>`;
    }
}
