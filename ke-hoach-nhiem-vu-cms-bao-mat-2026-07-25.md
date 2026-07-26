# Kế hoạch nhiệm vụ — CMS, Bảo mật & Hoàn thiện Website Đức Hiếu Auto

**Ngày tạo:** 2026-07-25
**Mục đích:** File nhiệm vụ tổng để làm dần từng phase. Mở file này mỗi khi bắt đầu buổi làm việc mới, tick `[x]` các việc đã xong, ghi chú kết quả/vướng mắc ngay dưới mục đó.

---

## Quyết định kiến trúc (đã chốt cùng user ngày 2026-07-25)

- **Hiện trạng:** site tĩnh (HTML/CSS/JS), không build tool, deploy qua GitHub Pages (`origin` → `github.com/vanduccbn-sketch/Claude.DUCHIEUAUTO`). Dữ liệu sản phẩm nằm cứng trong `assets/js/catalog-data.js`. Chưa có server/database/CMS.
- **Định hướng:** dùng GitHub Pages **tạm thời**, sau này mua hosting thật → cần kiến trúc **portable**, không phải viết lại khi đổi hosting.
- **Chọn:** Backend riêng — **Node.js + Express + SQLite** (file DB, không cần cài server DB riêng, nhẹ, dễ nâng cấp lên PostgreSQL/MySQL sau).
  - Deploy backend **miễn phí tạm thời** trên Render.com (hoặc Railway) — không cần thẻ tín dụng, không cần hosting trả phí ngay.
  - Frontend **giữ nguyên trên GitHub Pages** như hiện tại, gọi API backend qua `fetch()` (CORS mở cho domain GitHub Pages) cho phần nội dung động (blog, form liên hệ/đặt lịch).
  - **Khi mua hosting thật:** chỉ cần deploy lại đúng code Node.js đó lên hosting mới (VPS/shared hosting hỗ trợ Node, hoặc gộp luôn cả frontend vào cùng server) — không phải làm lại CMS từ đầu. Đây là lý do chọn hướng này thay vì Decap CMS (phụ thuộc OAuth phức tạp) hoặc WordPress (phải dựng lại toàn bộ theme).
- **Phạm vi:** **KHÔNG** làm giỏ hàng/thanh toán online (VNPay/Momo) ở giai đoạn này — giữ mô hình hiện tại (khách xem sản phẩm → liên hệ Zalo/hotline). Có thể bổ sung sau nếu cần, ghi ở Phase 8 (tương lai, không làm ngay).
- **[MỚI 2026-07-25] Mô hình quản trị — 2 admin:** sẽ có **Content admin** (viết bài, chỉnh nội dung/bố cục trang) và **Ads admin** (chạy quảng cáo, quản lý banner/chiến dịch, mã tracking). → CMS phải **phân quyền theo vai trò (role-based)** ngay từ khi thiết kế database ở Phase 3, không làm 1 admin dùng chung như bản đầu. Chi tiết bổ sung nằm trong Phase 3/4/5/6 bên dưới, đánh dấu `[MỚI]`.

---

## Cập nhật 2026-07-25 (lần 2) — chỉ bổ sung, không xoá/sửa mục cũ

File nhiệm vụ này **đang chạy**, nên lần cập nhật này giữ nguyên toàn bộ nội dung gốc. Mọi dòng mới thêm được đánh dấu `[MỚI]` ngay trong phase liên quan để dễ nhận ra. Lý do cập nhật:

1. Xác nhận sẽ có **2 admin** (content + ads) → cần CMS phân quyền theo vai trò, thêm vài bảng dữ liệu và giao diện admin tương ứng.
2. Rà soát lại phát hiện 5 mục bị sót khi tóm tắt danh sách A-E ban đầu: input validation chống XSS/SQL injection, chặn `/admin` khỏi robots.txt, watermark ảnh sản phẩm, schema.org, và performance + Google Analytics/Search Console. Cả 5 mục này giờ được thêm vào đúng phase phù hợp bên dưới.

---

## PHASE 0 — Chuẩn bị kiến trúc
- [x] Tạo repo/thư mục backend riêng (`duchieuauto-backend/`) — Node.js + Express + SQLite (`better-sqlite3`)
- [x] Khởi tạo project: `package.json`, cấu trúc thư mục (`routes/`, `models/`, `middleware/`, `admin/`)
- [x] Đăng ký tài khoản Render.com (hoặc Railway) để deploy free tier — **đã đăng ký xong** bằng email `vanduc.cbn@gmail.com` (2026-07-25). Chưa deploy thật (chờ hoàn thiện Phase 3 trước theo đúng thứ tự kế hoạch)
- [x] Cấu hình CORS cho phép domain GitHub Pages hiện tại gọi API — đã set qua biến môi trường `FRONTEND_ORIGIN` trong `server.js`

**PHASE 0: HOÀN THÀNH 100%**

## PHASE 1 — Hoàn thiện bố cục còn thiếu (làm ngay trên site tĩnh, không phụ thuộc backend)
- [x] Trang **Tin tức/Blog** (dạng tĩnh — `tin-tuc.html` + `bai-viet-chi-tiet.html`, dữ liệu ở `assets/js/blog-data.js`, 4 bài viết thật liên quan đúng dịch vụ đang bán: phim cách nhiệt, loa ô tô, PPF, đèn bi LED)
- [x] Trang/form **Đặt lịch hẹn** (`dat-lich-hen.html`) — gửi qua Formspree (dùng chung endpoint với form liên hệ, phân biệt bằng `_subject`), có validate ngày (không cho chọn ngày quá khứ), gửi AJAX hiện thông báo thành công ngay trên trang
- [x] Trang **Chính sách** (`chinh-sach.html`) — bảo hành, đổi trả, bảo mật thông tin khách hàng
- [x] Trang **FAQ** (`faq.html`) — 7 câu hỏi dạng accordion
- [x] Trang **404** tuỳ chỉnh (`404.html`)
- [x] `sitemap.xml` + `robots.txt`

## PHASE 2 — Bảo mật & ẩn thông tin cho phần tĩnh hiện có (làm ngay, không cần chờ backend)
- [ ] Minify `assets/js/*.js`, `assets/css/*.css` trước khi deploy bản production — cần chọn công cụ build (chưa làm, xem ghi chú bên dưới)
- [x] Rà soát xoá `console.log`, comment nội bộ nhạy cảm trong JS/HTML hiện có — **kết quả: sạch, không có `console.log` nào trong toàn bộ `assets/js/*.js` và các trang HTML**
- [ ] Chống hotlink ảnh sản phẩm (nếu hosting cho phép chỉnh — ghi chú: GitHub Pages hạn chế header tuỳ chỉnh, có thể cần Cloudflare đứng trước)
- [ ] **[MỚI]** Watermark logo nhỏ lên ảnh sản phẩm (chống đối thủ lấy ảnh) — làm hàng loạt bằng script, áp dụng cho ảnh mới upload qua CMS ở Phase 4
- [ ] reCAPTCHA cho form liên hệ/đặt lịch (chống spam bot) — cần user tự tạo site key tại Google reCAPTCHA trước
- [x] Kiểm tra không có API key/secret nào lộ trong code client-side hiện tại — **kết quả: sạch**, grep toàn bộ `*.html/*.js/*.css` tìm `api-key/secret/password/token` chỉ khớp các biến/field name phía backend (server-side, không lộ ra client), Formspree endpoint ID không phải secret (thiết kế công khai theo đúng cơ chế Formspree)
- [ ] Đánh giá đưa site qua **Cloudflare** (miễn phí) để có HTTPS chuẩn, security headers, chống DDoS cơ bản — bước này gỡ luôn hạn chế của GitHub Pages ở trên

