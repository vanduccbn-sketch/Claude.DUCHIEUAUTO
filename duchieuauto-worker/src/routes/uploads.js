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

// POST /api/uploads/from-url - tải lại 1 ảnh đang nằm ở domain KHÁC (VD dán nguyên cả trang có ảnh
// hotlink từ site đối thủ vào mô tả chi tiết) về lưu thật lên Cloudinary. Cần cho tính năng "cắt
// ảnh" ở trang quản trị: trình duyệt không đọc được dữ liệu ảnh domain khác để cắt do CORS (ảnh gốc
// không cấp quyền Access-Control-Allow-Origin cho domain admin), nhưng SERVER gọi fetch() tới domain
// đó thì không bị giới hạn này (CORS chỉ áp dụng cho trình duyệt) - tải hộ về rồi lưu lại lên
// Cloudinary, trả URL Cloudinary mới (luôn hỗ trợ CORS) để trình duyệt cắt được bình thường. Có lợi
// ích phụ: ảnh không còn phụ thuộc domain gốc nữa, tránh vỡ nếu trang nguồn xoá/đổi ảnh sau này.
app.post("/from-url", ...canUpload, async (c) => {
    const { url, purpose } = await c.req.json();
    if (!url) return c.json({ error: "Thiếu url ảnh nguồn" }, 400);

    try {
        const imgRes = await fetch(url);
        if (!imgRes.ok) throw new Error(`Không tải được ảnh nguồn (HTTP ${imgRes.status})`);
        const contentType = (imgRes.headers.get("content-type") || "").split(";")[0].trim();
        if (!ALLOWED_TYPES.includes(contentType)) {
            return c.json({ error: "Định dạng ảnh nguồn không được hỗ trợ (chỉ JPEG/PNG/WEBP/GIF)" }, 400);
        }
        const blob = await imgRes.blob();
        if (blob.size > MAX_SIZE) return c.json({ error: "Ảnh nguồn vượt quá 5MB" }, 400);

        const result = await uploadImage(blob, "duchieuauto", c.env);
        return c.json({ url: applyTransform(result.secure_url, purpose) }, 201);
    } catch (err) {
        console.error("Lỗi tải ảnh từ URL ngoài:", err.message);
        return c.json({ error: "Không tải/lưu được ảnh từ nguồn đó, vui lòng thử lại" }, 502);
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
