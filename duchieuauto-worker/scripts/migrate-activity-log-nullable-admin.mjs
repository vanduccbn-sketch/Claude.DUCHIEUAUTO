/**
 * Chạy 1 lần: nới lỏng ràng buộc `admin_id INTEGER NOT NULL REFERENCES admins(id)` trong bảng
 * activity_log thành nullable - cần cho logSecurityEvent() (Phase 13.9 risk mitigation) ghi các sự
 * kiện bảo mật (401/403, khoá brute-force) không gắn với admin thật nào. SQLite/Turso không hỗ trợ
 * ALTER COLUMN trực tiếp để bỏ NOT NULL, phải dùng cách chuẩn: tạo bảng mới đúng schema cũ (chỉ bỏ
 * NOT NULL ở admin_id) -> copy toàn bộ dữ liệu -> đối chiếu số dòng khớp -> xoá bảng cũ -> đổi tên
 * bảng mới. An toàn cho dữ liệu hiện có (220+ dòng thật, dùng chung giữa Render và Worker) vì không
 * mất field/dữ liệu nào, chỉ nới constraint.
 */
import { createClient } from "@libsql/client";

const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN
});

const before = await client.execute("SELECT COUNT(*) as c FROM activity_log");
const countBefore = Number(before.rows[0].c);
console.log(`So dong activity_log TRUOC migration: ${countBefore}`);

await client.execute(`
    CREATE TABLE activity_log_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        admin_id INTEGER REFERENCES admins(id),
        admin_username TEXT NOT NULL,
        action TEXT NOT NULL,
        target TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
`);

await client.execute(`
    INSERT INTO activity_log_new (id, admin_id, admin_username, action, target, created_at)
    SELECT id, admin_id, admin_username, action, target, created_at FROM activity_log
`);

const afterCopy = await client.execute("SELECT COUNT(*) as c FROM activity_log_new");
const countAfterCopy = Number(afterCopy.rows[0].c);
console.log(`So dong activity_log_new SAU khi copy: ${countAfterCopy}`);

if (countAfterCopy !== countBefore) {
    console.error("DUNG LAI: so dong khong khop, KHONG xoa bang cu. Kiem tra thu cong.");
    process.exit(1);
}

await client.execute("DROP TABLE activity_log");
await client.execute("ALTER TABLE activity_log_new RENAME TO activity_log");

const after = await client.execute("SELECT COUNT(*) as c FROM activity_log");
const countAfter = Number(after.rows[0].c);
console.log(`So dong activity_log SAU migration (bang da doi ten): ${countAfter}`);

if (countAfter !== countBefore) {
    console.error("CANH BAO NGHIEM TRONG: so dong cuoi cung khong khop ban dau!");
    process.exit(1);
}

console.log("OK: migration thanh cong, admin_id gio la nullable, du lieu nguyen ven.");