## PHASE 3 — Xây Backend CMS (Node.js + Express + SQLite)
- [x] Model dữ liệu: `posts` (bài viết), `admins` (tài khoản quản trị), `contacts` (form liên hệ/đặt lịch gửi về) — `duchieuauto-backend/models/db.js`
- [x] **[MỚI]** Thêm cột `role` vào bảng `admins` đã tạo (`content` / `ads` / `super_admin`) — có migration tự động (`ALTER TABLE` nếu cột chưa tồn tại, an toàn cho DB cũ đã có sẵn), `scripts/seed-admin.js` nhận thêm tham số role khi tạo tài khoản
- [x] **[MỚI]** Thêm bảng `activity_log` (admin_id, admin_username, action, target, created_at) — ghi ai sửa gì lúc nào; đã nối vào cả 4 thao tác ghi thật (tạo/sửa/xoá bài viết, đổi trạng thái liên hệ) qua helper `db.logActivity()`, không chỉ tạo bảng suông
- [x] **[MỚI]** Thêm bảng `settings` (key/value: mã Google Analytics, Facebook Pixel, social links, SEO mặc định toàn site) — mới có schema trong `db.js`; route API (`/api/settings`) chưa viết, để làm cùng lúc với trang quản trị ở Phase 4 (đúng phạm vi Phase 3 chỉ yêu cầu thêm bảng)
- [x] **[MỚI]** Thêm bảng `banners` (title, image, link, sort_order, start_date, end_date) — mới có schema trong `db.js`; route API (`/api/banners`) chưa viết, để làm cùng lúc với trang quản trị ở Phase 4 (đúng phạm vi Phase 3 chỉ yêu cầu thêm bảng)
- [x] API `auth`: đăng nhập admin (hash password bằng bcryptjs, trả JWT) — `routes/auth.js`, kèm chặn brute-force đơn giản theo IP (khoá 15 phút sau 5 lần sai)
- [x] **[MỚI]** Sửa `routes/auth.js`: thêm `role` vào payload JWT khi đăng nhập (và trả cả trong response body) để middleware phân quyền + frontend admin dùng được
- [x] API CRUD bài viết: `GET/POST/PUT/DELETE /api/posts` — `routes/posts.js`, tự tạo slug từ title
- [x] **[MỚI]** Sanitize HTML trong `routes/posts.js` bằng `sanitize-html` (whitelist đúng thẻ/thuộc tính mà trình soạn thảo rich-text sẽ tạo ra: p/h2-h4/list/link/ảnh..., ép `rel=noopener noreferrer` cho link) trước khi lưu DB - chặn stored-XSS khi hiển thị lại cho khách xem blog
- [x] API nhận form liên hệ/đặt lịch: `POST /api/contacts` — `routes/contacts.js`, có thêm `GET /api/contacts` + `PUT /api/contacts/:id/status` cho admin
- [x] Middleware xác thực JWT cho các route cần quyền admin — `middleware/auth.js`
- [x] **[MỚI]** Nâng `middleware/auth.js` thành `requireRole(...roles)`: `/api/posts` route ghi giờ chỉ nhận `content`/`super_admin` (Ads admin bị chặn 403); `/api/contacts` giữ nguyên mọi admin đều xem được (`requireRole()` không tham số); `requireAdmin` cũ vẫn giữ lại (= `requireRole()`) để tương thích ngược
- [x] Test API qua curl — **đã làm xong** (2026-07-25, Node v24.18.0 cài trên máy user): `npm install` sạch 0 vulnerabilities, test đủ health check/đăng nhập đúng-sai/CRUD bài viết/chặn XSS/phân quyền role (Ads admin bị 403 khi tạo bài viết, vẫn xem được liên hệ)/form liên hệ. Phát hiện và sửa 3 lỗi thật trong lúc test — xem chi tiết ở ghi chú "2026-07-25 (lần 4)" bên dưới
- [x] **Đã giải quyết vấn đề lưu trữ dữ liệu:** migrate toàn bộ backend từ `node:sqlite` sang **Turso (libSQL)** — database mạng miễn phí, không cần thẻ tín dụng, dữ liệu độc lập với filesystem của Render nên deploy lại không mất dữ liệu. Đổi `models/db.js` + 6 file route + 2 script sang async/await (API `@libsql/client` là bất đồng bộ). Test đầy đủ 12 kịch bản qua curl + xác nhận bằng screenshot Chrome headless (tự đăng nhập bằng token thật, chụp 5 trang admin + trang Tin Tức công khai) - tất cả khớp dữ liệu Turso, hành vi giống hệt bản cũ. Code đã đẩy lên GitHub (commit `4466b12`).
- [x] **Deploy backend lên Render.com — HOÀN THÀNH.** User tự tạo Web Service + xác thực GitHub OAuth trên Render dashboard, deploy thành công tại `https://claude-duchieuauto.onrender.com`. Xác nhận qua curl: `/api/health`, `/api/posts`, `/api/auth/login`, `/api/products/catalog` đều trả đúng dữ liệu thật từ Turso trên production. `assets/js/api-config.js` (`PRODUCTION_API_URL`) đã cập nhật đúng URL này và đẩy riêng lên GitHub.
- [x] **[MỚI] Giải quyết vấn đề lưu trữ ảnh upload** — phát hiện trong lúc làm Phase 7: ảnh upload qua `/api/uploads` (bìa bài viết, banner, ảnh sản phẩm) lưu trên ổ đĩa Render, gặp đúng vấn đề ephemeral disk như SQLite trước đây. Đã đổi sang **Cloudinary** (free tier, không cần thẻ) — `routes/uploads.js` viết lại dùng `multer.memoryStorage()` + `cloudinary.uploader.upload_stream()`, trả về URL CDN cố định thay vì `/uploads/...`. Test upload ảnh thật thành công, ảnh truy cập công khai qua CDN bình thường.

**PHASE 3: HOÀN THÀNH TOÀN BỘ — code, test local, migrate Turso, VÀ deploy thật lên Render. Vấn đề lưu trữ ảnh upload cũng đã giải quyết bằng Cloudinary.**

## PHASE 4 — Trang Admin (đăng nhập & quản trị nội dung)
- [x] Trang đăng nhập admin (`admin/login.html`) — riêng biệt, không lộ ra menu công khai (nằm ở domain backend riêng, không phải GitHub Pages), có `<meta name="robots" content="noindex, nofollow">`
- [x] Dashboard admin (`admin/dashboard.html`): thống kê nhanh (tổng bài viết/đã đăng/nháp, tổng liên hệ/chưa xử lý), link nhanh sang 2 trang quản lý
- [x] Form thêm/sửa bài viết (`admin/bai-viet-form.html`) — dùng **Quill** (rich text editor qua CDN, không cần build tool), có upload ảnh bìa + upload ảnh chèn trong nội dung (thay nút ảnh mặc định của Quill để gọi API upload thay vì nhúng base64)
- [x] Trang quản lý liên hệ (`admin/lien-he.html`) — xem danh sách, đổi trạng thái Mới/Đã liên hệ/Hoàn tất
- [x] Giới hạn số lần đăng nhập sai (chống brute-force) — đã làm từ Phase 3 (`routes/auth.js`)
- [x] **[MỚI]** Menu admin hiện theo `role`: `renderAdminNav()` trong `admin/assets/admin.js` ẩn mục "Bài Viết" nếu không phải content/super_admin; trang `bai-viet.html`/`bai-viet-form.html` tự chặn (redirect) nếu Ads admin cố truy cập trực tiếp bằng URL
- [x] **[MỚI]** Rich-text editor đủ: upload ảnh trực tiếp, heading/bold/italic/underline/list, chèn link, nút **Xem Trước** (mở tab mới, chưa lưu), trạng thái Draft/Published (`publishedToggle`)
- [x] **[MỚI]** Trang quản lý Banner/Slider (`admin/banner.html`) — danh sách + form thêm/sửa/xoá trên cùng 1 trang, upload ảnh qua `/api/uploads`, đặt ngày bắt đầu/kết thúc hiển thị. API `routes/banners.js` (GET public lọc theo ngày, GET/POST/PUT/DELETE admin chỉ ads/super_admin)
- [x] **[MỚI]** Trang Cấu hình chung (`admin/cau-hinh.html`) — Google Analytics/Facebook Pixel/Search Console/social links/SEO mặc định. API `routes/settings.js` (GET public để trang công khai đọc mã tracking, PUT chỉ ads/super_admin)
- [x] **[MỚI]** Trang Lịch sử chỉnh sửa (`admin/lich-su.html`, chỉ super_admin xem) — API `routes/activity.js` (`GET /api/activity`, giới hạn `super_admin`)
- [x] **[MỚI]** robots.txt riêng cho domain admin: `server.js` tự trả `Disallow: /` cho toàn bộ domain backend (route `/robots.txt`) — chặn cả API lẫn `/admin` khỏi index, đơn giản hơn sửa robots.txt của GitHub Pages vì admin không nằm chung domain với site chính

**PHASE 4: HOÀN THÀNH TOÀN BỘ, kể cả 3 trang Ads admin (Banner, Cấu hình, Activity log) — làm xong 2026-07-26, test đầy đủ qua curl (phân quyền role, CRUD banner, settings, activity log super_admin-only).**

