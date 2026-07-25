const path = require("path");
const fs = require("fs");
// Dùng module SQLite có sẵn trong Node.js (từ bản 22.5+) thay vì gói "better-sqlite3" - gói đó
// cần biên dịch native (node-gyp + Python + Visual Studio Build Tools) và bản build sẵn
// (prebuilt binary) thường không theo kịp các bản Node.js rất mới, dễ cài lỗi trên máy chưa có
// sẵn công cụ build. node:sqlite có API gần như giống hệt (prepare/run/get/all/exec) nên không
// phải đổi cách viết query ở các file khác.
const { DatabaseSync } = require("node:sqlite");

const DB_PATH = process.env.DB_PATH || "./data/duchieuauto.db";
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const db = new DatabaseSync(DB_PATH);
db.exec("PRAGMA journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'content', -- 'content' | 'ads' | 'super_admin'
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    category TEXT,
    excerpt TEXT,
    cover_image TEXT,
    content TEXT NOT NULL,
    meta_title TEXT,
    meta_description TEXT,
    published INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL DEFAULT 'contact', -- 'contact' hoặc 'booking'
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    service TEXT,
    preferred_date TEXT,
    preferred_time TEXT,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'new', -- 'new' | 'contacted' | 'done'
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS activity_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_id INTEGER NOT NULL REFERENCES admins(id),
    admin_username TEXT NOT NULL,
    action TEXT NOT NULL, -- VD: 'create_post', 'update_post', 'delete_post', 'update_contact_status'
    target TEXT,          -- VD: 'post:ten-slug', 'contact:12'
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,   -- VD: 'google_analytics_id', 'facebook_pixel_id', 'social_facebook'...
    value TEXT,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS banners (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    image TEXT NOT NULL,
    link TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    start_date TEXT,
    end_date TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// Migration nhẹ: bảng "admins" có thể đã được tạo từ trước (Phase 0/3 bản đầu, chưa có cột
// "role"). CREATE TABLE IF NOT EXISTS ở trên không tự thêm cột mới vào bảng đã tồn tại, nên cần
// kiểm tra và ALTER TABLE thủ công cho các máy đã có sẵn file database cũ.
const adminColumns = db.prepare("PRAGMA table_info(admins)").all().map(col => col.name);
if (!adminColumns.includes("role")) {
    db.exec("ALTER TABLE admins ADD COLUMN role TEXT NOT NULL DEFAULT 'content'");
}

// Ghi lại lịch sử thao tác của admin (ai sửa gì lúc nào) - dùng chung cho mọi route cần log,
// quan trọng vì sắp có từ 2 admin trở lên (Content + Ads) cùng thao tác trên hệ thống.
function logActivity(admin, action, target) {
    db.prepare(
        "INSERT INTO activity_log (admin_id, admin_username, action, target) VALUES (?, ?, ?, ?)"
    ).run(admin.id, admin.username, action, target || null);
}

module.exports = db;
module.exports.logActivity = logActivity;
