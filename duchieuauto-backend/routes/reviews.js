const express = require("express");
const db = require("../models/db");
const { requireRole } = require("../middleware/auth");

const router = express.Router();

// Content admin lẫn super_admin đều được duyệt/xoá đánh giá (cùng phạm vi quản lý nội dung công
// khai như bài viết/sản phẩm), Ads admin không cần đụng tới.
const canModerateReviews = requireRole("content", "super_admin");

// GET /api/reviews?product_id=X - public, CHỈ trả đánh giá đã duyệt (status='approved') + số
// liệu tổng hợp (trung bình sao, tổng số) để hiển thị và chèn schema AggregateRating.
router.get("/", async (req, res) => {
    const { product_id } = req.query;
    if (!product_id) return res.status(400).json({ error: "Thiếu product_id" });

    const reviews = await db.prepare(
        "SELECT id, customer_name, rating, comment, created_at FROM reviews WHERE product_id = ? AND status = 'approved' ORDER BY created_at DESC"
    ).all(product_id);

    const count = reviews.length;
    const average = count ? reviews.reduce((sum, r) => sum + r.rating, 0) / count : 0;

    res.json({ reviews, count, average: Math.round(average * 10) / 10 });
});

// POST /api/reviews - public, khách tự gửi đánh giá, luôn ở trạng thái "pending" chờ duyệt -
// không hiện công khai ngay để chặn spam/nội dung không phù hợp trước khi khách khác nhìn thấy.
router.post("/", async (req, res) => {
    const { product_id, customer_name, rating, comment } = req.body;

    if (!product_id || !customer_name || !comment) {
        return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });
    }
    const ratingNum = parseInt(rating, 10);
    if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
        return res.status(400).json({ error: "Số sao phải từ 1 đến 5" });
    }

    const product = await db.prepare("SELECT id FROM products WHERE id = ?").get(product_id);
    if (!product) return res.status(404).json({ error: "Không tìm thấy sản phẩm" });

    const info = await db.prepare(
        "INSERT INTO reviews (product_id, customer_name, rating, comment) VALUES (?, ?, ?, ?)"
    ).run(product_id, customer_name, ratingNum, comment);

    res.status(201).json({ id: info.lastInsertRowid });
});

/* =========================================================
   ADMIN - duyệt đánh giá (chỉ content/super_admin)
   ========================================================= */

// GET /api/reviews/admin/all - toàn bộ đánh giá mọi trạng thái, mới nhất trước, kèm tên sản phẩm
// để admin biết đang duyệt đánh giá của sản phẩm nào mà không cần tra chéo id thủ công.
router.get("/admin/all", canModerateReviews, async (req, res) => {
    const reviews = await db.prepare(`
        SELECT reviews.*, products.name as product_name
        FROM reviews JOIN products ON products.id = reviews.product_id
        ORDER BY reviews.created_at DESC
    `).all();
    res.json(reviews);
});

// PUT /api/reviews/:id/status - duyệt (approved) hoặc từ chối (rejected)
router.put("/:id/status", canModerateReviews, async (req, res) => {
    const { status } = req.body;
    if (!["approved", "rejected", "pending"].includes(status)) {
        return res.status(400).json({ error: "status không hợp lệ" });
    }
    const info = await db.prepare("UPDATE reviews SET status = ? WHERE id = ?").run(status, req.params.id);
    if (info.changes === 0) return res.status(404).json({ error: "Không tìm thấy đánh giá" });

    await db.logActivity(req.admin, "update_review_status", `review:${req.params.id}:${status}`);
    res.json({ ok: true });
});

// DELETE /api/reviews/:id - xoá hẳn (VD spam/nội dung vi phạm)
router.delete("/:id", canModerateReviews, async (req, res) => {
    const info = await db.prepare("DELETE FROM reviews WHERE id = ?").run(req.params.id);
    if (info.changes === 0) return res.status(404).json({ error: "Không tìm thấy đánh giá" });

    await db.logActivity(req.admin, "delete_review", `review:${req.params.id}`);
    res.json({ ok: true });
});

module.exports = router;