## PHASE 5 — Nối Blog động vào Frontend
- [x] Chuyển trang Tin tức từ dữ liệu tĩnh (Phase 1) sang gọi API `/api/posts` — `assets/js/api-config.js` (mới, tự nhận diện localhost/production) + viết lại `assets/js/blog-render.js` gọi API thật, giữ nguyên tên hàm `renderBlogGrid`/`renderBlogDetail`. Đã migrate 4 bài viết tĩnh cũ vào database thật (`scripts/migrate-static-posts.js`), không mất nội dung.
- [x] SEO cho từng bài viết: meta title/description riêng, slug, Open Graph khi share Facebook/Zalo — cập nhật động qua JS trong `renderBlogDetail()`. **Lưu ý hạn chế:** vì trang render phía client, bot chia sẻ mạng xã hội (không chạy JS) sẽ chỉ thấy meta mặc định trong HTML gốc, chỉ Google (có chạy JS khi index) thấy được bản cập nhật. Cần server-render nếu muốn preview đẹp khi share Zalo/Facebook — ngoài phạm vi hiện tại.
- [x] Loading state/skeleton khi chờ API — CSS skeleton (`pages.css`) cho cả lưới bài viết và trang chi tiết, có nút "Thử lại" khi lỗi.
- [x] **[MỚI]** Schema.org: `Product` (JSON-LD động trong `catalog-render.js` → `injectProductSchema()`, có `Offer`/giá nếu parse được số) cho trang chi tiết sản phẩm; `AutoRepair`/`LocalBusiness` (JSON-LD tĩnh) cho `index.html`. Tiện thể sửa luôn lỗi meta description cũ ghi nhầm "TP.HCM" thay vì Buôn Ma Thuột.
- [x] **[MỚI]** Performance: rà soát lazy-load ảnh toàn site (bổ sung 4 chỗ thiếu, giữ nguyên ảnh hero/LCP không lazy theo đúng best practice), **nén 51 ảnh sản phẩm nặng nhất bằng PowerShell + System.Drawing** (không cần cài thêm phần mềm) — giảm `assets/images` từ 59MB xuống 33MB. *Sự cố trong lúc nén:* 5 ảnh nhóm `zestech-box-dx*` bị lỗi decode (GDI+ không đọc được) → tự động khôi phục ngay từ Git, không mất dữ liệu. Nguyên tại: 5 file này thực chất là **ảnh WebP bị đặt nhầm đuôi `.jpg`** (lỗi dữ liệu có từ trước, không liên quan việc nén) — vẫn hiển thị bình thường trên web nhờ trình duyệt tự nhận diện định dạng thật, nhưng nên đổi tên đúng đuôi `.webp` khi có dịp (chưa làm, ghi chú lại đây). Cache tài nguyên tĩnh: GitHub Pages đã tự có cache header mặc định hợp lý cho static site, không cần cấu hình thêm.
- [x] **[MỚI]** Gắn Google Analytics + Facebook Pixel + Google Search Console — `assets/js/site-settings.js` (mới) đọc `/api/settings`, tự chèn script GA/Pixel/thẻ xác minh Search Console vào mọi trang công khai (đã nhúng vào cả 11 trang: index, san-pham, san-pham-chi-tiet, category-chi-tiet, brand-san-pham, dat-lich-hen, chinh-sach, faq, tin-tuc, bai-viet-chi-tiet, 404). Test qua DevTools Network: request `gtag/js?id=G-TEST123` trả về 200 - cơ chế hoạt động đúng. **Cần làm trước khi lên thật:** Ads admin đăng nhập `cau-hinh.html`, xoá `G-TEST123` (mã test), nhập mã Google Analytics/Pixel thật.

**PHASE 5: HOÀN THÀNH TOÀN BỘ, test qua trình duyệt thật (Chrome), user xác nhận "Tốt cả". CORS backend cũng đã sửa để luôn cho phép localhost/127.0.0.1 test cùng lúc vẫn giữ giới hạn domain thật cho production.**

## PHASE 6 — Bảo mật nâng cao cho Backend
- [x] `helmet` middleware — bật đủ security headers (CSP, X-Frame-Options=SAMEORIGIN, HSTS, X-Content-Type-Options...). CSP tuỳ chỉnh riêng cho `/admin` (script/style cho phép `'unsafe-inline'` + `cdn.jsdelivr.net` vì trang admin viết JS/CSS inline, không dùng nonce/hash - đánh đổi đã ghi rõ trong code). Test qua Chrome: trang Quill editor (phụ thuộc CDN nhiều nhất) vẫn render/hoạt động đầy đủ.
- [x] Rate limiting toàn API (`express-rate-limit`) — giới hạn chung 300 request/15 phút/IP cho `/api/*`, riêng `/api/auth/login` chặt hơn (20/15 phút) làm lớp bổ sung cho cơ chế khoá 5-lần-sai đã có sẵn.
- [x] CSRF protection — **không cần**, đã ghi chú rõ lý do trong `middleware/auth.js`: xác thực dùng JWT qua header `Authorization`, không dùng cookie/session nên trình duyệt không tự động gắn token khi request từ site lạ (đặc điểm cốt lõi gây ra CSRF).
- [x] Backup định kỳ — **đổi phạm vi vì đã chuyển sang Turso** (không còn file SQLite cục bộ để backup): viết `scripts/backup-turso.js`, export toàn bộ 6 bảng ra file JSON có timestamp trong `backups/` (đã thêm vào `.gitignore` vì chứa `password_hash`). Chạy thủ công định kỳ, đã test chạy thật thành công.
- [x] Log truy cập bất thường — middleware trong `server.js` ghi log mọi response 401/403 (kèm IP, method, path, thời gian) ra console, Render tự thu log này.
- [ ] (Tuỳ chọn) 2FA cho tài khoản admin — **chưa làm**, đúng như đánh dấu "tuỳ chọn" ban đầu, có thể làm sau nếu cần.
- [x] **[MỚI]** Review định kỳ quyền theo `role` — rà soát toàn bộ route, **phát hiện 1 lỗi thật**: `POST /api/uploads` chỉ cho phép `content`/`super_admin`, trong khi `admin/banner.html` (Ads admin) cũng gọi endpoint này để tải ảnh banner → tài khoản Ads admin thật (không phải super_admin) sẽ bị 403 khi upload ảnh banner. Đã sửa thành `requireRole("content", "ads", "super_admin")`, test lại bằng tài khoản `ads1` xác nhận upload thành công (201).

**PHASE 6: HOÀN THÀNH (trừ 2FA - tuỳ chọn, chưa cần thiết). Test qua curl + Chrome headless, không phát sinh lỗi CORS/CSP. Phát hiện và sửa 1 lỗi phân quyền thật (uploads.js thiếu role "ads").**

## PHASE 7 — Quản lý sản phẩm qua CMS (đang làm — backend+admin xong, còn nối frontend công khai)
**[MỚI 2026-07-26]** User xác nhận muốn làm — trang admin sẽ có quyền sửa toàn bộ sản phẩm/danh
mục/thương hiệu/thông số/hình ảnh, không chỉ bài viết + liên hệ như hiện tại. **Đã nêu rõ đánh
đổi với user trước khi chốt:** sau khi chuyển, các trang sản phẩm (san-pham.html,
category-chi-tiet.html, brand-san-pham.html, san-pham-chi-tiet.html, và mục Dịch Vụ/Sản Phẩm
Chiến Lược ở index.html) sẽ phải gọi API thay vì đọc file tĩnh `catalog-data.js` → site sản phẩm
phụ thuộc backend Render còn sống (rủi ro: gói free tier tự "ngủ" khi không có traffic, hoặc
Render lỗi → khách không xem được sản phẩm). User đồng ý đánh đổi này, nhưng **chưa bắt đầu làm
ngay** — ưu tiên hiện tại là Phase 4 (đang test/hoàn thiện) trước, quay lại Phase 7 sau. **Nhắc
lại chủ đề này ở đầu buổi làm việc tiếp theo sau khi Phase 4 xong.**

