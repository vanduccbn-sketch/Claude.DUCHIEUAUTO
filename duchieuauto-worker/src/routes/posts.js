/**
 * Port từ duchieuauto-backend/routes/posts.js sang Hono (Phase 13). Giữ nguyên 100% logic.
 */
import { Hono } from "hono";
import { requireRole } from "../middleware/auth.js";
import { sanitizeContent } from "../utils/sanitize-content.js";

const canEditPosts = requireRole("content", "super_admin");

function slugify(str) {
    return str
        .toLowerCase()
        .normalize("NFD").replace(/[̀-ͯ]/g, "")
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

async function publishScheduledPosts(db) {
    await db.prepare(
        "UPDATE posts SET published = 1, publish_at = NULL WHERE published = 0 AND publish_at IS NOT NULL AND publish_at <= datetime('now')"
    ).run();
}

const app = new Hono();

app.get("/", async (c) => {
    const db = c.get("db");
    await publishScheduledPosts(db);
    const posts = await db.prepare(
        "SELECT id, slug, title, category, excerpt, cover_image, created_at FROM posts WHERE published = 1 ORDER BY created_at DESC"
    ).all();
    return c.json(posts);
});

app.get("/admin/all", ...requireRole(), async (c) => {
    const db = c.get("db");
    await publishScheduledPosts(db);
    const posts = await db.prepare(
        "SELECT id, slug, title, category, excerpt, cover_image, published, publish_at, created_at, updated_at FROM posts ORDER BY updated_at DESC"
    ).all();
    return c.json(posts);
});

app.get("/admin/id/:id", ...requireRole(), async (c) => {
    const db = c.get("db");
    const post = await db.prepare("SELECT * FROM posts WHERE id = ?").get(c.req.param("id"));
    if (!post) return c.json({ error: "Không tìm thấy bài viết" }, 404);
    return c.json(post);
});

app.get("/:slug", async (c) => {
    const db = c.get("db");
    await publishScheduledPosts(db);
    const post = await db.prepare("SELECT * FROM posts WHERE slug = ? AND published = 1").get(c.req.param("slug"));
    if (!post) return c.json({ error: "Không tìm thấy bài viết" }, 404);
    return c.json(post);
});

app.post("/", ...canEditPosts, async (c) => {
    const { title, category, excerpt, cover_image, content, meta_title, meta_description, cta_text, cta_link, published, publish_at } = await c.req.json();
    if (!title || !content) {
        return c.json({ error: "Thiếu title hoặc content" }, 400);
    }

    const db = c.get("db");
    let slug = slugify(title);
    const exists = await db.prepare("SELECT id FROM posts WHERE slug = ?").get(slug);
    if (exists) slug = `${slug}-${Date.now()}`;

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

    await db.logActivity(c.get("admin"), "create_post", `post:${slug}`);
    return c.json({ id: info.lastInsertRowid, slug }, 201);
});

app.put("/:id", ...canEditPosts, async (c) => {
    const db = c.get("db");
    const id = c.req.param("id");
    const existing = await db.prepare("SELECT * FROM posts WHERE id = ?").get(id);
    if (!existing) return c.json({ error: "Không tìm thấy bài viết" }, 404);

    const body = await c.req.json();
    let publishAt = body.publish_at !== undefined ? (body.publish_at || null) : existing.publish_at;
    let published;
    if (body.published === true) {
        published = 1;
        publishAt = null;
    } else {
        published = publishAt ? 0 : (body.published === undefined ? existing.published : (body.published ? 1 : 0));
    }

    const merged = {
        title: body.title ?? existing.title,
        category: body.category ?? existing.category,
        excerpt: body.excerpt ?? existing.excerpt,
        cover_image: body.cover_image ?? existing.cover_image,
        content: body.content ? sanitizeContent(body.content) : existing.content,
        meta_title: body.meta_title ?? existing.meta_title,
        meta_description: body.meta_description ?? existing.meta_description,
        cta_text: body.cta_text ?? existing.cta_text,
        cta_link: body.cta_link ?? existing.cta_link,
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

    await db.logActivity(c.get("admin"), "update_post", `post:${existing.slug}`);
    return c.json({ ok: true });
});

app.delete("/:id", ...canEditPosts, async (c) => {
    const db = c.get("db");
    const id = c.req.param("id");
    const existing = await db.prepare("SELECT slug FROM posts WHERE id = ?").get(id);
    if (!existing) return c.json({ error: "Không tìm thấy bài viết" }, 404);

    await db.prepare("DELETE FROM posts WHERE id = ?").run(id);
    await db.logActivity(c.get("admin"), "delete_post", `post:${existing.slug}`);
    return c.json({ ok: true });
});

export default app;
