/* =========================================================
   CATALOG RENDER - Hàm dùng chung cho các trang:
   category-chi-tiet.html, brand-san-pham.html, san-pham-chi-tiet.html, san-pham.html

   [Phase 7] categories/brands/products giờ lấy từ API /api/products/catalog (database thật,
   admin sửa được qua trang quản trị) thay vì đọc CATALOG tĩnh trong catalog-data.js.
   CATALOG.serviceGroups vẫn giữ tĩnh - đó chỉ là cách NHÓM HIỂN THỊ ở trang chủ (Nội Thất/Ngoại
   Thất Ô Tô), không phải dữ liệu sản phẩm nên không thuộc phạm vi CMS sản phẩm.
   ========================================================= */

// Phase 9.4 - tự thêm hậu tố tên thương hiệu + khu vực vào alt text ảnh sản phẩm/danh mục, không
// bắt admin gõ tay - vừa chuẩn SEO ảnh (Google Images) vừa cho GEO/AI hiểu rõ ngữ cảnh địa lý khi
// trích dẫn ("dán phim cách nhiệt Buôn Ma Thuột" thay vì chỉ tên sản phẩm chung chung).
function seoAlt(name) {
    return `${name} - Đức Hiếu Auto Buôn Ma Thuột`;
}

let apiCatalogCache = null;
async function loadApiCatalog() {
    if (apiCatalogCache) return apiCatalogCache;
    const res = await fetch(`${API_BASE_URL}/api/products/catalog`);
    if (!res.ok) throw new Error("Không tải được danh mục sản phẩm");
    apiCatalogCache = await res.json();
    return apiCatalogCache;
}

function getParam(name) {
    return new URLSearchParams(window.location.search).get(name);
}

function findCategoryIn(categories, id) {
    return categories.find(c => c.id === id);
}

function findServiceGroup(id) {
    return CATALOG.serviceGroups.find(g => g.id === id);
}

function productImgFallback(id) {
    // Ảnh sản phẩm dùng chung 1 folder duy nhất theo id
    return `assets/images/products/${id}/anh-1.jpg`;
}

function serviceCardHtml(item) {
    return `
        <a class="service-card" href="${item.href}">
            <div class="service-img">
                <img src="${item.poster}" alt="${seoAlt(item.name)}" loading="lazy" onerror="this.src='assets/images/placeholder.svg'">
                <div class="service-overlay"><i class="fa-solid fa-magnifying-glass-plus"></i></div>
            </div>
            <div class="service-content">
                <h3>${item.name}</h3>
                <span class="service-more">Xem chi tiết <i class="fa-solid fa-arrow-right"></i></span>
            </div>
        </a>`;
}

/* ---------- Danh mục Sản Phẩm (san-pham.html) - giữ nguyên phẳng, đủ 8 danh mục ---------- */
async function renderCategoryGrid(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    try {
        const categories = await loadApiCatalog();
        container.innerHTML = categories
            .map(cat => serviceCardHtml({ ...cat, href: `category-chi-tiet.html?id=${cat.id}` }))
            .join("");
    } catch (err) {
        container.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:var(--text-muted);">Không tải được danh mục sản phẩm. Vui lòng thử lại sau.</p>`;
    }
}

/* ---------- Dropdown "Sản Phẩm" trên header - mỗi danh mục kèm flyout thương hiệu thật khi rê chuột ---------- */
const CATEGORY_NAV_ICON = {
    "man-hinh-o-to": "fa-tablet-screen-button",
    "am-thanh-cach-am-oto": "fa-volume-high",
    "android-box-o-to": "fa-box",
    "dan-phim-cach-nhiet": "fa-layer-group",
    "camera-hanh-trinh": "fa-video",
    "ppf-wrap-doi-mau": "fa-shield-halved",
    "do-den": "fa-lightbulb",
    "do-ban-tai": "fa-truck-pickup"
};

async function renderNavProductsDropdown(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    try {
        const categories = await loadApiCatalog();
        // API /catalog đã chỉ trả brand có hidden=0 sẵn, không cần filter lại ở đây.
        container.innerHTML = categories.map(cat => {
            const brands = cat.brands;
            const icon = CATEGORY_NAV_ICON[cat.id] || "fa-circle";
            const flyoutHtml = brands.length
                ? brands.map(b => `<a href="brand-san-pham.html?id=${cat.id}&brand=${b.id}">${b.name}</a>`).join("")
                : `<span class="nav-brand-empty">Đang cập nhật</span>`;

            return `
            <div class="nav-product-row">
                <a class="nav-product-link" href="category-chi-tiet.html?id=${cat.id}">
                    <span class="nav-product-label"><i class="fa-solid ${icon}"></i>${cat.name}</span>
                    <i class="fa-solid fa-chevron-right nav-product-arrow"></i>
                </a>
                <div class="nav-brand-flyout">${flyoutHtml}</div>
            </div>`;
        }).join("");
    } catch (err) {
        // Dropdown menu không phải nội dung chính - lỗi tải không nên chặn cả trang, chỉ để trống.
    }
}

