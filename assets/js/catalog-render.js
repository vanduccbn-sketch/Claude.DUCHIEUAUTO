/* =========================================================
   CATALOG RENDER - Hàm dùng chung cho các trang:
   category-chi-tiet.html, brand-san-pham.html, san-pham-chi-tiet.html, san-pham.html
   ========================================================= */

function getParam(name) {
    return new URLSearchParams(window.location.search).get(name);
}

function findCategory(id) {
    return CATALOG.categories.find(c => c.id === id);
}

function findServiceGroup(id) {
    return CATALOG.serviceGroups.find(g => g.id === id);
}

function findProduct(id) {
    return CATALOG.products[id] || null;
}

function productImgFallback(id) {
    // Ảnh sản phẩm dùng chung 1 folder duy nhất theo id
    return `assets/images/products/${id}/anh-1.jpg`;
}

function serviceCardHtml(item) {
    return `
        <a class="service-card" href="${item.href}">
            <div class="service-img">
                <img src="${item.poster}" alt="${item.name}" loading="lazy" onerror="this.src='assets/images/placeholder.svg'">
                <div class="service-overlay"><i class="fa-solid fa-magnifying-glass-plus"></i></div>
            </div>
            <div class="service-content">
                <h3>${item.name}</h3>
                <span class="service-more">Xem chi tiết <i class="fa-solid fa-arrow-right"></i></span>
            </div>
        </a>`;
}

