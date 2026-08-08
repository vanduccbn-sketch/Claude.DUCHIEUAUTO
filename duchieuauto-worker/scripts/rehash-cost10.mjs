/**
 * Chạy 1 lần: hash lại mật khẩu 2 tài khoản admin hiện có sang cost factor 10 (thay vì 12) - bắt
 * buộc phải làm vì bcrypt.compareSync() khi ĐĂNG NHẬP đọc cost ngay trong chuỗi hash cũ để verify,
 * nên dù code mới chỉ hashSync() ở cost 10 cho mật khẩu MỚI, các tài khoản cũ (hash cost 12 có sẵn)
 * vẫn sẽ verify ở cost 12 lúc đăng nhập -> vẫn vượt giới hạn CPU của Workers. Đổi hash cost 12->10
 * cho mật khẩu HIỆN TẠI (giữ nguyên mật khẩu, chỉ đổi cách lưu) là cách duy nhất xử lý dứt điểm.
 * An toàn cho cả 2 backend cùng lúc: bcrypt tự đọc cost từ hash, Render (Node thường, không giới
 * hạn CPU) verify hash cost 10 bình thường không vấn đề gì.
 */
import { createClient } from "@libsql/client";
import bcrypt from "bcryptjs";

const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN
});

const accounts = [
    { username: "admin", password: "Vanduc@123" },
    { username: "ads1", password: "NewAdsPass2026!" }
];

for (const acc of accounts) {
    const res = await client.execute({ sql: "SELECT id, password_hash FROM admins WHERE username = ?", args: [acc.username] });
    const row = res.rows[0];
    if (!row) {
        console.log(`BO QUA: khong tim thay tai khoan ${acc.username}`);
        continue;
    }
    const matches = bcrypt.compareSync(acc.password, row.password_hash);
    if (!matches) {
        console.log(`CANH BAO: mat khau da luu cho ${acc.username} khac voi mat khau du kien - BO QUA, khong doi gi`);
        continue;
    }
    const newHash = bcrypt.hashSync(acc.password, 10);
    await client.execute({ sql: "UPDATE admins SET password_hash = ? WHERE id = ?", args: [newHash, row.id] });
    console.log(`OK: da doi hash cost 12->10 cho ${acc.username} (mat khau giu nguyen)`);
}
