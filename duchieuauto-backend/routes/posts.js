const express = require("express");
const db = require("../models/db");
const { requireRole } = require("../middleware/auth");
const { sanitizeContent } = require("../utils/sanitize-content");

const router = express.Router();

// Chỉ Content admin (hoặc super_admin) được tạo/sửa/xoá bài viết - Ads admin không có quyền
// này (đúng yêu cầu phân quyền: Ads admin chỉ quản banner/tracking/xem lead, không đụng bài viết).
const canEditPosts = requireRole("content", "super_admin");

function slugify(str) {
    return str
        .toLowerCase()
        // Bỏ dấu tiếng Việt: NFD tách chữ có dấu thành chữ gốc + dấu kết hợp riêng (VD "á" ->
        // "a" + U+0301), rồi xoá mọi ký tự trong khối Unicode "Combining Diacritical Marks"
        // (U+0300-U+036F). PHẢI dùng mã hex ̀-ͯ thay vì gõ thẳng ký tự Unicode vào
        // regex - bản gõ trực tiếp trước đó bị lỗi encoding khiến regex không khớp đúng dải,
        // làm slug tiếng Việt bị cắt xén sai (đã phát hiện qua test thật: "Cách" -> "c-ch").
        .normalize("NFD").replace(/[̀-ͯ]/g, "")
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

// Lịch đăng bài - thay vì cần 1 tiến trình cron riêng chạy đúng giờ (không đáng tin cậy trên
// Render free tier vì server "ngủ" khi không có request, hẹn giờ trong tiến trình có thể không
// bao giờ chạy), tự chuyển draft -> published ngay khi có request thật chạm tới bất kỳ endpoint
// công khai nào của bài viết. Độ trễ tối đa là tới lần khách ghé site tiếp theo sau giờ hẹn -
// chấp nhận được với quy mô 1 cửa hàng địa phương, đổi lại không cần thêm hạ tầng cron.
async function publishScheduledPosts() {
    await db.prepare(
        "UPDATE posts SET published = 1, publish_at = NULL WHERE published = 0 AND publish_at IS NOT NULL AND publish_at <= datetime('now')"
    ).run();
}

// GET /api/posts - danh sách bài viết đã publish (public, dùng cho trang Tin Tức)
router.get("/", async (req, res) => {
    await publishScheduledPosts();
    const posts = await db.prepare(
        "SELECT id, slug, title, category, excerpt, cover_image, created_at FROM posts WHERE published = 1 ORDER BY created_at DESC"
    ).all();
    res.json(posts);
});

// GET /api/posts/admin/all - TẤT CẢ bài viết kể cả bản nháp (cần đăng nhập) - dùng cho trang
// quản trị, đặt TRƯỚC route "/:slug" bên dưới để không bị nuốt mất (dù "/:slug" chỉ khớp đúng
// 1 đoạn nên về lý thuyết không đụng "/admin/all", đặt trước vẫn rõ ràng và an toàn hơn).
router.get("/admin/all", requireRole(), async (req, res) => {
    await publishScheduledPosts();
    const posts = await db.prepare(
        "SELECT id, slug, title, category, excerpt, cover_image, published, publish_at, created_at, updated_at FROM posts ORDER BY updated_at DESC"
    ).all();
    res.json(posts);
});

// GET /api/posts/admin/id/:id - chi tiết 1 bài viết theo ID, kể cả bản nháp (cần đăng nhập) -
// dùng cho form sửa bài ở trang quản trị.
router.get("/admin/id/:id", requireRole(), async (req, res) => {
    const post = await db.prepare("SELECT * FROM posts WHERE id = ?").get(req.params.id);
    if (!post) return res.status(404).json({ error: "Không tìm thấy bài viết" });
    res.json(post);
});

// GET /api/posts/:slug - chi tiết 1 bài viết (public, chỉ bài đã publish) - dùng cho trang blog công khai
router.get("/:slug", async (req, res) => {
    await publishScheduledPosts();
    const post = await db.prepare("SELECT * FROM posts WHERE slug = ? AND published = 1").get(req.params.slug);
    if (!post) return res.status(404).json({ error: "Không tìm thấy bài viết" });
    res.json(post);
});

// POST /api/posts - tạo bài viết mới (chỉ Content admin / super_admin)
router.post("/", canEditPosts, async (req, res) => {
    const { title, category, excerpt, cover_image, content, meta_title, meta_description, cta_text, cta_link, published, publish_at } = req.body;
    if (!title || !content) {
        return res.status(400).json({ error: "Thiếu title hoặc content" });
    }

    let slug = slugify(title);
    const exists = await db.prepare("SELECT id FROM posts WHERE slug = ?").get(slug);
    if (exists) slug = `${slug}-${Date.now()}`;

    // Có đặt lịch đăng -> luôn lưu ở trạng thái nháp, publishScheduledPosts() sẽ tự chuyển đúng
    // giờ hẹn (xem ghi chú ở hàm đó) - không cho phép vừa "published" vừa "publish_at" cùng lúc.
    const resolvedPublished = publish_at ? 0 : (published === false ? 0 : 1);

    const info = await db.prepare(`
        INSERT INTO posts (slug, title, category, excerpt, cover_image, content, meta_title, meta_description, cta_text, cta_link, published, publish_at)
        VALUES (@slug, @title, @category, @excerpt, @cover_image, @content, @meta_title, @meta_description, @cta_text, @cta_link, @published, @publish_at)
    `).run({
        slug, title,
        category: category || null,
        excerpt: excerpt || null,
        cover_image: cover_image || null,
        content: sanitizeContent(content),
        meta_title: meta_title || title,
        meta_description: meta_description || excerpt || null,
        cta_text: cta_text || null,
        cta_link: cta_link || null,
        published: resolvedPublished,
        publish_at: publish_at || null
    });

    await db.logActivity(req.admin, "create_post", `post:${slug}`);
    res.status(201).json({ id: info.lastInsertRowid, slug });
});

// PUT /api/posts/:id - sửa bài viết (chỉ Content admin / super_admin)
router.put("/:id", canEditPosts, async (req, res) => {
    const existing = await db.prepare("SELECT * FROM posts WHERE id = ?").get(req.params.id);
    if (!existing) return res.status(404).json({ error: "Không tìm thấy bài viết" });

    // Chỉ lấy đúng các field mà câu UPDATE bên dưới cần - libSQL (giống node:sqlite trước đây)
    // báo lỗi nếu object binding có field thừa không khớp tham số nào trong SQL (VD spread
    // nguyên "existing" sẽ dư "slug"/"created_at").
    // publish_at gửi chuỗi rỗng "" nghĩa là admin đã bấm "Huỷ lịch đăng" (khác undefined = không
    // đụng tới field này) - phải phân biệt rõ để không giữ nhầm lịch cũ khi admin cố tình xoá.
    let publishAt = req.body.publish_at !== undefined ? (req.body.publish_at || null) : existing.publish_at;
    let published;
    if (req.body.published === true) {
        // "Đăng ngay" (kể cả bấm hàng loạt "Đăng Đã Chọn") luôn thắng - ghi đè bỏ lịch đăng đang
        // chờ nếu có, tránh trường hợp bấm đăng ngay nhưng bài vẫn ở nháp vì còn publish_at cũ.
        published = 1;
        publishAt = null;
    } else {
        published = publishAt ? 0 : (req.body.published === undefined ? existing.published : (req.body.published ? 1 : 0));
    }

    const merged = {
        title: req.body.title ?? existing.title,
        category: req.body.category ?? existing.category,
        excerpt: req.body.excerpt ?? existing.excerpt,
        cover_image: req.body.cover_image ?? existing.cover_image,
        content: req.body.content ? sanitizeContent(req.body.content) : existing.content,
        meta_title: req.body.meta_title ?? existing.meta_title,
        meta_description: req.body.meta_description ?? existing.meta_description,
        cta_text: req.body.cta_text ?? existing.cta_text,
        cta_link: req.body.cta_link ?? existing.cta_link,
        published,
        publish_at: publishAt,
        updated_at: new Date().toISOString(),
        id: existing.id
    };
    await db.prepare(`
        UPDATE posts SET title=@title, category=@category, excerpt=@excerpt, cover_image=@cover_image,
        content=@content, meta_title=@meta_title, meta_description=@meta_description,
        cta_text=@cta_text, cta_link=@cta_link,
        published=@published, publish_at=@publish_at, updated_at=@updated_at WHERE id=@id
    `).run(merged);

    await db.logActivity(req.admin, "update_post", `post:${existing.slug}`);
    res.json({ ok: true });
});

// DELETE /api/posts/:id - xoá bài viết (chỉ Content admin / super_admin)
router.delete("/:id", canEditPosts, async (req, res) => {
    const existing = await db.prepare("SELECT slug FROM posts WHERE id = ?").get(req.params.id);
    if (!existing) return res.status(404).json({ error: "Không tìm thấy bài viết" });

    await db.prepare("DELETE FROM posts WHERE id = ?").run(req.params.id);
    await db.logActivity(req.admin, "delete_post", `post:${existing.slug}`);
    res.json({ ok: true });
});

module.exports = router;
