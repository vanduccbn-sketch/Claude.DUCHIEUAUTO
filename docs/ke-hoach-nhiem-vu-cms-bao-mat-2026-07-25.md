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
**[CẬP NHẬT 2026-07-27]** Đã có domain thật `duchieuauto.vn` + Cloudflare (xem "Ghi chú khi làm"
ngày 2026-07-27) - phần lớn lý do "chờ domain" ở dưới không còn nữa, đã đánh dấu lại trạng thái:
- [ ] Minify `assets/js/*.js`, `assets/css/*.css` trước khi deploy bản production — cần chọn công cụ build (chưa làm, không liên quan domain, có thể làm bất kỳ lúc nào)
- [x] Rà soát xoá `console.log`, comment nội bộ nhạy cảm trong JS/HTML hiện có — **kết quả: sạch, không có `console.log` nào trong toàn bộ `assets/js/*.js` và các trang HTML**
- [x] Chống hotlink ảnh sản phẩm — HOÀN THÀNH 2026-07-27: Cloudflare WAF Custom Rule (Rulesets API,
  chặn theo `http.referer` không chứa `duchieuauto.vn` khi có referer), verify đủ 4 kịch bản (chặn
  hotlink, cho phép truy cập trực tiếp không referer, cho phép cùng domain, site vẫn chạy bình thường)
- [ ] **[MỚI]** Watermark logo nhỏ lên ảnh sản phẩm (chống đối thủ lấy ảnh) — làm hàng loạt bằng script, áp dụng cho ảnh mới upload qua CMS ở Phase 4 (không liên quan domain) — **vẫn CHƯA làm**, đang chờ logo thật (logo hiện tại chỉ là placeholder tạm)
- [x] reCAPTCHA cho form liên hệ/đặt lịch (chống spam bot) — HOÀN THÀNH 2026-07-27: reCAPTCHA v2
  checkbox, áp dụng cho `dat-lich-hen.html`, `nhac-bao-duong.html`, form đánh giá ở
  `san-pham-chi-tiet.html` (form liên hệ ở `index.html` dùng Formspree riêng, có chống spam sẵn nên
  không áp dụng); backend verify fail-open nếu thiếu `RECAPTCHA_SECRET_KEY`
- [x] Kiểm tra không có API key/secret nào lộ trong code client-side hiện tại — **kết quả: sạch**, grep toàn bộ `*.html/*.js/*.css` tìm `api-key/secret/password/token` chỉ khớp các biến/field name phía backend (server-side, không lộ ra client), Formspree endpoint ID không phải secret (thiết kế công khai theo đúng cơ chế Formspree)
- [x] **Đưa site qua Cloudflare** — HOÀN THÀNH 2026-07-27: domain `duchieuauto.vn` mua tại Mắt Bão, đổi nameserver sang Cloudflare, proxy (CDN + chống DDoS) đã bật cho toàn bộ bản ghi
- [x] Làm lại tính năng gửi email quên mật khẩu thật — HOÀN THÀNH 2026-07-27: đổi sang Resend
  (`utils/mailer.js`), domain `duchieuauto.vn` đã verify DKIM/SPF qua Cloudflare, test gửi/nhận
  email thật + reset mật khẩu thành công trên production (`admin.duchieuauto.vn`)
- [x] Đổi đúng đuôi `.webp` cho 5 ảnh sản phẩm nhóm `zestech-box-dx*` hiện đang bị đặt nhầm đuôi `.jpg` — đã làm 2026-07-26
- [x] Đánh giá ảnh hưởng SEO khi nội dung sản phẩm/blog chuyển từ tĩnh sang gọi API — đã làm 2026-07-26, xem báo cáo `danh-gia-seo-chuyen-doi-api-2026-07-26.md`, phát hiện thêm và đã sửa luôn: sitemap.xml cũ thiếu 293 URL sản phẩm

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
**[CẬP NHẬT 2026-07-27]** Domain thật đã trỏ xong (`duchieuauto.vn` qua Cloudflare) - nhưng
QUYẾT ĐỊNH GIỮ NGUYÊN GitHub Pages (frontend) + Render (backend) làm nơi lưu trữ/chạy code, Cloudflare
chỉ đứng vai trò DNS/CDN phía trước, KHÔNG chuyển hẳn sang 1 hosting/VPS mới. 2 mục dưới coi như
không cần làm nữa trừ khi sau này thật sự muốn rời khỏi GitHub Pages/Render (VD cần chạy tiến trình
nền dài hạn mà 2 nền tảng free tier không hỗ trợ tốt):
- [x] Trỏ domain riêng, cấu hình SSL — HOÀN THÀNH 2026-07-27 (xem Phase 2 + ghi chú "lần 27-07")
- [ ] ~~Deploy lại đúng backend Node.js lên hosting mới~~ — không cần, Render vẫn đang phục vụ tốt qua domain thật
- [ ] ~~Gộp frontend + backend cùng 1 domain~~ — không cần, đã tách domain con rõ ràng (`duchieuauto.vn` / `api.duchieuauto.vn` / `admin.duchieuauto.vn`) qua Cloudflare, đủ gọn mà không phải gộp code
- [ ] (Optional, nếu cần) bổ sung giỏ hàng/thanh toán VNPay/Momo — chưa nằm trong phạm vi hiện tại (mô hình dịch vụ lắp đặt tại chỗ, không phải bán lẻ ship COD)

## PHASE 9 — Nâng cấp trải nghiệm & độ tin cậy thương hiệu (nhóm "nội dung tay nghề thật" + "trải nghiệm mượt")

**[MỚI 2026-07-26]** User yêu cầu: ưu tiên tự động chuẩn SEO + GEO (Geo/local SEO và cả
Generative-Engine Optimization - nội dung dễ được AI Overview/ChatGPT trích dẫn), ảnh tự tuỳ
chỉnh đúng tỷ lệ hiển thị, tham khảo chuẩn quốc tế để nâng mặt bằng thiết kế/nội dung, làm theo
trải nghiệm người dùng thật, không lan man.

**Nguyên tắc xuyên suốt:** không tự bịa số liệu/thành tích (đúng quy tắc đã có trong
`huong-dan-viet-content-nhan-vien.md` mục 5) - mọi số liệu (số năm hoạt động, số xe đã phục vụ,
tên/kinh nghiệm kỹ thuật viên) phải do user cung cấp thật, Claude chỉ dựng khung + tự động hoá.

### 9.1 — Nghiên cứu chuẩn quốc tế trước khi thiết kế (input, không phải code)
- [ ] Tham khảo 2-3 trang dịch vụ ô tô uy tín ở nước ngoài (Mỹ/Úc/Anh) qua WebSearch: cấu trúc
  trang "About Us", cách trình bày gallery trước/sau, schema.org họ dùng, cách viết nội dung dễ
  được AI trích dẫn (trả lời trực tiếp ngay đầu đoạn, có số liệu cụ thể, định dạng hỏi-đáp rõ ràng).
  Chỉ học **cấu trúc/định dạng**, không sao chép nội dung (đúng nguyên tắc mục 5 mọi khi).
- [ ] Rút ra 1 khung mẫu áp dụng cho Đức Hiếu Auto - áp dụng ở các mục bên dưới.

