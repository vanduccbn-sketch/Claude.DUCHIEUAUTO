/* =========================================================
   TÌM KIẾM SẢN PHẨM TOÀN SITE
   Tự chèn nút tìm kiếm vào .header-actions + overlay kết quả vào <body> ở MỌI trang có nạp file
   này - không cần sửa HTML từng trang. Cần nạp SAU catalog-render.js (dùng loadApiCatalog()).
   ========================================================= */
(function () {
    // Bỏ dấu tiếng Việt để tìm không cần gõ đúng dấu (VD gõ "man hinh" vẫn ra "Màn Hình")
    function normalize(str) {
        return (str || "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[̀-ͯ]/g, "")
            .replace(/đ/g, "d");
    }

    let flatProductsPromise = null;
    function getFlatProducts() {
        if (flatProductsPromise) return flatProductsPromise;
        flatProductsPromise = loadApiCatalog().then(categories => {
            const list = [];
            categories.forEach(cat => {
                cat.brands.forEach(brand => {
                    const items = brand.types ? brand.types.flatMap(t => t.products) : brand.products;
                    items.forEach(p => list.push({ ...p, categoryName: cat.name }));
                });
            });
            return list;
        });
        return flatProductsPromise;
    }

    function resultItemHtml(p) {
        const img = p.image || `assets/images/products/${p.id}/anh-1.webp`;
        return `
            <a class="site-search-result-item" href="san-pham-chi-tiet?id=${p.id}">
                <img src="${img}" alt="" loading="lazy" onerror="this.src='assets/images/placeholder.svg'">
                <div class="site-search-result-info">
                    <strong>${p.name}</strong>
                    <span>${p.brand} · ${p.categoryName}</span>
                </div>
            </a>`;
    }

    async function runSearch(query) {
        const resultsEl = document.getElementById("siteSearchResults");
        const q = normalize(query.trim());
        if (!q) {
            resultsEl.innerHTML = `<p class="site-search-hint">Nhập tên sản phẩm hoặc thương hiệu để tìm (VD: "màn hình", "JBL", "phim cách nhiệt")...</p>`;
            return;
        }
        resultsEl.innerHTML = `<p class="site-search-hint">Đang tìm...</p>`;
        try {
            const all = await getFlatProducts();
            const matches = all.filter(p =>
                normalize(p.name).includes(q) || normalize(p.brand).includes(q) || normalize(p.categoryName).includes(q)
            ).slice(0, 8);
            resultsEl.innerHTML = matches.length
                ? matches.map(resultItemHtml).join("")
                : `<p class="site-search-hint">Không tìm thấy sản phẩm phù hợp. Thử từ khoá khác hoặc <a href="dat-lich-hen.html">liên hệ tư vấn</a>.</p>`;
        } catch (err) {
            resultsEl.innerHTML = `<p class="site-search-hint">Không tải được dữ liệu tìm kiếm, vui lòng thử lại sau.</p>`;
        }
    }

    function init() {
        const headerActions = document.querySelector(".header-actions");
        if (!headerActions) return;

        const toggleBtn = document.createElement("button");
        toggleBtn.type = "button";
        toggleBtn.className = "site-search-toggle";
        toggleBtn.setAttribute("aria-label", "Tìm kiếm sản phẩm");
        toggleBtn.innerHTML = `<i class="fa-solid fa-magnifying-glass"></i>`;
        headerActions.insertBefore(toggleBtn, headerActions.lastElementChild);

        const overlay = document.createElement("div");
        overlay.className = "site-search-overlay";
        overlay.id = "siteSearchOverlay";
        overlay.innerHTML = `
            <div class="site-search-box">
                <div class="site-search-input-row">
                    <i class="fa-solid fa-magnifying-glass"></i>
                    <input type="text" id="siteSearchInput" placeholder="Tìm sản phẩm theo tên, thương hiệu...">
                    <button type="button" id="siteSearchClose" aria-label="Đóng tìm kiếm"><i class="fa-solid fa-xmark"></i></button>
                </div>
                <div class="site-search-results" id="siteSearchResults">
                    <p class="site-search-hint">Nhập tên sản phẩm hoặc thương hiệu để tìm (VD: "màn hình", "JBL", "phim cách nhiệt")...</p>
                </div>
            </div>`;
        document.body.appendChild(overlay);

        const input = document.getElementById("siteSearchInput");
        const closeBtn = document.getElementById("siteSearchClose");

        function openSearch() {
            overlay.classList.add("open");
            setTimeout(() => input.focus(), 50);
        }
        function closeSearch() {
            overlay.classList.remove("open");
        }

        toggleBtn.addEventListener("click", openSearch);
        closeBtn.addEventListener("click", closeSearch);
        overlay.addEventListener("click", (e) => { if (e.target === overlay) closeSearch(); });
        document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeSearch(); });

        let debounceTimer;
        input.addEventListener("input", () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => runSearch(input.value), 250);
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
