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
            email TEXT,
            reset_token TEXT,
            reset_token_expires TEXT,
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

        -- Phase 7: quản lý sản phẩm qua CMS. Giữ nguyên đúng slug/id hiện có trong
        -- assets/js/catalog-data.js để không đổi URL/đường dẫn ảnh đang dùng.
        CREATE TABLE IF NOT EXISTS categories (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            poster TEXT,
            sort_order INTEGER NOT NULL DEFAULT 0,
            seo_title TEXT,
            seo_meta_description TEXT,
            seo_image TEXT,
            seo_image_caption TEXT,
            seo_intro TEXT,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS category_sections (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category_id TEXT NOT NULL REFERENCES categories(id),
            heading TEXT NOT NULL,
            body TEXT NOT NULL,
            sort_order INTEGER NOT NULL DEFAULT 0
        );

        -- "brands" = cấp thứ 2 sau danh mục. Với 7/8 danh mục đây là thương hiệu thật (JBL,
        -- Gotech...). Riêng "Đồ Bán Tải" đây là NHÓM SẢN PHẨM (Nắp Thùng, Lò Xo...), thương hiệu
        -- thật nằm ở "brand_types" bên dưới - xem ghi chú ở bảng đó.
        -- Khoá chính là (category_id, id) chứ KHÔNG PHẢI id đơn: id chỉ duy nhất TRONG PHẠM VI 1
        -- danh mục, không phải toàn cục (đã xác nhận qua dữ liệu thật trước khi tạo bảng).
        CREATE TABLE IF NOT EXISTS brands (
            category_id TEXT NOT NULL REFERENCES categories(id),
            id TEXT NOT NULL,
            name TEXT NOT NULL,
            logo TEXT,
            hidden INTEGER NOT NULL DEFAULT 0,
            sort_order INTEGER NOT NULL DEFAULT 0,
            PRIMARY KEY (category_id, id)
        );

        -- "brand_types" = cấp thứ 3 (tuỳ chọn). Với danh mục thường: phân loại theo tính năng
        -- trong 1 thương hiệu (VD JBL -> "Loa Ô Tô"/"Loa Sub"/"Âm Ly"). Với "Đồ Bán Tải": đây mới
        -- là THƯƠNG HIỆU THẬT (Aeroklas, TJM...) nằm trong 1 nhóm sản phẩm.
        -- Khoá chính (category_id, brand_id, id): 1 brand id (VD "tjm") có thể lặp lại ở NHIỀU
        -- nhóm sản phẩm khác nhau trong cùng danh mục Đồ Bán Tải (xác nhận qua dữ liệu thật: TJM
        -- xuất hiện ở cả 3 nhóm Lò Xo/Nhíp/Tời Điện với sản phẩm khác nhau) - nếu chỉ khoá theo id
        -- sẽ bị trùng khoá.
        CREATE TABLE IF NOT EXISTS brand_types (
            category_id TEXT NOT NULL,
            brand_id TEXT NOT NULL,
            id TEXT NOT NULL,
            name TEXT NOT NULL,
            logo TEXT,
            sort_order INTEGER NOT NULL DEFAULT 0,
            PRIMARY KEY (category_id, brand_id, id),
            FOREIGN KEY (category_id, brand_id) REFERENCES brands(category_id, id)
        );

        CREATE TABLE IF NOT EXISTS products (
            id TEXT PRIMARY KEY,
            category_id TEXT NOT NULL REFERENCES categories(id),
            brand_id TEXT NOT NULL,
            brand_type_id TEXT,
            name TEXT NOT NULL,
            price TEXT,
            description TEXT,
            detail_content TEXT,
            image TEXT,
            hidden INTEGER NOT NULL DEFAULT 0,
            sort_order INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS product_specs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id TEXT NOT NULL REFERENCES products(id),
            spec_key TEXT NOT NULL,
            spec_value TEXT NOT NULL,
            sort_order INTEGER NOT NULL DEFAULT 0
        );

        -- Đánh giá khách hàng cho sản phẩm - khách tự gửi (public), mặc định "pending" chờ admin
        -- duyệt mới hiện công khai (chống spam/nội dung bậy) - giống mô hình comment cần duyệt.
        CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id TEXT NOT NULL REFERENCES products(id),
            customer_name TEXT NOT NULL,
            rating INTEGER NOT NULL,
            comment TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending',
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        -- FAQ riêng theo từng danh mục (khác FAQ chung ở faq.html) - nội dung thật do Content admin
        -- tự viết qua trang quản trị, không tự sinh - hiện ngay trên trang danh mục kèm schema
        -- FAQPage để tăng khả năng được Google/AI trích dẫn (GEO).
        CREATE TABLE IF NOT EXISTS category_faqs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category_id TEXT NOT NULL REFERENCES categories(id),
            question TEXT NOT NULL,
            answer TEXT NOT NULL,
            sort_order INTEGER NOT NULL DEFAULT 0
        );

        -- 2 khu vực nổi bật ở trang chủ ("Sản Phẩm Chiến Lược", "Giải Mã Công Nghệ") - trước đây
        -- viết cứng trong index.html (đổi phải sửa trực tiếp code), giờ admin chọn sản phẩm thật
        -- + viết thêm vài dòng tiếp thị riêng cho từng khu vực. section: 'strategic' hoặc 'tech' -
        -- badge_text/price_tag chỉ strategic dùng, tag_text/story_title chỉ tech dùng (để cùng 1
        -- bảng thay vì tách 2 bảng gần như giống hệt nhau).
        CREATE TABLE IF NOT EXISTS homepage_highlights (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            section TEXT NOT NULL,
            product_id TEXT NOT NULL REFERENCES products(id),
            badge_text TEXT,
            price_tag TEXT,
            tag_text TEXT,
            story_title TEXT,
            description TEXT,
            sort_order INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
    `);

    // Migration nhẹ: bảng "products" đã có dữ liệu thật trên Turso (242 sản phẩm import từ
    // catalog-data.js) trước khi thêm cột "detail_content" - CREATE TABLE IF NOT EXISTS ở trên
    // không tự thêm cột mới vào bảng đã tồn tại, nên phải kiểm tra và ALTER TABLE thủ công.
    const productColumns = (await prepare("PRAGMA table_info(products)").all()).map(c => c.name);
    if (!productColumns.includes("detail_content")) {
        await exec("ALTER TABLE products ADD COLUMN detail_content TEXT");
    }

    // Migration tương tự cho "admins" - đã có tài khoản thật (admin, ads1) trước khi thêm email +
    // cơ chế quên mật khẩu qua token.
    const adminColumnsCheck = (await prepare("PRAGMA table_info(admins)").all()).map(c => c.name);
    if (!adminColumnsCheck.includes("email")) {
        await exec("ALTER TABLE admins ADD COLUMN email TEXT");
    }
    if (!adminColumnsCheck.includes("reset_token")) {
        await exec("ALTER TABLE admins ADD COLUMN reset_token TEXT");
    }
    if (!adminColumnsCheck.includes("reset_token_expires")) {
        await exec("ALTER TABLE admins ADD COLUMN reset_token_expires TEXT");
    }

    // Migration tương tự cho "posts" - thêm lịch đăng bài (chọn thời điểm tương lai, hệ thống tự
    // chuyển draft -> published đúng lúc thay vì phải đăng nhập đúng giờ để bấm tay).
    const postColumnsCheck = (await prepare("PRAGMA table_info(posts)").all()).map(c => c.name);
    if (!postColumnsCheck.includes("publish_at")) {
        await exec("ALTER TABLE posts ADD COLUMN publish_at TEXT");
    }
})();

module.exports = { prepare, exec, logActivity, ready };
