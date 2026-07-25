/**
 * Tạo tài khoản admin đầu tiên. Chạy 1 lần sau khi cài đặt:
 *   node scripts/seed-admin.js <username> <password> [role]
 * role: content | ads | super_admin (mặc định: super_admin - dùng cho tài khoản chủ đầu tiên)
 */
require("dotenv").config();
const bcrypt = require("bcryptjs");
const db = require("../models/db");

const [, , username, password, roleArg] = process.argv;
const VALID_ROLES = ["content", "ads", "super_admin"];
const role = roleArg || "super_admin";

if (!username || !password) {
    console.error("Cách dùng: node scripts/seed-admin.js <username> <password> [content|ads|super_admin]");
    process.exit(1);
}

if (password.length < 8) {
    console.error("Mật khẩu nên có ít nhất 8 ký tự.");
    process.exit(1);
}

if (!VALID_ROLES.includes(role)) {
    console.error(`Vai trò không hợp lệ: "${role}". Chỉ chấp nhận: ${VALID_ROLES.join(", ")}`);
    process.exit(1);
}

const existing = db.prepare("SELECT id FROM admins WHERE username = ?").get(username);
if (existing) {
    console.error(`Tài khoản "${username}" đã tồn tại.`);
    process.exit(1);
}

const hash = bcrypt.hashSync(password, 12);
db.prepare("INSERT INTO admins (username, password_hash, role) VALUES (?, ?, ?)").run(username, hash, role);

console.log(`Đã tạo tài khoản admin "${username}" (vai trò: ${role}) thành công.`);