- [x] Đánh giá ảnh: **giữ 242 ảnh hiện có dạng file tĩnh** trên GitHub Pages (đã tối ưu ở Phase 5, không re-upload). Ảnh sản phẩm MỚI thêm sau này upload qua Cloudinary (xem mục Cloudinary ở Phase 3) - đã giải quyết luôn vấn đề ephemeral disk phát sinh từ đây.
- [x] Thiết kế schema DB — số liệu thật sau khi phân tích `catalog-data.js`: **242 sản phẩm** (không phải 246), **32 brand/nhóm**, đúng 8 danh mục. Phát hiện quan trọng trước khi viết code: brand "TJM" xuất hiện ở **3 nhóm sản phẩm khác nhau** trong Đồ Bán Tải (Lò Xo, Nhíp, Tời Điện) với sản phẩm khác nhau mỗi nhóm → không thể dùng `id` làm khoá chính toàn cục cho bảng `brands`. Schema cuối cùng (6 bảng, khoá kép đúng theo thực tế dữ liệu): `categories`, `category_sections`, `brands` (PK: category_id+id), `brand_types` (PK: category_id+brand_id+id), `products` (PK: id, đã xác nhận 242 id không trùng), `product_specs`.
- [x] Viết script import `scripts/migrate-catalog-data.js` (dùng `vm.runInContext` để nạp đúng file `catalog-data.js` chạy trên trình duyệt, không phải chép tay dữ liệu) — **kết quả khớp 100%**: 242/242 sản phẩm, 0 tham chiếu thiếu, xác nhận qua query thật (TJM đúng 3 nhóm, Đồ Bán Tải đúng brand_id=nhóm/brand_type_id=thương hiệu thật).
- [x] API CRUD đầy đủ (`routes/products.js`): `GET /api/products/catalog` (cây danh mục công khai), `GET /api/products/:id` (chi tiết), `GET/POST/PUT/DELETE` admin cho products (chỉ content/super_admin), `POST admin/brands` + `POST admin/brand-types` (thêm mới nhanh ngay trong form sản phẩm). **Lỗi phát hiện + sửa lúc test:** hiển thị sai tên thương hiệu cho sản phẩm Đồ Bán Tải (lấy nhầm tên nhóm sản phẩm thay vì thương hiệu thật) - đã sửa cả ở `GET /:id` và `admin/list`.
- [x] Trang Admin (`admin/san-pham.html` + `admin/san-pham-form.html`): danh sách có lọc theo danh mục/thương hiệu + tìm kiếm tên, form đầy đủ trường (tên/giá/mô tả/ảnh/danh mục/thương hiệu/loại/thông số kỹ thuật dạng key-value động), thêm nhanh thương hiệu/loại mới ngay trong form. Test qua screenshot Chrome headless - hiển thị đúng 242 sản phẩm.
- [x] **[MỚI 2026-07-26]** Mục "Mô tả chi tiết" cho sản phẩm — theo yêu cầu cụ thể của user (kèm ảnh tham khảo đối thủ): rich-text (tiêu đề/đậm/nghiêng/danh sách/link), chèn ảnh + chú thích ảnh in nghiêng dưới ảnh, hiệu ứng "Xem Thêm/Thu Gọn" ở trang công khai. Thêm cột `detail_content` vào `products` (migration `ALTER TABLE` vì Turso đã có 242 dòng dữ liệu thật). Tách `utils/sanitize-content.js` dùng chung cho bài viết + sản phẩm. Thêm Quill editor vào `san-pham-form.html` (tái dùng đúng pattern từ `bai-viet-form.html`, upload ảnh qua Cloudinary). **Lỗi CSS phát hiện lúc test:** quy tắc format chữ nghiêng thành "chú thích ảnh" ban đầu áp dụng cho MỌI thẻ `<em>/<i>`, làm vỡ dòng khi dùng in nghiêng nhấn mạnh giữa câu bình thường — đã sửa dùng CSS `:only-child` để chỉ áp dụng khi cả đoạn chỉ toàn chữ nghiêng.
- [x] Sửa `catalog-render.js` + `san-pham-chi-tiet.html` (trang chi tiết sản phẩm): `renderProductDetail()` đổi thành async, gọi API `/api/products/:id` thay vì đọc `CATALOG.products` tĩnh — cần thiết để mục "Mô tả chi tiết" mới hiện ra được trên trang công khai. **Phạm vi: mới nối ĐÚNG 1 trang này**, 4 trang còn lại (`san-pham.html`, `category-chi-tiet.html`, `brand-san-pham.html`, mục Dịch Vụ ở `index.html`) **vẫn đọc `catalog-data.js` tĩnh như cũ** — admin sửa thông tin sản phẩm sẽ KHÔNG hiện ở các trang danh sách/lưới cho tới khi nối nốt 4 trang này.
- [x] **Nối nốt 4 trang frontend còn lại vào API — HOÀN THÀNH.** `san-pham.html` (`renderCategoryGrid`), `category-chi-tiet.html` (`renderCategoryDetail`/`renderServiceGroupDetail`), `brand-san-pham.html` (`renderBrandProducts`), `index.html` mục Dịch Vụ (`renderServiceGrid`) + dropdown nav (`renderNavProductsDropdown`) - tất cả đổi thành `async`, gọi `loadApiCatalog()` (cache 1 lần/trang) thay vì đọc `CATALOG.categories` tĩnh. `CATALOG.serviceGroups` (chỉ là cách nhóm hiển thị ở trang chủ) vẫn giữ tĩnh, không thuộc phạm vi CMS sản phẩm.
  - **Bug thật phát hiện lúc nối:** logic cũ coi MỌI `brand_type_id` là "thương hiệu thật" (đúng cho Đồ Bán Tải, nhưng SAI cho 7 danh mục còn lại) → sản phẩm JBL từng hiển thị brand = "Loa Ô Tô" (tên phân loại) thay vì "JBL" (tên hãng thật) — lỗi này ĐÃ CÓ SẴN từ khi làm mục "Mô tả chi tiết" trước đó, chỉ chưa bị phát hiện vì chưa test sản phẩm ngoài Đồ Bán Tải. Sửa bằng hằng số `CATEGORIES_WITH_PRODUCT_GROUPS = ["do-ban-tai"]` dùng chung ở cả `GET /:id`, `admin/list`, và `GET /catalog`.
  - **Bug thật thứ 2:** `renderServiceGrid()` (trang chủ) giờ bất đồng bộ nhưng `new Swiper('.service-slider', ...)` chạy đồng bộ ngay sau — Swiper khởi tạo với 0 slide vì dữ liệu API chưa kịp về. Sửa bằng cách giữ lại promise của `renderServiceGrid` rồi gọi `swiper.update()` sau khi có dữ liệu thật.
  - **Test:** dùng Chrome headless `--dump-dom` (chụp DOM thật sau khi JS chạy xong) thay vì screenshot ảnh cho các trang có phần tử `100vh` (hero che khuất nội dung khi phóng to cửa sổ test) - xác nhận đúng: 8 danh mục, 4 nhóm sản phẩm Đồ Bán Tải (đúng số lượng sản phẩm mỗi nhóm), 2 thương hiệu con (King Springs/TJM) trong nhóm Lò Xo, brand hiển thị đúng ở mọi cấp, Swiper trang chủ nhận đủ 3 slide.
- [ ] Đánh giá ảnh hưởng SEO khi nội dung sản phẩm chuyển từ tĩnh (Google crawl trực tiếp) sang gọi API — còn lại, có thể làm sau (không khẩn, Google hiện tại vẫn chạy JS khi index).

**PHASE 7: HOÀN THÀNH — schema, import, API, admin CRUD sản phẩm, mô tả chi tiết, VÀ toàn bộ 5 trang frontend công khai đã nối vào API thật. Admin sửa sản phẩm giờ hiện đúng ngay trên toàn site, không còn 2 nguồn dữ liệu song song.**

## PHASE 8 — Khi mua hosting thật (tương lai)
- [ ] Deploy lại đúng backend Node.js lên hosting mới (không viết lại)
- [ ] Gộp frontend + backend cùng 1 domain nếu muốn (bỏ phụ thuộc GitHub Pages)
- [ ] Trỏ domain riêng, cấu hình SSL
- [ ] (Optional, nếu cần) bổ sung giỏ hàng/thanh toán VNPay/Momo — chưa nằm trong phạm vi hiện tại

---

## Ghi chú khi làm (cập nhật liên tục)

<!-- Thêm note mới bên dưới, theo format: Ngày — Task — Kết quả — Bước tiếp theo -->

**2026-07-25** — Buổi làm việc đầu tiên theo file kế hoạch này.
- **Task:** Phase 1 (toàn bộ 6 mục), Phase 0 (scaffold), phần lớn Phase 3 (code API), phần rà soát được của Phase 2.
- **Kết quả:**
  - 6 trang tĩnh mới: `tin-tuc.html`, `bai-viet-chi-tiet.html`, `dat-lich-hen.html`, `chinh-sach.html`, `faq.html`, `404.html` + `sitemap.xml`, `robots.txt`. CSS dùng chung ở `assets/css/pages.css`, tái dùng tối đa `catalog-pages.css`/`main.css` sẵn có để đồng bộ giao diện.
  - Cập nhật nav + footer "Liên Kết Nhanh" ở cả 5 trang cũ (`index.html`, `san-pham.html`, `san-pham-chi-tiet.html`, `category-chi-tiet.html`, `brand-san-pham.html`) trỏ tới các trang mới.
  - **Sự cố phát hiện & đã sửa ngay trong buổi:** thêm cả "Tin Tức" và "Đặt Lịch Hẹn" vào nav chính làm nav tràn xuống 2 dòng ở độ rộng desktop/tablet (992-1280px, trước khi nav sập xuống hamburger). Đã bỏ "Đặt Lịch Hẹn" khỏi nav chính (giữ "Tin Tức" thôi), "Đặt Lịch Hẹn" vẫn dễ tìm qua footer + link ngữ cảnh trong FAQ/blog. Xác nhận lại bằng screenshot — nav về đúng 1 dòng.
  - Backend `duchieuauto-backend/` đã viết code đầy đủ cho Phase 0 + phần lớn Phase 3 (auth JWT + bcrypt, CRUD posts, contacts, chặn brute-force cơ bản) nhưng **chưa test chạy được** vì máy soạn thảo không có Node.js/npm — cần làm tiếp ở máy có Node hoặc thẳng trên Render.
  - Rà soát console.log + secret lộ trong code client: sạch, không có vấn đề.
