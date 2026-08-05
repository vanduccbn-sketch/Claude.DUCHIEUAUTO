/* =========================================================
   Cloudflare Worker - Dynamic rendering cho bot (Phase 12, 2026-08-05)
   KHÔNG deploy qua git/Render - phải copy-paste thủ công vào Cloudflare Dashboard
   (Workers & Pages -> Create Worker), xem hướng dẫn triển khai trong nhật ký phát triển.

   Việc làm: khi phát hiện đúng bot (AI crawler không chạy JS, hoặc bot preview mạng xã hội) truy
   cập đúng 1 trong 3 loại trang động (sản phẩm/danh mục/bài viết), gọi sang route SSR
   /render/* của backend (duchieuauto-backend/routes/render.js) và trả kết quả đó thay vì để bot
   thấy khung trang rỗng (site chính là site tĩnh + JS, GitHub Pages không chạy được logic này).

   Người dùng thật + Googlebot (tự chạy JS tốt) hoàn toàn KHÔNG bị ảnh hưởng - luôn đi thẳng qua
   GitHub Pages như cũ, không có gì thay đổi. Nếu backend SSR lỗi/quá tải, tự rơi về đúng hành vi
   hiện tại (fetch(request) bình thường) - không có tình huống nào làm trang XẤU HƠN hiện trạng.
   ========================================================= */

const BOT_PATTERNS = [
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