/* ---------- Dịch Vụ (index.html) - gộp nhóm: Nội Thất Ô Tô / Ngoại Thất Ô Tô / Đồ Bán Tải ---------- */
async function renderServiceGrid(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    try {
        const categories = await loadApiCatalog();
        const doBanTai = findCategoryIn(categories, "do-ban-tai");
        const items = [
            ...CATALOG.serviceGroups.map(g => ({ ...g, href: `category-chi-tiet.html?group=${g.id}` })),
            ...(doBanTai ? [{ ...doBanTai, href: `category-chi-tiet.html?id=${doBanTai.id}` }] : [])
        ];

        // Container này đồng thời là .swiper-wrapper (carousel Swiper trên trang chủ) nên mỗi thẻ
        // cần bọc trong .swiper-slide.
        container.innerHTML = items.map(item => `<div class="swiper-slide">${serviceCardHtml(item)}</div>`).join("");
    } catch (err) {
        container.innerHTML = CATALOG.serviceGroups
            .map(g => `<div class="swiper-slide">${serviceCardHtml({ ...g, href: `category-chi-tiet.html?group=${g.id}` })}</div>`)
            .join("");
    }
}

/* ---------- Dải logo thương hiệu chạy (index.html) - mỗi logo dẫn thẳng tới trang thương hiệu ---------- */
const BRAND_MARQUEE_ITEMS = [
    { logo: "assets/images/brands/xpel/logo.png", alt: "XPEL", href: "brand-san-pham.html?id=ppf-wrap-doi-mau&brand=xpel" },
    { logo: "assets/images/brands/3m-film/logo.png", alt: "3M", href: "brand-san-pham.html?id=dan-phim-cach-nhiet&brand=3m-film" },
    { logo: "assets/images/brands/jbl/logo.svg", alt: "JBL", href: "brand-san-pham.html?id=am-thanh-cach-am-oto&brand=jbl" },
    { logo: "assets/images/brands/infinity/logo.png", alt: "Infinity", href: "brand-san-pham.html?id=am-thanh-cach-am-oto&brand=infinity" },
    { logo: "assets/images/brands/harman-kardon/logo.png", alt: "Harman/Kardon", href: "brand-san-pham.html?id=am-thanh-cach-am-oto&brand=harman-kardon" },
    { logo: "assets/images/brands/pioneer/logo.png", alt: "Pioneer", href: "brand-san-pham.html?id=am-thanh-cach-am-oto&brand=pioneer" },
    { logo: "assets/images/brands/warn/logo.svg", alt: "WARN", href: "brand-san-pham.html?id=do-ban-tai&brand=toi-dien&loai=warn" },
    { logo: "assets/images/brands/tjm/logo.svg", alt: "TJM", href: "brand-san-pham.html?id=do-ban-tai&brand=toi-dien&loai=tjm" },
    { logo: "assets/images/brands/king-springs/logo.svg", alt: "King Springs", href: "brand-san-pham.html?id=do-ban-tai&brand=lo-xo-giam-xoc&loai=king-springs" },
    { logo: "assets/images/brands/aeroklas/logo.png", alt: "Aeroklas", href: "brand-san-pham.html?id=do-ban-tai&brand=nap-thung&loai=aeroklas" },
    { logo: "assets/images/brands/fogway/logo.png", alt: "Fogway", href: "brand-san-pham.html?id=do-den&brand=fogway" },
    { logo: "assets/images/brands/aozoom/logo.svg", alt: "Aozoom", href: "brand-san-pham.html?id=do-den&brand=aozoom" },
    { logo: "assets/images/brands/zestech/logo.svg", alt: "Zestech", href: "brand-san-pham.html?id=man-hinh-o-to&brand=zestech" },
    { logo: "assets/images/brands/teyes/logo.png", alt: "Teyes", href: "brand-san-pham.html?id=man-hinh-o-to&brand=teyes" },
    { logo: "assets/images/brands/gotech/logo.png", alt: "Gotech", href: "brand-san-pham.html?id=man-hinh-o-to&brand=gotech" },
    { logo: "assets/images/brands/vietmap-cam/logo.png", alt: "VIETMAP", href: "brand-san-pham.html?id=camera-hanh-trinh&brand=vietmap-cam" },
    { logo: "assets/images/brands/utour/logo.png", alt: "UTOUR", href: "brand-san-pham.html?id=camera-hanh-trinh&brand=utour" },
    { logo: "assets/images/brands/blackvue/logo-wordmark.png", alt: "BlackVue", href: "brand-san-pham.html?id=camera-hanh-trinh&brand=blackvue" },
    { logo: "assets/images/brands/carlinkit/logo.png", alt: "Carlinkit", href: "brand-san-pham.html?id=android-box-o-to&brand=carlinkit" },
    { logo: "assets/images/brands/elliview/logo.png", alt: "Elliview", href: "brand-san-pham.html?id=android-box-o-to&brand=elliview" },
    { logo: "assets/images/brands/ax-film/logo.png", alt: "AX Film", href: "brand-san-pham.html?id=ppf-wrap-doi-mau&brand=ax-film" },
    { logo: "assets/images/brands/avery-dennison/logo.png", alt: "Avery Dennison", href: "brand-san-pham.html?id=ppf-wrap-doi-mau&brand=avery" },
    { logo: "assets/images/brands/global-film/logo.png", alt: "Global", href: "brand-san-pham.html?id=dan-phim-cach-nhiet&brand=global-film" },
    { logo: "assets/images/brands/70mai/logo.svg", alt: "70mai", href: "brand-san-pham.html?id=camera-hanh-trinh&brand=70mai" }
];