- **Bước tiếp theo (buổi sau):** cài Node.js đâu đó để test backend (`npm install` + `npm run dev` + `curl`), rồi mới đăng ký Render.com và deploy thật; sau đó quay lại Phase 2 phần còn thiếu (minify, Cloudflare, reCAPTCHA — cả 2 việc sau cần quyết định/tài khoản từ user trước).

**2026-07-25 (lần 2)** — Cập nhật kế hoạch, không viết code.
- **Task:** User xác nhận sẽ có 2 admin (Content + Ads) → cần CMS phân quyền theo vai trò. Đồng thời bổ sung 5 mục bị sót phát hiện ở lần rà soát A-E trước đó.
- **Đã làm:** Thêm các dòng `[MỚI]` vào Phase 2/3/4/5/6 (không xoá/sửa dòng cũ nào, kể cả các dòng `[x]` đã hoàn thành ở buổi trước). Xác minh trực tiếp code thật (`models/db.js`, `routes/auth.js`, `routes/posts.js`, `middleware/auth.js`) trước khi ghi task, để task mô tả đúng chỗ cần sửa (ví dụ: bảng `admins` hiện chưa có cột `role`, `routes/posts.js` chưa sanitize HTML trước khi lưu).
- **Kết quả chính cần làm ở Phase 3/4:** thêm cột `role` cho `admins`, bảng `activity_log`/`settings`/`banners`, sanitize HTML chống stored-XSS, middleware `requireRole`, và ở Phase 4 thêm menu/trang theo vai trò (Banner, Cấu hình tracking, Activity log).
- **Bước tiếp theo:** khi quay lại Phase 3, làm các mục `[MỚI]` về schema/role trước khi viết tiếp API Phase 4, để tránh phải sửa lại migration sau khi đã có dữ liệu thật.

**2026-07-25 (lần 3)** — Hoàn thành Phase 0 + toàn bộ phần code còn lại của Phase 3.
- **Task:** User xác nhận đã đăng ký xong tài khoản Render.com (`vanduc.cbn@gmail.com`). Yêu cầu triển khai tiếp các việc còn thiếu theo đúng thứ tự kế hoạch.
- **Đã làm:**
  - **Phase 0: hoàn thành 100%** — ghi nhận tài khoản Render.com đã đăng ký.
  - **Phase 3 - làm hết 7 mục `[MỚI]` còn lại:**
    - `models/db.js`: thêm cột `role` vào `admins` (kèm migration `ALTER TABLE` tự động cho DB cũ), thêm bảng `activity_log`/`settings`/`banners`, thêm helper `db.logActivity(admin, action, target)`
    - `routes/auth.js`: JWT payload + response giờ có `role`
    - `middleware/auth.js`: viết lại thành `requireRole(...roles)` (không tham số = mọi admin; có tham số = giới hạn đúng vai trò đó), giữ `requireAdmin` cũ để tương thích ngược
    - `routes/posts.js`: thêm `sanitize-html` (whitelist thẻ/thuộc tính rich-text, ép `rel=noopener noreferrer` cho link) chống stored-XSS; đổi phân quyền ghi từ "mọi admin" sang chỉ `content`/`super_admin`; ghi `activity_log` cho cả 3 thao tác tạo/sửa/xoá
    - `routes/contacts.js`: đổi sang `requireRole()` (giữ nguyên hành vi mọi admin xem được), thêm ghi `activity_log` khi đổi trạng thái
    - `package.json`: thêm dependency `sanitize-html`
    - `scripts/seed-admin.js`: nhận thêm tham số `role` khi tạo tài khoản (mặc định `super_admin` cho tài khoản đầu tiên)
  - Cập nhật `duchieuauto-backend/README.md`: thêm mục "Mô hình quyền (2 admin)" giải thích rõ role nào làm được gì, cập nhật sơ đồ thư mục và lệnh seed-admin mẫu.
  - **Chưa làm được**: bảng `settings`/`banners` mới có schema, chưa có route API (đúng phạm vi Phase 3 - API cho 2 bảng này sẽ viết cùng lúc với trang quản trị ở Phase 4). Deploy + test thật trên Render vẫn chưa làm được (thiếu Node.js ở môi trường soạn thảo).
- **Bước tiếp theo:** cần Node.js để `npm install` + test toàn bộ API (đặc biệt route mới đổi phân quyền) trước khi deploy thật lên Render.com; sau đó bắt đầu Phase 4 (trang admin) - lúc đó mới viết API cho `settings`/`banners`.

**2026-07-25 (lần 4)** — User tự cài Node.js, test thật toàn bộ backend, tìm và sửa 3 lỗi.
- **Task:** User cài Node.js xong (v24.18.0, cài vào ổ D:\ thay vì vị trí mặc định C:\Program Files - không có trong PATH nên phải gọi bằng đường dẫn đầy đủ hoặc tự thêm PATH tạm cho từng phiên làm việc). Tiến hành `npm install` + test toàn bộ API qua curl như kế hoạch yêu cầu.
- **Lỗi 1 - `better-sqlite3` không cài được:** gói cần biên dịch native (node-gyp) nhưng máy không có Python/Visual Studio Build Tools, và không có bản build sẵn (prebuilt binary) cho Node v24.18.0 (bản Node quá mới). **Giải pháp:** đổi sang `node:sqlite` - module SQLite tích hợp sẵn trong Node.js (>=22.5.0), không cần biên dịch, đã test API tương thích 100% (prepare/run/get/all/exec) với cách viết query cũ, chỉ phải đổi 2 chỗ dùng `.pragma()` (better-sqlite3) thành `.exec("PRAGMA ...")`/`.prepare("PRAGMA ...").all()` (node:sqlite). Cập nhật `engines.node` trong `package.json` lên `>=22.5.0`.
- **Lỗi 2 - `bcrypt` kéo theo 6 lỗ hổng bảo mật (5 high, 1 critical):** lỗ hổng nằm trong bộ công cụ build native của bcrypt (`@mapbox/node-pre-gyp` → `tar`/`glob`/`minimatch`/`brace-expansion`), `npm audit fix` không sửa được vì bị khoá sâu trong cây phụ thuộc. **Giải pháp:** đổi sang `bcryptjs` (cùng API `hashSync`/`compareSync`, JS thuần, không native) - sau khi đổi, `npm audit` báo **0 vulnerabilities**, số gói cài đặt giảm từ 159 xuống 103.
- **Lỗi 3 - `PUT /api/posts/:id` báo lỗi 500 "Unknown named parameter 'slug'":** phát hiện khi test sửa bài viết thật. Nguyên nhân: code cũ gộp `{...existing, ...req.body}` rồi bind thẳng vào câu UPDATE - `better-sqlite3` cho phép object binding có field thừa (tự bỏ qua field không dùng), nhưng `node:sqlite` kiểm tra nghiêm ngặt hơn, báo lỗi ngay nếu object có field không khớp tham số nào trong SQL (`slug`, `created_at` bị thừa vì UPDATE không đụng tới). **Giải pháp:** viết lại, chỉ đưa đúng field câu SQL cần vào object bind.
- **Phát hiện thêm (không phải lỗi code, chỉ là lưu ý khi test):** dùng `curl -d '...'` với tiếng Việt gõ thẳng trong đối số dòng lệnh trên Windows Git Bash bị corrupt encoding (VD "Cách" thành "C?ch") - đã xác minh bằng cách tách nhỏ từng bước (test slugify độc lập, test node:sqlite độc lập, test Express độc lập, so sánh gửi bằng đối số dòng lệnh vs gửi bằng file) - lỗi nằm ở cách `curl.exe` trên Windows xử lý đối số non-ASCII, không phải ở code Node.js. Sau khi đổi sang gửi bằng file (`--data-binary @file.json`), tiếng Việt (kể cả "Đánh Giá Phim Cách Nhiệt 3M") hiển thị và tạo slug đúng 100% (`danh-gia-phim-cach-nhiet-3m`). Ghi chú này đã thêm vào `README.md` để lần sau không mất thời gian điều tra lại.
- **Kết quả test đầy đủ (tất cả PASS):** health check, đăng nhập đúng/sai (401 + khoá sau 5 lần sai), tạo/xem/sửa/xoá bài viết (bao gồm tiếng Việt có dấu), chặn XSS (`<script>` bị lọc sạch khỏi content), phân quyền role (Ads admin bị 403 khi tạo bài viết, vẫn xem được liên hệ), form liên hệ/đặt lịch (public POST + admin GET), chặn truy cập không có token (401).
- **Bước tiếp theo:** deploy thật lên Render.com (tài khoản đã có), sau đó bắt đầu Phase 4 (trang Admin).

