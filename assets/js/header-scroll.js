/* =========================================================
   HIỆU ỨNG HEADER KHI CUỘN TRANG
   Thanh top-bar (địa chỉ/email/hotline) tự cuộn khuất theo dòng chảy trang (không cần xử lý gì
   thêm). Thanh nav chính (#header, position: sticky) khi cuộn xuống sẽ mờ đi (đỡ che nội dung),
   di chuột vào lại sáng rõ ngay để chọn menu bình thường. Dùng chung cho mọi trang có nạp file này.
   ========================================================= */
(function () {
    function init() {
        const header = document.getElementById("header");
        if (!header) return;

        const SCROLL_THRESHOLD = 80; // px - khoảng bằng chiều cao top-bar + 1 đoạn, tránh mờ ngay khi vừa nhích chuột
        let ticking = false;

        function updateHeaderState() {
            header.classList.toggle("scrolled", window.scrollY > SCROLL_THRESHOLD);
            ticking = false;
        }

        window.addEventListener("scroll", () => {
            if (!ticking) {
                requestAnimationFrame(updateHeaderState);
                ticking = true;
            }
        }, { passive: true });

        updateHeaderState();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
