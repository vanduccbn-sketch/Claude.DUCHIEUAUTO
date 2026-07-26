const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const express = require("express");
const multer = require("multer");
const { requireRole } = require("../middleware/auth");

const router = express.Router();

const UPLOAD_DIR = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const randomName = crypto.randomBytes(16).toString("hex");
        cb(null, `${randomName}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        if (!ALLOWED_TYPES.includes(file.mimetype)) {
            return cb(new Error("Chỉ chấp nhận ảnh JPEG, PNG, WEBP hoặc GIF"));
        }
        cb(null, true);
    }
});

// POST /api/uploads - upload 1 ảnh, dùng chung cho 2 nơi: ảnh bìa/ảnh chèn bài viết (Content
// admin) VÀ ảnh banner (Ads admin) - [Phase 6] phát hiện lúc rà soát quyền: bản đầu chỉ cho
// content/super_admin nên Ads admin thật sẽ bị 403 khi upload ảnh banner, đã sửa lại cho đủ cả 2
// vai trò cần dùng endpoint này. Trả về URL tương đối "/uploads/<ten-file>.jpg" - lưu trực tiếp
// trên đĩa server, phục vụ qua express.static (xem server.js). LƯU Ý: ổ đĩa Render free tier không
// persistent qua mỗi lần deploy lại - ảnh có thể mất, nên cân nhắc chuyển sang lưu trữ đối tượng
// (Cloudflare R2/S3...) khi lượng ảnh nhiều/quan trọng hơn.
router.post("/", requireRole("content", "ads", "super_admin"), (req, res) => {
    upload.single("image")(req, res, (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        if (!req.file) {
            return res.status(400).json({ error: "Thiếu file ảnh" });
        }
        res.status(201).json({ url: `/uploads/${req.file.filename}` });
    });
});

module.exports = router;