/* ---------- Danh mục Sản Phẩm (san-pham.html) - giữ nguyên phẳng, đủ 8 danh mục ---------- */
function renderCategoryGrid(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    container.innerHTML = CATALOG.categories
        .map(cat => serviceCardHtml({ ...cat, href: `category-chi-tiet.html?id=${cat.id}` }))
        .join("");
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

function renderNavProductsDropdown(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    container.innerHTML = CATALOG.categories.map(cat => {
        const brands = cat.brands.filter(b => !b.hidden);
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
}

/* ---------- Dịch Vụ (index.html) - gộp nhóm: Nội Thất Ô Tô / Ngoại Thất Ô Tô / Đồ Bán Tải ---------- */
function renderServiceGrid(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const doBanTai = findCategory("do-ban-tai");
    const items = [
        ...CATALOG.serviceGroups.map(g => ({ ...g, href: `category-chi-tiet.html?group=${g.id}` })),
        ...(doBanTai ? [{ ...doBanTai, href: `category-chi-tiet.html?id=${doBanTai.id}` }] : [])
    ];

    // Container này đồng thời là .swiper-wrapper (carousel Swiper trên trang chủ) nên mỗi thẻ
    // cần bọc trong .swiper-slide.
    container.innerHTML = items.map(item => `<div class="swiper-slide">${serviceCardHtml(item)}</div>`).join("");
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
function renderCategoryDetail() {
    const groupId = getParam("group");
    if (groupId) {
        renderServiceGroupDetail(groupId);
        return;
    }

    const id = getParam("id");
    const cat = findCategory(id);

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
    posterImg.alt = cat.name;
    posterImg.onerror = () => { posterImg.onerror = null; posterImg.src = "assets/images/placeholder.svg"; };
    document.querySelector(".category-title").textContent = cat.name;

    document.querySelector(".breadcrumb-parent").textContent = "Sản Phẩm";
    document.querySelector(".breadcrumb-parent").href = "san-pham.html";
    document.querySelector(".breadcrumb-current").textContent = cat.name;

    const seoBox = document.querySelector(".category-seo-content");
    if (cat.seo && (cat.seo.intro || cat.seo.sections)) {
        seoBox.hidden = false;
        const imgHtml = cat.seo.image
            ? `<figure class="category-seo-figure"><img src="${cat.seo.image}" alt="${cat.name}" loading="lazy" onerror="this.closest('figure').remove()">${cat.seo.imageCaption ? `<figcaption>${cat.seo.imageCaption}</figcaption>` : ""}</figure>`
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
}

/* ---------- Trang chi tiết 1 nhóm dịch vụ (poster + danh sách danh mục con) ---------- */
function renderServiceGroupDetail(groupId) {
    const group = findServiceGroup(groupId);

    if (!group) {
        document.querySelector(".category-detail-wrap").innerHTML = "<p>Không tìm thấy danh mục.</p>";
        return;
    }

    document.title = group.name + " | Đức Hiếu Auto";
    const posterImg = document.querySelector(".category-poster img");
    posterImg.src = group.poster;
    posterImg.alt = group.name;
    posterImg.onerror = () => { posterImg.onerror = null; posterImg.src = "assets/images/placeholder.svg"; };
    document.querySelector(".category-title").textContent = group.name;

    document.querySelector(".breadcrumb-parent").textContent = "Dịch Vụ";
    document.querySelector(".breadcrumb-parent").href = "index.html#service";
    document.querySelector(".breadcrumb-current").textContent = group.name;

    const scrollCueText = document.querySelector(".scroll-cue span");
    if (scrollCueText) scrollCueText.textContent = "Xem danh mục";

    const grid = document.querySelector(".brand-grid");
    grid.classList.remove("brand-grid");
    grid.classList.add("services-grid");
    grid.innerHTML = group.categories
        .map(catId => findCategory(catId))
        .filter(Boolean)
        .map(cat => serviceCardHtml({ ...cat, href: `category-chi-tiet.html?id=${cat.id}` }))
        .join("");
}

/* ---------- Trang sản phẩm theo thương hiệu (hỗ trợ thêm cấp "loại": hãng -> loại -> sản phẩm) ---------- */
function renderBrandProducts() {
    const id = getParam("id");
    const brandId = getParam("brand");
    const typeId = getParam("loai");
    const cat = findCategory(id);
    const brand = cat ? cat.brands.find(b => b.id === brandId) : null;

    if (!cat || !brand) {
        document.querySelector(".brand-products-wrap").innerHTML = "<p>Không tìm thấy thương hiệu.</p>";
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

    let productIds;
    if (brand.types) {
        const t = brand.types.find(x => x.id === typeId);
        if (!t) {
            document.querySelector(".brand-products-wrap").innerHTML = "<p>Không tìm thấy loại sản phẩm.</p>";
            return;
        }
        productIds = t.products;

        breadcrumbBrandSep.hidden = false;
        breadcrumbBrand.hidden = false;
        breadcrumbBrand.textContent = brand.name;
        breadcrumbBrand.href = `brand-san-pham.html?id=${cat.id}&brand=${brand.id}`;
        document.querySelector(".breadcrumb-current").textContent = t.name;
        document.title = brand.name + " - " + t.name + " | Đức Hiếu Auto";
        setBrandTitle(brand.name + " - " + t.name, t.logo || brand.logo);
    } else {
        productIds = brand.products;
        breadcrumbBrandSep.hidden = true;
        breadcrumbBrand.hidden = true;
        document.querySelector(".breadcrumb-current").textContent = brand.name;
        document.title = brand.name + " | Đức Hiếu Auto";
        setBrandTitle(brand.name, brand.logo);
    }

    grid.classList.remove("type-grid");
    grid.innerHTML = productIds.map(pid => {
        const p = findProduct(pid);
        if (!p) return "";
        const img = p.image || productImgFallback(pid);
        return `
        <a class="product-card-catalog" href="san-pham-chi-tiet.html?id=${pid}">
            <div class="product-img-catalog">
                <img src="${img}" alt="${p.name}" loading="lazy" onerror="this.src='assets/images/placeholder.svg'">
            </div>
            <div class="product-info-catalog">
                <span class="product-brand-catalog">${p.brand}</span>
                <h3>${p.name}</h3>
                ${p.price ? `<span class="product-price-catalog">${p.price}</span>` : ""}
            </div>
        </a>`;
    }).join("");
}

/* ---------- Trang chi tiết sản phẩm ---------- */
function injectProductSchema(p, img, absoluteImgUrl) {
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

    let script = document.getElementById("productSchema");
    if (!script) {
        script = document.createElement("script");
        script.type = "application/ld+json";
        script.id = "productSchema";
        document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(schema);
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
        detailImg.alt = p.name;
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
        injectProductSchema(p, img, absoluteImgUrl);
    } catch (err) {
        wrap.innerHTML = "<p>Không tìm thấy sản phẩm.</p>";
    }
}
