require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");

const db = require("./models/db");
const authRoutes = require("./routes/auth");
const postsRoutes = require("./routes/posts");
const contactsRoutes = require("./routes/contacts");
const uploadsRoutes = require("./routes/uploads");
const settingsRoutes = require("./routes/settings");
const bannersRoutes = require("./routes/banners");
const activityRoutes = require("./routes/activity");

const app = express();

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

app.get("/api/health", (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

app.use("/api/auth", authRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/contacts", contactsRoutes);
app.use("/api/uploads", uploadsRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/banners", bannersRoutes);
app.use("/api/activity", activityRoutes);

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
