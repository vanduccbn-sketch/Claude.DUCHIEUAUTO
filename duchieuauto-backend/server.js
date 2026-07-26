require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const db = require("./models/db");
const authRoutes = require("./routes/auth");
const postsRoutes = require("./routes/posts");
const contactsRoutes = require("./routes/contacts");
const uploadsRoutes = require("./routes/uploads");
const settingsRoutes = require("./routes/settings");
const bannersRoutes = require("./routes/banners");
const activityRoutes = require("./routes/activity");
const productsRoutes = require("./routes/products");

const app = express();

// Security headers (Phase 6). CSP chỉ cần bao phủ trang quản trị /admin (HTML/JS thuần, không
// build tool) - trang công khai nằm ở domain GitHub Pages riêng, không đi qua server này.
// scriptSrc/styleSrc phải cho "unsafe-inline" vì toàn bộ trang admin viết JS/CSS inline trực tiếp
// trong <script>/<style> (không dùng nonce/hash) - đánh đổi này được ghi nhận rõ ở đây, có thể
// siết chặt hơn sau nếu viết lại toàn bộ admin sang file JS ngoài + nonce.
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
            imgSrc: ["'self'", "data:", "blob:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'", "data:"],
            objectSrc: ["'none'"],
            frameAncestors: ["'none'"]
        }
    }
}));

app.use(express.json());

// Luôn cho phép domain frontend thật (FRONTEND_ORIGIN) + luôn cho phép localhost/127.0.0.1 bất kể
// môi trường - phục vụ test frontend tĩnh trên máy dev mà không phải nới lỏng CORS cho domain lạ.
const allowedOrigins = (process.env.FRONTEND_ORIGIN || "*").split(",").map(s => s.trim());
app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes("*")) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return callback(null, true);
        return callback(new Error("CORS: origin không được phép"));
    }
}));

// Rate limiting (Phase 6) - chặn spam/DoS đơn giản theo IP. Giới hạn chung cho toàn API, và giới
// hạn chặt hơn riêng cho đăng nhập (bổ sung thêm lớp bảo vệ ngoài cơ chế khoá 5-lần-sai đã có sẵn
// trong routes/auth.js - rate limit chặn được cả trường hợp gửi request dồn dập bất kể đúng/sai).
app.use("/api", rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Quá nhiều request, vui lòng thử lại sau ít phút" }
}));
app.use("/api/auth/login", rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Quá nhiều lần thử đăng nhập, vui lòng thử lại sau ít phút" }
}));

// Log truy cập bất thường (Phase 6) - ghi lại mọi request bị từ chối do thiếu/sai quyền (401/403)
// kèm IP + đường dẫn, giúp phát hiện sớm nếu có ai dò quét /api hoặc /admin. Render tự thu log
// stdout nên không cần ghi file riêng (cũng hợp lý vì free tier không có ổ đĩa cố định).
app.use((req, res, next) => {
    res.on("finish", () => {
        if (res.statusCode === 401 || res.statusCode === 403) {
            console.warn(`[canh-bao-truy-cap] ${new Date().toISOString()} ${req.ip} ${req.method} ${req.originalUrl} -> ${res.statusCode}`);
        }
    });
    next();
});

app.get("/api/health", (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

app.use("/api/auth", authRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/contacts", contactsRoutes);
app.use("/api/uploads", uploadsRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/banners", bannersRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/products", productsRoutes);

// Ảnh upload (ảnh bìa bài viết, ảnh chèn nội dung) - phục vụ trực tiếp file tĩnh
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Trang quản trị (Phase 4) - HTML/CSS/JS thuần, không build tool, cùng domain với API nên gọi
// fetch() bằng đường dẫn tương đối, không lo CORS. Không gắn trong menu công khai của site chính
// (site chính nằm ở domain GitHub Pages riêng, hoàn toàn tách biệt).
app.use("/admin", express.static(path.join(__dirname, "admin")));

// Chặn index toàn bộ domain backend này (API + trang quản trị đều không cần lên Google) - domain
// công khai cho khách truy cập vẫn là GitHub Pages, robots.txt của domain đó xử lý riêng.
app.get("/robots.txt", (req, res) => {
    res.type("text/plain").send("User-agent: *\nDisallow: /\n");
});

app.use((req, res) => res.status(404).json({ error: "Không tìm thấy route" }));

const PORT = process.env.PORT || 4000;
// Chờ schema Turso khởi tạo xong (CREATE TABLE IF NOT EXISTS) trước khi nhận request - tránh
// trường hợp request đầu tiên chạy trước khi bảng được tạo xong.
db.ready
    .then(() => app.listen(PORT, () => console.log(`Đức Hiếu Auto backend đang chạy tại cổng ${PORT}`)))
    .catch(err => {
        console.error("Không kết nối được Turso:", err.message);
        process.exit(1);
    });
