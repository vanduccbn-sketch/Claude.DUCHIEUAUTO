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

/* ---------- Dịch Vụ (index.html) - gộp nhóm: Nội Thất Ô Tô / Ngoại Thất Ô Tô / Đồ Bán Tải ---------- */
function renderServiceGrid(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const doBanTai = findCategory("do-ban-tai");
    const items = [
        ...CATALOG.serviceGroups.map(g => ({ ...g, href: `category-chi-tiet.html?group=${g.id}` })),
        ...(doBanTai ? [{ ...doBanTai, href: `category-chi-tiet.html?id=${doBanTai.id}` }] : [])
    ];

    container.innerHTML = items.map(serviceCardHtml).join("");
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

    document.title = cat.name + " | Đức Hiếu Auto";
    const posterImg = document.querySelector(".category-poster img");
    posterImg.src = cat.poster;
    posterImg.alt = cat.name;
    posterImg.onerror = () => { posterImg.onerror = null; posterImg.src = "assets/images/placeholder.svg"; };
    document.querySelector(".category-title").textContent = cat.name;

    document.querySelector(".breadcrumb-parent").textContent = "Sản Phẩm";
    document.querySelector(".breadcrumb-parent").href = "san-pham.html";
    document.querySelector(".breadcrumb-current").textContent = cat.name;

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
        brandTitleEl.innerHTML = (logoSrc ? `<img class="brand-title-logo" src="${logoSrc}" alt="${text}">` : "") + `<span>${text}</span>`;
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
function renderProductDetail() {
    const id = getParam("id");
    const p = findProduct(id);

    if (!p) {
        document.querySelector(".product-detail-wrap").innerHTML = "<p>Không tìm thấy sản phẩm.</p>";
        return;
    }

    document.title = p.name + " | Đức Hiếu Auto";
    const img = p.image || productImgFallback(id);
    const detailImg = document.querySelector(".product-detail-img img");
    detailImg.src = img;
    detailImg.alt = p.name;
    detailImg.onerror = () => { detailImg.onerror = null; detailImg.src = "assets/images/placeholder.svg"; };
    document.querySelector(".product-detail-brand").textContent = p.brand;
    document.querySelector(".product-detail-name").textContent = p.name;
    document.querySelector(".product-detail-price").textContent = p.price || "Liên hệ để biết giá";
    document.querySelector(".product-detail-desc").textContent = p.desc || "Thông tin chi tiết đang được cập nhật. Vui lòng liên hệ hotline để được tư vấn.";

    const specsSection = document.querySelector(".product-detail-specs");
    if (p.specs && p.specs.length) {
        specsSection.querySelector(".specs-table").innerHTML = p.specs.map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`).join("");
        specsSection.hidden = false;
    } else {
        specsSection.hidden = true;
    }
}