**2026-07-26** — Xây xong Phase 4 (phần cốt lõi cho Content admin), user xác nhận đã test và "Tốt".
- **Task:** Xây trang quản trị thật (đăng nhập, viết/sửa/xoá bài viết bằng rich-text editor, quản lý liên hệ), để nhân viên content có công cụ tự làm việc thay vì phải nhờ qua trung gian.
- **Quyết định kiến trúc:** Trang admin (`duchieuauto-backend/admin/`) được **phục vụ trực tiếp bởi backend** (Express `express.static`), KHÔNG nằm trong site tĩnh GitHub Pages. Lý do: cùng domain với API nên gọi `fetch()` bằng đường dẫn tương đối, không lo CORS; tách biệt hoàn toàn khỏi domain công khai (thêm 1 lớp khó đoán); dễ chặn index bằng 1 `robots.txt` chung cho cả domain thay vì phải sửa robots.txt của site chính.
- **Đã làm:**
  - Backend: thêm `routes/uploads.js` (multer, giới hạn 5MB, chỉ nhận ảnh, lưu vào `uploads/`, chỉ Content/super_admin được upload), serve tĩnh `/uploads` và `/admin`, thêm route `/robots.txt` (chặn index toàn domain), thêm 2 API mới cho trang quản trị (`GET /api/posts/admin/all`, `GET /api/posts/admin/id/:id` - lấy được cả bài nháp, route công khai `GET /api/posts` cũ vẫn chỉ trả bài đã đăng)
  - 5 trang admin: `login.html`, `dashboard.html`, `bai-viet.html` (danh sách), `bai-viet-form.html` (soạn/sửa bài dùng **Quill** rich-text editor qua CDN + upload ảnh bìa/ảnh nội dung + nút Xem Trước + Draft/Published), `lien-he.html` (xem + đổi trạng thái liên hệ/đặt lịch)
  - `admin/assets/admin.js` dùng chung: auth guard theo role (`requireAuth`), fetch wrapper tự đính JWT + tự đăng xuất khi hết hạn (`apiFetch`), thanh điều hướng tự ẩn/hiện mục theo vai trò (`renderAdminNav`)
- **Lỗi phát hiện + sửa trong lúc xây:** `multer@1.4.5-lts.2` (bản mới nhất dòng 1.x) bị cảnh báo lỗ hổng bảo mật đã biết khi cài — nâng thẳng lên `multer@2.x`, cài lại sạch, `npm audit` báo 0 vulnerabilities.
- **Test:** cài lại `npm install` sạch (0 vulnerabilities), test API upload ảnh qua curl (thành công, ảnh phục vụ đúng qua `/uploads/...`), kiểm tra cú pháp toàn bộ JS trong 5 trang admin bằng `node --check` (không lỗi). User tự mở trình duyệt thật, đăng nhập, thử soạn bài/upload ảnh/lưu — xác nhận **"Tốt"**.
- **Viết lại `huong-dan-viet-content-nhan-vien.md`** mục 6 (trước đó mô tả quy trình tạm "gửi bản nháp qua trung gian" vì chưa có công cụ) — giờ hướng dẫn chi tiết từng bước dùng trang quản trị thật: đăng nhập, viết bài (dùng thanh công cụ Quill, chèn ảnh, chọn danh mục, Draft/Published), sửa/xoá bài, xem liên hệ, lưu ý bảo mật (đăng xuất khi dùng xong, không chia sẻ mật khẩu).
- **User xác nhận muốn làm Phase 7 tiếp theo** (cho admin sửa được toàn bộ sản phẩm/danh mục/thông số/ảnh) — đã giải thích rõ đánh đổi kiến trúc (xem ghi chú ở mục Phase 7 phía trên), user đồng ý đánh đổi nhưng dời việc bắt đầu sau khi xong việc trước mắt. **Đã thống nhất cách chia nhỏ Phase 7 thành nhiều buổi riêng** (không dồn 1 lần vì khối lượng rất lớn - 246 sản phẩm, sửa cả backend lẫn 5 trang frontend).
- **Chưa làm**: 3 trang Ads admin (Banner, Cấu hình, Activity log) - dời sang làm cùng Phase 7; deploy thật lên Render.com.
- **Bước tiếp theo:** (1) Deploy backend lên Render.com (việc "vừa" - 1 buổi riêng), (2) Bắt đầu Phase 7 theo từng bước nhỏ đã liệt kê ở mục Phase 7.

**2026-07-26 (lần 2)** — Hoàn thành nốt Phase 4 (3 trang Ads admin) + toàn bộ Phase 5. Bắt đầu deploy Render rồi tạm dừng vì phát hiện vấn đề kiến trúc.
- **Task:** User yêu cầu "Khoan bắt đầu phase 7, hoàn thiện xong 3-4-5" trước.
- **Phase 4 - 3 trang Ads admin còn thiếu:** `admin/banner.html` (CRUD banner + upload ảnh + ngày hiện/ẩn), `admin/cau-hinh.html` (GA/Pixel/Search Console/social/SEO mặc định), `admin/lich-su.html` (activity log, chỉ super_admin). API tương ứng: `routes/banners.js`, `routes/settings.js`, `routes/activity.js`. Test đầy đủ qua curl (phân quyền role, CRUD, public vs admin-only).
- **Đẩy code backend lên GitHub:** commit riêng `duchieuauto-backend/` (không đụng các file frontend đang sửa dở), theo đúng yêu cầu user. Phát hiện và sửa 1 lỗ hổng nhỏ trước khi push: `.gitignore` backend thiếu `*.db-shm`/`*.db-wal` (file phụ SQLite WAL mode) nên suýt commit nhầm dữ liệu database thật (kể cả mật khẩu admin đã hash) - đã bỏ stage kịp thời và bổ sung `.gitignore`.
- **Thử deploy Render.com - tạm dừng:** phát hiện Render free tier không có persistent disk, mỗi lần deploy code mới sẽ xoá sạch file SQLite. Đề xuất 2 hướng (Turso/libSQL hoặc tự backup/restore qua GitHub) - **user yêu cầu dời quyết định sang buổi sau**, ưu tiên Phase 5 trước.
- **[MỚI] User đặt ra thang điểm rủi ro 1-10** cho việc Claude tự quyết định vs phải xin duyệt trước (chi tiết xem file `.claude/` memory `feedback_approval_scale`) - áp dụng từ giờ cho mọi việc trong dự án, không riêng CMS.
- **Phase 5 - làm toàn bộ:** xem chi tiết từng mục đã tick `[x]` ở phần Phase 5 phía trên. Điểm đáng chú ý: thêm cột `cta_text`/`cta_link` vào bảng `posts` (không có trong kế hoạch gốc, bổ sung để khớp đúng yêu cầu cấu trúc bài viết ở `huong-dan-viet-content-nhan-vien.md`); phát hiện và xin phép trước khi nén ảnh (đúng thang điểm rủi ro mới) - trong lúc nén làm lộ ra 1 lỗi dữ liệu có từ trước (5 ảnh WebP bị đặt nhầm đuôi `.jpg`), đã xử lý sự cố (khôi phục từ Git) mà không mất dữ liệu.
- **Test:** mở static server tạm (`node` một file server nhỏ, cổng 5500) phục vụ frontend tĩnh + backend thật ở cổng 4000, mở Chrome thật để user tự kiểm tra. Gặp lỗi CORS lúc đầu (`.env` backend giới hạn `FRONTEND_ORIGIN` chỉ domain GitHub Pages thật) - đã sửa `server.js` để luôn cho phép thêm `localhost`/`127.0.0.1` bất kể cấu hình, không ảnh hưởng giới hạn domain thật khi lên production. User xác nhận "Tốt cả" sau khi tự kiểm tra ảnh, Google Analytics (qua DevTools Network), và trang Tin Tức.
- **Chưa làm / còn treo:** xoá mã `google_analytics_id=G-TEST123` (mã test) trong settings trước khi dùng thật; đổi đuôi đúng cho 5 ảnh WebP bị đặt nhầm `.jpg`; quyết định hướng lưu trữ dữ liệu (Turso vs backup/restore) rồi mới deploy Render thật.
- **Bước tiếp theo:** quyết định hướng lưu trữ dữ liệu cho Render, deploy backend thật, rồi mới bắt đầu Phase 7.

