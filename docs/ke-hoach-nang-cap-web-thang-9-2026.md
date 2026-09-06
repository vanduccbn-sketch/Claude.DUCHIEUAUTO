# Kế hoạch nâng cấp web tháng 9/2026 — duchieuauto.vn

- **Kỳ:** 09/2026 (~4 tuần), làm dần theo phase
- **Dựa trên:** `docs/danh-gia-doi-chuan-akauto-2026-09-03.md`
- **Bản trực quan:** https://claude.ai/code/artifact/08a4e793-afc4-4df7-a077-8b6dc0363daf
- **Nguyên tắc:** làm theo phase (không nhảy cóc), test kỹ trước khi push, tăng `sw.js` CACHE_NAME mỗi lần, không đụng thứ rủi ro cao (đổi URL, đổi nền tảng).

---

## Toàn cảnh 7 phase

| Phase | Nội dung | Tuần | Phụ thuộc |
|---|---|---|---|
| 1 | SEO nền tảng cấp tốc — canonical, schema trang chủ, sửa lỗi datePublished | T1 | — |
| 2 | Trang Giới thiệu + tín hiệu tác giả (E-E-A-T) | T1–2 | 1 |
| 3 | Render trang chủ cho bot (SSR / pre-render) | T2 | — |
| 4 | Hiệu năng — gộp CSS, bỏ JS thừa, tối ưu ảnh/CDN | T2–3 | 3 (nếu chọn pre-render) |
| 5 | Đánh giá khách hiển thị + schema sản phẩm đầy đủ (giá theo dòng xe) | T3 | — |
| 6 | Local SEO — vùng phục vụ, sitemap tự động, Google Business Profile | T3–4 | 1 |
| 7 | Nội dung danh mục sâu (2–3 danh mục ưu tiên) | T4 → sang T10 | nội dung anh Đức |

---

## PHASE 1 — SEO nền tảng cấp tốc (T1, ~2 ngày)

**Mục tiêu:** bịt 3 lỗ hổng kỹ thuật rẻ nhất.

- Thêm `<link rel="canonical">` vào **mọi trang tĩnh** (`index.html`, `product.html`, `tin-tuc.html`, `faq.html`, `chinh-sach.html`, `dat-lich-hen.html`, `nhac-bao-duong.html`, `404`…). Hiện chưa trang nào có.
- Viết lại schema trang chủ (`index.html`): `Organization` + `LocalBusiness`+`AutoRepair` đầy đủ — `@id`, `geo` (toạ độ), `openingHoursSpecification`, `hasMap`, `postalCode`, logo + `WebSite`+`SearchAction`. Hiện chỉ có `AutoRepair` 9 dòng.
- Sửa `datePublished` trong `ssr-render.js` (worker + backend, 2 chỗ, dòng ~260): DB trả `"2026-07-26 02:40:50"` → chuyển ISO 8601 `"2026-07-26T02:40:50+07:00"`.
- Tăng `sw.js` CACHE_NAME; test bằng Google Rich Results Test; push.

**Cần từ anh Đức:**
- **Toạ độ GPS xưởng** (Google Maps → chuột phải điểm → copy 2 số). — *chặn phase*
- **Giờ mở cửa** từng ngày (T2→CN, mở/đóng, nghỉ trưa, nghỉ ngày nào). — *chặn phase*
- **Link Google Business Profile** / `?cid=` / Place ID.
- *(tuỳ chọn)* Mã số thuế, tên công ty đầy đủ, năm bắt đầu nghề.

**Xong khi:** Rich Results Test báo `LocalBusiness` + `Article` hợp lệ; mọi trang tĩnh có canonical.

---

## PHASE 2 — Trang Giới thiệu + tín hiệu tác giả (T1–2, ~2–3 ngày)

**Mục tiêu:** dựng nền E-E-A-T. Hiện `/gioi-thieu` → **404**.

- Tạo `gioi-thieu.html`: câu chuyện xưởng, cơ sở vật chất (ảnh thật), đội ngũ, quy trình, cam kết, số liệu thật. Schema `AboutPage` trỏ về `LocalBusiness`.
- Đổi menu "Giới Thiệu" từ `#about` → `/gioi-thieu` trên 13 trang; giữ `#about` ở trang chủ làm tóm tắt + nút "Tìm hiểu thêm →".
- Khối/trang tác giả: `Person` schema (tên, ảnh, vai trò, kinh nghiệm) — gán vào bài viết + trang dịch vụ thay `author: Organization`.
- Bổ sung social thật vào footer + `sameAs` (hiện 2, AKauto 7).

