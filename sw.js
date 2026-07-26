/* =========================================================
   SERVICE WORKER - PWA cơ bản
   Chỉ cache tài nguyên TĨNH (CSS/JS/ảnh) để tải nhanh hơn ở lần ghé sau và cho phép "cài đặt" web
   lên điện thoại. KHÔNG cache API backend (giá/sản phẩm/bài viết cần luôn mới nhất) - loại trừ rõ
   theo domain Render + đường dẫn /api/ để tránh hiện dữ liệu cũ mà không hay biết.
   ========================================================= */
const CACHE_NAME = "dha-static-v1";

self.addEventListener("install", (event) => {
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    const req = event.request;
    if (req.method !== "GET") return;

    const url = new URL(req.url);
    // Không đụng vào API backend hoặc request cross-origin khác (CDN font/icon) - chỉ tối ưu tài
    // nguyên tĩnh cùng domain của chính site (CSS/JS/ảnh nội bộ).
    if (url.origin !== self.location.origin) return;
    if (url.pathname.includes("/api/")) return;

    // Stale-while-revalidate: trả ngay bản cache (nếu có) cho cảm giác tải nhanh, đồng thời âm
    // thầm lấy bản mới nhất từ mạng để cập nhật cache cho lần sau - không bao giờ "kẹt" mãi ở
    // bản cũ vì luôn có 1 lượt fetch mạng chạy song song mỗi lần.
    event.respondWith(
        caches.open(CACHE_NAME).then((cache) =>
            cache.match(req).then((cached) => {
                const networkFetch = fetch(req)
                    .then((res) => {
                        if (res.ok) cache.put(req, res.clone());
                        return res;
                    })
                    .catch(() => cached);
                return cached || networkFetch;
            })
        )
    );
});
