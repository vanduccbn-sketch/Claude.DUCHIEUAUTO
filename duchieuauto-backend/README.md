# Đức Hiếu Auto — Backend CMS

Node.js + Express + **Turso (libSQL)** - database SQLite chạy trên mạng (không phải file cục bộ).
Xem quyết định kiến trúc đầy đủ tại `../ke-hoach-nhiem-vu-cms-bao-mat-2026-07-25.md` (Phase 0-5).

**Vì sao Turso thay vì file SQLite cục bộ:** ban đầu dùng `node:sqlite` (module tích hợp sẵn
Node.js, không cần biên dịch native) với file `.db` cục bộ. Khi chuẩn bị deploy lên Render.com mới
phát hiện free tier của Render **không có persistent disk** - mỗi lần deploy code mới sẽ xoá sạch
file SQLite. Turso lưu dữ liệu trên server riêng (miễn phí, không cần thẻ tín dụng), tách khỏi
filesystem của hosting nên deploy lại bao nhiêu lần cũng không mất dữ liệu. Toàn bộ route/script
gọi database đã chuyển sang `async/await` để phù hợp API bất đồng bộ của `@libsql/client`.

Các lựa chọn JS thuần khác vẫn giữ nguyên (không gói nào cần biên dịch native): `bcryptjs` thay vì
`bcrypt`, tránh lỗi build từng gặp trên Windows lúc test.

**Đã test thật:**
- **2026-07-25** (Node v24.18.0, Windows, lúc còn dùng `node:sqlite`): `npm install` sạch (0
  vulnerabilities), gọi đủ API qua curl - health check, đăng nhập đúng/sai, CRUD bài viết (kèm
  chặn XSS), phân quyền role, form liên hệ/đặt lịch. Sửa 3 lỗi thật lúc đó: đổi `better-sqlite3` →
  `node:sqlite`, đổi `bcrypt` → `bcryptjs`, sửa lỗi object binding thừa field trong `PUT /api/posts/:id`.
- **2026-07-26** (migrate sang Turso): chuyển toàn bộ `models/db.js` + 6 file route + 2 script sang
  async/await, test lại đầy đủ 12 kịch bản qua curl (đăng nhập, CRUD bài viết/banner, phân quyền,
  settings, activity log) - tất cả PASS, hành vi giống hệt trước. Xác nhận thêm bằng screenshot
  Chrome headless (tự đăng nhập bằng token thật, chụp 5 trang admin + trang Tin Tức công khai) -
  toàn bộ hiển thị đúng, số liệu khớp Turso.

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
├── server.js           # entry point, chờ db.ready trước khi app.listen
├── routes/
│   ├── auth.js          # POST /api/auth/login (trả JWT kèm role)
│   ├── posts.js         # CRUD bài viết (ghi: chỉ content/super_admin), sanitize-html chống XSS
│   ├── contacts.js      # nhận form liên hệ/đặt lịch (public) + xem danh sách (mọi admin)
│   ├── settings.js      # cấu hình chung (GA/Pixel/Search Console/social) - chỉ ads/super_admin ghi
│   ├── banners.js       # CRUD banner/slider - chỉ ads/super_admin
│   ├── activity.js      # xem nhật ký thao tác - chỉ super_admin
│   └── uploads.js       # upload ảnh (multer) - chỉ content/super_admin
├── middleware/
│   └── auth.js          # xác thực JWT + phân quyền (requireRole, requireAdmin)
├── models/
│   └── db.js             # tạo Turso client (@libsql/client) + shim prepare().get/all/run (async)
│                          # tương thích ngược với cách gọi cũ + schema (admins+role, posts,
│                          # contacts, activity_log, settings, banners) + helper logActivity()
├── admin/                # trang quản trị tĩnh (login, dashboard, bài viết, liên hệ, banner,
│                          # cấu hình, lịch sử) - phục vụ qua express.static, cùng domain API
├── scripts/
│   ├── seed-admin.js            # tạo tài khoản admin (hỗ trợ chọn role)
│   └── migrate-static-posts.js  # migrate 4 bài viết tĩnh cũ (Phase 1) vào database, chạy 1 lần
├── .env.example
└── package.json
```

## Cài đặt local

```bash
cd duchieuauto-backend
npm install
cp .env.example .env
# Mở .env, đổi JWT_SECRET sang chuỗi ngẫu nhiên dài, đổi FRONTEND_ORIGIN nếu cần
# Điền TURSO_DATABASE_URL và TURSO_AUTH_TOKEN (lấy từ app.turso.tech - tạo 1 database free,
# không cần thẻ tín dụng)

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

Vì dữ liệu đã nằm trên Turso (không phụ thuộc filesystem của Render), deploy lại code bao nhiêu
lần cũng không mất dữ liệu - không cần Render Disks hay backup thủ công nữa.

1. Đăng nhập [render.com](https://render.com) (tài khoản đã có).
2. **New +** → **Web Service** → kết nối GitHub → chọn repo `Claude.DUCHIEUAUTO`.
3. Cấu hình:
   - **Root Directory:** `duchieuauto-backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment Variables:** `JWT_SECRET`, `FRONTEND_ORIGIN` (domain GitHub Pages thật), `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` (copy nguyên giá trị đang có trong `.env` local)
4. Deploy xong, gọi thử `<địa-chỉ-render>/api/health` để xác nhận chạy được.
5. **Không cần chạy lại `seed-admin.js`** - tài khoản admin/bài viết đã có sẵn trên Turso từ lúc test local, dùng chung luôn cho production. Cân nhắc đổi mật khẩu tài khoản test (`admin`/`TestPass2026!`) trước khi dùng thật lâu dài.
6. Cập nhật `assets/js/api-config.js` ở frontend (`PRODUCTION_API_URL`) thành đúng domain Render vừa deploy.

## Khi mua hosting thật (Phase 8)

Không cần viết lại — chỉ cần deploy đúng thư mục `duchieuauto-backend/` này lên hosting mới
(VPS/shared hosting hỗ trợ Node.js), giữ nguyên biến môi trường Turso. Đây chính là lý do chọn
kiến trúc Node.js + Turso portable thay vì phụ thuộc nền tảng CMS khác.
