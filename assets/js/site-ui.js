/* =========================================================
   SITE-UI - Cải thiện trải nghiệm chung cho MỌI trang
   Nạp SAU các <script> inline sẵn có của từng trang. KHÔNG tự gắn sự kiện
   mở/đóng menu (việc đó do inline script từng trang lo, tránh gắn 2 lần =
   triệt tiêu nhau) - ở đây chỉ "lắng nghe" trạng thái menu qua thay đổi class
   rồi bổ sung: khoá cuộn nền, đổi icon hamburger <-> X, cập nhật aria, đóng
   menu khi bấm vào link hoặc nhấn Esc.
   ========================================================= */
(function () {
    "use strict";

    // Trang động (category/san-pham/brand/bai-viet chi tiet) là khung CSR: bot nhận bản SSR có
    // <link rel="canonical"> riêng, còn người dùng thật nhận khung này chưa có canonical. Nếu
    // trang CHƯA có thẻ canonical thì tự thêm canonical tự-trỏ, bỏ đuôi ".html" cho khớp đúng
    // URL chuẩn mà bản SSR khai (vd .../san-pham-chi-tiet?id=x). Trang tĩnh đã có canonical cứng
    // trong <head> nên nhánh này tự bỏ qua.
    function canonicalFallback() {
        if (document.querySelector('link[rel="canonical"]')) return;
        var href = location.origin + location.pathname.replace(/\.html$/, "") + location.search;
        var link = document.createElement("link");
        link.rel = "canonical";
        link.href = href;
        document.head.appendChild(link);
    }
    canonicalFallback();

    function init() {
        var nav = document.querySelector(".main-nav");
        var toggle = document.querySelector(".menu-toggle");
        if (!nav) return;

        var NAV_OPEN_CLASS = "nav-open"; // gắn lên <html> để khoá cuộn nền khi menu mở

        function isOpen() {
            return nav.classList.contains("active");
        }

        function syncState() {
            var open = isOpen();
            document.documentElement.classList.toggle(NAV_OPEN_CLASS, open);
            if (toggle) {
                toggle.setAttribute("aria-expanded", open ? "true" : "false");
                toggle.setAttribute("aria-label", open ? "Đóng menu" : "Mở menu");
                var icon = toggle.querySelector("i");
                if (icon) {
                    icon.classList.toggle("fa-bars", !open);
                    icon.classList.toggle("fa-xmark", open);
                }
            }
        }

        function closeMenu() {
            if (!isOpen()) return;
            nav.classList.remove("active");
            // thu gọn luôn các dropdown đang mở trong menu cho lần mở sau sạch sẽ
            nav.querySelectorAll(".has-dropdown.dropdown-open").forEach(function (el) {
                el.classList.remove("dropdown-open");
            });
        }

        // Theo dõi class .active để đồng bộ trạng thái phụ (icon, aria, khoá cuộn)
        if (typeof MutationObserver === "function") {
            new MutationObserver(syncState).observe(nav, {
                attributes: true,
                attributeFilter: ["class"]
            });
        }
        syncState();

        // Bấm vào 1 liên kết điều hướng trong menu -> đóng menu
        nav.addEventListener("click", function (e) {
            var link = e.target.closest("a[href]");
            if (!link) return;
            // Bỏ qua nút mũi tên xổ dropdown (không phải <a>) - đã lọc bằng selector ở trên
            closeMenu();
        });

        // Nhấn Esc -> đóng menu
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" || e.key === "Esc") closeMenu();
        });

        // Quay lại bề rộng desktop -> đảm bảo menu không kẹt ở trạng thái mở/khoá cuộn
        var mq = window.matchMedia("(min-width: 992px)");
        var onChange = function (ev) {
            if (ev.matches) {
                nav.classList.remove("active");
                document.documentElement.classList.remove(NAV_OPEN_CLASS);
                syncState();
            }
        };
        if (mq.addEventListener) mq.addEventListener("change", onChange);
        else if (mq.addListener) mq.addListener(onChange);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