function renderBrandMarquee(containerSelector) {
    const track = document.querySelector(containerSelector);
    if (!track) return;

    const itemHtml = (item) => `
        <a class="brand-marquee-item" href="${item.href}" title="${item.alt}">
            <img src="${item.logo}" alt="${item.alt}" loading="lazy">
        </a>`;

    // Lặp lại danh sách 2 lần để animation cuộn ngang liền mạch không đứt đoạn
    track.innerHTML = BRAND_MARQUEE_ITEMS.map(itemHtml).join("") + BRAND_MARQUEE_ITEMS.map(itemHtml).join("");
}

/* ---------- Trang chi tiết danh mục (poster + danh sách thương hiệu) ---------- */
async function renderCategoryDetail() {
    const groupId = getParam("group");
    if (groupId) {
        renderServiceGroupDetail(groupId);
        return;
    }

    const id = getParam("id");
    let cat;
    try {
        const categories = await loadApiCatalog();
        cat = findCategoryIn(categories, id);
    } catch (err) {
        document.querySelector(".category-detail-wrap").innerHTML = "<p>Không tải được danh mục. Vui lòng thử lại sau.</p>";
        return;
    }

    if (!cat) {
        document.querySelector(".category-detail-wrap").innerHTML = "<p>Không tìm thấy danh mục.</p>";
        return;
    }

    document.title = (cat.seo && cat.seo.title) ? cat.seo.title : cat.name + " | Đức Hiếu Auto";
    if (cat.seo && cat.seo.metaDescription) {
        let metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc) {
            metaDesc = document.createElement("meta");
            metaDesc.setAttribute("name", "description");
            document.head.appendChild(metaDesc);
        }
        metaDesc.setAttribute("content", cat.seo.metaDescription);
    }
    const posterImg = document.querySelector(".category-poster img");
    posterImg.src = cat.poster;
    posterImg.alt = seoAlt(cat.name);
    posterImg.onerror = () => { posterImg.onerror = null; posterImg.src = "assets/images/placeholder.svg"; };
    document.querySelector(".category-title").textContent = cat.name;

    document.querySelector(".breadcrumb-parent").textContent = "Sản Phẩm";
    document.querySelector(".breadcrumb-parent").href = "san-pham.html";
    document.querySelector(".breadcrumb-current").textContent = cat.name;

    injectBreadcrumbSchema([
        { name: "Trang chủ", href: "index.html" },
        { name: "Sản Phẩm", href: "san-pham.html" },
        { name: cat.name, href: `category-chi-tiet.html?id=${cat.id}` }
    ]);
    injectServiceSchema(cat.name, cat.seo && cat.seo.metaDescription);

    const seoBox = document.querySelector(".category-seo-content");
    if (cat.seo && (cat.seo.intro || cat.seo.sections)) {
        seoBox.hidden = false;
        const imgHtml = cat.seo.image
            ? `<figure class="category-seo-figure"><img src="${cat.seo.image}" alt="${seoAlt(cat.name)}" loading="lazy" onerror="this.closest('figure').remove()">${cat.seo.imageCaption ? `<figcaption>${cat.seo.imageCaption}</figcaption>` : ""}</figure>`
            : "";
        const sectionsHtml = (cat.seo.sections || []).map(s => `<h2>${s.heading}</h2><p>${s.body}</p>`).join("");
        seoBox.innerHTML = `
            ${imgHtml}
            ${cat.seo.intro ? `<p class="category-seo-intro">${cat.seo.intro}</p>` : ""}
            ${sectionsHtml}
        `;
    }

    const brandGrid = document.querySelector(".brand-grid");
    brandGrid.innerHTML = cat.brands.filter(brand => !brand.hidden).map(brand => {
        const count = brand.types
            ? brand.types.reduce((sum, t) => sum + t.products.length, 0)
            : brand.products.length;
        const logoHtml = brand.logo ? `<div class="brand-logo"><img src="${brand.logo}" alt="${brand.name}" loading="lazy"></div>` : "";
        return `
        <a class="brand-card" href="brand-san-pham.html?id=${cat.id}&brand=${brand.id}">
            <div class="brand-card-info">
                <h3>${brand.name}</h3>
                <span>${count} sản phẩm <i class="fa-solid fa-arrow-right"></i></span>
            </div>
            ${logoHtml}
        </a>`;
    }).join("");

    renderCategoryFaqs(cat.faqs);
}

