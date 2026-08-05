/* =========================================================
   SERVICE WORKER - PWA cơ bản
   Chỉ cache tài nguyên TĨNH (CSS/JS/ảnh) để tải nhanh hơn ở lần ghé sau và cho phép "cài đặt" web
   lên điện thoại. KHÔNG cache API backend (giá/sản phẩm/bài viết cần luôn mới nhất) - loại trừ rõ
   theo domain Render + đường dẫn /api/ để tránh hiện dữ liệu cũ mà không hay biết.
   ========================================================= */
// Đổi số bản (v1 -> v2 -> ...) MỖI KHI deploy thay đổi quan trọng ở CSS/JS/ảnh tĩnh - "activate"
// bên dưới tự xoá sạch cache tên cũ khi thấy CACHE_NAME đổi, ép trình duyệt lấy bản mới hoàn toàn
// thay vì có thể "kẹt" ở bản cache cũ dù đã sửa xong trên server (F5 thường/Ctrl+Shift+R không xoá
// được cache của Service Worker - đây là cơ chế riêng, khác cache HTTP thường của trình duyệt).
const CACHE_NAME = "dha-static-v10";

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
    // nguyên tĩnh cùng domain của chính site (CSS/JS/HTML nội bộ).
    if (url.origin !== self.location.origin) return;
    if (url.pathname.includes("/api/")) return;

    // KHÔNG can thiệp request ẢNH - phát hiện lúc audit giao diện di động: khi nhiều ảnh khác URL
    // cùng được trình duyệt tải gần như đồng thời (VD dải logo thương hiệu cuộn ngang - nhiều ảnh
    // loading="lazy" cùng vào khung nhìn 1 lúc do 1 lần cuộn), việc Service Worker "nuốt" request rồi
    // tự gọi lại fetch(req) bên trong (event.respondWith(fetch(req))) khiến response nhận về đủ
    // status 200 nhưng NỘI DUNG ảnh rỗng/hỏng (naturalWidth=0) - xác nhận lặp lại trên cả server dev
    // cục bộ LẪN trên production (duchieuauto.vn), và xác nhận biến mất hoàn toàn khi so sánh với
    // Network.setBypassServiceWorker - tức lỗi nằm ở chính cơ chế respondWith(fetch()) khi bị dội
    // nhiều request ảnh khác URL cùng lúc, KHÔNG liên quan gì đến logic Cache Storage (đã loại trừ
    // bằng cách tắt hẳn cache.match()/cache.put() và vẫn còn lỗi y hệt). Ảnh vốn đã có HTTP cache
    // riêng của trình duyệt (Cache-Control ở server) nên bỏ qua SW cho ảnh không mất gì, mà tránh
    // hẳn được lớp lỗi này - chỉ giữ SW lo phần CSS/JS/HTML.
    if (/\.(?:jpe?g|png|webp|gif|svg|avif|ico)(?:\?|$)/i.test(url.pathname)) return;

    // Stale-while-revalidate: trả ngay bản cache (nếu có) cho cảm giác tải nhanh, đồng thời âm
    // thầm lấy bản mới nhất từ mạng để cập nhật cache cho lần sau - không bao giờ "kẹt" mãi ở
    // bản cũ vì luôn có 1 lượt fetch mạng chạy song song mỗi lần.
    //
    // Toàn bộ phần đọc/ghi Cache Storage được cô lập bằng try/catch riêng, tách khỏi response mạng
    // thật (res) - lỗi tầng cache (VD cache.put() báo trùng khoá khi 2 request trùng URL gần như
    // đồng thời) không bao giờ được để rơi vào cùng nhánh lỗi với fetch() thật, tránh vứt bỏ nhầm
    // 1 response mạng đã tải thành công.
    event.respondWith(
        (async () => {
            let cached;
            try {
                const cache = await caches.open(CACHE_NAME);
                cached = await cache.match(req);
            } catch (err) {
                cached = undefined;
            }

            const networkFetch = fetch(req).then((res) => {
                if (res.ok) {
                    caches.open(CACHE_NAME)
                        .then((cache) => cache.put(req, res.clone()))
                        .catch(() => {});
                }
                return res;
            });

            if (cached) {
                networkFetch.catch(() => {});
                return cached;
            }
            return networkFetch;
        })()
    );
});