**2026-07-26 (lần 3)** — Migrate sang Turso, hoàn thành Phase 3+5, bắt đầu Phase 6.
- **Task:** User chọn Turso làm hướng lưu trữ dữ liệu (sau khi tôi phân tích Turso an toàn/ổn định hơn tự viết backup qua GitHub). Tạo tài khoản Turso qua web dashboard, gửi Database URL + Auth Token.
- **Đã làm:** Cài `@libsql/client`, viết lại `models/db.js` (shim `prepare().get/all/run` bất đồng bộ tương thích ngược), chuyển toàn bộ `routes/*.js` (6 file) + `scripts/seed-admin.js` + `scripts/migrate-static-posts.js` + `server.js` (chờ `db.ready`) sang async/await. Cập nhật `package.json` (bỏ yêu cầu Node >=22.5.0 gắn với `node:sqlite`), `.env.example`, `README.md`.
- **Test:** 12 kịch bản qua curl (đăng nhập đúng/sai, CRUD bài viết có dấu tiếng Việt, phân quyền role 403, contacts, settings, banner CRUD, activity log super_admin-only) - PASS 100%, hành vi giống hệt bản `node:sqlite` cũ.
- **User yêu cầu "tự test luôn" thay vì nhờ user click tay** - dùng Chrome headless chụp screenshot (khác cách cũ hay bị treo: lần này chỉ 1 lần điều hướng duy nhất - tạo trang tạm tự set `localStorage` bằng token thật lấy qua curl rồi redirect, không phải giả lập nhiều bước click/gõ). Chụp thành công 5 trang admin (dashboard, bài viết, banner, cấu hình, lịch sử) + trang Tin Tức công khai - tất cả khớp dữ liệu Turso thật. Đã xoá file test tạm sau khi xong, không lọt vào git.
- **Đã đẩy code lên GitHub** (commit `4466b12`).
- **Deploy Render:** đã cập nhật README hướng dẫn đầy đủ, nhưng **user yêu cầu dời lại** (cần tự xác thực GitHub OAuth trên dashboard, Claude không làm thay được) - "làm phần khác trước, nhắc lại phần này tôi làm sau".
- **[MỚI] Cập nhật thang điểm rủi ro:** trong lúc nén ảnh Phase 5, sự cố ngoài ý muốn (5 file bị lỗi decode, tự khôi phục từ Git kịp thời) minh hoạ đúng lý do thang điểm 1-10 tồn tại - đã xin phép trước khi nén ảnh theo đúng quy tắc.
- **Bước tiếp theo:** làm Phase 6 (bảo mật nâng cao backend) trong lúc chờ user tự deploy Render; nhắc lại việc deploy + Phase 7 ở đầu buổi sau.

**2026-07-26 (lần 4)** — Hoàn thành Phase 6 (bảo mật nâng cao backend), trong lúc chờ user tự deploy Render.
- **Task:** User yêu cầu deploy Render dời lại tự làm sau ("làm phần khác trước") - chuyển sang làm Phase 6, không cần chờ deploy vì làm được hết ở local.
- **Đã làm:** cài `helmet` (CSP tuỳ chỉnh cho phép CDN jsdelivr + `unsafe-inline` vì admin viết JS/CSS inline, các header khác dùng mặc định) + `express-rate-limit` (300/15p toàn API, 20/15p riêng cho login) + middleware log 401/403 ra console + ghi chú lý do không cần CSRF (JWT qua header, không cookie) + `scripts/backup-turso.js` (export 6 bảng ra JSON, thêm `backups/` vào `.gitignore` vì chứa password_hash).
- **Rà soát phân quyền role phát hiện 1 lỗi thật:** `POST /api/uploads` chỉ cho `content`/`super_admin`, nhưng `banner.html` (Ads admin) cũng gọi endpoint này để tải ảnh banner → Ads admin thật bị 403. Đã sửa thành `requireRole("content", "ads", "super_admin")`, test lại bằng tài khoản `ads1` xác nhận upload OK (201). Đây là ví dụ cụ thể cho lý do mục "review định kỳ quyền theo role" tồn tại trong kế hoạch.
- **Test sau khi thêm helmet/CSP:** lo ngại CSP chặn nhầm CDN Quill hoặc inline script của admin - đã rà soát không có trang admin nào dùng inline event attribute (`onclick=...`), chỉ dùng `addEventListener`, nên không bị ảnh hưởng. Xác nhận bằng Chrome headless: chụp `banner.html` và `bai-viet-form.html` (trang phụ thuộc CDN nhiều nhất, dùng Quill editor) - cả 2 render/hoạt động đầy đủ, không lỗi.
- **Chưa làm:** 2FA (đánh dấu tuỳ chọn từ đầu, chưa cần thiết).
- **Bước tiếp theo:** deploy Render (user tự làm phần xác thực GitHub OAuth), rồi bắt đầu Phase 7.

**2026-07-26 (lần 5)** — User tự deploy Render thành công, bắt đầu và làm phần lớn Phase 7, giải quyết vấn đề lưu trữ ảnh bằng Cloudinary.
- **Task:** User xác nhận "Bắt đầu" Phase 7. Phân tích kỹ `catalog-data.js` trước khi thiết kế (không đoán mò) - phát hiện số liệu thật khác ước tính ban đầu (242 sản phẩm, không phải 246) và 1 vấn đề thiết kế quan trọng (brand "TJM" lặp lại ở 3 nhóm khác nhau trong Đồ Bán Tải) - đã sửa schema dùng khoá kép trước khi viết code, tránh phải làm lại.
- **Đã làm (chi tiết xem các mục `[x]` ở Phase 7 phía trên):** schema 6 bảng trong `models/db.js`, script `scripts/migrate-catalog-data.js` (dùng `vm.runInContext` nạp file JS chạy trình duyệt, không chép tay dữ liệu) - import khớp 100%, `routes/products.js` (API CRUD đầy đủ), 2 trang admin (`san-pham.html`, `san-pham-form.html`), cập nhật nav/dashboard.
- **Trong lúc chờ script import chạy nền** (~3 phút do ghi tuần tự qua mạng lên Turso, không có batch), user tranh thủ hỏi hướng dẫn setup tài khoản Turso/Render/upload ảnh - đã hướng dẫn từng bước, riêng phần ảnh đề xuất Cloudinary (free, không thẻ) - user đồng ý và tạo tài khoản ngay.
- **User tự deploy Render thành công** (`https://claude-duchieuauto.onrender.com`) trong lúc tôi đang làm Phase 7 - phát hiện Render đang chạy code CŨ (Phase 7 code chưa push) khi test `/api/products/catalog` báo lỗi. Đã push Phase 6+7 lên GitHub, Render tự redeploy, xác nhận lại bằng curl - hoạt động đúng trên production (8 danh mục, 239/242 sản phẩm hiện trong cây duyệt công khai - chênh lệch 3 là ĐÚNG dự kiến vì 3 sản phẩm thuộc brand có `hidden:true` trong dữ liệu gốc, đã xác minh qua query trực tiếp, không phải lỗi).
- **Cloudinary:** user gửi Cloud Name/API Key/API Secret, viết lại `routes/uploads.js` dùng `multer.memoryStorage()` + `cloudinary.uploader.upload_stream()` thay vì lưu đĩa cục bộ. Test upload ảnh thật thành công, ảnh truy cập công khai qua CDN. Đã push lên GitHub, hướng dẫn user thêm 3 biến môi trường Cloudinary vào Render.
- **Đã đẩy 3 lần lên GitHub trong buổi này** (Phase 6+7 gộp 1 lần, `api-config.js` riêng 1 lần, Cloudinary riêng 1 lần) - đều xin xác nhận trước theo đúng thang điểm rủi ro đã chốt.
- **Chưa làm - còn thiếu duy nhất để Phase 7 "sống" thật:** sửa `catalog-render.js` + 5 trang frontend công khai (san-pham.html, category-chi-tiet.html, brand-san-pham.html, san-pham-chi-tiet.html, index.html) để gọi API `/api/products/catalog` thay vì đọc file tĩnh `catalog-data.js` - hiện tại 2 nguồn dữ liệu (file tĩnh cũ + database mới) đang tồn tại song song, sửa gì trong admin cũng KHÔNG hiện ra trang công khai cho tới khi làm bước này.
- **Bước tiếp theo:** nối frontend công khai vào API sản phẩm (bước cuối của Phase 7), sau đó mới có thể coi Phase 7 hoàn chỉnh; xoá mã GA test `G-TEST123` trước khi dùng thật; đổi đuôi đúng cho 5 ảnh WebP bị đặt nhầm `.jpg` (việc nhỏ, không khẩn).

