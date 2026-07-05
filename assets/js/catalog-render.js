/* =========================================================
   CATALOG RENDER - Hàm dùng chung cho các trang:
   category-chi-tiet.html, brand-san-pham.html, san-pham-chi-tiet.html, san-pham.html
   ========================================================= */

function getParam(name) {
    return new URLSearchParams(window.location.search).get(name);
}

function getCategoryList(type) {
    return type === "product" ? CATALOG.productCategories : CATALOG.services;
}

function findCategory(type, id) {
    return getCategoryList(type).find(c => c.id === id);
}

function findProduct(id) {
    return CATALOG.products[id] || null;
}

function productImgFallback(id) {
    // Ảnh sản phẩm dùng chung 1 folder duy nhất theo id, không phân biệt vào từ dịch vụ hay sản phẩm
    return `assets/images/products/${id}/anh-1.jpg`;
}

/* ---------- Trang danh mục dịch vụ / sản phẩm (index.html) ---------- */
function renderCategoryGrid(containerSelector, type) {
    const list = getCategoryList(type);
    const container = document.querySelector(containerSelector);
    if (!container) return;

    container.innerHTML = list.map(cat => `
        <a class="service-card" href="category-chi-tiet.html?type=${type}&id=${cat.id}">
            <div class="service-img">
                <img src="${cat.poster}" alt="${cat.name}" loading="lazy" onerror="this.src='assets/images/placeholder.svg'">
                <div class="service-overlay"><i class="fa-solid fa-magnifying-glass-plus"></i></div>
            </div>
            <div class="service-content">
                <h3>${cat.name}</h3>
                <span class="service-more">Xem chi tiết <i class="fa-solid fa-arrow-right"></i></span>
            </div>
        </a>
    `).join("");
}

/* ---------- Trang chi tiết danh mục (poster + danh sách thương hiệu) ---------- */
function renderCategoryDetail() {
    const type = getParam("type") || "service";
    const id = getParam("id");
    const cat = findCategory(type, id);

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

    const breadcrumbLabel = type === "product" ? "Sản Phẩm" : "Dịch Vụ";
    const breadcrumbLink = type === "product" ? "san-pham.html" : "index.html#service";
    document.querySelector(".breadcrumb-parent").textContent = breadcrumbLabel;
    document.querySelector(".breadcrumb-parent").href = breadcrumbLink;
    document.querySelector(".breadcrumb-current").textContent = cat.name;

    const brandGrid = document.querySelector(".brand-grid");
    brandGrid.innerHTML = cat.brands.map(brand => `
        <a class="brand-card" href="brand-san-pham.html?type=${type}&id=${cat.id}&brand=${brand.id}">
            <h3>${brand.name}</h3>
            <span>${brand.products.length} sản phẩm <i class="fa-solid fa-arrow-right"></i></span>
        </a>
    `).join("");
}

/* ---------- Trang sản phẩm theo thương hiệu ---------- */
function renderBrandProducts() {
    const type = getParam("type") || "service";
    const id = getParam("id");
    const brandId = getParam("brand");
    const cat = findCategory(type, id);
    const brand = cat ? cat.brands.find(b => b.id === brandId) : null;

    if (!cat || !brand) {
        document.querySelector(".brand-products-wrap").innerHTML = "<p>Không tìm thấy thương hiệu.</p>";
        return;
    }

    document.title = brand.name + " | Đức Hiếu Auto";
    document.querySelector(".brand-title").textContent = brand.name;

    const breadcrumbCat = document.querySelector(".breadcrumb-cat");
    breadcrumbCat.textContent = cat.name;
    breadcrumbCat.href = `category-chi-tiet.html?type=${type}&id=${cat.id}`;
    document.querySelector(".breadcrumb-current").textContent = brand.name;

    const grid = document.querySelector(".product-grid-catalog");
    grid.innerHTML = brand.products.map(pid => {
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
}
