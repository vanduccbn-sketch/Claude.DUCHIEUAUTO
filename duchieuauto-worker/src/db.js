/**
 * Port từ duchieuauto-backend/models/db.js sang Cloudflare Workers (Phase 13).
 *
 * 2 khác biệt so với bản gốc:
 * 1. `@libsql/client` -> `@libsql/client/web` (entry point dành cho edge runtime, Turso khuyến
 *    nghị dùng bản này thay vì bản Node mặc định).
 * 2. Client KHÔNG tạo ở module scope (Workers không đảm bảo `env`/secret có sẵn lúc import module
 *    - chỉ có chắc chắn trong ngữ cảnh 1 request qua tham số `env`). Dùng cache lười (lazy) ở biến
 *    module-level, tạo 1 lần rồi tái sử dụng cho các request sau trong cùng 1 isolate (an toàn vì
 *    giá trị env không đổi giữa các request của cùng 1 lần deploy).
 *
 * KHÔNG chạy CREATE TABLE/migration tự động ở đây như bản gốc (`ready` IIFE) - database Turso
 * dùng chung với bản Render hiện tại đã có đủ schema, không cần khởi tạo lại. Nếu cần tạo CSDL mới
 * từ đầu, chạy tay `duchieuauto-backend/models/db.js` (import qua Node thường) 1 lần trước.
 */
import { createClient } from "@libsql/client/web";

let cachedClient = null;
let cachedUrl = null;

function getClient(env) {
    if (cachedClient && cachedUrl === env.TURSO_DATABASE_URL) return cachedClient;
    cachedClient = createClient({
        url: env.TURSO_DATABASE_URL,
        authToken: env.TURSO_AUTH_TOKEN
    });
    cachedUrl = env.TURSO_DATABASE_URL;
    return cachedClient;
}

function normalizeArgs(params) {
    if (params.length === 1 && typeof params[0] === "object" && params[0] !== null && !Array.isArray(params[0])) {
        return params[0];
    }
    return params;
}

export function getDb(env) {
    const client = getClient(env);

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

    async function logActivity(admin, action, target) {
        await prepare(
            "INSERT INTO activity_log (admin_id, admin_username, action, target) VALUES (@admin_id, @admin_username, @action, @target)"
        ).run({ admin_id: admin.id, admin_username: admin.username, action, target: target || null });
    }

    return { prepare, logActivity };
}
