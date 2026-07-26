/**
 * Chuyển từ node:sqlite (file cục bộ) sang Turso (libSQL) - lý do: Render free tier không có ổ
 * đĩa cố định, mỗi lần deploy code mới sẽ xoá sạch file SQLite cục bộ. Turso lưu dữ liệu trên
 * server riêng, không phụ thuộc filesystem của Render, miễn phí và không cần thẻ tín dụng.
 *
 * API @libsql/client là bất đồng bộ (mọi query đều trả về Promise), khác với node:sqlite/
 * better-sqlite3 vốn đồng bộ - nên toàn bộ route/script gọi db đều phải dùng async/await.
 * Để không phải viết lại hoàn toàn cách gọi SQL ở các file khác, "prepare(sql)" bên dưới giả lập
 * lại đúng hình dạng cũ (.get/.all/.run) nhưng trả về Promise thay vì giá trị trực tiếp.
 */
const { createClient } = require("@libsql/client");

const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN
});

function normalizeArgs(params) {
    if (params.length === 1 && typeof params[0] === "object" && params[0] !== null && !Array.isArray(params[0])) {
        return params[0]; // named params (@ten) - libsql nhận thẳng object
    }
    return params; // positional params (?) - libsql nhận mảng
}

function prepare(sql) {
    return {
        get: async (...params) => {
            const res = await client.execute({ sql, args: normalizeArgs(params) });
            return res.rows[0] ? { ...res.rows[0] } : undefined;
        },
        all: async (...params) => {
            const res = await client.execute({ sql, args: normalizeArgs(params) });
            return res.rows.map(r => ({ ...r }));
        },
        run: async (...params) => {
            const res = await client.execute({ sql, args: normalizeArgs(params) });
            return {
                lastInsertRowid: res.lastInsertRowid !== undefined ? Number(res.lastInsertRowid) : undefined,
                changes: res.rowsAffected
            };
        }
    };
}

async function exec(sql) {
    // Turso không hỗ trợ nhiều câu lệnh SQL cách nhau bằng ";" trong 1 lần execute() như
    // node:sqlite's exec() - phải tách từng câu CREATE TABLE riêng rồi gửi tuần tự.
    const statements = sql.split(";").map(s => s.trim()).filter(Boolean);
    for (const stmt of statements) {
        await client.execute(stmt);
    }
}

async function logActivity(admin, action, target) {
    await prepare(
        "INSERT INTO activity_log (admin_id, admin_username, action, target) VALUES (@admin_id, @admin_username, @action, @target)"
    ).run({ admin_id: admin.id, admin_username: admin.username, action, target: target || null });
}

const ready = (async () => {
    await exec(`
        CREATE TABLE IF NOT EXISTS admins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'content',
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
            cta_text TEXT,
            cta_link TEXT,
            published INTEGER NOT NULL DEFAULT 1,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL DEFAULT 'contact',
            name TEXT NOT NULL,
            phone TEXT NOT NULL,
            email TEXT,
            service TEXT,
            preferred_date TEXT,
            preferred_time TEXT,
            message TEXT,
            status TEXT NOT NULL DEFAULT 'new',
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS activity_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            admin_id INTEGER NOT NULL REFERENCES admins(id),
            admin_username TEXT NOT NULL,
            action TEXT NOT NULL,
            target TEXT,
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
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
})();

module.exports = { prepare, exec, logActivity, ready };