// FAQ riêng theo danh mục (nội dung thật do Content admin nhập qua trang quản trị) - cùng kiểu
// accordion với faq.html (class faq-item/faq-question/faq-answer) để đồng bộ giao diện toàn site.
// Kèm schema FAQPage - đúng khuyến nghị GEO 2026 (nội dung hỏi-đáp trực tiếp giúp AI trích dẫn).
function renderCategoryFaqs(faqs) {
    const section = document.getElementById("categoryFaqSection");
    const list = document.getElementById("categoryFaqList");
    if (!section || !list) return;

    if (!faqs || !faqs.length) {
        section.hidden = true;
        return;
    }

    list.innerHTML = faqs.map(f => `
        <div class="faq-item">
            <button class="faq-question" type="button">
                ${f.question}
                <i class="fa-solid fa-chevron-down"></i>
            </button>
            <div class="faq-answer"><p>${f.answer}</p></div>
        </div>`).join("");

    list.querySelectorAll(".faq-question").forEach(btn => {
        btn.addEventListener("click", () => {
            const item = btn.closest(".faq-item");
            const wasOpen = item.classList.contains("open");
            list.querySelectorAll(".faq-item.open").forEach(el => el.classList.remove("open"));
            if (!wasOpen) item.classList.add("open");
        });
    });

    section.hidden = false;

    injectJsonLd("faqSchema", {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(f => ({
            "@type": "Question",
            "name": f.question,
            "acceptedAnswer": { "@type": "Answer", "text": f.answer }
        }))
    });
}

/* ---------- Trang chi tiết 1 nhóm dịch vụ (poster + danh sách danh mục con) ---------- */
async function renderServiceGroupDetail(groupId) {
    const group = findServiceGroup(groupId);

    if (!group) {
        document.querySelector(".category-detail-wrap").innerHTML = "<p>Không tìm thấy danh mục.</p>";
        return;
    }

    document.title = group.name + " | Đức Hiếu Auto";
    const posterImg = document.querySelector(".category-poster img");
    posterImg.src = group.poster;
    posterImg.alt = seoAlt(group.name);
    posterImg.onerror = () => { posterImg.onerror = null; posterImg.src = "assets/images/placeholder.svg"; };
    document.querySelector(".category-title").textContent = group.name;

    document.querySelector(".breadcrumb-parent").textContent = "Dịch Vụ";
    document.querySelector(".breadcrumb-parent").href = "index.html#service";
    document.querySelector(".breadcrumb-current").textContent = group.name;

    injectBreadcrumbSchema([
        { name: "Trang chủ", href: "index.html" },
        { name: "Dịch Vụ", href: "index.html#service" },
        { name: group.name, href: `category-chi-tiet.html?group=${group.id}` }
    ]);
    injectServiceSchema(group.name);

    const scrollCueText = document.querySelector(".scroll-cue span");
    if (scrollCueText) scrollCueText.textContent = "Xem danh mục";

    const grid = document.querySelector(".brand-grid");
    grid.classList.remove("brand-grid");
    grid.classList.add("services-grid");

    try {
        const categories = await loadApiCatalog();
        grid.innerHTML = group.categories
            .map(catId => findCategoryIn(categories, catId))
            .filter(Boolean)
            .map(cat => serviceCardHtml({ ...cat, href: `category-chi-tiet.html?id=${cat.id}` }))
            .join("");
    } catch (err) {
        grid.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:var(--text-muted);">Không tải được danh mục. Vui lòng thử lại sau.</p>`;
    }
}