### 9.2 — Trang "Về Chúng Tôi" chuẩn SEO + GEO
- [ ] Trang mới `ve-chung-toi.html` - viết theo khối hỏi-đáp trực tiếp ("Đức Hiếu Auto hoạt động
  bao nhiêu năm?", "Phục vụ khu vực nào?"...) để cả Google lẫn AI Overview dễ trích dẫn.
- [ ] Schema.org `AutoRepair`/`Organization` mở rộng (đã có bản cơ bản ở `index.html` từ Phase 5) -
  bổ sung `foundingDate`, `areaServed` (Buôn Ma Thuột + Đắk Lắk và vùng lân cận), `employee`/`founder`
  nếu user muốn nêu tên kỹ thuật viên chính.
- [ ] **Cần từ user (không tự bịa):** số năm hoạt động thật, số xe/khách đã phục vụ (ước tính thật),
  tên + kinh nghiệm kỹ thuật viên chính (nếu muốn nêu), ảnh xưởng + đội ngũ thật (không dùng ảnh AI/stock).

### 9.3 — Portfolio "Dự Án Đã Làm" theo dịch vụ (tái dùng hạ tầng blog có sẵn, không tạo bảng mới)
- [ ] Thêm 1 danh mục bài viết riêng "Dự Án Đã Làm" trong hệ thống Tin Tức hiện có (tái dùng
  `posts` + `routes/posts.js` đã có sẵn CRUD/rich-text/upload ảnh - không cần bảng DB mới, đúng
  tinh thần không tạo trừu tượng thừa khi cái cũ đã đáp ứng đủ).
  - Mỗi bài: ảnh trước/sau (2 ảnh), dịch vụ liên quan, khu vực khách hàng (phục vụ GEO local).
- [ ] Trang liệt kê riêng (lọc theo danh mục này) đặt link ngay trong mỗi trang dịch vụ liên quan
  (category-chi-tiet.html) - khách xem dịch vụ thấy ngay ví dụ thực tế, không phải tìm ở trang khác.
- [ ] **Cần từ user:** ảnh trước/sau thật của các dự án đã làm (càng nhiều dịch vụ càng tốt).

### 9.4 — Pipeline ảnh tự động chuẩn hoá (dùng Cloudinary transformation có sẵn, không viết xử lý ảnh riêng)
- [ ] Cấu hình Cloudinary transformation preset (crop theo tỷ lệ chuẩn khớp từng vị trí hiển thị:
  vuông cho thumbnail, 16:9 cho ảnh bìa, giữ nguyên tỷ lệ gốc cho before/after) ngay trong URL trả
  về từ `routes/uploads.js` - Cloudinary xử lý tự động phía server của họ, không cần cài thêm thư
  viện xử lý ảnh (sharp/canvas) ở backend, tận dụng dịch vụ đã có sẵn.
- [ ] Auto alt text theo template ghép chữ (không phải AI mô tả ảnh): `"{tên dịch vụ/sản phẩm} tại
  Đức Hiếu Auto Buôn Ma Thuột"` - tự sinh khi admin nhập tên, không cần gõ tay, chuẩn cả SEO ảnh
  lẫn ngữ cảnh cho AI/GEO.
- [ ] Watermark logo nhỏ góc ảnh (mục đã hoãn ở Phase 2) - làm gộp luôn ở bước này vì cùng pipeline
  Cloudinary transformation, không tốn thêm công sức riêng.

### 9.5 — [PHÁT HIỆN ĐÃ LÀM XONG TỪ TRƯỚC, xác minh 2026-07-28] Trải nghiệm cuộn trang
- [x] Counter animation - đã có sẵn trong `index.html` (dùng đúng `IntersectionObserver` +
  `requestAnimationFrame`, easing, `unobserve` sau khi chạy 1 lần - đúng kỹ thuật đã đề ra).
- [x] Fade-in từng section khi cuộn tới - đã có sẵn qua thư viện AOS (`data-aos` trên hero/about/
  brand-marquee...), khác thuần `IntersectionObserver` như dự tính ban đầu nhưng đạt cùng mục đích,
  đã dùng nhất quán toàn site nên không viết lại bằng cách khác (tránh 2 cơ chế fade-in song song).

### 9.6 — [PHÁT HIỆN PHẦN LỚN ĐÃ LÀM XONG TỪ TRƯỚC + HOÀN THÀNH PHẦN CÒN LẠI 2026-07-28]
- [x] `Service` schema riêng từng trang danh mục - đã có sẵn (`injectServiceSchema()` trong
  `catalog-render.js`, kèm `areaServed: ["Buôn Ma Thuột", "Đắk Lắk"]`).
- [x] `BreadcrumbList` schema cho trang con (sản phẩm/danh mục/thương hiệu/bài viết) - đã có sẵn
  (`injectBreadcrumbSchema()` trong `catalog-render.js` + `blog-render.js`), gắn ở 7 vị trí.
- [x] Rà soát meta description toàn site - THẬT SỰ CÒN THIẾU, đã làm 2026-07-28: `san-pham.html` và
  `brand-san-pham.html` thiếu hẳn thẻ meta description (đã thêm); `faq.html`, `nhac-bao-duong.html`
  có description nhưng thiếu từ khoá khu vực (đã bổ sung "Buôn Ma Thuột"); 2 danh mục động
  (`android-box-o-to`, `camera-hanh-trinh`) cũng thiếu từ khoá khu vực, đã sửa qua API. `so-sanh.html`
  và `404.html` đã `noindex` sẵn nên không cần. Blog post không theo quy ước nhắc khu vực trong
  `meta_description` (đúng theo mẫu 4 bài cũ đã có từ trước) - giữ nguyên, không tạo lệ khác biệt.

**Thứ tự đề xuất khi bắt đầu:** 9.1 (nghiên cứu) → 9.4 (pipeline ảnh, làm 1 lần dùng mãi) → 9.6
(SEO/GEO, không cần chờ nội dung mới) có thể làm ngay bằng dữ liệu hiện có. Riêng 9.2 và 9.3 phải
**chờ user cung cấp thông tin/ảnh thật** mới làm được (không thể tự bịa số liệu/ảnh).

## PHASE 10 — Tích hợp dữ liệu quảng cáo Facebook/TikTok (ĐANG LÀM DỞ - code xong, chờ thiết lập Facebook App Dashboard)

**[CẬP NHẬT 2026-07-27]** User chọn **Hướng B** (nhận Lead Ads). Đã code xong hoàn toàn phần backend:

- [x] `routes/leads.js` - webhook Facebook (`GET/POST /api/leads/facebook`: verify challenge-response,
  verify chữ ký `X-Hub-Signature-256` bằng HMAC-SHA256, gọi Graph API lấy chi tiết lead từ
  `leadgen_id`, lưu vào `contacts` với `type='facebook_lead'`) + khung webhook TikTok tương tự
  (`GET/POST /api/leads/tiktok`, đánh dấu rõ cần đối chiếu lại tài liệu TikTok thật khi có app thật).
- [x] `server.js` - mount `/api/leads`, thêm `express.json({verify: ...})` lưu `rawBody` để tính HMAC.
- [x] `.env.example` - thêm chỗ cho `FB_VERIFY_TOKEN`, `FB_APP_SECRET`, `FB_PAGE_ACCESS_TOKEN`,
  `TIKTOK_VERIFY_TOKEN`. **Chưa set giá trị thật trên Render** - chờ xong phần dưới mới có giá trị.
- [x] `admin/lien-he.html` - thêm nhãn hiển thị `facebook_lead`/`tiktok_lead` trong danh sách liên hệ.

**Đang dở (phía user, trên Facebook App Dashboard):**
- [x] B1 - Tạo app "Duc Hieu Auto CRM" trên Meta for Developers - đã tạo xong.
- [ ] **B2 - Thiết lập Webhooks** - ĐANG BỊ KẸT: sidebar app hiện chỉ có sẵn product "Đăng nhập bằng
  Facebook", chưa thấy Webhooks. Đã hướng dẫn thử vào mục "Trường hợp sử dụng" (giao diện Meta bản
  mới gộp việc thêm sản phẩm vào đây thay vì nút "+ Add Product" cũ) nhưng **chưa có phản hồi tiếp
  theo từ user** - cần chụp màn hình trang "Trường hợp sử dụng" ở lần làm tiếp theo vì giao diện Meta
  đổi khá thường xuyên, cần thấy đúng bản user đang có mới chỉ được chính xác nút bấm.
- [ ] B3 - Lấy App Secret (Cài đặt ứng dụng → Cơ bản → App Secret) - chưa làm, phải xong B2 trước.
- [ ] B4 - Lấy Page Access Token qua System User (cần quyền `leads_retrieval`) - chưa làm.
- [ ] B5 - Kết nối đúng Fanpage/form Lead Ads thật đang chạy quảng cáo - chưa làm.
- [ ] Set `FB_VERIFY_TOKEN`/`FB_APP_SECRET`/`FB_PAGE_ACCESS_TOKEN` thật trên Render sau khi có đủ B2-B4.

**Bối cảnh giữ nguyên (không đổi):** user muốn sau này liên kết Facebook và TikTok vào để "xử lý
data" - đã phác trước 2 hướng phổ biến nhất để không phải nghiên cứu lại từ đầu khi bắt tay vào:

- **Hướng A - Facebook/TikTok Conversion API (gửi dữ liệu ĐI):** mỗi khi khách gửi form liên hệ/
  đặt lịch/mua hàng trên site, gửi kèm 1 sự kiện (VD "Lead", "Booking") về Facebook Conversion API
  và TikTok Events API - giúp thuật toán quảng cáo nhắm đúng đối tượng hơn, đo hiệu quả quảng cáo
  chính xác hơn (khắc phục việc trình duyệt chặn cookie/pixel phía client). Cần: Facebook
  Pixel ID + Access Token, TikTok Pixel Code + Access Token (Ads admin tự lấy từ Meta/TikTok
  Ads Manager), thêm 1-2 hàm gọi API trong `routes/contacts.js` sau khi lưu contact thành công.
- **Hướng B - Nhận Lead Ads (dữ liệu VỀ):** nếu chạy quảng cáo dạng "Lead Ads" (form điền ngay
  trên Facebook/TikTok, không dẫn về site), cần đăng ký webhook để 2 nền tảng đó chủ động gửi
  data lead mới về hệ thống - phức tạp hơn Hướng A (cần xác minh webhook, xử lý theo đúng chuẩn
  từng nền tảng).

**Về đề xuất dùng Supabase cho phần này:** có thể dùng, nhưng cân nhắc kỹ trước khi chọn so với
cách đơn giản hơn là thêm route mới ngay trong backend Express hiện tại:
- Nếu chỉ làm Hướng A (gửi sự kiện đi) - **không cần Supabase**, chỉ cần thêm vài dòng gọi API
  trong route `contacts.js`/`reviews.js` đã có sẵn, dùng chung Turso/activity log hiện tại. Thêm
  cả 1 nền tảng (Supabase) chỉ để làm việc này là dư thừa, tăng chi phí vận hành/bảo trì không cần
  thiết cho 1 việc nhỏ.
- Nếu làm Hướng B (nhận webhook) và có nhu cầu **thật sự cần chạy tách biệt khỏi backend chính**
  (VD lo webhook dồn dập ảnh hưởng tới site chính, hoặc muốn 1 nơi lưu riêng dữ liệu quảng cáo
  không lẫn với dữ liệu vận hành cửa hàng) - lúc đó Supabase (cụ thể là Edge Functions nhận
  webhook + Postgres lưu riêng) là lựa chọn hợp lý, tách bạch rõ ràng.
- **Khuyến nghị:** bắt đầu bằng Hướng A trong chính backend hiện tại (rẻ, nhanh, ít rủi ro) trước,
  chỉ cân nhắc thêm Supabase nếu nhu cầu thực tế phát sinh (VD sau này thật sự chạy Lead Ads).

