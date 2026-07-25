const express = require("express");
const sanitizeHtml = require("sanitize-html");
const db = require("../models/db");
const { requireRole } = require("../middleware/auth");

const router = express.Router();

// Chỉ Content admin (hoặc super_admin) được tạo/sửa/xoá bài viết - Ads admin không có quyền
// này (đúng yêu cầu phân quyền: Ads admin chỉ quản banner/tracking/xem lead, không đụng bài viết).
const canEditPosts = requireRole("content", "super_admin");

// Cấu hình cho phép đúng các thẻ/thuộc tính mà trình soạn thảo rich-text (Quill/TipTap ở Phase 4)
// tạo ra - chặn stored-XSS (VD: <script>, onerror=...) do nội dung được lưu vào DB rồi hiển thị
// lại cho MỌI khách xem blog, nếu không sanitize thì 1 bài viết độc hại có thể chạy JS trên máy
// mọi khách truy cập trang Tin Tức.
const SANITIZE_OPTIONS = {
    allowedTags: [
        "p", "br", "strong", "b", "em", "i", "u", "s", "blockquote",
        "h2", "h3", "h4", "ul", "ol", "li", "a", "img", "figure", "figcaption"
    ],
    allowedAttributes: {
        a: ["href", "target", "rel"],
        img: ["src", "alt", "loading"]
    },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
        a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer", target: "_blank" })
    }
};

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

// GET /api/posts - danh sách bài viết đã publish (public, dùng cho trang Tin Tức)
router.get("/", (req, res) => {
    const posts = db.prepare(
        "SELECT id, slug, title, category, excerpt, cover_image, created_at FROM posts WHERE published = 1 ORDER BY created_at DESC"
    ).all();
    res.json(posts);
});

// GET /api/posts/admin/all - TẤT CẢ bài viết kể cả bản nháp (cần đăng nhập) - dùng cho trang
// quản trị, đặt TRƯỚC route "/:slug" bên dưới để không bị nuốt mất (dù "/:slug" chỉ khớp đúng
// 1 đoạn nên về lý thuyết không đụng "/admin/all", đặt trước vẫn rõ ràng và an toàn hơn).
router.get("/admin/all", requireRole(), (req, res) => {
    const posts = db.prepare(
        "SELECT id, slug, title, category, excerpt, cover_image, published, created_at, updated_at FROM posts ORDER BY updated_at DESC"
    ).all();
    res.json(posts);
});

// GET /api/posts/admin/id/:id - chi tiết 1 bài viết theo ID, kể cả bản nháp (cần đăng nhập) -
// dùng cho form sửa bài ở trang quản trị.
router.get("/admin/id/:id", requireRole(), (req, res) => {
    const post = db.prepare("SELECT * FROM posts WHERE id = ?").get(req.params.id);
    if (!post) return res.status(404).json({ error: "Không tìm thấy bài viết" });
    res.json(post);
});

// GET /api/posts/:slug - chi tiết 1 bài viết (public, chỉ bài đã publish) - dùng cho trang blog công khai
router.get("/:slug", (req, res) => {
    const post = db.prepare("SELECT * FROM posts WHERE slug = ? AND published = 1").get(req.params.slug);
    if (!post) return res.status(404).json({ error: "Không tìm thấy bài viết" });
    res.json(post);
});

// POST /api/posts - tạo bài viết mới (chỉ Content admin / super_admin)
router.post("/", canEditPosts, (req, res) => {
    const { title, category, excerpt, cover_image, content, meta_title, meta_description, published } = req.body;
    if (!title || !content) {
        return res.status(400).json({ error: "Thiếu title hoặc content" });
    }

    let slug = slugify(title);
    const exists = db.prepare("SELECT id FROM posts WHERE slug = ?").get(slug);
    if (exists) slug = `${slug}-${Date.now()}`;

    const info = db.prepare(`
        INSERT INTO posts (slug, title, category, excerpt, cover_image, content, meta_title, meta_description, published)
        VALUES (@slug, @title, @category, @excerpt, @cover_image, @content, @meta_title, @meta_description, @published)
    `).run({
        slug, title,
        category: category || null,
        excerpt: excerpt || null,
        cover_image: cover_image || null,
        content: sanitizeHtml(content, SANITIZE_OPTIONS),
        meta_title: meta_title || title,
        meta_description: meta_description || excerpt || null,
        published: published === false ? 0 : 1
    });

    db.logActivity(req.admin, "create_post", `post:${slug}`);
    res.status(201).json({ id: info.lastInsertRowid, slug });
});

// PUT /api/posts/:id - sửa bài viết (chỉ Content admin / super_admin)
router.put("/:id", canEditPosts, (req, res) => {
    const existing = db.prepare("SELECT * FROM posts WHERE id = ?").get(req.params.id);
    if (!existing) return res.status(404).json({ error: "Không tìm thấy bài viết" });

    // Chỉ lấy đúng các field mà câu UPDATE bên dưới cần - node:sqlite (khác với better-sqlite3
    // trước đây) báo lỗi "Unknown named parameter" nếu object binding có field thừa không khớp
    // tham số nào trong SQL (VD spread nguyên "existing" sẽ dư "slug"/"created_at").
    const merged = {
        title: req.body.title ?? existing.title,
        category: req.body.category ?? existing.category,
        excerpt: req.body.excerpt ?? existing.excerpt,
        cover_image: req.body.cover_image ?? existing.cover_image,
        content: req.body.content ? sanitizeHtml(req.body.content, SANITIZE_OPTIONS) : existing.content,
        meta_title: req.body.meta_title ?? existing.meta_title,
        meta_description: req.body.meta_description ?? existing.meta_description,
        published: req.body.published === undefined ? existing.published : (req.body.published ? 1 : 0),
        updated_at: new Date().toISOString(),
        id: existing.id
    };
    db.prepare(`
        UPDATE posts SET title=@title, category=@category, excerpt=@excerpt, cover_image=@cover_image,
        content=@content, meta_title=@meta_title, meta_description=@meta_description,
        published=@published, updated_at=@updated_at WHERE id=@id
    `).run(merged);

    db.logActivity(req.admin, "update_post", `post:${existing.slug}`);
    res.json({ ok: true });
});

// DELETE /api/posts/:id - xoá bài viết (chỉ Content admin / super_admin)
router.delete("/:id", canEditPosts, (req, res) => {
    const existing = db.prepare("SELECT slug FROM posts WHERE id = ?").get(req.params.id);
    if (!existing) return res.status(404).json({ error: "Không tìm thấy bài viết" });

    db.prepare("DELETE FROM posts WHERE id = ?").run(req.params.id);
    db.logActivity(req.admin, "delete_post", `post:${existing.slug}`);
    res.json({ ok: true });
});

module.exports = router;
