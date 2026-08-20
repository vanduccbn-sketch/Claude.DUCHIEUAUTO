/* =========================================================
   Cloudflare Worker - Dynamic rendering cho bot (Phase 12, 2026-08-05)
   KHÔNG deploy qua git/Render - phải copy-paste thủ công vào Cloudflare Dashboard
   (Workers & Pages -> Create Worker), xem hướng dẫn triển khai trong nhật ký phát triển.

   Việc làm: khi phát hiện đúng bot (AI crawler không chạy JS, bot preview mạng xã hội, hoặc
   Googlebot) truy cập đúng 1 trong 3 loại trang động (sản phẩm/danh mục/bài viết), gọi sang route
   SSR /render/* của backend (duchieuauto-backend/routes/render.js) và trả kết quả đó thay vì để
   bot thấy khung trang rỗng (site chính là site tĩnh + JS, GitHub Pages không chạy được logic này).

   SỬA 2026-08-20: bản đầu (Phase 12) cố tình LOẠI Googlebot khỏi danh sách này với giả định
   "Googlebot tự chạy JS tốt nên không cần SSR". Dữ liệu thật từ Google Search Console Coverage
   (2026-08-20) cho thấy giả định đó sai trong thực tế: gần như toàn bộ URL sản phẩm/danh mục/
   thương hiệu (320 URL) bị xếp vào "Đã phát hiện - chưa lập chỉ mục" hoặc "Trang trùng lặp, chưa
   chọn trang chính tắc" - vì HTML gốc (trước khi JS chạy) của mọi trang cùng loại đều giống hệt
   nhau (cùng title/meta chung chung, không có canonical), khiến Google đánh giá thấp/gộp trùng
   ngay ở bước quét đầu tiên, trước khi kịp render JS. Thêm "googlebot" vào BOT_PATTERNS để
   Googlebot cũng nhận HTML đã có sẵn title/meta/canonical/schema.org riêng cho từng trang ngay từ
   response đầu tiên - đúng kỹ thuật "dynamic rendering" Google khuyến nghị cho site CSR, không
   phải cloaking vì nội dung SSR lấy từ đúng dữ liệu thật người dùng cuối cùng cũng thấy.

   Người dùng thật hoàn toàn KHÔNG bị ảnh hưởng - luôn đi thẳng qua GitHub Pages như cũ, không có
   gì thay đổi. Nếu backend SSR lỗi/quá tải, tự rơi về đúng hành vi hiện tại (fetch(request) bình
   thường) - không có tình huống nào làm trang XẤU HƠN hiện trạng.
   ========================================================= */

const BOT_PATTERNS = [
    // Googlebot (crawler chính dùng để lập chỉ mục, KHÁC "google-extended" là bot huấn luyện AI)
    "googlebot",
    // AI crawler / answer engine (không chạy JS)
    "gptbot", "chatgpt-user", "oai-searchbot",
    "claudebot", "claude-web", "anthropic-ai",
    "perplexitybot", "perplexity-user",
    "google-extended", "bingbot",
    "bytespider", "ccbot", "amazonbot", "applebot-extended", "meta-externalagent",
    // Bot preview link mạng xã hội / chat app (đọc OG tag, không chạy JS)
    "facebookexternalhit", "twitterbot", "linkedinbot", "slackbot", "telegrambot",
    "whatsapp", "discordbot", "zalo"
];

// path trang tĩnh -> { route SSR tương ứng, tên tham số query bắt buộc phải có mới SSR được }
const PATH_MAP = {
    "/san-pham-chi-tiet": { renderPath: "/render/product", requiredParam: "id" },
    "/san-pham-chi-tiet.html": { renderPath: "/render/product", requiredParam: "id" },
    "/category-chi-tiet": { renderPath: "/render/category", requiredParam: "id" },
    "/category-chi-tiet.html": { renderPath: "/render/category", requiredParam: "id" },
    "/brand-san-pham": { renderPath: "/render/brand", requiredParam: "id" },
    "/brand-san-pham.html": { renderPath: "/render/brand", requiredParam: "id" },
    "/bai-viet-chi-tiet": { renderPath: "/render/post", requiredParam: "slug" },
    "/bai-viet-chi-tiet.html": { renderPath: "/render/post", requiredParam: "slug" }
};

const BACKEND_ORIGIN = "https://api.duchieuauto.vn";

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const ua = (request.headers.get("User-Agent") || "").toLowerCase();

        const isBot = BOT_PATTERNS.some(p => ua.includes(p));
        const mapping = PATH_MAP[url.pathname];

        if (!isBot || !mapping || !url.searchParams.get(mapping.requiredParam)) {
            return fetch(request);
        }

        const renderUrl = `${BACKEND_ORIGIN}${mapping.renderPath}${url.search}`;

        // Cache tại edge Cloudflare 1 giờ - giảm tải backend Render (free tier hay "ngủ"), phản hồi
        // nhanh hơn cho các lượt bot crawl lại cùng URL trong thời gian ngắn.
        const cache = caches.default;
        const cacheKey = new Request(renderUrl, request);
        let cached = await cache.match(cacheKey);
        if (cached) return cached;

        try {
            const ssrResponse = await fetch(renderUrl, { cf: { cacheTtl: 3600 } });
            if (!ssrResponse.ok) return fetch(request);

            const body = await ssrResponse.text();
            const response = new Response(body, {
                status: 200,
                headers: {
                    "content-type": "text/html; charset=utf-8",
                    "cache-control": "public, max-age=3600"
                }
            });
            ctx.waitUntil(cache.put(cacheKey, response.clone()));
            return response;
        } catch (err) {
            // Backend lỗi/timeout - rơi về đúng hành vi hiện tại (trang tĩnh + JS), không làm gì tệ hơn.
            return fetch(request);
        }
    }
};