**[ĐÃ CHỐT]** User chọn Hướng B, không dùng Supabase (đúng khuyến nghị - tái dùng bảng `contacts`
sẵn có). Việc còn lại chỉ là hoàn tất B2-B5 ở trên trên Facebook App Dashboard thật.

---

## PHASE 11 — Phát triển danh mục/nội dung dựa trên nghiên cứu đối thủ (tiếp nối Phase 9)

**[MỚI 2026-07-27]** Sau khi khảo sát 4 đối thủ (Auto365, MAST, AKauto, Thế Giới Đồ Chơi Ô Tô) và
kiểm tra lại dữ liệu thật (242 sản phẩm/8 danh mục - **không có danh mục nào trống**, nhầm lẫn ban
đầu do đếm thiếu cấp `brand.types[].products`), chốt 7 hạng mục phát triển. Áp dụng đúng nguyên
tắc SEO+GEO và pipeline ảnh đã định nghĩa ở Phase 9 (9.1/9.4/9.6), không định nghĩa lại từ đầu.

**Nguồn ảnh:** KHÔNG tải/chỉnh sửa ảnh từ website đối thủ (kể cả xoá watermark) - rủi ro bản quyền
thật. Ưu tiên ảnh chính hãng từ nhà phân phối/nhà sản xuất (Pioneer, JBL, VIETMAP, 3M...) - vốn
được cung cấp sẵn cho đại lý dùng quảng cáo, hoặc ảnh thật do user chụp tại cửa hàng.

**Thứ tự triển khai - chia theo mức độ cần input từ user:**

### Đợt 1 - làm ngay được, đã đủ dữ liệu thật trong DB (không cần chờ user)

**11.1 — [ĐIỀU CHỈNH sau khi kiểm tra thật] Bổ sung FAQ cho 8 trang danh mục, KHÔNG viết lại nội
dung SEO hiện có**
- Kiểm tra trực tiếp `seo_title`/`seo_meta_description`/`seo_intro`/`category_sections` của cả 8
  danh mục qua `/api/products/catalog` (2026-07-27): nội dung đã tốt sẵn - cụ thể, có chuyên môn
  thật, không sáo rỗng/AI (VD đoạn DSP/cách âm 2 lớp Butyl ở danh mục Âm Thanh) - **không cần viết
  lại**, tránh phá nội dung tốt đã có.
- Khoảng trống thật duy nhất giống nhau ở cả 8/8 danh mục: **`category_faqs` = 0 câu hỏi**. Đây là
  định dạng hỏi-đáp trực tiếp giúp AI (ChatGPT, Google AI Overview) dễ trích dẫn nhất theo đúng
  nguyên tắc GEO đã thống nhất ở Phase 9.1, hiện chưa danh mục nào có.
- Việc cần làm: viết 3-5 câu hỏi FAQ thật cho mỗi danh mục (dựa trên nội dung/chuyên môn đã có sẵn
  trong `seo_intro`/`category_sections`, không bịa thêm số liệu mới), lưu qua
  `POST /api/products/admin/categories/:id/faqs` (route đã có sẵn).
- Làm mẫu 1 danh mục trước cho user duyệt, rồi mới làm hàng loạt 7 danh mục còn lại.
- **[x] HOÀN THÀNH 2026-07-27** - đã đăng đủ 4 FAQ/danh mục cho cả 8/8 danh mục (32 câu hỏi), xác
  minh qua `/api/products/catalog` production. User duyệt mẫu danh mục Âm Thanh trước, góp ý sửa
  2 câu hỏi (cách âm dán cửa có đủ chưa, so sánh 4 loa vs 8-10 loa) trước khi làm hàng loạt.

**11.2 — CTA "Đặt Lịch Hẹn" / "Nhắc Bảo Dưỡng" nổi bật trên trang chủ**
- Thêm 1 khối CTA 2 nút lớn vào `index.html` (giữa/sau section `#service` hoặc `#tech`), dẫn tới
  `dat-lich-hen.html`/`nhac-bao-duong.html` - đây là 2 tính năng đối thủ không có nhưng hiện đang
  chìm trong menu, cần thuần HTML/CSS tái dùng class nút sẵn có, không cần JS mới.

### Đợt 2 - cần input nhỏ từ user trước khi làm

**11.3 — [ĐIỀU CHỈNH + HOÀN THÀNH 2026-07-28] Bổ sung 4 bài blog mới**
- User không cung cấp câu hỏi khách thật hay hỏi (2 lần nhắc "Tiếp tục" không kèm thông tin) -
  chuyển hướng an toàn: viết bài dạng giáo dục/kỹ thuật mở rộng trực tiếp từ đúng nội dung
  `seo_intro`/`category_sections` đã kiểm chứng ở mục 11.1 (không đóng khung "khách từng hỏi",
  không bịa tình huống/số liệu mới) - vẫn đúng nguyên tắc không tự bịa nội dung.
- Ưu tiên 4 danh mục CHƯA có bài blog nào (Màn Hình, Android Box, Camera Hành Trình, Đồ Bán Tải) -
  4 bài cũ trước đó đã phủ Âm Thanh/Đèn/Film Cách Nhiệt/PPF.
- Ảnh bìa dùng ảnh sản phẩm thật đã có sẵn trong từng danh mục (VD Zestech ZX10, VIETMAP SC620) -
  không dùng ảnh stock, tránh đúng vấn đề phát hiện ở mục 11.4 bên dưới.
- Đã đăng cả 4 bài qua `POST /api/posts`, xác minh hiển thị đúng tiếng Việt trên
  `https://duchieuauto.vn/tin-tuc.html`.

**11.4 — [TẠM DỪNG, phát hiện vấn đề mới] Thay ảnh hero + ảnh minh hoạ trang chủ**
- Ảnh chính trong gallery "Về Đức Hiếu Auto" (`about-image .main`) là ảnh stock Unsplash - đúng
  như nhận định ban đầu.
- **Phát hiện thêm khi tìm ảnh thay thế (2026-07-28):** toàn bộ ảnh trong `assets/images/about/`
  (`detail-1.jpg`, `detail-2.jpg`) và các thư mục placeholder `assets/images/service/*` (từ Phase 1,
  chưa nối vào category thật) **cũng đều là ảnh stock nước ngoài** - nghiêm trọng nhất là
  `service/phu-ceramic/poster.jpg` có in rõ logo thương hiệu thật "Ceramic Pro" trên áo kỹ thuật
  viên, dùng sẽ ngầm khẳng định sai sự thật. May là ảnh này chưa từng được nối vào category thật
  nào (chỉ nằm trong thư mục placeholder, không hiển thị công khai) - không phải lỗi đang sống,
  nhưng TUYỆT ĐỐI không dùng để thay ảnh mới.
- **Quyết định:** không tự thay ảnh stock này bằng ảnh stock khác (không giải quyết được vấn đề
  gốc). Giữ nguyên hiện trạng, chờ user cung cấp ảnh thật (xe khách/cửa hàng/kỹ thuật viên đang thi
  công) - không có cách nào khác để tôi tự làm phần này mà không vi phạm nguyên tắc không bịa nội
  dung/hình ảnh sai sự thật.
- **Lưu ý cho việc dọn dẹp sau này (không khẩn):** rà lại toàn bộ ảnh stock trong
  `assets/images/about/` và `assets/images/service/*` trước khi Phase 11.6 (danh mục Chăm Sóc Xe)
  bắt đầu - vài thư mục ở đây (`phu-ceramic`, `phu-gam-oto`) trùng đúng ý tưởng danh mục mới, nhưng
  ảnh trong đó không dùng được, cần ảnh thật khác.

### Đợt 3 - cần input lớn (dữ liệu kinh doanh thật), chưa thể tự code

**11.5 — Công cụ "Tìm phụ kiện theo xe" (hãng → dòng xe)**
- Kỹ thuật: thêm cột `compatible_vehicles` vào bảng `products` (migration nhỏ), thêm ô nhập trong
  `admin/san-pham-form.html`, thêm bộ lọc 2 cấp trên `san-pham.html` (lọc client-side trong dữ
  liệu catalog đã tải, không cần API riêng).
- **Cần từ user quyết định trước:** mức độ chi tiết mong muốn (lọc theo hãng xe thôi, hay tới từng
  dòng xe cụ thể) - ảnh hưởng trực tiếp khối lượng nhập liệu cho 73+ sản phẩm hiện có, nên chốt
  trước khi làm để không phải nhập lại.

**11.6 — [HOÀN THÀNH 2026-07-28] Danh mục mới "Chăm Sóc Xe - Detailing"** (rửa xe, vệ sinh nội
thất, vệ sinh khoang máy, đánh bóng xe, phủ ceramic, vệ sinh dàn lạnh)
- User xác nhận quy trình detailing giống ~95% giữa các tiệm trong ngành nên cho phép viết nội
  dung theo kiến thức chung ngành (không copy nguyên văn đối thủ), tối ưu SEO/GEO cho từ khoá địa
  phương ("rửa xe tại Đắk Lắk/Buôn Ma Thuột"...), và cho dùng ảnh minh hoạ nước ngoài (không phải
  ảnh thật cửa hàng) miễn không lộ logo thương hiệu khác.
- Kỹ thuật: thêm route `POST /api/products/admin/categories` (chưa có trước đây, chỉ có PUT sửa -
  8 danh mục cũ coi là cố định) để tạo category qua đúng CMS thay vì chèn thẳng DB.
