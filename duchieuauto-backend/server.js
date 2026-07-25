require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const postsRoutes = require("./routes/posts");
const contactsRoutes = require("./routes/contacts");
const uploadsRoutes = require("./routes/uploads");
const settingsRoutes = require("./routes/settings");
const bannersRoutes = require("./routes/banners");
const activityRoutes = require("./routes/activity");

const app = express();

app.use(express.json());
app.use(cors({
    origin: process.env.FRONTEND_ORIGIN || "*"
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
app.listen(PORT, () => console.log(`Đức Hiếu Auto backend đang chạy tại cổng ${PORT}`));