/* ---------- Trang sản phẩm theo thương hiệu (hỗ trợ thêm cấp "loại": hãng -> loại -> sản phẩm) ---------- */
async function renderBrandProducts() {
    const id = getParam("id");
    const brandId = getParam("brand");
    const typeId = getParam("loai");
    const wrap = document.querySelector(".brand-products-wrap");

    let cat, brand;
    try {
        const categories = await loadApiCatalog();
        cat = findCategoryIn(categories, id);
        brand = cat ? cat.brands.find(b => b.id === brandId) : null;
    } catch (err) {
        wrap.innerHTML = "<p>Không tải được dữ liệu. Vui lòng thử lại sau.</p>";
        return;
    }

    if (!cat || !brand) {
        wrap.innerHTML = "<p>Không tìm thấy thương hiệu.</p>";
        return;
    }

    const breadcrumbCat = document.querySelector(".breadcrumb-cat");
    breadcrumbCat.textContent = cat.name;
    breadcrumbCat.href = `category-chi-tiet.html?id=${cat.id}`;

    const breadcrumbBrandSep = document.querySelector(".breadcrumb-brand-sep");
    const breadcrumbBrand = document.querySelector(".breadcrumb-brand");
    const grid = document.querySelector(".product-grid-catalog");

    const brandTitleEl = document.querySelector(".brand-title");
    const setBrandTitle = (text, logoSrc) => {
        brandTitleEl.innerHTML = (logoSrc ? `<img class="brand-title-logo" src="${logoSrc}" alt="${text}" loading="lazy">` : "") + `<span>${text}</span>`;
    };

    // Hãng có phân loại (VD: Loa Ô Tô / Loa Sub / Âm Ly) và chưa chọn loại cụ thể -> hiển thị danh sách loại
    if (brand.types && !typeId) {
        document.title = brand.name + " | Đức Hiếu Auto";
        setBrandTitle(brand.name, brand.logo);
        breadcrumbBrandSep.hidden = true;
        breadcrumbBrand.hidden = true;
        document.querySelector(".breadcrumb-current").textContent = brand.name;

        grid.classList.add("type-grid");
        grid.innerHTML = brand.types.map(t => {
            const typeLogoHtml = t.logo ? `<div class="brand-logo"><img src="${t.logo}" alt="${t.name}" loading="lazy"></div>` : "";
            return `
            <a class="brand-card" href="brand-san-pham.html?id=${cat.id}&brand=${brand.id}&loai=${t.id}">
                <div class="brand-card-info">
                    <h3>${t.name}</h3>
                    <span>${t.products.length} sản phẩm <i class="fa-solid fa-arrow-right"></i></span>
                </div>
                ${typeLogoHtml}
            </a>`;
        }).join("");
        return;
    }

    let productList;
    if (brand.types) {
        const t = brand.types.find(x => x.id === typeId);
        if (!t) {
            wrap.innerHTML = "<p>Không tìm thấy loại sản phẩm.</p>";
            return;
        }
        productList = t.products;

        breadcrumbBrandSep.hidden = false;
        breadcrumbBrand.hidden = false;
        breadcrumbBrand.textContent = brand.name;
        breadcrumbBrand.href = `brand-san-pham.html?id=${cat.id}&brand=${brand.id}`;
        document.querySelector(".breadcrumb-current").textContent = t.name;
        document.title = brand.name + " - " + t.name + " | Đức Hiếu Auto";
        setBrandTitle(brand.name + " - " + t.name, t.logo || brand.logo);
    } else {
        productList = brand.products;
        breadcrumbBrandSep.hidden = true;
        breadcrumbBrand.hidden = true;
        document.querySelector(".breadcrumb-current").textContent = brand.name;
        document.title = brand.name + " | Đức Hiếu Auto";
        setBrandTitle(brand.name, brand.logo);
    }

    grid.classList.remove("type-grid");

    // Bộ lọc/sắp xếp - chỉ hiện khi có từ 2 sản phẩm trở lên (sắp xếp 1 sản phẩm vô nghĩa)
    const toolbar = document.getElementById("productToolbar");
    const sortSelect = document.getElementById("sortSelect");
    if (toolbar) toolbar.hidden = productList.length < 2;

    function priceValue(p) {
        // "Liên hệ" hoặc không có giá -> xếp cuối cùng dù sắp xếp chiều nào
        const digits = (p.price || "").replace(/[^\d]/g, "");
        return digits ? parseInt(digits, 10) : null;
    }

    function sortProducts(list, mode) {
        if (mode === "default") return list;
        const sorted = [...list];
        sorted.sort((a, b) => {
            const pa = priceValue(a), pb = priceValue(b);
            if (pa === null && pb === null) return 0;
            if (pa === null) return 1;
            if (pb === null) return -1;
            return mode === "price-asc" ? pa - pb : pb - pa;
        });
        return sorted;
    }

    // Sản phẩm trong cây API đã có sẵn đủ field (name/price/image/brand) - không cần lookup thêm
    // như trước đây (findProduct(pid) trên dữ liệu tĩnh).
    function renderGrid(list) {
        grid.innerHTML = list.map(p => `
            <a class="product-card-catalog" href="san-pham-chi-tiet.html?id=${p.id}">
                <div class="product-img-catalog">
                    <img src="${p.image}" alt="${seoAlt(p.name)}" loading="lazy" onerror="this.src='assets/images/placeholder.svg'">
                </div>
                <div class="product-info-catalog">
                    <span class="product-brand-catalog">${p.brand}</span>
                    <h3>${p.name}</h3>
                    ${p.price ? `<span class="product-price-catalog">${p.price}</span>` : ""}
                </div>
            </a>`).join("");
    }

    renderGrid(productList);
    if (sortSelect) {
        sortSelect.value = "default";
        sortSelect.onchange = () => renderGrid(sortProducts(productList, sortSelect.value));
    }
}