- Đã tạo: category `cham-soc-xe` + brand "Dịch Vụ Detailing" + 6 sản phẩm/dịch vụ + 4 FAQ + SEO
  title/meta/intro đầy đủ. Giá tạm để **"Liên hệ"** (giá trị đã dùng sẵn ở nơi khác trong hệ thống
  cho sản phẩm giá biến động) vì chưa có giá thật - **cần user cập nhật giá thật qua admin sau**.
- Ảnh: 6 ảnh Pexels/Unsplash (giấy phép miễn phí thương mại) đã rà từng ảnh loại bỏ các ảnh dính
  logo thương hiệu khác (VD "Ceramic Pro", "TORQUE Detail", "VPROTEC/COATINGBAY") trước khi chọn.
- **[MỚI] Mô tả chi tiết (detail_content) cho cả 9 dịch vụ** (6 Chăm Sóc Xe + 3 Đổi Màu Nội Thất) -
  tham khảo nội dung thật từ các trang dịch vụ AKauto (rửa xe, vệ sinh nội thất/khoang máy, đánh
  bóng, phủ ceramic, vệ sinh dàn lạnh, bọc ghế/trần/táp-lô da) để nắm quy trình/kỹ thuật chuẩn
  ngành, sau đó viết lại hoàn toàn bằng lời riêng - KHÔNG dùng tên thương hiệu sản phẩm cụ thể của
  AKauto (Chemical Guys, Kubebond...) vì đó là lựa chọn nhà cung cấp riêng của họ, không phải của
  Đức Hiếu Auto, và KHÔNG copy giá/thời hạn bảo hành của họ vì đó là chính sách kinh doanh riêng.
