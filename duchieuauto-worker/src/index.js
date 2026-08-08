/**
 * Entry point Cloudflare Workers cho backend Đức Hiếu Auto (Phase 13).
 * Mirror cấu trúc mount route của duchieuauto-backend/server.js, port dần từng route sang Hono -
 * xem tiến độ trong docs/nhat-ky-phat-trien-duc-hieu-auto-2026-07-06.md mục Phase 13.
 */
import { Hono } from "hono";
import { secureHeaders } from "hono/secure-headers";
import { getDb } from "./db.js";
import authRoutes from "./routes/auth.js";
import adminsRoutes from "./routes/admins.js";
import contactsRoutes from "./routes/contacts.js";
import reviewsRoutes from "./routes/reviews.js";
import productsRoutes from "./routes/products.js";
import postsRoutes from "./routes/posts.js";
import homepageRoutes from "./routes/homepage.js";
import homepageContentRoutes from "./routes/homepage-content.js";
import renderRoutes from "./routes/render.js";
import settingsRoutes from "./routes/settings.js";
import bannersRoutes from "./routes/banners.js";
import activityRoutes from "./routes/activity.js";
import uploadsRoutes from "./routes/uploads.js";
import leadsRoutes from "./routes/leads.js";

const app = new Hono();

// Phase 13.7 - port nguyên văn cấu hình CSP từ helmet() trong server.js gốc (xem comment gốc ở đó
// về lý do 'unsafe-inline' và danh sách domain ảnh). hono/secure-headers giữ mặc định hợp lý cho
// các header còn lại (X-Content-Type-Options, X-Frame-Options, Referrer-Policy, ...) tương đương
// helmet mặc định.
app.use("*", secureHeaders({
    contentSecurityPolicy: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
        imgSrc: ["'self'", "data:", "blob:", "https://duchieuauto.vn", "https://vanduccbn-sketch.github.io", "https://res.cloudinary.com"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", "data:"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"]
    }
}));

// Phase 13.7 - port nguyên văn logic CORS tuỳ biến từ server.js gốc (không dùng hono/cors thẳng vì
// cần đúng 4 điều kiện allow gốc, đặc biệt điều kiện "same-host" cho trang /admin cùng domain).
// Viết middleware tay để vừa quyết định allow/reject vừa tự xử lý preflight OPTIONS.
function isOriginAllowed(origin, c) {
    const allowedOrigins = (c.env.FRONTEND_ORIGIN || "*").split(",").map(s => s.trim());
    if (allowedOrigins.includes("*")) return true;
    if (allowedOrigins.includes(origin)) return true;
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return true;
    try {
        if (new URL(origin).host === new URL(c.req.url).host) return true;
    } catch (err) { /* origin không parse được thì rơi xuống bị từ chối bên dưới */ }
    return false;
}

app.use("*", async (c, next) => {
    const origin = c.req.header("Origin");
    if (!origin) {
        await next();
        return;
    }
    if (!isOriginAllowed(origin, c)) {
        console.warn(`[canh-bao-cors] ${new Date().toISOString()} ${c.req.method} ${c.req.path} origin=${origin}`);
        return c.json({ error: "Origin không được phép" }, 403);
    }
    c.header("Access-Control-Allow-Origin", origin);
    c.header("Vary", "Origin");
    if (c.req.method === "OPTIONS") {
        c.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS");
        c.header("Access-Control-Allow-Headers", c.req.header("Access-Control-Request-Headers") || "Content-Type,Authorization");
        return c.body(null, 204);
    }
    await next();
});

// Gắn sẵn `db` vào context cho mọi route - route handler dùng `c.get("db").prepare(...)`,
// tương đương `db.prepare(...)` ở bản Express cũ (route file cũ làm `const db = require("../models/db")`).
app.use("*", async (c, next) => {
    c.set("db", getDb(c.env));
    await next();
});

// Phase 13.7 - port nguyên văn log 401/403 từ server.js gốc, giúp phát hiện sớm nếu có ai dò quét
// /api. Workers Free không lưu log lâu dài (chỉ xem real-time qua `wrangler tail`), khác Render
// trước đây nhưng chấp nhận được (đã ghi trong plan Phase 13).
app.use("*", async (c, next) => {
    await next();
    if (c.res.status === 401 || c.res.status === 403) {
        console.warn(`[canh-bao-truy-cap] ${new Date().toISOString()} ${c.req.method} ${c.req.path} -> ${c.res.status}`);
    }
});

// Hono's c.json() không tự thêm "; charset=utf-8" vào Content-Type như Express res.json() -
// phát hiện thật lúc test Phase 13.3: dữ liệu tiếng Việt vẫn ĐÚNG 100% ở tầng byte (đã xác minh
// bằng cách tự giải mã UTF-8 thủ công), nhưng thiếu charset khiến 1 số HTTP client (VD PowerShell
// Invoke-RestMethod) tự đoán sai encoding lúc hiển thị. Thêm charset rõ ràng để khớp hành vi cũ,
// tránh mọi nhầm lẫn tương tự về sau (dù trình duyệt/fetch() thật luôn hiểu đúng UTF-8 cho JSON
// bất kể có charset hay không, theo đúng chuẩn JSON).
app.use("*", async (c, next) => {
    await next();
    const ct = c.res.headers.get("Content-Type");
    if (ct === "application/json") {
        c.res.headers.set("Content-Type", "application/json; charset=utf-8");
    }
});

app.get("/api/health", (c) => c.json({ ok: true, time: new Date().toISOString() }));

app.route("/api/auth", authRoutes);
app.route("/api/admins", adminsRoutes);
app.route("/api/contacts", contactsRoutes);
app.route("/api/reviews", reviewsRoutes);
app.route("/api/products", productsRoutes);
app.route("/api/posts", postsRoutes);
app.route("/api/homepage", homepageRoutes);
app.route("/api/homepage-content", homepageContentRoutes);
app.route("/render", renderRoutes);
app.route("/api/settings", settingsRoutes);
app.route("/api/banners", bannersRoutes);
app.route("/api/activity", activityRoutes);
app.route("/api/uploads", uploadsRoutes);
app.route("/api/leads", leadsRoutes);

// Vào thẳng gốc domain thì tự chuyển tới trang đăng nhập thay vì rơi vào 404 - giống hành vi gốc,
// hữu ích khi trỏ subdomain riêng (VD admin.duchieuauto.vn) vào thẳng Worker này (Phase 13.8 mới có
// static assets /admin thật, nhưng route redirect port sẵn ở đây theo đúng thứ tự bản gốc).
app.get("/", (c) => c.redirect("/admin/login.html"));

// Chặn index toàn bộ domain backend này (API + trang quản trị đều không cần lên Google) - domain
// công khai cho khách truy cập vẫn là GitHub Pages, robots.txt của domain đó xử lý riêng.
app.get("/robots.txt", (c) => c.text("User-agent: *\nDisallow: /\n"));

app.notFound((c) => c.json({ error: "Không tìm thấy route" }, 404));

app.onError((err, c) => {
    if (err && typeof err.message === "string" && err.message.startsWith("CORS")) {
        return c.json({ error: "Origin không được phép" }, 403);
    }
    console.error("[loi-server]", err);
    return c.json({ error: "Lỗi máy chủ, vui lòng thử lại sau" }, 500);
});

export default app;