**2026-07-26 (lần 6)** — Thêm mục "Mô tả chi tiết" sản phẩm + hoàn thành nối toàn bộ frontend vào API, Phase 7 xong hẳn.
- **Task:** User yêu cầu cụ thể (kèm ảnh tham khảo đối thủ PGI): thêm mô tả chi tiết dạng rich-text cho sản phẩm, có ảnh + chú thích, hiệu ứng Xem Thêm/Thu Gọn. Sau đó user yêu cầu tiếp tục nối nốt 4 trang frontend còn lại vào API sản phẩm.
- **Mô tả chi tiết:** cột `detail_content` mới (migration ALTER TABLE vì Turso đã có 242 dòng thật), tách `utils/sanitize-content.js` dùng chung bài viết + sản phẩm, thêm Quill editor vào `san-pham-form.html`, nối `san-pham-chi-tiet.html` vào API trước tiên (cần thiết để tính năng mới hiện ra công khai). Phát hiện + sửa 1 lỗi CSS (in nghiêng giữa câu bị vỡ dòng do nhầm với chú thích ảnh - dùng `:only-child` để phân biệt).
- **Nối nốt 4 trang còn lại:** `san-pham.html`, `category-chi-tiet.html`, `brand-san-pham.html`, `index.html` (mục Dịch Vụ + dropdown nav) - toàn bộ hàm render trong `catalog-render.js` đổi thành async, dùng `loadApiCatalog()` cache chung.
- **2 lỗi thật phát hiện lúc test kỹ (không phải đoán, xác nhận qua curl/DOM thật):**
  1. Logic brand hiển thị coi mọi `brand_type_id` là "thương hiệu thật" - đúng cho Đồ Bán Tải nhưng SAI cho 7 danh mục còn lại (sản phẩm JBL từng hiện brand = "Loa Ô Tô" thay vì "JBL"). Lỗi này đã tồn tại từ lúc làm mục Mô tả chi tiết nhưng chưa lộ ra vì chỉ test sản phẩm Đồ Bán Tải. Sửa bằng `CATEGORIES_WITH_PRODUCT_GROUPS = ["do-ban-tai"]` dùng chung 3 nơi.
  2. `renderServiceGrid()` (trang chủ) bất đồng bộ nhưng Swiper khởi tạo đồng bộ ngay sau → 0 slide. Sửa bằng cách chờ promise rồi gọi `swiper.update()`.
- **Test:** dùng `--dump-dom` (DOM thật sau khi JS chạy) thay vì screenshot ảnh cho các trang có hero `100vh` (phóng to cửa sổ test làm hero chiếm hết khung hình, che mất nội dung cần xem) - xác nhận đúng toàn bộ: 8 danh mục, 4 nhóm Đồ Bán Tải đúng số lượng, thương hiệu con đúng, brand hiển thị đúng mọi cấp, Swiper đủ 3 slide.
- **Đã đẩy 2 lần lên GitHub buổi này** (Mô tả chi tiết + sửa bug brand/Swiper), Render tự redeploy, xác nhận lại qua curl production.
- **Phase 7 giờ đã hoàn thành đầy đủ** - không còn 2 nguồn dữ liệu song song, admin sửa gì cũng hiện đúng trên toàn site công khai.
- **Việc nhỏ còn treo (không khẩn):** xoá mã GA test `G-TEST123`; đổi đuôi đúng cho 5 ảnh WebP bị đặt nhầm `.jpg`; đánh giá ảnh hưởng SEO khi chuyển sản phẩm từ tĩnh sang API (Phase 5 cũ).
- **Bước tiếp theo:** Phase 6/7 coi như xong - quay lại các việc nhỏ còn treo, hoặc bắt đầu phần tiếp theo user muốn ưu tiên.

**2026-07-26 (lần 7)** — Thêm hệ thống quản lý tài khoản admin đầy đủ (đổi mật khẩu, quên mật khẩu qua email thật, super_admin quản lý admin khác) + tài liệu tổng hợp thông tin dự án.
- **Task:** User yêu cầu 4 việc: (1) đổi mật khẩu/tạo tài khoản/quên mật khẩu/phân quyền cho super admin, (2) xác nhận trang admin đã public - đã có sẵn từ lúc deploy Render, (3) đã tự thêm mã Analytics thật, (4) viết lại tài liệu hướng dẫn nhân viên.
- **Quên mật khẩu:** user chọn gửi email thật (không chọn phương án đơn giản hơn là super_admin tự đặt lại) → chọn Gmail SMTP dùng email cửa hàng có sẵn (`contact.duchieuauto47@gmail.com`) thay vì đăng ký dịch vụ email mới, cần user tự tạo App Password trên Google.
- **Backend:** thêm cột `email`/`reset_token`/`reset_token_expires` vào `admins` (migration ALTER TABLE), `utils/mailer.js` (nodemailer + Gmail SMTP), `routes/auth.js` thêm `GET /me`, `PUT /my-email`, `PUT /change-password`, `POST /forgot-password`, `POST /reset-password` (token băm sha256, hết hạn 1 giờ, luôn trả lời chung chung để không lộ tài khoản tồn tại), `routes/admins.js` mới (toàn bộ chỉ super_admin: liệt kê/tạo/sửa vai trò/đặt lại mật khẩu trực tiếp/xoá tài khoản, có chặn tự xoá/tự hạ quyền mình và chặn xoá/hạ quyền super_admin cuối cùng).
- **Frontend:** `quen-mat-khau.html` + `dat-lai-mat-khau.html` (công khai, không cần đăng nhập), `tai-khoan.html` (đổi mật khẩu + email bản thân cho mọi role, + khu vực quản lý tài khoản chỉ hiện cho super_admin), thêm link vào `login.html`, nav, dashboard.
- **Lỗi thật phát hiện lúc test bằng Chrome (không phải chỉ syntax check):** `tai-khoan.html` khai báo lại `const ROLE_LABEL` trùng tên với biến đã có sẵn trong `assets/admin.js` (nạp trước đó cùng trang) → toàn bộ script trang không chạy được dòng nào (nav trống, khu vực super_admin không hiện) dù cú pháp từng file riêng lẻ đều hợp lệ. Đây là loại lỗi mà syntax checker riêng từng file KHÔNG bắt được (cần 2 file cùng chạy chung 1 trang mới lộ ra) — bài học: luôn test bằng trình duyệt thật, không chỉ tin cú pháp sạch.
- **Test:** đầy đủ qua curl (đổi mật khẩu, đăng nhập lại bằng mật khẩu mới, super_admin reset mật khẩu người khác, tạo/xoá tài khoản, mọi guard bảo vệ đều đúng) + Chrome screenshot (sau khi sửa lỗi ROLE_LABEL, toàn bộ trang hoạt động đúng). Phần gửi email thật CHƯA test được (đang chờ user gửi Gmail App Password) - nhưng đã xác nhận: khi thiếu App Password, hệ thống không bị crash, vẫn trả lời API đúng, chỉ log lỗi kỹ thuật ra console (đúng thiết kế).
- **Tài liệu:** viết lại toàn bộ `huong-dan-viet-content-nhan-vien.md` - bổ sung mục 8 (quản lý sản phẩm, kể cả cách tạo chú thích ảnh bằng in nghiêng cả dòng), mục 9-10 (tài khoản cá nhân + quản lý tài khoản cho super_admin), cập nhật link admin thật.
- **[MỚI] Tạo file `tai-khoan-va-lien-ket-du-an.md`** (gốc dự án) theo yêu cầu user - tổng hợp toàn bộ link/tài khoản/mã kết nối (GitHub, Render, Turso, Cloudinary, Gmail, tài khoản admin). **Đã thêm vào `.gitignore` gốc dự án ngay lập tức** vì chứa mật khẩu/API secret thật - xác nhận qua `git check-ignore` không lọt lên GitHub.
- **Còn treo:** chờ user gửi Gmail App Password để test thật luồng quên mật khẩu qua email; đổi mật khẩu test `admin`/`TestPass2026!` sang mật khẩu thật; cập nhật `ADMIN_BASE_URL` trên Render (hiện đang là `http://localhost:4000` trong `.env` local, cần đổi thành `https://claude-duchieuauto.onrender.com` khi thêm biến môi trường này lên Render).
- **Bước tiếp theo:** nhận App Password từ user, thêm biến môi trường Gmail + `ADMIN_BASE_URL` lên Render, test lại luồng quên mật khẩu bằng email thật trên production, rồi push code lên GitHub.