- **[MỚI] Cải tổ điều hướng cho danh mục 1 thương hiệu:** phát hiện category-chi-tiet.html và
  dropdown "Sản Phẩm" bắt khách bấm qua bước chọn thương hiệu ("Dịch Vụ Detailing") dù chỉ có 1
  lựa chọn duy nhất - đã sửa `catalog-render.js` để tự động bỏ qua bước này, hiện thẳng danh sách
  sản phẩm khi `brands.length === 1` (áp dụng chung, không riêng "Chăm Sóc Xe", nên "Đổi Màu Nội
  Thất" cũng được hưởng lợi luôn). Đồng thời thêm "Chăm Sóc Xe - Detailing" vào carousel "Dịch Vụ"
  trên trang chủ, đứng ngay trước nhóm "Nội Thất Ô Tô" (cùng cách "Đồ Bán Tải" đã được thêm riêng).

**11.7 — [ĐỔI HƯỚNG, HOÀN THÀNH 2026-07-28] "Đổi Màu Nội Thất"** (bọc ghế da, bọc trần da, bọc da
táp-lô) thay vì "Phụ Kiện Tiện Ích" ban đầu đề xuất
- User tách lại nhóm dịch vụ theo đúng thực tế kinh doanh: 3 mục bọc da tách thành danh mục riêng
  "Đổi Màu Nội Thất" thay vì gộp chung "Chăm Sóc Xe" như đề xuất ban đầu của Claude. Nhóm "Phụ Kiện
  Tiện Ích" (móc khóa, nước hoa xe...) CHƯA làm - vẫn giữ nguyên trạng thái chờ user xác nhận có
  thật sự kinh doanh nhóm này không.
- Đã tạo: category `doi-mau-noi-that` + brand "Dịch Vụ Bọc Da" + 3 sản phẩm + 4 FAQ + SEO đầy đủ,
  giá tạm "Liên hệ" (cần cập nhật giá thật).

**[MỚI 2026-07-28] Rà soát lại ảnh poster 8 danh mục cũ (phát sinh ngoài kế hoạch ban đầu)** - user
yêu cầu mỗi ảnh phải "nhìn phát biết ngay danh mục nào", tốt nhất là cận cảnh sản phẩm/dịch vụ
nhưng vẫn thấy được xe (mẫu chuẩn: ảnh PPF-Wrap hiện có). Rà cả 8 ảnh, phát hiện 5 vấn đề:
- **Màn Hình Ô Tô:** lộ tên đài phát thanh thật "Narodni Radio" trên màn hình - đánh giá rủi ro
  thấp (chỉ là nội dung ngẫu nhiên, không phải thương hiệu cạnh tranh) - **giữ nguyên** sau nhiều
  lần tìm ảnh thay thế đều dính vấn đề khác (đồng hồ sau vô-lăng thay vì màn hình trung tâm, hoặc
  giao diện độc quyền Tesla).
- **Âm Thanh:** ảnh loa JBL cô lập nền đen, không thấy xe - **đã thay** bằng ảnh loa lắp trong cửa
  xe (Pexels).
- **Android Box:** lộ nhầm thương hiệu "BTV" (không phải hãng đang bán) - **đã thay** bằng ảnh sản
  phẩm thật VIETMAP BS10 đã có sẵn trong catalog.
- **Camera Hành Trình:** chỉ thấy nguyên xe Tesla, không thấy camera - **đã thay** bằng ảnh sản
  phẩm thật VIETMAP SC620 (có bối cảnh đường xá trên màn hình sản phẩm).
- **Đồ Bán Tải:** xe bán tải chung chung, không thấy phụ kiện cụ thể - **đã thay** bằng ảnh nắp
  thùng Aeroklas lắp trên Ford Ranger WildTrak thật (khớp chính xác ví dụ user đưa ra).
- Giữ nguyên (đã đạt chuẩn từ trước): Film Cách Nhiệt, PPF - Wrap Đổi Màu, Nâng Cấp Ánh Sáng.

**Hạng mục tạm gác (không đưa vào Phase này):** dịch vụ lắp đặt tại nhà - là quyết định vận hành/
kinh doanh (nhân sự, tính phí di chuyển...), không phải việc code, chỉ làm phần hiển thị web sau
khi user xác nhận có triển khai thật.

### Checklist tổng hợp - đang chờ user (2026-07-28), Claude không tự làm tiếp được nếu thiếu

Đã làm hết phần tự làm được (11.1, 11.2, 11.3). 4 mục dưới đây **đều thật sự cần input từ user**,
không phải Claude ngại làm - tự bịa số liệu/dịch vụ/ảnh cho 1 cửa hàng thật là sai nguyên tắc cốt
lõi của dự án (xem `huong-dan-viet-content-nhan-vien.md` mục 5), có thể khiến khách hiểu sai giá/
dịch vụ/hình ảnh thật của cửa hàng:

- [ ] **11.4 - Ảnh thật:** ảnh xe khách/cửa hàng/kỹ thuật viên đang thi công (thay ảnh stock ở mục
  "Về Đức Hiếu Auto"). Không có ảnh thật thì để nguyên hiện trạng, không thay bằng ảnh stock khác.
- [ ] **11.5 - Quyết định mức độ lọc xe:** lọc "tìm phụ kiện theo xe" theo hãng xe (Ford, Toyota...)
  hay tới từng dòng xe cụ thể (Ford Ranger, Toyota Vios...)? Ảnh hưởng khối lượng nhập liệu cho
  73+ sản phẩm. Riêng danh mục Đồ Bán Tải đã có sẵn tên xe trong tên sản phẩm (VD "Ford Ranger
  WildTrak 2023") - có thể tận dụng ngay, các danh mục khác (âm thanh, màn hình...) chưa có dữ liệu
  xe cụ thể vì bản chất đa số sản phẩm dùng chung cho nhiều dòng xe.
- [x] **11.6/11.7 - HOÀN THÀNH** (xem chi tiết ở mục 11.6/11.7 phía trên) - 2 danh mục mới "Chăm
  Sóc Xe" (6 dịch vụ) và "Đổi Màu Nội Thất" (3 dịch vụ) đã lên production đầy đủ nội dung/ảnh/FAQ.
- [x] **11.8 - HOÀN THÀNH 2026-07-28 - Danh mục "Phụ Kiện Tiện Ích"** (tách riêng khỏi 11.7 ban đầu
  vì user đổi hướng dùng slot đó cho "Đổi Màu Nội Thất"). User chốt danh sách sau khi xem khảo sát
  22 nhóm sản phẩm từ Thế Giới Đồ Chơi Ô Tô (link tham khảo, không copy nội dung): chỉ chọn 6/22 -
  giá đỡ điện thoại, tẩu sạc/bộ chia tẩu sạc, bảng số điện thoại, nước hoa ô tô (CHỈ Areon), bơm lốp
  cứu hộ đa năng, bọc vô lăng. Đã tạo 4/6 (giá đỡ điện thoại, tẩu sạc, nước hoa Areon - dùng ảnh
  chính hãng từ areon-fresh.us vì user yêu cầu chỉ bán Areon, bọc vô lăng) với brand "Areon" tách
  riêng brand "Phụ Kiện Tiện Ích" cho 3 món còn lại. **2 món chưa đăng: Bảng Số Điện Thoại, Bơm Lốp
  Cứu Hộ Đa Năng** - không tìm được ảnh minh hoạ đáng tin cậy (free stock), nên chờ ảnh thật từ nhà
  cung cấp cụ thể khi user nhập hàng (chính xác hơn ảnh chung chung).
- [ ] **Giá thật cho 13 sản phẩm/dịch vụ mới** (6 Chăm Sóc Xe + 3 Đổi Màu Nội Thất + 4 Phụ Kiện
  Tiện Ích) - đang để tạm "Liên hệ", cần user cập nhật giá thật qua trang admin `san-pham.html`.
- [ ] **2 sản phẩm Phụ Kiện Tiện Ích còn thiếu ảnh:** Bảng Số Điện Thoại, Bơm Lốp Cứu Hộ Đa Năng -
  cần ảnh thật từ nhà cung cấp/sản phẩm thật khi nhập hàng.

**Cách làm tiếp:** không cần cung cấp đủ cả 4 mục cùng lúc - mục nào có thông tin trước, báo trước,
Claude làm ngay mục đó, không cần chờ đủ hết.

**[MỚI 2026-07-28] Bài học quan trọng - đổi quy trình: demo local trước khi push, không đẩy thẳng
lên production nữa cho các thay đổi giao diện/JS.** User báo "lỗi tùm lum" sau loạt thay đổi
11.1-11.8 - rà lại bằng Chrome headless (`--headless=new --user-data-dir=<thư mục tạm riêng>` để
không đụng profile Chrome thật của user) + chụp ảnh màn hình thật, phát hiện và sửa:
- **Mega-menu "Dịch Vụ" ở header (HTML tĩnh lặp lại 12 trang) bị bỏ sót** khi thêm "Chăm Sóc Xe" -
  trước đó chỉ sửa carousel trang chủ (JS/API), quên mất menu header là markup tĩnh RIÊNG, không
  chung nguồn dữ liệu.
- **Mega-menu tràn/lệch màn hình** qua 3 vòng chỉnh CSS: (1) cột bị ép rộng bằng nhau gây tràn khi
  thêm cột mới → cho `flex-wrap: wrap` + `max-width` theo viewport; (2) canh trái theo đúng vị trí
  chữ "Dịch Vụ" thay vì canh giữa trang → đổi mốc định vị sang `.header-inner` (đúng vùng nội dung
  trang, max-width 1200px) thay vì thẻ `<li>`; (3) cột bị ép bằng nhau (flex:1) khiến cột chữ dài
  tràn sang cột bên - đổi `flex: 0 1 auto` để mỗi cột tự rộng theo đúng nội dung, rồi tăng
  `max-width` mega-menu lên 1020px để đủ chỗ 4 cột cùng hàng.
- **30 ảnh sản phẩm bị vỡ** (hiện chữ alt text thay vì ảnh) - lỗi hệ thống có thật, không phải chỉ
  do phase này: code luôn yêu cầu file `-400w` (bản ảnh nhỏ cho `srcset`) nhưng KHÔNG kiểm tra file
  đó có tồn tại hay không. 13 ảnh mới (Phase 11.6-11.8) thiếu bản này vì chưa chạy
  `scripts/generate-responsive-images.js`; phát hiện thêm **17 ảnh sản phẩm THẬT đã có từ trước**
  (JBL, VIETMAP) cũng bị lỗi y hệt - có thể đã vỡ trên production một thời gian mà chưa ai để ý,
  đặc biệt 2 ảnh vừa được chọn làm poster thay thế (VIETMAP SC620, BS10). Đã chạy script fix hàng
  loạt + copy tay 1 ảnh quá nhỏ (Areon, 445px, dưới ngưỡng script tự tạo bản nhỏ).
- **Nút "Xem Thêm" ở mô tả chi tiết sản phẩm phản hồi không rõ ràng** - code đo chiều cao nội dung
  bằng `requestAnimationFrame` ngay sau khi set `innerHTML`, TRƯỚC KHI web font (Bebas Neue/Poppins)
  chắc chắn đã tải xong - đo lúc font hệ thống tạm thời hiển thị có thể ra kết quả khác với sau khi
  font thật load xong, khiến trạng thái nút/nội dung không khớp. Sửa dùng `document.fonts.ready`
  trước khi đo - ảnh hưởng tốt tới TOÀN BỘ trang chi tiết sản phẩm, không riêng phase này.
- **[QUAN TRỌNG] Đã push đủ 3 fix trên nhưng user báo web thật vẫn y nguyên lỗi cũ** - hoá ra do
  `sw.js` (Service Worker, cache PWA) dùng `CACHE_NAME` cố định `"dha-static-v1"` không bao giờ đổi
  qua các lần deploy trước đó. Service Worker cache nằm NGOÀI phạm vi cache HTTP thường - **Ctrl+
  Shift+R không xoá được**, khiến trình duyệt tiếp tục phục vụ CSS/JS/ảnh cũ đã lưu dù server đã có
  bản mới. Đã đổi `CACHE_NAME` sang `"dha-static-v2"` để buộc xoá sạch cache cũ (logic `activate`
  đã có sẵn tự xoá cache tên cũ khi thấy đổi tên). **Bài học ghi nhớ: mỗi lần deploy có sửa CSS/JS/
  ảnh tĩnh quan trọng, phải tăng số bản `CACHE_NAME` trong `sw.js`** - nếu không, user có thể vẫn
  thấy bản cũ dù server đã đúng, gây nhầm lẫn tưởng fix chưa có tác dụng.

**[MỚI 2026-07-28] Công cụ CMS sửa toàn bộ nội dung chữ/ảnh trang chủ + gom nhóm menu admin.**
User yêu cầu: (1) sửa được Hero/Giới Thiệu trước (đã làm, xem mục trước), (2) mở rộng ra sửa được
"bất cứ chỗ nào" trên trang chủ kể cả ảnh, dưới dạng công cụ dùng lại được chứ không vá cứng từng
chỗ, mỗi mục tách riêng ra để dễ hiểu/dễ sửa, chữ có sẵn phải hiện sẵn trong ô (không phải gõ lại từ
đầu); (3) gom nhóm thanh điều hướng trên cùng của trang admin (đang liệt kê phẳng 12 mục quá tải).
- **Cơ chế generic (không hardcode JS map nữa):** `assets/js/homepage-content.js` viết lại thành quét
  `document.querySelectorAll("[data-content-key]")`/`[data-content-image-key]`/`[data-content-count-key]`
  thay vì object map cứng id↔key như bản đầu. Từ nay thêm 1 chỗ sửa được mới chỉ cần gắn thuộc tính
  `data-content-*` vào HTML + thêm khoá vào `ALLOWED_KEYS` (`routes/homepage-content.js`) + thêm ô
  input ở admin - không phải sửa lại file JS này nữa. Bảng `homepage_content` giữ nguyên (không cần
  bảng/route mới), khoá ảnh chỉ là chuỗi URL lưu chung như khoá chữ.
- **Mở rộng phạm vi:** từ 14 khoá (Hero/Giới Thiệu) lên 52 khoá, phủ toàn bộ tiêu đề mục/câu dẫn/mô
  tả/nhãn CTA còn lại (Dịch Vụ, Đặt Lịch Hẹn/Nhắc Bảo Dưỡng, Sản Phẩm Chiến Lược, Giải Mã Công Nghệ,
  Liên Hệ, Footer) + 4 ảnh tĩnh (poster nền Hero, 3 ảnh khối Giới Thiệu). Cố ý KHÔNG đưa vào: số điện
  thoại/địa chỉ/email dạng có href thật (tel/mailto/Maps/Zalo) - sửa chữ hiển thị mà không đồng bộ
  href sẽ gây lỗi âm thầm (nút "Gọi ngay" trỏ sai số), để dành làm riêng kỹ hơn sau; danh sách link
  điều hướng footer/menu (là điều hướng thật, không phải nội dung tiếp thị); thẻ dịch vụ/sản phẩm/
  công nghệ (đã render động từ danh mục/API `/api/homepage` sẵn có, chỉ tiêu đề mục cha là chữ tĩnh
  mới thêm); video nền Hero (chỉ ảnh poster đổi được, đổi hẳn video là việc khác, file nặng hơn).
- **"Chữ có sẵn phải hiện sẵn":** viết `scripts/seed-homepage-content.js` (mẫu như `seed-admin.js`)
  chèn đúng chữ/ảnh THẬT đang hiển thị vào bảng, dùng `ON CONFLICT DO UPDATE ... CASE WHEN value =
  '' THEN excluded.value ELSE value END` (không phải `DO NOTHING` đơn thuần) - chỉ điền lại khoá
  đang rỗng, giữ nguyên khoá admin đã nhập, kể cả khoá đó đang rỗng do lỡ dọn dữ liệu test trước đó.
  Chạy thử lúc test phát hiện tài khoản `admin` thật đã tự lưu thử Hero lúc 14:13 hôm nay - script
  giữ nguyên đúng như mong đợi, không ghi đè mất.
- **Ảnh dùng lại nguyên cơ chế upload đã có** ở `admin/banner.html` (input file → `POST /api/uploads`
  purpose `cover`/`content` → lưu URL Cloudinary trả về vào ô input ẩn) - không phát minh cơ chế mới.
- **Admin `trang-chu.html`** mở rộng thêm 6 khối `.settings-section` mới (Dịch Vụ, Đặt Lịch/Nhắc Bảo
  Dưỡng, chữ đầu khối Sản Phẩm Chiến Lược/Giải Mã Công Nghệ, Liên Hệ, Footer), mỗi trường 1 ô riêng.
  KHÔNG tách thành nhiều trang (hiểu lầm ban đầu khi lập kế hoạch - đã hỏi lại user để sửa đúng ý:
  "gom nhóm" chỉ nói đến thanh điều hướng admin, không phải bố cục trong trang này).
- **Gom nhóm `renderAdminNav()`** (`admin/assets/admin.js`) từ liệt kê phẳng 12 mục sang: "Tổng Quan"
  + "Liên Hệ/Đặt Lịch" (có badge số mới, luôn hiện riêng) đứng ngoài, còn lại gom 3 dropdown "Nội
  Dung"/"Marketing"/"Hệ Thống" theo tính chất công việc - cùng cơ chế hover-mở như `.has-dropdown` ở
  header.css ngoài web công khai, chỉ đổi màu cho khớp nền tối topbar. Nhãn nhóm cha tự tô sáng khi
  trang đang mở thuộc nhóm đó.
- **Lỗi thật xảy ra lúc test (không phải chỉ đoán) - lặp lại đúng bài học đã ghi ở lần 10:** lúc dọn
  dữ liệu test, gõ trực tiếp `curl -d '{"footer_copyright":"© 2026 Đức Hiếu Auto..."}'` (có ký tự
  tiếng Việt/©) thay vì ghi ra file trước - Git Bash làm hỏng byte UTF-8 y hệt sự cố lần 10, phát
  hiện ngay qua đọc lại file JSON (không tin output terminal, terminal tự hiển thị sai font). Sửa
  lại đúng bằng file + `--data-binary @file`, xác nhận khôi phục đúng nguyên văn. **Nhắc lại quy tắc
  đã có trong bộ nhớ: không bao giờ gõ tiếng Việt trực tiếp trong `curl -d`, kể cả lệnh "chỉ để dọn
  dữ liệu test" tưởng như vô hại.**
- **Test:** curl round-trip (ghi file JSON, không gõ trực tiếp) + Chrome headless (`--dump-dom`,
  profile cô lập) cho cả trang công khai lẫn trang admin (đăng nhập giả bằng token thật ghi vào
  localStorage qua 1 trang tiêm tạm, xoá ngay sau khi dump xong) - `--dump-dom` KHÔNG phản ánh được
  `.value` runtime của `<input>` text thường (chỉ phản ánh cho `type="hidden"`, do khác biệt thuộc
  tính/property theo chuẩn HTML) nên phải tạm ghi giá trị ra `document.title` để xác minh, xoá đoạn
  debug ngay sau khi xác nhận đúng. Toàn bộ tài khoản/dữ liệu test đều xoá sạch khỏi Turso production
  sau khi xác nhận, không để sót.
- **Chưa test:** upload ảnh thật qua `/api/uploads` (cố ý bỏ qua để không tạo rác trong thư viện
  Cloudinary thật của user) - tin tưởng vì dùng lại y nguyên đoạn code đã chạy thật ở `banner.html`.

**Quy trình mới từ đây:** với thay đổi động (HTML nhiều trang, CSS layout, JS) - dựng server tĩnh
cục bộ (`http://localhost:5500` + backend `http://localhost:4000`), tự kiểm tra bằng Chrome
headless (JS console error + `--screenshot` xem trực quan) trước, mở demo cho user xem bằng
`Start-Process` (mở đúng trình duyệt/máy user, không phải mở hộ), chỉ `git push` sau khi user xác
nhận qua demo - không tự đẩy thẳng lên production như trước.

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

**2026-07-26 (lần 8)** — Sửa lỗi đăng nhập production thật (CORS), phát hiện Render chặn SMTP, bỏ tính năng gửi email quên mật khẩu, đẩy toàn bộ phần việc bị sót lên GitHub.
- **Task:** User báo không đăng nhập được trang admin production, kèm ảnh lỗi `Unexpected token '<', "<!DOCTYPE"... is not valid JSON`.
- **Lỗi thật 1 - CORS chặn nhầm đăng nhập:** middleware CORS trong `server.js` ném lỗi khi `Origin` header không khớp allowlist (chỉ có domain GitHub Pages), không ai bắt lỗi đó nên Express trả HTML mặc định thay vì JSON. `curl` không tự gắn `Origin` nên test trước đó "may mắn" pass, còn trình duyệt thật luôn gắn `Origin` (kể cả request same-origin) nên mọi lần đăng nhập qua web đều lỗi. **Sửa:** cho phép origin trùng chính domain server (so sánh theo `host`, không dùng `req.protocol` vì Render/Cloudflare làm sai giá trị này), thêm error handler chung luôn trả JSON. Xác nhận lại bằng curl giả lập Origin trình duyệt - login thành công.
- **Phát hiện thêm:** rất nhiều việc đã làm xong ở buổi trước (Phase 1: 6 trang tĩnh mới, Phase 5: ảnh đã nén, tài liệu) **chưa từng được `git push`** - GitHub Pages công khai chưa hề có các trang này dù kế hoạch ghi "hoàn thành". Đã đẩy đủ 3 commit (ảnh+CSS, trang tĩnh mới+JS, tài liệu) - xác nhận qua curl các trang mới đã lên GitHub Pages (200 OK).
- **Lỗi thật 2 - Render chặn SMTP:** test luồng quên mật khẩu thật trên production, phát hiện request treo >60s cho tài khoản có email (tài khoản không tồn tại thì trả lời <1s - đúng thiết kế, chỉ riêng nhánh gửi mail bị treo). Điều tra qua Render dashboard:
  1. Kiểm tra Environment Variables trên Render - **thiếu hẳn 6 biến** (`CLOUDINARY_*` x3, `ADMIN_BASE_URL`, `GMAIL_USER`, `GMAIL_APP_PASSWORD`) dù tài liệu nội bộ ghi nhầm là "đã cấu hình". User tự thêm qua dashboard.
  2. Thêm timeout cho transporter (10s) - request giờ báo lỗi thay vì treo vô hạn, lộ ra lỗi thật: xem Render Logs thấy `ENETUNREACH` khi kết nối **địa chỉ IPv6** của Gmail (`2404:6800:...`) - mạng outbound Render không route được IPv6.
  3. Thử `family: 4` riêng lẻ - không đủ hiệu lực (nodemailer dùng shorthand `service:"gmail"` bỏ qua). Thử `dns.setDefaultResultOrder("ipv4first")` toàn cục - vẫn không đủ. Cuối cùng dùng option `lookup` tuỳ chỉnh (gọi thẳng `dns.lookup(host, {family:4})`) - hết lỗi ENETUNREACH, nhưng đổi thành lỗi `Connection timeout` đơn thuần ở cổng 465.
  4. Thử đổi sang cổng 587 (STARTTLS) - vẫn `Connection timeout` y hệt. **Kết luận: Render free tier chặn hoàn toàn outbound SMTP (cả 2 cổng)**, không phải lỗi cấu hình hay DNS - đây là giới hạn hạ tầng, không sửa được từ phía code.
- **Quyết định của user:** không chuyển sang dịch vụ email qua API (Resend/Brevo) hay Gmail API OAuth2 ngay - **bỏ hẳn tính năng gửi email quên mật khẩu**, giữ lại cách Super Admin tự đặt lại mật khẩu trực tiếp (đã có sẵn, không đổi). Sẽ làm lại gửi email thật sau khi có domain/hosting riêng (thoát giới hạn Render free tier).
- **Dọn dẹp theo quyết định trên:** xoá `utils/mailer.js`, `admin/quen-mat-khau.html`, `admin/dat-lai-mat-khau.html`; xoá route `PUT /my-email`, `GET /me`, `POST /forgot-password`, `POST /reset-password` khỏi `routes/auth.js`; xoá rate-limit riêng cho `forgot-password` khỏi `server.js`; xoá field/cột Email khỏi `tai-khoan.html` (form đổi mật khẩu, form tạo tài khoản, bảng danh sách - không còn tác dụng gì nếu không gửi được email); gỡ `nodemailer` khỏi `package.json` (dùng `npm uninstall` để đồng bộ `package-lock.json` đúng cách, không sửa tay). Cột `email`/`reset_token`/`reset_token_expires` trong bảng `admins` (Turso) vẫn giữ nguyên, không xoá (tránh rủi ro migration DROP COLUMN trên dữ liệu thật, để đó cũng không hại gì).
- **Cập nhật tài liệu:** `huong-dan-viet-content-nhan-vien.md` (mục 6, 9 - bỏ hướng dẫn quên mật khẩu qua email, thay bằng báo Super Admin), `tai-khoan-va-lien-ket-du-an.md` (mục 3, 4, 7 - đánh dấu Gmail SMTP đã ngưng dùng, lý do cụ thể).
- **Bài học kỹ thuật đáng nhớ:** (1) CORS middleware ném lỗi không bắt = tự biến mọi lỗi thành trang HTML, phải luôn có error handler chung trả JSON cho API; (2) test bằng `curl` không đại diện đúng hành vi trình duyệt thật nếu thiếu header trình duyệt tự gắn (ở đây là `Origin`) - phải chủ động thêm header đó khi tái hiện lỗi; (3) dual-stack DNS (IPv4+IPv6) là nguồn lỗi `ENETUNREACH`/treo kết nối phổ biến trên các host cloud chỉ hỗ trợ IPv4 outbound - `family`/`dns.setDefaultResultOrder` không phải lúc nào cũng đủ, option `lookup` tuỳ chỉnh mới chắc chắn; (4) một số PaaS free tier (Render) chặn hẳn outbound SMTP bất kể cổng - cần dùng email qua HTTP API nếu không có domain/hosting riêng.
- **Bước tiếp theo:** không có việc khẩn - còn lại các mục Phase 2 (minify, watermark, hotlink, reCAPTCHA, Cloudflare) cần quyết định/tài khoản từ user, và việc nhỏ không khẩn (đổi đuôi 5 ảnh webp, đánh giá SEO). Quay lại tính năng gửi email thật khi có domain/hosting riêng.

**2026-07-26/27 (lần 9)** — 2 đợt nâng cấp lớn cho trang quản trị (Tổng Quan theo danh mục, sửa được sản phẩm nổi bật, SEO danh mục, thao tác hàng loạt, xuất/nhập CSV, lịch đăng bài, lịch đặt hẹn theo ngày, thư viện ảnh, tìm kiếm nhanh, cảnh báo nội dung thiếu).
- **Đợt 1 (theo yêu cầu cụ thể của user):** trang-chu.html thêm sửa được sản phẩm (trước chỉ lưu/xoá được, đổi sản phẩm phải xoá-thêm-lại mất vị trí) + nút sắp xếp lên/xuống + bố cục lại thành thẻ; Tổng Quan thêm lưới thống kê theo 8 danh mục kèm link nhanh sang Sản Phẩm/FAQ đã lọc sẵn (`san-pham.html`/`danh-muc.html` hỗ trợ `?category=`); thêm endpoint `GET /admin/categories/overview`.
- **Đợt 2 (5 gợi ý tự đề xuất, user duyệt "Ok, triển khai"):** UI sửa SEO danh mục ở `danh-muc.html` (API đã có từ trước nhưng chưa có giao diện dùng); bulk ẩn/hiện/xoá + Xuất CSV ở Sản Phẩm; nút Xem Trước cho form sản phẩm (theo đúng cơ chế đã có ở form bài viết); Xuất CSV cho Liên Hệ; badge số đỏ liên hệ "Mới" trên menu admin.
- **Đợt 3 (Nhóm A/B theo đề xuất, user duyệt lần lượt):** tìm kiếm nhanh toàn admin (topbar), cảnh báo nội dung thiếu ở Tổng Quan (phát hiện thật: **cả 8 danh mục đều chưa có FAQ nào** dù tính năng đã có sẵn), lọc lịch sử hoạt động theo admin/hành động/ngày, bulk actions cho Bài Viết, Xem Trước cho Banner; rồi lịch đăng bài viết (cột `posts.publish_at`, tự chuyển draft→published bằng cách kiểm tra lười (lazy check) ngay trong các endpoint GET công khai thay vì cron - Render free tier "ngủ" nên cron trong tiến trình không đáng tin cậy), nhập CSV hàng loạt cho sản phẩm (xem trước + validate trước khi tạo), lịch đặt hẹn dạng lưới 6 khung giờ theo ngày ở Liên Hệ (tái dùng endpoint `availability` có sẵn), thư viện ảnh liệt kê toàn bộ ảnh Cloudinary qua `cloudinary.api.resources()` (không cần bảng DB riêng).
- **Lỗi thật tự phát hiện lúc test (không phải chỉ đoán):** thiếu khởi động lại backend local sau khi sửa route (`EADDRINUSE` do tiến trình cũ còn giữ cổng, phải tìm và kill đúng PID); dùng `git mv`/API PUT round-trip kiểm tra dữ liệu SEO danh mục an toàn trước khi ghép vào form.
- **Test:** toàn bộ qua Chrome headless (đăng nhập giả bằng token thật ghi vào localStorage rồi redirect, xoá file test ngay sau khi xong) + curl round-trip trên dữ liệu thật (luôn dọn dữ liệu test khỏi Turso production ngay sau khi xác nhận).

**2026-07-27 (lần 10)** — Rà soát bảo mật toàn dự án + phát hiện và vá lỗ hổng XSS nghiêm trọng + sắp xếp lại file dự án.
- **Task:** User yêu cầu kiểm tra lỗi tiếng Việt hiển thị sai trên trang Âm Thanh (kèm ảnh), rà soát toàn bộ dự án, gom file `.md` vào 1 thư mục, kiểm tra code/vận hành/an toàn.
- **Lỗi thật 1 - dữ liệu SEO danh mục Âm Thanh bị hỏng encoding trên production:** truy ngược lại đúng nguyên nhân - 1 lệnh `curl -d '{...}'` test round-trip trước đó (lần 9) gõ tiếng Việt trực tiếp trong tham số dòng lệnh bị Git Bash làm hỏng byte UTF-8 trước khi gửi lên server (không phải lỗi hiển thị, dữ liệu THẬT trong Turso đã bị ghi sai). Khôi phục đúng nguyên văn gốc (đã có sẵn từ lần đọc trước đó trong cùng phiên làm việc), xác nhận 7 danh mục còn lại không bị ảnh hưởng. **Đã lưu quy tắc vào bộ nhớ cá nhân:** không bao giờ gõ tiếng Việt trực tiếp trong `curl -d`, luôn ghi JSON ra file rồi gửi bằng `--data-binary @file`.
- **Lỗi thật 2 - lỗ hổng XSS nghiêm trọng (Stored XSS → đánh cắp token admin):** nội dung do khách công khai tự nhập (tên/nhận xét đánh giá sản phẩm, tên/SĐT/ghi chú liên hệ-đặt lịch) bị chèn thẳng vào `innerHTML` không escape ở CẢ trang quản trị (`danh-gia.html`, `lien-he.html`) lẫn trang công khai (`catalog-render.js`). Nghiêm trọng nhất: bất kỳ ai cũng gửi được 1 đánh giá/liên hệ chứa `<script>` đọc `localStorage` (nơi lưu JWT token đăng nhập) - script tự chạy ngay khi BẤT KỲ admin nào mở đúng trang quản lý tương ứng (việc họ làm hàng ngày), đủ để chiếm token và có toàn quyền truy cập (kể cả super_admin). **Vá bằng hàm `escapeHtml()` dùng chung** (thêm vào `admin.js` cho trang quản trị, `catalog-render.js` cho trang công khai), áp dụng cho mọi field có nguồn gốc input công khai. Test thật bằng 2 payload (`<script>`, `<img onerror>`) xác nhận hiện thành text vô hại; test tiếng Việt có dấu xác nhận không ảnh hưởng hiển thị bình thường.
- **Rà soát thêm (không phát hiện lỗi mới):** không có ghép chuỗi trực tiếp vào SQL ở bất kỳ route nào (toàn bộ dùng tham số hoá `?`); JWT qua header (không cookie) nên không cần CSRF; bcrypt cost 12 + khoá 5-lần-sai-15-phút cho đăng nhập; rate limit 300/15p toàn API + 20/15p riêng login; helmet CSP đầy đủ; file upload giới hạn đúng mimetype + 5MB.
- **Sắp xếp dự án:** gom 5 file `.md` (kế hoạch CMS, nhật ký, hướng dẫn nhân viên, báo cáo SEO, tài khoản/liên kết) vào thư mục `docs/` bằng `git mv` (giữ lịch sử), sửa lại đúng 1 link thật bị ảnh hưởng (`duchieuauto-backend/README.md`), cập nhật `.gitignore`. Dọn rác cục bộ không ảnh hưởng git (file SQLite cũ từ trước khi có Turso, 2 ảnh mồ côi trong `uploads/` từ trước khi có Cloudinary, 2 file log rỗng) - đã xác nhận không code nào còn tham chiếu trước khi xoá.
- **Phát hiện phụ (chưa xử lý, chỉ ghi nhận):** hệ thống Banner có đầy đủ CRUD + API public nhưng **chưa từng được gắn vào trang công khai nào** (không có slider nào trên site thật đọc `GET /api/banners`) - tính năng nửa vời, để dành làm sau nếu muốn dùng banner thật.
- **Bước tiếp theo lúc đó:** không có việc khẩn, chờ user quyết định hướng tiếp theo.

**2026-07-27 (lần 11)** — Mua domain thật `duchieuauto.vn`, chuyển DNS sang Cloudflare, cập nhật toàn bộ code sang domain mới, dựng lại kế hoạch phát triển.
- **Task:** User đã mua `duchieuauto.vn` tại Mắt Bão, muốn chuyển DNS sang Cloudflare (miễn phí, có CDN/chống DDoS) nhưng vẫn giữ nguyên hosting (GitHub Pages + Render) - không mua thêm hosting mới.
- **Thực hiện (chủ yếu thao tác trên dashboard, Claude hướng dẫn từng bước qua ảnh chụp màn hình user gửi):** tạo site trên Cloudflare → lấy 2 nameserver → đổi nameserver tại Mắt Bão → khai báo DNS record cho GitHub Pages (4 A record IP cố định của GitHub cho domain gốc, CNAME `www`) và Render (CNAME `api`) → khai báo Custom Domain ở GitHub Pages Settings (tự tạo file `CNAME` trong repo) và Render (`api.duchieuauto.vn`) → xác nhận domain chạy đúng bằng curl trước khi sửa code → cập nhật `FRONTEND_ORIGIN` trên Render (thêm domain mới, giữ domain cũ song song) để tránh CORS chặn domain mới → mới push code.
- **Sửa code (chỉ sau khi domain + CORS đã xác nhận chạy):** `api-config.js` (`PRODUCTION_API_URL`), `admin.js` (`FRONTEND_BASE_URL` - lưu ý domain apex thật KHÔNG còn phần path `/Claude.DUCHIEUAUTO` như URL project-page GitHub Pages cũ), `trang-chu.html`, `index.html` (OG tags + JSON-LD), `robots.txt`, `server.js` (thêm domain mới vào CSP `imgSrc`, thêm route `GET /` tự chuyển hướng `/admin/login.html`), `generate-sitemap.js` (chạy lại sinh 311 URL đúng domain thật). Giữ song song domain cũ (github.io/onrender.com) ở những chỗ hợp lý, không xoá vội.
- **Thêm subdomain `admin.duchieuauto.vn`** trỏ cùng service Render (không cần sửa code gì thêm - Express phục vụ như nhau bất kể hostname nào trỏ vào, chỉ khác cách bấm vào cho gọn).
- **Sự cố nhỏ lúc kiểm tra (không phải lỗi cấu hình thật):** sau khi user bật Cloudflare Proxy (mây cam) cho toàn bộ record, `curl` từ máy Claude vẫn thấy domain gốc đi thẳng tới GitHub (`Server: GitHub.com`, không có header `cf-ray`) trong khi `api.` đã đúng qua Cloudflare - tưởng nhầm là cấu hình sai, nhưng truy vấn thẳng DNS Cloudflare (`1.1.1.1`) và test bằng `curl --resolve` vào đúng IP Cloudflare xác nhận **mọi thứ đã đúng**, vấn đề chỉ là cache DNS cũ trên máy Claude (A và AAAA cache riêng, mức độ lệch khác nhau) - bài học: khi nghi ngờ DNS, luôn kiểm tra thẳng qua resolver độc lập (`1.1.1.1`/`8.8.8.8`) hoặc `--resolve` thay vì tin ngay kết quả từ máy đang test.
- **Quyết định:** KHÔNG bật "Bảo mật DNS" (DNSSEC) ở Mắt Bão - cần đồng bộ chính xác giá trị DS record với Cloudflare, bật sai có thể làm domain mất phân giải hoàn toàn; để dành, không phải việc bắt buộc.
- **Dựng lại kế hoạch (yêu cầu của user):** rà lại toàn bộ mục "chờ domain riêng" trong Phase 2/8, đánh dấu lại đúng trạng thái (phần lớn đã làm được hoặc không còn phụ thuộc domain nữa - riêng email quên mật khẩu vẫn cần đổi sang Resend/Brevo vì gốc vấn đề là Render chặn SMTP chứ không phải thiếu domain). Thêm **Phase 10 mới** theo yêu cầu user: tích hợp dữ liệu Facebook/TikTok - đã phác 2 hướng (gửi sự kiện conversion đi / nhận lead ads về) kèm khuyến nghị kỹ thuật riêng, và ý kiến khách quan về đề xuất dùng Supabase của user (chỉ thật sự cần nếu làm hướng nhận webhook tách biệt, còn hướng gửi sự kiện thì làm ngay trong backend hiện tại là đủ, không cần thêm nền tảng mới).
- **Bước tiếp theo:** còn 4 mục Phase 2 sẵn sàng làm ngay (chống hotlink ảnh qua Cloudflare Rules, watermark logo, reCAPTCHA - cần user tạo site key, email quên mật khẩu qua Resend/Brevo - cần user tạo tài khoản); Phase 10 (Facebook/TikTok) cần user xác nhận mục đích cụ thể trước khi thiết kế chi tiết.

**2026-07-29 (lần 12)** — 10 đề xuất nâng cấp trang admin (trang trí, tiện ích, công cụ mở rộng, phân quyền), user duyệt "Làm hết tất cả, trừ Tìm kiếm/lọc trong Thư Viện Ảnh".
- **Trang trí:** Dashboard (`dashboard.html`) đổi từ danh sách link chữ trơn `→ Quản lý sản phẩm` sang lưới thẻ `.quick-link-card` có icon (đồng bộ ẩn/hiện theo role bằng class thay vì id đơn); icon riêng cho từng khối `.settings-section` ở `trang-chu.html`; đồng bộ trạng thái "Đang tải..."/"Chưa có..." toàn admin qua 2 hàm dùng chung `loadingRowHtml()`/`loadingHintHtml()`/`emptyRowHtml()`/`emptyHintHtml()` (mới thêm vào `admin.js`) kèm spinner CSS thuần (`.admin-spinner`).
- **Tiện ích:** thêm `DELETE /api/uploads` (theo `publicId` lấy từ `GET /library`, đã bổ sung field này) + nút Xoá ở `thu-vien-anh.html` - cảnh báo rõ trong `confirm()` là không kiểm tra ảnh có đang dùng ở đâu; cảnh báo "còn thay đổi chưa lưu" (`beforeunload`) ở `trang-chu.html` theo dõi dirty **riêng từng khoá** (không phải 1 cờ chung) để lưu 1 khối không xoá nhầm cảnh báo của khối khác còn dở; nút "Xem Trước Trang Chủ" gửi toàn bộ giá trị đang gõ (kể cả chưa lưu) qua query string `?preview=<json>` sang tab mới cùng domain công khai - `assets/js/homepage-content.js` nhận diện tham số này và dùng thẳng thay vì gọi API, kèm banner vàng cố định đầu trang báo đang ở chế độ xem trước (không dùng sessionStorage vì admin và trang công khai khác origin, không chia sẻ được).
- **Phát hiện thật ngoài dự kiến khi làm cảnh báo ảnh:** đề xuất ban đầu "tích hợp tự tạo ảnh -400w khi upload" hoá ra là **không cần thiết** cho ảnh Cloudinary (đã tự tạo theo URL on-the-fly từ trước, xem `productSrcsetParts()` trong `catalog-render.js`) - chỉ ảnh LOCAL (242 sản phẩm gốc) mới có rủi ro này, và ảnh local không đi qua "upload" nào cả (chỉ được thêm bằng cách commit file trực tiếp). Đổi hướng thành cảnh báo chủ động ở Dashboard (`GET /api/products/admin/categories/overview` thêm field `missingResponsiveCount`, dùng `fs.existsSync` kiểm tra file `-400w` thật trên đĩa, im lặng bỏ qua nếu không truy cập được filesystem) - chạy thử phát hiện **3 sản phẩm thật đang có nguy cơ vỡ ảnh** (`kovar-t2`, `safeview-elite-360`, `finevu-gx4`) mà trước đó không ai biết: thư mục ảnh chỉ có `README.txt`, chưa từng có ảnh gốc thật (khác hẳn sự cố cũ là có ảnh gốc nhưng thiếu bản nhỏ) - cần ảnh thật, không tự tạo được.
- **Mở rộng công cụ CMS sang trang khác:** thêm 5 khoá `faq_page_title/intro`, `policy_page_title`, `booking_page_title/intro` vào cùng bảng `homepage_content` (không tạo bảng riêng), gắn `data-content-key` vào `faq.html`/`chinh-sach.html`/`dat-lich-hen.html` + nạp `homepage-content.js`. Cố ý CHỈ tiêu đề/đoạn dẫn đầu trang, không đưa nội dung FAQ/điều khoản chính sách vào (rủi ro sửa sai nội dung dài/pháp lý qua 1 ô text đơn giản).
- **Lịch sử/khôi phục:** bảng mới `homepage_content_history` (key, old_value, changed_by, changed_at) - mỗi lần PUT giá trị THẬT SỰ đổi mới ghi 1 dòng (không log khi bấm Lưu mà không sửa gì). `GET /history` (50 gần nhất) + `POST /revert` (khôi phục theo `historyId`, tự ghi thêm 1 dòng lịch sử cho chính hành động khôi phục - lỡ khôi phục nhầm vẫn khôi phục ngược lại được). UI dạng `<details>` gập gọn ở đầu `trang-chu.html`.
- **Phân quyền chi tiết theo khối:** bảng mới `content_permissions (admin_id, section)` - **mặc định 0 dòng = không giới hạn** (tương thích ngược, admin cũ không bị ảnh hưởng gì); super_admin gán cụ thể qua `tai-khoan.html` (nút "Phân Quyền Nội Dung" mỗi admin role content, checkbox 9 khối) mới bắt đầu giới hạn. `CONTENT_SECTIONS` (map khối → danh sách khoá) đặt trong `routes/homepage-content.js`, dùng chung cho `ALLOWED_KEYS` (gộp phẳng), check quyền ở PUT và revert (403 nếu đụng khoá ngoài khối được gán), và `GET /my-permissions` để `trang-chu.html` tự khoá mờ + vô hiệu hoá input các khối không được gán (chặn thật nằm ở backend, UI chỉ để gọn giao diện).
- **Sự cố lúc test (môi trường, không phải bug code):** ổ đĩa tạm đầy 99% gây lỗi `CacheStorage: Unexpected internal error` hàng loạt khi test Service Worker bằng headless Chrome - dọn bớt thư mục profile Chrome test cũ (chưa từng bị xoá sau mỗi lần test suốt nhiều phiên) giải quyết được; phát hiện thêm nhiều tiến trình `chrome.exe` headless từ các lần test trước đó trong phiên (một số từ hàng giờ trước) chưa từng bị kill, phải dọn thủ công - **bài học quy trình: luôn kill tiến trình Chrome headless VÀ xoá thư mục `--user-data-dir` ngay sau khi lấy xong kết quả test, không để dồn**. 1 lần lặp lại đúng lỗi encoding tiếng Việt đã ghi ở lần 10/11 (gõ trực tiếp `curl -d` thay vì qua file) lúc dọn dữ liệu test - phát hiện và sửa ngay.
- **Test:** toàn bộ 10 mục đều test round-trip qua curl (ghi file JSON) + Chrome headless (`--dump-dom`, đăng nhập giả qua token thật ghi vào localStorage) cho cả 2 vai trò content/super_admin, riêng phân quyền test đủ kịch bản: mặc định không giới hạn, giới hạn 1 khối, PUT đúng khối thành công, PUT khối khác bị 403, revert trong khối được phép thành công. Toàn bộ tài khoản/quyền/lịch sử test đều dọn sạch khỏi Turso production sau khi xác nhận.
- **Chưa push:** đang chờ user xem demo local trước khi đẩy lên, theo đúng quy trình đã thống nhất.