/* ---------- Phase 9.6 - Schema SEO/GEO dùng chung (Service, Breadcrumb) ---------- */
// Chèn/cập nhật 1 thẻ <script type="application/ld+json"> theo id cố định - dùng chung cho mọi
// loại schema động (Product, Service, BreadcrumbList...) để không lặp code tạo/tìm thẻ script.
function injectJsonLd(id, schema) {
    let script = document.getElementById(id);
    if (!script) {
        script = document.createElement("script");
        script.type = "application/ld+json";
        script.id = id;
        document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(schema);
}

// items: [{name, href}] - href tương đối, tự quy về URL tuyệt đối theo domain đang chạy (không
// hardcode domain vì sau này có thể đổi sang domain riêng - xem Phase 8).
function injectBreadcrumbSchema(items) {
    injectJsonLd("breadcrumbSchema", {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": items.map((it, i) => ({
            "@type": "ListItem",
            "position": i + 1,
            "name": it.name,
            "item": new URL(it.href, window.location.href).href
        }))
    });
}

// Service schema cho từng trang danh mục/dịch vụ - giúp AI/Google hiểu đây là 1 dịch vụ cụ thể
// của Đức Hiếu Auto phục vụ đúng khu vực Buôn Ma Thuột/Đắk Lắk (GEO), không chỉ 1 trang liệt kê
// sản phẩm chung chung.
function injectServiceSchema(serviceName, description) {
    injectJsonLd("serviceSchema", {
        "@context": "https://schema.org",
        "@type": "Service",
        "serviceType": serviceName,
        "name": `${serviceName} - Đức Hiếu Auto`,
        "description": description || `Dịch vụ ${serviceName} tại Đức Hiếu Auto, Buôn Ma Thuột.`,
        "provider": { "@type": "AutoRepair", "name": "Đức Hiếu Auto" },
        "areaServed": ["Buôn Ma Thuột", "Đắk Lắk"],
        "url": window.location.href
    });
}

/* ---------- Trang chi tiết sản phẩm ---------- */
function injectProductSchema(p, img, absoluteImgUrl, reviewStats) {
    const priceDigits = (p.price || "").replace(/[^\d]/g, "");
    const schema = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": p.name,
        "image": absoluteImgUrl,
        "description": p.description || "",
        "brand": { "@type": "Brand", "name": p.brand || "Đức Hiếu Auto" }
    };
    if (priceDigits) {
        schema.offers = {
            "@type": "Offer",
            "priceCurrency": "VND",
            "price": priceDigits,
            "availability": "https://schema.org/InStock",
            "url": window.location.href
        };
    }
    // Chỉ chèn AggregateRating khi có ít nhất 1 đánh giá THẬT đã được duyệt - không tự bịa số
    // liệu (đúng nguyên tắc nội dung của dự án), rating giả sẽ vi phạm chính sách schema của Google.
    if (reviewStats && reviewStats.count > 0) {
        schema.aggregateRating = {
            "@type": "AggregateRating",
            "ratingValue": reviewStats.average,
            "reviewCount": reviewStats.count
        };
    }
    injectJsonLd("productSchema", schema);
}

// Hiện/ẩn nút "Xem Thêm / Thu Gọn" cho khối mô tả chi tiết - chỉ hiện nút nếu nội dung thực sự
// dài hơn chiều cao giới hạn (max-height đặt trong catalog-pages.css), tránh hiện nút thừa cho
// sản phẩm có mô tả ngắn.
function renderProductDetailContent(html) {
    const section = document.querySelector(".product-detail-content-section");
    const contentEl = document.querySelector(".product-detail-content");
    const wrap = document.querySelector(".product-detail-content-wrap");
    const toggleBtn = document.querySelector(".detail-toggle-btn");

    if (!html || !html.trim()) {
        section.hidden = true;
        return;
    }

    section.hidden = false;
    contentEl.innerHTML = html;

    requestAnimationFrame(() => {
        if (contentEl.scrollHeight > contentEl.clientHeight + 10) {
            wrap.classList.add("has-fade");
            toggleBtn.hidden = false;
            toggleBtn.addEventListener("click", () => {
                const expanded = contentEl.classList.toggle("expanded");
                wrap.classList.toggle("has-fade", !expanded);
                toggleBtn.querySelector(".toggle-label").textContent = expanded ? "Thu Gọn" : "Xem Thêm";
                toggleBtn.querySelector("i").className = expanded ? "fa-solid fa-chevron-up" : "fa-solid fa-chevron-down";
            });
        } else {
            toggleBtn.hidden = true;
        }
    });
}