**Cần từ anh Đức:**
- **Nội dung trang Giới thiệu** — mình soạn nháp, cần dữ kiện: năm bắt đầu nghề, diện tích xưởng, số khoang, số KTV, điểm khác biệt. — *chặn phase*
- **5–10 ảnh thật của xưởng** (mặt tiền, khu làm việc, máy móc, KTV đang làm). — *chặn phase*
- **Tác giả nội dung là ai** (tên + ảnh chân dung + 1–2 câu kinh nghiệm).
- **Kênh social khác** nếu có.

**Xong khi:** `/gioi-thieu` trả 200 có nội dung + ảnh thật; menu trỏ đúng; `Person` schema hợp lệ.

---

## PHASE 3 — Render trang chủ cho bot (T2, 1–3 ngày)

**Mục tiêu:** Google/Facebook/Zalo thấy nội dung thật trang chủ, không phải khung rỗng 10 KB.

**Hai hướng — anh Đức chọn 1:**

| | Hướng A — route SSR cho bot | Hướng B — pre-render lúc build ⭐ |
|---|---|---|
| Cách làm | Thêm `/` vào `cloudflare-worker-bot-ssr.js` + route `/render/home` | Script khi deploy: gọi API → ghi nội dung vào `index.html` → commit. Thêm 1 GitHub Action. |
| Ai hưởng | chỉ bot | bot + người dùng thật (trang chủ hiện ngay) |
| Công sức | thấp (~1 ngày) | TB (~2–3 ngày, có bước build mới) |
| Rủi ro | vẫn phụ thuộc API sống; worker deploy tay | nội dung trang chủ "đông cứng" tới lần deploy sau |

**Khuyến nghị:** Hướng B (fix cả SEO lẫn tốc độ, mở đường Phase 4). Làm A trước nếu cần nhanh.

**Cần từ anh Đức:** chọn A/B; nếu B thì đồng ý repo có thêm bước build tự động.

**Xong khi:** `curl` giả Googlebot vào `duchieuauto.vn/` trả HTML có tên dịch vụ + sản phẩm + schema đầy đủ.

---

## PHASE 4 — Hiệu năng (T2–3, ~2–3 ngày)

- Gộp 11 file `assets/css/*.css` → 1 file nén (trong bước build Phase 3B).
- Bỏ `catalog-data.js` (226 KB) khỏi `index.html` + trang không dùng catalog.
- Font Awesome full (~75 KB) → subset ~30 icon (IcoMoon) / SVG sprite → tiết kiệm ~60 KB.
- Gom Swiper + AOS về cùng cdnjs (bỏ unpkg), hoặc self-host.
- Self-host ảnh About (đang lấy `images.unsplash.com`); `fetchpriority="high"` + preload ảnh/video hero; `defer` script không cần chạy ngay.

**Cần từ anh Đức:** 2–3 ảnh thật thay ảnh Unsplash ở khối "Nâng Tầm Trải Nghiệm".

**Xong khi:** PageSpeed (mobile) tăng rõ; không còn request unsplash/unpkg; trang chủ không tải `catalog-data.js`.

---

## PHASE 5 — Đánh giá khách + schema sản phẩm đầy đủ (T3, ~2 ngày)

**Mục tiêu:** đủ điều kiện hiện sao vàng + khoảng giá trong Google. Code phần lớn đã có, thiếu dữ liệu + hiển thị.

- Sản phẩm không có giá gốc nhưng có `product_price_tiers`: sửa `ssr-render.js` xuất `AggregateOffer` (`lowPrice`/`highPrice` từ tier) thay vì bỏ trống `offers`. Code hiện chỉ dùng `p.price`.
- Kích hoạt + style khối đánh giá trên trang sản phẩm/dịch vụ (`renderReviews` đã có trong `catalog-render.js`).
- `aggregateRating` + vài `Review` vào schema — chỉ khi có đánh giá thật đã duyệt (giữ nguyên tắc không bịa số — code đã chặn).
- Hiển thị 3–6 đánh giá tiêu biểu ở trang chủ + trang dịch vụ.

**Cần từ anh Đức:**
- **Nhập giá ~15–20 sản phẩm chủ lực** qua CMS (giá gốc hoặc mức theo dòng xe) — ưu tiên màn hình, phim cách nhiệt, camera, loa. — *chặn phase*
- **Đánh giá khách thật:** mục `danh-gia` trong admin hiện có bao nhiêu? Nếu ít → thu thập (mình soạn tin nhắn + link xin đánh giá để anh gửi khách cũ qua Zalo).

