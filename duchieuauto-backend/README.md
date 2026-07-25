# Đức Hiếu Auto — Backend CMS

Node.js + Express + SQLite (module `node:sqlite` có sẵn trong Node.js, không phải gói ngoài).
Xem quyết định kiến trúc đầy đủ tại `../ke-hoach-nhiem-vu-cms-bao-mat-2026-07-25.md` (Phase 0-3).

**Yêu cầu Node.js >= 22.5.0** (bản có `node:sqlite`). Toàn bộ dependency đều là JS thuần, **không
gói nào cần biên dịch native** (không cần cài Python/Visual Studio Build Tools) - cố tình chọn
`node:sqlite` thay vì `better-sqlite3` và `bcryptjs` thay vì `bcrypt` vì lý do này, sau khi gặp lỗi
build thật trên Windows lúc test (xem mục "Đã test thật" bên dưới).

**Đã test thật** (2026-07-25, Node v24.18.0 trên Windows): `npm install` sạch (0 vulnerabilities),
chạy server, gọi đủ API qua curl - health check, đăng nhập đúng/sai, CRUD bài viết (kèm chặn
XSS), phân quyền role (Ads admin bị chặn 403 khi tạo bài viết nhưng vẫn xem được liên hệ), form
liên hệ/đặt lịch. Phát hiện và sửa 3 lỗi thật trong lúc test (xem lịch sử trong file kế hoạch):
đổi `better-sqlite3` → `node:sqlite`, đổi `bcrypt` → `bcryptjs`, sửa route `PUT /api/posts/:id`
(node:sqlite không cho object binding có field thừa không khớp tham số SQL).

**Lưu ý khi tự test bằng curl trên Windows (Git Bash):** `curl -d '{"title":"chữ có dấu"}'` với
tiếng Việt gõ trực tiếp trong đối số dòng lệnh có thể bị corrupt encoding (lỗi của curl.exe trên
Windows khi xử lý đối số non-ASCII, không phải lỗi API). Cách test an toàn: ghi JSON ra file rồi
gửi bằng `curl --data-binary @file.json`. Request thật từ trình duyệt (fetch/JSON.stringify) luôn
gửi đúng UTF-8 trong request body nên không gặp vấn đề này.

## Mô hình quyền (2 admin: Content + Ads)

Bảng `admins` có cột `role`: `content` | `ads` | `super_admin`. Vai trò được nhúng vào JWT khi
đăng nhập, middleware `requireRole(...roles)` (`middleware/auth.js`) kiểm tra ở từng route:
- **Content admin**: được tạo/sửa/xoá bài viết (`/api/posts` các route ghi).
- **Ads admin**: (Phase 4) sẽ quản banner/cấu hình tracking - chưa có route API riêng ở Phase 3,
  chỉ mới có bảng `banners`/`settings` trong DB, API cụ thể làm cùng lúc với trang quản trị.
- **Cả 2 vai trò** đều xem được `/api/contacts` (liên hệ/đặt lịch) - Ads admin cần số liệu này để
  đo hiệu quả quảng cáo.
- Mọi thao tác ghi (tạo/sửa/xoá bài viết, đổi trạng thái liên hệ) đều được ghi vào bảng
  `activity_log` qua `db.logActivity(admin, action, target)`.

## Cấu trúc thư mục

```
duchieuauto-backend/
├── server.js           # entry point
├── routes/
│   ├── auth.js          # POST /api/auth/login (trả JWT kèm role)
│   ├── posts.js         # CRUD bài viết (ghi: chỉ content/super_admin), sanitize-html chống XSS
│   └── contacts.js      # nhận form liên hệ/đặt lịch (public) + xem danh sách (mọi admin)
├── middleware/
│   └── auth.js          # xác thực JWT + phân quyền (requireRole, requireAdmin)
├── models/
│   └── db.js             # khởi tạo node:sqlite + schema (admins+role, posts, contacts,
│                          # activity_log, settings, banners) + helper logActivity() + migration cột role
├── admin/
│   └── README.md         # placeholder cho Phase 4 (trang quản trị)
├── scripts/
│   └── seed-admin.js     # tạo tài khoản admin đầu tiên (hỗ trợ chọn role)
├── .env.example
└── package.json
```

## Cài đặt local

```bash
cd duchieuauto-backend
npm install
cp .env.example .env
# Mở .env, đổi JWT_SECRET sang chuỗi ngẫu nhiên dài, đổi FRONTEND_ORIGIN nếu cần

node scripts/seed-admin.js admin "mat-khau-du-manh-8-ky-tu-tro-len" super_admin
# Sau này tạo thêm tài khoản Content/Ads: node scripts/seed-admin.js content1 "mat-khau..." content

npm run dev
# Server chạy tại http://localhost:4000
```

Test nhanh:
```bash
curl http://localhost:4000/api/health
curl -X POST http://localhost:4000/api/auth/login -H "Content-Type: application/json" -d "{\"username\":\"admin\",\"password\":\"mat-khau...\"}"
```

## Deploy lên Render.com (free tier, không cần thẻ tín dụng)

1. Tạo repo Git riêng cho `duchieuauto-backend/` (hoặc dùng monorepo, trỏ Render vào đúng thư mục con này).
2. Đăng ký tài khoản tại [render.com](https://render.com) bằng GitHub.
3. **New +** → **Web Service** → chọn repo backend.
4. Cấu hình:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment Variables:** thêm `JWT_SECRET`, `FRONTEND_ORIGIN` (domain GitHub Pages), `DB_PATH=./data/duchieuauto.db`
5. **Lưu ý về SQLite trên Render free tier:** ổ đĩa free tier không persistent qua mỗi lần deploy lại (ephemeral filesystem) — dữ liệu SQLite có thể bị mất khi Render khởi động lại instance. Với dữ liệu quan trọng (bài viết, liên hệ khách hàng), nên:
   - Dùng **Render Disks** (persistent disk, có phí nhỏ) để giữ file `.db`, hoặc
   - Backup định kỳ file `.db` về nơi khác (Phase 6 - "Backup định kỳ SQLite"), hoặc
   - Cân nhắc chuyển sang Render PostgreSQL free tier nếu dữ liệu quan trọng hơn chi phí chuyển đổi.
6. Sau khi deploy, chạy `seed-admin.js` qua Render Shell (tab "Shell" trong dashboard) để tạo tài khoản admin đầu tiên trên server thật.
7. Cập nhật `FRONTEND_ORIGIN` đúng domain GitHub Pages đang publish (`https://vanduccbn-sketch.github.io`) để CORS hoạt động.

## Khi mua hosting thật (Phase 8)

Không cần viết lại — chỉ cần deploy đúng thư mục `duchieuauto-backend/` này lên hosting mới
(VPS/shared hosting hỗ trợ Node.js), đổi `DB_PATH`/biến môi trường cho phù hợp. Đây chính là lý
do chọn kiến trúc Node.js + SQLite portable thay vì phụ thuộc nền tảng CMS khác.