function miniProductCardHtml(p) {
    const img = p.image || productImgFallback(p.id);
    return `
        <a class="product-card-catalog" href="san-pham-chi-tiet.html?id=${p.id}">
            <div class="product-img-catalog">
                <img src="${img}" alt="${seoAlt(p.name)}" loading="lazy" onerror="this.src='assets/images/placeholder.svg'">
            </div>
            <div class="product-info-catalog">
                <span class="product-brand-catalog">${p.brand}</span>
                <h3>${p.name}</h3>
                ${p.price ? `<span class="product-price-catalog">${p.price}</span>` : ""}
            </div>
        </a>`;
}

// Sản phẩm liên quan - ưu tiên cùng thương hiệu trước, thiếu thì lấy thêm sản phẩm khác cùng
// danh mục. Dùng loadApiCatalog() đã cache sẵn, không gọi thêm API riêng.
async function renderRelatedProducts(p) {
    const section = document.getElementById("relatedProductsSection");
    const grid = document.getElementById("relatedProductsGrid");
    if (!section || !grid) return;
    try {
        const categories = await loadApiCatalog();
        const cat = findCategoryIn(categories, p.category_id);
        if (!cat) return;

        const all = [];
        cat.brands.forEach(brand => {
            const items = brand.types ? brand.types.flatMap(t => t.products) : brand.products;
            all.push(...items);
        });

        const sameBrand = all.filter(x => x.id !== p.id && x.brand === p.brand);
        const others = all.filter(x => x.id !== p.id && x.brand !== p.brand);
        const picked = [...sameBrand, ...others].slice(0, 4);
        if (!picked.length) return;

        grid.innerHTML = picked.map(miniProductCardHtml).join("");
        section.hidden = false;
    } catch (err) { /* chỉ là gợi ý thêm - lỗi không chặn phần chính của trang */ }
}

// Sản phẩm đã xem gần đây - lưu trong localStorage của trình duyệt (không cần tài khoản), tối đa
// 8 sản phẩm, mới nhất lên đầu.
const RECENTLY_VIEWED_KEY = "dha_recently_viewed";
const RECENTLY_VIEWED_MAX = 8;

function readRecentlyViewed() {
    try {
        return JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) || "[]");
    } catch (err) {
        return [];
    }
}

function pushRecentlyViewed(p, img) {
    try {
        let list = readRecentlyViewed().filter(x => x.id !== p.id);
        list.unshift({ id: p.id, name: p.name, brand: p.brand, price: p.price, image: img });
        localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(list.slice(0, RECENTLY_VIEWED_MAX)));
    } catch (err) { /* localStorage đầy/bị chặn (chế độ ẩn danh...) - bỏ qua, không chặn trang */ }
}

function renderRecentlyViewed(currentId) {
    const section = document.getElementById("recentlyViewedSection");
    const grid = document.getElementById("recentlyViewedGrid");
    if (!section || !grid) return;

    const list = readRecentlyViewed().filter(x => x.id !== currentId);
    if (!list.length) return;

    grid.innerHTML = list.map(miniProductCardHtml).join("");
    section.hidden = false;
}

// ---------- Đánh giá khách hàng (hiển thị + gửi mới) ----------
function starsHtml(rating) {
    return Array.from({ length: 5 }, (_, i) => `<i class="fa-${i < rating ? "solid" : "regular"} fa-star"></i>`).join("");
}

function reviewItemHtml(r) {
    const date = new Date(r.created_at.replace(" ", "T") + "Z").toLocaleDateString("vi-VN");
    return `
        <div class="review-item">
            <div class="review-item-header">
                <strong>${r.customer_name}</strong>
                <span class="review-stars">${starsHtml(r.rating)}</span>
            </div>
            <p class="review-comment">${r.comment}</p>
            <span class="review-date">${date}</span>
        </div>`;
}

