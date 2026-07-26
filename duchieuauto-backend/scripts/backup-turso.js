/**
 * Backup toàn bộ dữ liệu Turso ra 1 file JSON (Phase 6). Turso tự có cơ chế bền vững riêng ở phía
 * hạ tầng của họ, nhưng backup này phòng trường hợp lỗi thao tác của người (xoá nhầm hàng loạt,
 * sửa sai dữ liệu) - Turso không có tính năng "thùng rác" để khôi phục như vậy.
 *
 * Chạy thủ công định kỳ (khuyến nghị: trước mỗi lần thay đổi lớn, hoặc 1 lần/tuần):
 *   node scripts/backup-turso.js
 * File backup lưu ở backups/backup-<thời-gian>.json (đã thêm backups/ vào .gitignore - không
 * commit lên git vì có chứa password_hash của tài khoản admin).
 *
 * Khôi phục thủ công khi cần: mở file JSON, dùng lại đúng câu INSERT ở models/db.js cho từng
 * bảng, điền dữ liệu từ file backup vào. Không viết sẵn script restore tự động ở đây để tránh
 * rủi ro chạy nhầm ghi đè dữ liệu thật đang có - phục hồi dữ liệu nên được làm thủ công, có kiểm
 * tra kỹ từng bước.
 */
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const db = require("../models/db");

const TABLES = ["admins", "posts", "contacts", "activity_log", "settings", "banners"];

(async () => {
    await db.ready;

    const backup = { created_at: new Date().toISOString(), tables: {} };
    for (const table of TABLES) {
        backup.tables[table] = await db.prepare(`SELECT * FROM ${table}`).all();
    }

    const dir = path.join(__dirname, "..", "backups");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const filename = `backup-${backup.created_at.replace(/[:.]/g, "-")}.json`;
    const filepath = path.join(dir, filename);
    fs.writeFileSync(filepath, JSON.stringify(backup, null, 2), "utf8");

    const counts = TABLES.map(t => `${t}: ${backup.tables[t].length}`).join(", ");
    console.log(`Đã backup xong -> ${filepath}`);
    console.log(`Số dòng mỗi bảng: ${counts}`);
})();
