/**
 * Entry point Cloudflare Workers cho backend Đức Hiếu Auto (Phase 13).
 * Mirror cấu trúc mount route của duchieuauto-backend/server.js, port dần từng route sang Hono -
 * xem tiến độ trong docs/nhat-ky-phat-trien-duc-hieu-auto-2026-07-06.md mục Phase 13.
 */
import { Hono } from "hono";
import { getDb } from "./db.js";
import authRoutes from "./routes/auth.js";
import adminsRoutes from "./routes/admins.js";

const app = new Hono();

// Gắn sẵn `db` vào context cho mọi route - route handler dùng `c.get("db").prepare(...)`,
// tương đương `db.prepare(...)` ở bản Express cũ (route file cũ làm `const db = require("../models/db")`).
app.use("*", async (c, next) => {
    c.set("db", getDb(c.env));
    await next();
});

app.get("/api/health", (c) => c.json({ ok: true, time: new Date().toISOString() }));

app.route("/api/auth", authRoutes);
app.route("/api/admins", adminsRoutes);

app.notFound((c) => c.json({ error: "Không tìm thấy route" }, 404));

app.onError((err, c) => {
    console.error("[loi-server]", err);
    return c.json({ error: "Lỗi máy chủ, vui lòng thử lại sau" }, 500);
});

export default app;
