/* =========================================================
   CẤU HÌNH API BACKEND (Phase 5 - CMS)
   Tự nhận diện đang chạy ở máy local (test) hay trên GitHub Pages (thật) để gọi đúng địa chỉ
   backend. Khi deploy backend thật lên Render.com, chỉ cần sửa đúng 1 dòng PRODUCTION_API_URL
   bên dưới, không cần sửa chỗ khác.
   ========================================================= */
const PRODUCTION_API_URL = "https://claude-duchieuauto.onrender.com"; // Backend thật đã deploy trên Render (2026-07-26)

const API_BASE_URL = (() => {
    const isLocal = ["localhost", "127.0.0.1"].includes(window.location.hostname);
    return isLocal ? "http://localhost:4000" : PRODUCTION_API_URL;
})();
