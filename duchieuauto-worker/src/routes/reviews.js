/**
 * Port từ duchieuauto-backend/routes/reviews.js sang Hono (Phase 13). Giữ nguyên 100% logic.
 */
import { Hono } from "hono";
import { requireRole } from "../middleware/auth.js";
import { verifyTurnstile } from "../utils/verify-turnstile.js";

const canModerateReviews = requireRole("content", "super_admin");

const app = new Hono();

app.get("/", async (c) => {
    const productId = c.req.query("product_id");
    if (!productId) return c.json({ error: "Thiếu product_id" }, 400);

    const db = c.get("db");
    const reviews = await db.prepare(
        "SELECT id, customer_name, rating, comment, created_at FROM reviews WHERE product_id = ? AND status = 'approved' ORDER BY created_at DESC"
    ).all(productId);

    const count = reviews.length;
    const average = count ? reviews.reduce((sum, r) => sum + r.rating, 0) / count : 0;

    return c.json({ reviews, count, average: Math.round(average * 10) / 10 });
});

app.post("/", async (c) => {
    const { product_id, customer_name, rating, comment, recaptcha_token } = await c.req.json();

    if (!product_id || !customer_name || !comment) {
        return c.json({ error: "Thiếu thông tin bắt buộc" }, 400);
    }
    const ratingNum = parseInt(rating, 10);
    if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
        return c.json({ error: "Số sao phải từ 1 đến 5" }, 400);
    }
    if (!(await verifyTurnstile(recaptcha_token, c.env))) {
        return c.json({ error: "Xác thực bảo mật thất bại, vui lòng thử lại" }, 400);
    }

    const db = c.get("db");
    const product = await db.prepare("SELECT id FROM products WHERE id = ?").get(product_id);
    if (!product) return c.json({ error: "Không tìm thấy sản phẩm" }, 404);

    const info = await db.prepare(
        "INSERT INTO reviews (product_id, customer_name, rating, comment) VALUES (?, ?, ?, ?)"
    ).run(product_id, customer_name, ratingNum, comment);

    return c.json({ id: info.lastInsertRowid }, 201);
});

app.get("/admin/all", ...canModerateReviews, async (c) => {
    const db = c.get("db");
    const reviews = await db.prepare(`
        SELECT reviews.*, products.name as product_name
        FROM reviews JOIN products ON products.id = reviews.product_id
        ORDER BY reviews.created_at DESC
    `).all();
    return c.json(reviews);
});

app.put("/:id/status", ...canModerateReviews, async (c) => {
    const { status } = await c.req.json();
    if (!["approved", "rejected", "pending"].includes(status)) {
        return c.json({ error: "status không hợp lệ" }, 400);
    }
    const db = c.get("db");
    const id = c.req.param("id");
    const info = await db.prepare("UPDATE reviews SET status = ? WHERE id = ?").run(status, id);
    if (info.changes === 0) return c.json({ error: "Không tìm thấy đánh giá" }, 404);

    await db.logActivity(c.get("admin"), "update_review_status", `review:${id}:${status}`);
    return c.json({ ok: true });
});

app.delete("/:id", ...canModerateReviews, async (c) => {
    const db = c.get("db");
    const id = c.req.param("id");
    const info = await db.prepare("DELETE FROM reviews WHERE id = ?").run(id);
    if (info.changes === 0) return c.json({ error: "Không tìm thấy đánh giá" }, 404);

    await db.logActivity(c.get("admin"), "delete_review", `review:${id}`);
    return c.json({ ok: true });
});

export default app;