**Xong khi:** Rich Results Test báo `Product` có `offers`/`AggregateOffer` hợp lệ; trang sản phẩm hiển thị khối đánh giá.

---

## PHASE 6 — Local SEO + sitemap tự động (T3–4, ~1–2 ngày web + anh Đức làm GBP)

- `areaServed`: BMT + các huyện quanh (Cư M'gar, Buôn Đôn, Krông Pắc, Ea Kar…) + Đắk Nông.
- Tự sinh `sitemap.xml` khi deploy (GitHub Action chạy `generate-sitemap.js`); thêm `<lastmod>` cho trang tĩnh; bỏ `<priority>`/`<changefreq>`.
- Checklist tối ưu Google Business Profile cho anh Đức tự làm (mình soạn từng bước).

**Cần từ anh Đức:**
- **Quyền quản trị Google Business Profile.** — cần sớm
- Xác nhận danh sách huyện/khu vực xưởng thực sự nhận khách.

**Xong khi:** sitemap tự cập nhật khi deploy; GBP đủ ảnh + mô tả + dịch vụ + đã trả lời hết đánh giá.

---

## PHASE 7 — Nội dung danh mục sâu (T4 → sang T10)

**Mục tiêu:** nâng 2–3 danh mục ưu tiên từ ~700 từ lên 2.000–3.000 từ.

- Chọn 3 danh mục làm trước: **Màn hình ô tô**, **Phim cách nhiệt**, **PPF**.
- Khung mỗi danh mục: giới thiệu → các loại/phân khúc → bảng so sánh → hướng dẫn chọn theo nhu cầu → quy trình thi công tại xưởng → 6–10 FAQ → vì sao chọn Đức Hiếu Auto. (Khung Quill trong admin hỗ trợ bảng + ảnh.)
- Mình soạn bản nháp đầy đủ; anh Đức sửa cho khớp thực tế (giá, thương hiệu phân phối, kinh nghiệm thật).

**Cần từ anh Đức:** thời gian review bản nháp ~30–45 phút/danh mục.

**Xong khi:** 3 danh mục ưu tiên đạt 2.000+ từ có bảng so sánh + quy trình + FAQ; SSR trả đầy đủ.

---

## TÓM TẮT: anh Đức cần chuẩn bị gì

| Cần cho | Việc chuẩn bị | Mức |
|---|---|---|
| P1 | Toạ độ GPS + giờ mở cửa từng ngày + link Google Business Profile | **Chặn P1** |
| P1 | *(tuỳ chọn)* Mã số thuế, tên công ty, năm bắt đầu nghề | tuỳ chọn |
| P2 | Dữ kiện + 5–10 ảnh thật của xưởng cho trang Giới thiệu | **Chặn P2** |
| P2 | Tác giả nội dung (tên + ảnh + 1–2 câu kinh nghiệm) | cần sớm |
| P2 | Link social khác (TikTok, YouTube…) | khi có |
| P3 | Chọn hướng render trang chủ: A (nhanh) hay B (khuyến nghị) | cần quyết |
| P4 | 2–3 ảnh thật thay ảnh Unsplash | cần sớm |
| P5 | Nhập giá ~15–20 sản phẩm chủ lực qua CMS | **Chặn P5** |
| P5 | Đánh giá khách thật (kiểm số lượng / thu thập thêm) | cần cho sao vàng |
| P6 | Quyền đăng nhập Google Business Profile + danh sách khu vực | cần sớm |
| P7 | Thời gian review nội dung 3 danh mục (~30–45 phút/danh mục) | tuần 4+ |
| — | Xác nhận: trong tháng 9 mình được tự commit+push sau khi test & báo, hay chờ duyệt từng lần | cần quyết |

---

## BẮT ĐẦU NGAY (mình làm không cần chờ anh)

- Thêm `canonical` toàn bộ trang tĩnh — Phase 1
- Sửa lỗi `datePublished` ISO 8601 trong `ssr-render.js` — Phase 1
- Dựng khung schema trang chủ (chừa chỗ điền toạ độ / giờ mở cửa) — Phase 1
- Soạn bản nháp nội dung `/gioi-thieu` để anh điền dữ kiện — Phase 2

→ Anh gửi **toạ độ GPS + giờ mở cửa** là ráp xong Phase 1 và đẩy lên.
