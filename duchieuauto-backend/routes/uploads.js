const express = require("express");
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const { requireRole } = require("../middleware/auth");

const router = express.Router();

// Lưu ảnh lên Cloudinary (free tier, không cần thẻ tín dụng) thay vì ổ đĩa cục bộ của Render -
// ổ đĩa free tier không persistent qua mỗi lần deploy lại (đúng vấn đề y hệt SQLite trước khi
// chuyển sang Turso), nên ảnh admin tải lên (bìa bài viết, banner, ảnh sản phẩm) sẽ mất mỗi lần
// deploy code mới nếu vẫn lưu cục bộ. Cloudinary trả về URL CDN cố định, không phụ thuộc Render.
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// Phase 9.4 - tự crop/nén ảnh đúng tỷ lệ theo từng vị trí hiển thị bằng Cloudinary transformation
// URL (dịch vụ đã có sẵn xử lý, không cần cài thư viện ảnh riêng ở backend). Áp dụng lúc TRẢ VỀ
// URL (on-the-fly, Cloudinary tự render + cache ở CDN lần đầu request) - ảnh gốc trên Cloudinary
// không bị đổi, có thể đổi/bỏ preset sau này mà không mất dữ liệu gốc.
const TRANSFORM_PRESETS = {
    // Ảnh vuông: logo/thumbnail nhỏ
    square: "c_fill,g_auto,ar_1:1,w_600,q_auto,f_auto",
    // Ảnh bìa/banner rộng 16:9
    cover: "c_fill,g_auto,ar_16:9,w_1200,q_auto,f_auto",
    // Ảnh sản phẩm: 4:3 đồng bộ trong lưới danh sách
    product: "c_fill,g_auto,ar_4:3,w_800,q_auto,f_auto",
    // Ảnh chèn nội dung/before-after: giữ nguyên tỷ lệ gốc, chỉ giới hạn chiều rộng + nén, không crop
    content: "c_limit,w_1600,q_auto,f_auto"
};

function applyTransform(url, purpose) {
    const preset = TRANSFORM_PRESETS[purpose];
    if (!preset) return url; // không rõ mục đích thì giữ nguyên ảnh gốc, không tự ý crop
    return url.replace("/upload/", `/upload/${preset}/`);
}

// memoryStorage: giữ file trong RAM (buffer) rồi đẩy thẳng lên Cloudinary, không ghi ra đĩa cục bộ
// ở bất kỳ bước nào - tránh phụ thuộc filesystem của Render hoàn toàn.
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        if (!ALLOWED_TYPES.includes(file.mimetype)) {
            return cb(new Error("Chỉ chấp nhận ảnh JPEG, PNG, WEBP hoặc GIF"));
        }
        cb(null, true);
    }
});

// POST /api/uploads - upload 1 ảnh, dùng chung cho ảnh bìa/ảnh chèn bài viết (Content admin), ảnh
// banner (Ads admin), và ảnh sản phẩm (Content admin).
router.post("/", requireRole("content", "ads", "super_admin"), (req, res) => {
    upload.single("image")(req, res, (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        if (!req.file) {
            return res.status(400).json({ error: "Thiếu file ảnh" });
        }

        const stream = cloudinary.uploader.upload_stream(
            { folder: "duchieuauto" },
            (error, result) => {
                if (error) {
                    console.error("Lỗi upload Cloudinary:", error.message);
                    return res.status(502).json({ error: "Tải ảnh lên thất bại, vui lòng thử lại" });
                }
                res.status(201).json({ url: applyTransform(result.secure_url, req.body.purpose) });
            }
        );
        stream.end(req.file.buffer);
    });
});

module.exports = router;