// Tải + hiển thị đánh giá đã duyệt, gắn sự kiện cho form gửi đánh giá mới. Trả về {count, average}
// để injectProductSchema() chèn AggregateRating (chỉ khi có đánh giá thật, không tự bịa số liệu).
async function initProductReviews(productId) {
    const summaryEl = document.getElementById("reviewsSummary");
    const listEl = document.getElementById("reviewsList");
    let stats = { count: 0, average: 0 };

    try {
        const res = await fetch(`${API_BASE_URL}/api/reviews?product_id=${encodeURIComponent(productId)}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        stats = { count: data.count, average: data.average };

        if (data.count > 0) {
            summaryEl.innerHTML = `<span class="review-stars">${starsHtml(Math.round(data.average))}</span> <strong>${data.average}/5</strong> <span>(${data.count} đánh giá)</span>`;
            summaryEl.hidden = false;
            listEl.innerHTML = data.reviews.map(reviewItemHtml).join("");
        } else {
            listEl.innerHTML = `<p class="reviews-empty">Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên chia sẻ trải nghiệm!</p>`;
        }
    } catch (err) {
        listEl.innerHTML = `<p class="reviews-empty">Không tải được đánh giá, vui lòng thử lại sau.</p>`;
    }

    const starPicker = document.getElementById("starPicker");
    const reviewForm = document.getElementById("reviewForm");
    if (!starPicker || !reviewForm) return stats;

    let selectedRating = 0;
    const starButtons = starPicker.querySelectorAll("button");
    starButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            selectedRating = parseInt(btn.dataset.star, 10);
            starButtons.forEach(b => b.classList.toggle("active", parseInt(b.dataset.star, 10) <= selectedRating));
        });
    });

    reviewForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const errorEl = document.getElementById("reviewError");
        const successEl = document.getElementById("reviewSuccess");
        errorEl.hidden = true;
        successEl.hidden = true;

        if (!selectedRating) {
            errorEl.textContent = "Vui lòng chọn số sao đánh giá.";
            errorEl.hidden = false;
            return;
        }

        const submitBtn = reviewForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        try {
            const res = await fetch(`${API_BASE_URL}/api/reviews`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    product_id: productId,
                    customer_name: document.getElementById("rvName").value.trim(),
                    rating: selectedRating,
                    comment: document.getElementById("rvComment").value.trim()
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Gửi đánh giá thất bại");

            successEl.hidden = false;
            reviewForm.reset();
            selectedRating = 0;
            starButtons.forEach(b => b.classList.remove("active"));
        } catch (err) {
            errorEl.textContent = err.message;
            errorEl.hidden = false;
        } finally {
            submitBtn.disabled = false;
        }
    });

    return stats;
}

// Gọi API thật (Phase 7) thay vì đọc CATALOG.products tĩnh - cho phép admin sửa sản phẩm trong
// trang quản trị và thấy ngay kết quả trên trang công khai.
async function renderProductDetail() {
    const id = getParam("id");
    const wrap = document.querySelector(".product-detail-wrap");

    try {
        const res = await fetch(`${API_BASE_URL}/api/products/${encodeURIComponent(id)}`);
        if (!res.ok) throw new Error("Không tìm thấy sản phẩm");
        const p = await res.json();

        const img = p.image || productImgFallback(id);
        const detailImg = document.querySelector(".product-detail-img img");
        detailImg.src = img;
        detailImg.alt = seoAlt(p.name);
        detailImg.onerror = () => { detailImg.onerror = null; detailImg.src = "assets/images/placeholder.svg"; };
        document.querySelector(".product-detail-brand").textContent = p.brand;
        document.querySelector(".product-detail-name").textContent = p.name;
        document.querySelector(".product-detail-price").textContent = p.price || "Liên hệ để biết giá";
        document.querySelector(".product-detail-desc").textContent = p.description || "Thông tin chi tiết đang được cập nhật. Vui lòng liên hệ hotline để được tư vấn.";

        const specsSection = document.querySelector(".product-detail-specs");
        if (p.specs && p.specs.length) {
            specsSection.querySelector(".specs-table").innerHTML = p.specs.map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`).join("");
            specsSection.hidden = false;
        } else {
            specsSection.hidden = true;
        }

        renderProductDetailContent(p.detail_content);

        const pageDesc = (p.description || "").slice(0, 155);
        document.title = `${p.name} - ${p.brand} | Đức Hiếu Auto`;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc && pageDesc) metaDesc.setAttribute("content", pageDesc);
        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) ogTitle.setAttribute("content", `${p.name} | Đức Hiếu Auto`);
        const ogDesc = document.querySelector('meta[property="og:description"]');
        if (ogDesc && pageDesc) ogDesc.setAttribute("content", pageDesc);

        const absoluteImgUrl = new URL(img, window.location.href).href;

        pushRecentlyViewed(p, img);
        renderRecentlyViewed(p.id);
        renderRelatedProducts(p);
        const reviewStats = await initProductReviews(p.id);

        injectProductSchema(p, img, absoluteImgUrl, reviewStats);
        injectBreadcrumbSchema([
            { name: "Trang chủ", href: "index.html" },
            { name: "Sản Phẩm", href: "san-pham.html" },
            ...(p.category_name ? [{ name: p.category_name, href: `category-chi-tiet.html?id=${p.category_id}` }] : []),
            { name: p.name, href: `san-pham-chi-tiet.html?id=${p.id}` }
        ]);
    } catch (err) {
        wrap.innerHTML = "<p>Không tìm thấy sản phẩm.</p>";
    }
}
