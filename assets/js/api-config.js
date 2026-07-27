/* =========================================================
   CẤU HÌNH API BACKEND (Phase 5 - CMS)
   Tự nhận diện đang chạy ở máy local (test) hay trên GitHub Pages (thật) để gọi đúng địa chỉ
   backend. Khi deploy backend thật lên Render.com, chỉ cần sửa đúng 1 dòng PRODUCTION_API_URL
   bên dưới, không cần sửa chỗ khác.
   ========================================================= */
const PRODUCTION_API_URL = "https://api.duchieuauto.vn"; // Domain thật qua Cloudflare (2026-07-27) - backend vẫn chạy trên Render, chỉ đổi tên miền trỏ vào (URL onrender.com cũ vẫn còn hoạt động song song, không dùng nữa trong code)

const API_BASE_URL = (() => {
    const isLocal = ["localhost", "127.0.0.1"].includes(window.location.hostname);
    return isLocal ? "http://localhost:4000" : PRODUCTION_API_URL;
})();
