/**
 * Port từ duchieuauto-backend/routes/uploads.js sang Hono (Phase 13) - viết lại nhiều nhất trong
 * toàn bộ migration: `multer` (dựa vào Node stream `req`) -> `c.req.formData()` (Web FormData
 * chuẩn), và SDK `cloudinary` -> gọi REST trực tiếp qua utils/cloudinary.js. Giữ nguyên 100% hành
 * vi/response shape để frontend admin không cần sửa gì.
 */
import { Hono } from "hono";
import { requireRole } from "../middleware/auth.js";
import { uploadImage, listImages, deleteImage, applyTransform } from "../utils/cloudinary.js";

const canUpload = requireRole("content", "ads", "super_admin");
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

const app = new Hono();

app.post("/", ...canUpload, async (c) => {
    const formData = await c.req.formData();
    const file = formData.get("image");
    const purpose = formData.get("purpose");

    if (!file || typeof file === "string") {
        return c.json({ error: "Thiếu file ảnh" }, 400);
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
        return c.json({ error: "Chỉ chấp nhận ảnh JPEG, PNG, WEBP hoặc GIF" }, 400);
    }
    if (file.size > MAX_SIZE) {
        return c.json({ error: "Ảnh vượt quá 5MB" }, 400);
    }

    try {
        const result = await uploadImage(file, "duchieuauto", c.env);
        return c.json({ url: applyTransform(result.secure_url, purpose) }, 201);
    } catch (err) {
        console.error("Lỗi upload Cloudinary:", err.message);
        return c.json({ error: "Tải ảnh lên thất bại, vui lòng thử lại" }, 502);
    }
});

app.get("/library", ...canUpload, async (c) => {
    try {
        const resources = await listImages(c.env);
        return c.json(resources.map(r => ({
            url: r.secure_url,
            publicId: r.public_id,
            createdAt: r.created_at,
            format: r.format,
            bytes: r.bytes,
            width: r.width,
            height: r.height
        })));
    } catch (err) {
        console.error("Lỗi tải thư viện ảnh Cloudinary:", err.message);
        return c.json({ error: "Không tải được thư viện ảnh, vui lòng thử lại" }, 502);
    }
});

app.delete("/", ...canUpload, async (c) => {
    const { publicId } = await c.req.json();
    if (!publicId) return c.json({ error: "Thiếu publicId" }, 400);

    try {
        await deleteImage(publicId, c.env);
        const db = c.get("db");
        await db.logActivity(c.get("admin"), "delete_image", publicId);
        return c.json({ ok: true });
    } catch (err) {
        console.error("Lỗi xoá ảnh Cloudinary:", err.message);
        return c.json({ error: "Xoá ảnh thất bại, vui lòng thử lại" }, 502);
    }
});

export default app;
