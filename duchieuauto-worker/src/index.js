/**
 * Entry point Cloudflare Workers cho backend Đức Hiếu Auto (Phase 13).
 * Mirror cấu trúc mount route của duchieuauto-backend/server.js, port dần từng route sang Hono -
 * xem tiến độ trong docs/nhat-ky-phat-trien-duc-hieu-auto-2026-07-06.md mục Phase 13.
 */
import { Hono } from "hono";
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

// Gắn sẵn `db` vào context cho mọi route - route handler dùng `c.get("db").prepare(...)`,
// tương đương `db.prepare(...)` ở bản Express cũ (route file cũ làm `const db = require("../models/db")`).
app.use("*", async (c, next) => {
    c.set("db", getDb(c.env));
    await next();
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

app.notFound((c) => c.json({ error: "Không tìm thấy route" }, 404));

app.onError((err, c) => {
    console.error("[loi-server]", err);
    return c.json({ error: "Lỗi máy chủ, vui lòng thử lại sau" }, 500);
});

export default app;
