# Báo cáo đối chuẩn: duchieuauto.vn vs akauto.com.vn

- **Ngày:** 2026-09-03
- **Đối tượng:** duchieuauto.vn (Buôn Ma Thuột)
- **Chuẩn so sánh:** akauto.com.vn (TP.HCM — WordPress + WooCommerce + Rank Math + LiteSpeed)
- **Phương pháp:** đọc mã nguồn thực tế trong repo + kiểm tra phản hồi HTTP + giả lập Googlebot bằng curl
- **Bản trực quan (đọc trên điện thoại):** https://claude.ai/code/artifact/a4cb5923-6c38-4033-9052-59d737e2da53

---

## 0. Tóm tắt điều hành

duchieuauto.vn có **thiết kế sạch, nội dung viết tốt, mô hình "đặt lịch tới xưởng" phù hợp một cơ sở ở tỉnh** — không cần đại tu. Đang thua AKauto ở 4 mặt:

1. **Trang chủ CSR — gần như vô hình với bot.** Người dùng + Google vào `/` chỉ nhận khung HTML **10 KB rỗng**, chờ 13 file JS + gọi API mới hiện nội dung. AKauto giao ngay HTML **61 KB** đã render đủ. Worker SSR-cho-bot của DHA chỉ xử lý trang sản phẩm/danh mục/bài viết — **không có trang chủ**.
2. **Schema sơ sài.** Trang chủ chỉ `AutoRepair` tối giản. Trang sản phẩm **không khai giá**, không đánh giá sao. AKauto: `LocalBusiness` đầy đủ + `Offer` có giá + `AggregateRating` → sao vàng + giá trong kết quả Google.
3. **E-E-A-T yếu.** `/gioi-thieu` → **404**. Nội dung ẩn danh, 2 social, 1 hotline. AKauto: tác giả đích danh, 4 trang chính sách, mã số thuế, 7 social, 3 hotline, live chat.
4. **Nội dung danh mục mỏng.** ~700 từ vs ~9.000 từ của AKauto.

**Lợi thế DHA:** site nhẹ, chi phí ~0; CMS tự xây gọn, đủ dùng; có **Đặt lịch hẹn + Nhắc bảo dưỡng** (AKauto không có); nội dung giọng tư vấn thật. Thắng được ở Đắk Lắk – Tây Nguyên bằng local SEO + tốc độ + nội dung tập trung.

### Chênh lệch qua con số

| Chỉ số | duchieuauto | akauto |
|---|---|---|
| HTML trang chủ nhận được | 10 KB (khung rỗng) | 61 KB (render đủ) |
| Sản phẩm lập chỉ mục | ~242 | 948 |
| Danh mục | 8 nhóm dịch vụ | 72 |
| Bài viết | (ít) | 390 |
| Từ / trang danh mục | ~700 | ~9.000 |
| JS nạp mọi trang (`catalog-data.js`) | 226 KB | — |
| File CSS chưa gộp | 11 | (gộp + cache) |
| Kênh mạng xã hội | 2 | 7 |
| Hotline | 1 | 3 |
| Chi nhánh | 1 | 2 |

---

## 1. Bối cảnh

| | duchieuauto.vn | akauto.com.vn |
|---|---|---|
| Nền tảng | HTML/CSS/JS tĩnh + CMS tự xây (Node→CF Workers, Turso) + Worker SSR riêng cho bot. Host GitHub Pages. | WordPress + WooCommerce + theme Flatsome + Rank Math SEO + LiteSpeed Cache. Qua Cloudflare. |
| Quy mô | ~242 SP, 8 nhóm dịch vụ, 1 cơ sở | 948 SP, 72 danh mục, 390 bài, 2 chi nhánh, cty 12 năm, 80 NV |
| Chi phí | gần 0 | hosting WP + bảo trì |
| Mô hình | đặt lịch tới xưởng | bán online có giỏ hàng + lắp tận nơi |

Mục tiêu không phải "bằng AKauto toàn quốc" mà **thống trị tìm kiếm ở Đắk Lắk / Tây Nguyên** — nơi AKauto gần như không cạnh tranh local.

---

## 2. Render & kiến trúc (điểm yếu nền tảng)

- **CSR trên trang chủ:** trình duyệt tải khung 10 KB → 13 file JS → gọi `api.duchieuauto.vn` → mới vẽ khối Dịch Vụ / Sản Phẩm Chiến Lược / Giải Mã Công Nghệ. Máy yếu / mạng chậm / API lag = trang trắng nhiều giây.
- **Worker `cloudflare-worker-bot-ssr.js`** chỉ chặn `/san-pham-chi-tiet`, `/category-chi-tiet`, `/brand-san-pham`, `/bai-viet-chi-tiet` → gọi `/render/*`. **Trang chủ `/` không có.** Kiểm chứng: `curl -A Googlebot https://duchieuauto.vn/` trả về đúng file CSR tĩnh, chỉ có schema `AutoRepair` sơ sài.
- **Rủi ro:** worker deploy thủ công qua dashboard (không qua git); nội dung bot thấy phụ thuộc API backend còn sống đúng lúc Google quét.
- **AKauto:** LiteSpeed full-page cache (`x-litespeed-cache: hit`) → mọi khách nhận HTML tĩnh đã render.

**Khuyến nghị:**
- **[P1]** Thêm `/` vào worker bot-SSR + route `/render/home` sinh HTML có khối dịch vụ + sản phẩm + FAQ + schema đầy đủ.
- **[P1]** Tốt hơn: pre-render trang chủ lúc build (script đổ nội dung động → HTML tĩnh, commit vào repo). Người dùng thật cũng hưởng lợi. Không cần đổi nền tảng.
- **[P3]** Dài hạn: nếu nội dung tăng mạnh → Astro/11ty hoặc WordPress.

---

## 3. Hiệu năng (tốc độ)

Đo trên trang chủ duchieuauto:
- 11 file CSS riêng lẻ, chưa gộp/nén → 11 request chặn render.
- 3 CDN: cdnjs (Font Awesome **bản full ~75 KB** cho ~30 icon), jsDelivr (Swiper), unpkg (AOS — hay chậm).
- `catalog-data.js` = **226 KB nạp mọi trang** kể cả trang chủ (phần lớn không dùng ở trang chủ).
- Google Fonts Bebas Neue + Poppins 5 weight — chặn render.
- Video nền hero 8 MB + 3 lớp ảnh nền chồng; ảnh About từ `images.unsplash.com`.
- Không `defer`/`async`, không preload/`fetchpriority` ảnh LCP.

AKauto: JS nạp trễ (`litespeed/javascript`), lazy-load ảnh, `<link rel=preload as=image media=...>` cho hero mobile, critical CSS inline.

**Khuyến nghị [P1]:**
- Gộp 11 CSS → 1 file nén.
- Font Awesome → subset icon đang dùng / SVG sprite (tiết kiệm ~60 KB).
- `catalog-data.js` → chỉ nạp ở product / so-sanh / search. Bỏ khỏi trang chủ + trang tĩnh khác.
- Gom Swiper + AOS về cùng cdnjs (bỏ unpkg) hoặc self-host.
- Self-host ảnh About; `fetchpriority="high"` + preload ảnh/video LCP; `defer` script không cần chạy ngay.

---

## 4. SEO kỹ thuật

| Hạng mục | duchieuauto | akauto | Cần làm |
|---|---|---|---|
| robots.txt | tối giản, có sitemap | chuẩn (chặn wp-admin, `?s=`, wp-json); 7 sitemap | đủ dùng |
| Sitemap | 336 URL; có `changefreq`/`priority` (Google bỏ qua); **275/336 có `lastmod`**; chạy tay `generate-sitemap.js` | Rank Math tự sinh; tách product/category/post/author; `lastmod` đủ | thêm `lastmod` mọi URL; bỏ `priority`/`changefreq`; tự sinh khi deploy |
| **canonical** | **THIẾU hoàn toàn ở trang tĩnh** (trang chủ, product.html, tin-tuc, faq, chinh-sach...). Trang SSR có. | mọi trang có | **[P0]** thêm canonical mọi trang tĩnh |
| Cấu trúc URL | `?id=man-hinh-o-to` (query); trộn `/product` với `/tin-tuc.html` | `/man-hinh-o-to`, `/man-hinh-o-to/bravigo/ultra-pro` (path sạch) | thống nhất 1 kiểu; lý tưởng path sạch |
| HTTPS/HTTP2/nén | ✓ | ✓ | OK |
| SSR cho bot | SP, danh mục, brand, bài viết ✓ — trang chủ ✗ | toàn bộ | thêm trang chủ |

**Điểm sáng:** trang danh mục DHA khi SSR trả về rất bài bản — `<title>` riêng, meta description, 3 khối schema (`Service` + `BreadcrumbList` + `FAQPage`), `<h1>` thật, nhiều `<h2>` nội dung. Cơ chế đúng, chỉ cần mở rộng phủ.

---

## 5. Schema.org

### Trang chủ
- **DHA:** 1 khối `AutoRepair` — name, image, tel, email, priceRange, address (**thiếu `postalCode`**), areaServed, 2 `sameAs`. Không `@id`, `geo`, `openingHoursSpecification`, `hasMap`.
- **AKauto:** `@graph` lớn — `Organization`+`LocalBusiness`+`AutoPartsStore` (mã số thuế, tên pháp lý, năm thành lập, 80 NV, 3 `ContactPoint`); `WebSite`+`SearchAction`; `OfferCatalog` 19 danh mục; 2 `subOrganization` (mỗi chi nhánh có `geo` + giờ mở cửa + `hasMap` CID); `Person` tác giả; `MerchantReturnPolicy`.

### Trang sản phẩm
- **DHA:** `Product` (name, image, description, brand) + `BreadcrumbList`. **Thiếu `offers` (không có giá!), `aggregateRating`, `review`.**
- **AKauto:** `Product` đầy đủ — `offers` (price, priceValidUntil, availability InStock, seller, return policy, shipping), `brand`, `aggregateRating` (5.0 / 3), 3 `Review` có tên + ngày + nội dung + sao → **sao vàng + giá trong Google**.

### Trang bài viết
- **DHA:** `Article` OK nhưng `datePublished":"2026-07-26 02:40:50"` — **sai ISO 8601** (thiếu `T` + múi giờ; phải là `2026-07-26T02:40:50+07:00`). `author` = `Organization`, không phải `Person`.

**Khuyến nghị:**
- **[P0]** Trang chủ: `LocalBusiness` đầy đủ (`geo`, `openingHoursSpecification`, `postalCode`, `hasMap` link GBP `?cid=`) + `WebSite`+`SearchAction`.
- **[P0]** Trang SP: thêm `offers` có giá + `availability`. Nhiều mức giá theo dòng xe → `AggregateOffer` (`lowPrice`/`highPrice`).
- **[P0]** Sửa `datePublished` về đúng ISO 8601.
- **[P1]** Kéo đánh giá thật từ mục `danh-gia` trong admin ra `aggregateRating` + `review` trên trang SP/dịch vụ.
- **[P1]** `author` → `Person` (tên chủ xưởng / KTV chính) + trang tác giả.

---

## 6. E-E-A-T & tín nhiệm

| Tín hiệu | duchieuauto | akauto |
|---|---|---|
| Trang "Giới thiệu" | **Không có** (`/gioi-thieu` → 404; menu chỉ trỏ `#about`) | có, dùng làm `ownershipFundingInfo` |
| Tác giả nội dung | ẩn danh | Trần Phú Quý — tên, ảnh, chức danh GĐ, "12 năm KN", trang tác giả, `Person` schema, FB cá nhân |
| Trang chính sách | 1 trang `chinh-sach.html` | 4 trang: biên tập, chỉnh sửa, đánh giá, bảo hành/đổi trả/hoàn tiền (khai trong schema) |
| Pháp lý | không hiển thị | mã số thuế, tên cty, năm thành lập 2012 |
| Mạng xã hội | 2 (FB, Zalo) | 7 (FB, YouTube, TikTok, X, LinkedIn, Instagram, Pinterest) |
| Hotline | 1 | 3 |
| Hiển thị đánh giá khách | CMS có mục `danh-gia`, chưa hiển thị nổi bật | có, khách gửi ảnh + video |
| Live chat | không (chỉ nút Zalo/Messenger nổi) | Subiz |

**Khuyến nghị:**
- **[P0]** Làm trang `/gioi-thieu` thật: câu chuyện xưởng, ảnh cơ sở vật chất thật, đội ngũ, cam kết. Là nơi `LocalBusiness` schema trỏ tới.
- **[P1]** Gán tên tác giả thật cho bài viết + trang dịch vụ; trang "Về đội ngũ / KTV".
- **[P1]** Hiển thị đánh giá khách (đã có trong CMS) lên trang chủ + trang dịch vụ, kèm schema.
- **[P2]** Bổ sung TikTok/YouTube nếu làm video; cân nhắc live chat miễn phí (Tawk.to).

---

## 7. Local SEO

Phần lớn khách tìm "độ xe ở BMT", "màn hình android ô tô Buôn Ma Thuột", "dán PPF Đắk Lắk" → local pack + Google Business Profile quan trọng hơn cả traffic web.

| | duchieuauto | akauto |
|---|---|---|
| Địa chỉ schema | thiếu `postalCode`, không `geo` | đủ, `geo` toạ độ chính xác từng chi nhánh |
| Giờ mở cửa | không khai | `openingHoursSpecification` 08:00–19:00 cả tuần |
| Link Google Maps | chỉ iframe nhúng, không `hasMap` CID | `hasMap` trỏ `?cid=` (liên kết trực tiếp GBP) |
| Vùng phục vụ | "BMT", "Đắk Lắk" | `areaServed` mở rộng Bình Dương, Đồng Nai |

**Khuyến nghị:**
- **[P0]** Thêm `geo`, `openingHoursSpecification`, `postalCode`, `hasMap` vào schema trang chủ.
- **[P1]** Tối ưu hồ sơ Google Business Profile: ảnh mới, mô tả, sản phẩm, bài đăng định kỳ, trả lời mọi đánh giá.
- **[P1]** `areaServed` liệt kê các huyện quanh BMT (Cư M'gar, Buôn Đôn, Krông Pắc...) + Đắk Nông.
- **[P2]** Landing local: "Độ xe Buôn Ma Thuột", "Dán phim cách nhiệt Đắk Lắk"...

---

## 8. Bố cục & UX

- **Trang chủ:** cả hai theo cấu trúc marketing chuẩn. DHA gọn hơn, ít rối hơn AKauto. Không phải chỗ cần lo.
- **Bộ chọn dòng xe** (AKauto có, DHA không): quan trọng nhất về UX + SEO trong ngành phụ kiện. AKauto lọc Hãng → Dòng xe, sinh hàng trăm URL landing "màn hình android cho [tên xe]". Dữ liệu `car-data.js` đã có sẵn một phần trong repo DHA. → **[P2]**
- **Trang danh mục:** DHA ~700 từ + 4 FAQ, **viết tốt** (giọng tư vấn thật) nhưng ngắn. AKauto ~9.000 từ, 12 H2, bảng so sánh, hướng dẫn chọn mua, quy trình lắp 6 bước, 10+ FAQ. AKauto có lọc + sắp xếp theo giá, card hiện "15 đánh giá" + quà tặng. → **[P2]** nâng nội dung lên 2.000–3.000 từ (khung Quill trong admin đã hỗ trợ).
- **Trang sản phẩm:** DHA có **giá nhiều mức theo loại xe** (điểm hay) + nút "Đặt Lịch Ngay". Nhưng khung SSR trả `<h1>`/brand/giá **rỗng** (điền bằng JS) → bot không đọc được giá.
- **Mobile:** đã sửa đợt vừa rồi (menu, nút nổi safe-area, header, 3 slider hiện hết thẻ, khối liên hệ 2 cột, "Dịch Vụ" xổ/thu). Làm thêm: **thanh gọi cố định dưới đáy màn hình**; làm nổi bật hơn **Đặt lịch hẹn + Nhắc bảo dưỡng** (lợi thế thật).
- **Bán online vs Đặt lịch:** với 1 cơ sở ở tỉnh, mô hình đặt lịch hợp lý — **không nên sao chép giỏ hàng**. Nhưng nên có nút "Chốt đơn / Tư vấn qua Zalo" rõ ràng ở mỗi sản phẩm.

---

## 9. Quản trị / CMS

| | CMS tự xây (DHA) | WordPress + WooCommerce (AKauto) |
|---|---|---|
| Ưu | nhẹ, nhanh, chi phí ~0, toàn quyền kiểm soát, không lỗ hổng plugin WP, không phí theme | Rank Math tự sinh schema + sitemap + breadcrumb; WooCommerce chuẩn ngành; plugin review ảnh/video; hệ sinh thái khổng lồ |
| Nhược | mọi thứ phải tự code (schema, sitemap chạy tay, SSR worker thủ công, không UI review sẵn, không bộ lọc SP); phụ thuộc 1–2 người biết codebase | nặng, cần cập nhật bảo mật thường xuyên, phí hosting cao, dễ phình plugin, tốc độ phải "vá" bằng cache |
| Admin panel | sản phẩm, danh mục, bài viết, banner, đánh giá, liên hệ, cấu hình, lịch sử, thư viện ảnh, tài khoản (phân quyền) — **khá đầy đủ cho quy mô hiện tại** | WP admin + WooCommerce (nhiều thứ thừa cho một xưởng) |

**Đánh giá thẳng:** CMS tự xây **đủ dùng cho ~242 SP / 1 cơ sở**. Không nên vội chuyển nền tảng. Nhưng phải trả "nợ kỹ thuật" ở 3 chỗ: (1) SSR trang chủ, (2) schema đầy đủ & tự động, (3) sinh sitemap tự động khi deploy. Chỉ tính chuyển Astro/Next/WordPress nếu 12–24 tháng tới mở rộng mạnh (nhiều cơ sở, >1.000 SP, bán online thực thụ).

---

## 10. Kế hoạch hành động theo mức ưu tiên

### P0 — Làm ngay (tác động cao, công sức thấp, 1–3 ngày)

| Việc | Vì sao | Nơi sửa |
|---|---|---|
| Thêm `<link rel="canonical">` mọi trang tĩnh | chống trùng lặp URL | `*.html` |
| Trang chủ: schema `LocalBusiness` đầy đủ (geo, giờ, hasMap, postalCode) + `WebSite`/`SearchAction` | rich result, local pack, ô tìm kiếm trong Google | `index.html` |
| Trang SP SSR: thêm `offers` (giá + còn hàng) vào `Product` | hiện giá trong Google | `ssr-render.js` / `render.js` |
| Sửa `datePublished` bài viết về đúng ISO 8601 | schema đang lỗi validation | `ssr-render.js` |
| Làm trang `/gioi-thieu` thật | E-E-A-T; đang thiếu hẳn 1 trang | file mới |

### P1 — Trong 2–4 tuần

- SSR cho trang chủ (thêm `/` vào bot-worker + route render).
- Gộp + nén 11 CSS → 1; bỏ `catalog-data.js` khỏi trang chủ; subset Font Awesome / SVG; gom CDN về 1 mối; self-host ảnh Unsplash.
- Kéo đánh giá thật (có trong admin) ra trang SP/dịch vụ + `aggregateRating` schema.
- Tự động sinh sitemap khi deploy + `lastmod` đủ; bỏ `priority`/`changefreq`.
- Rà soát & tối ưu Google Business Profile.

### P2 — Trong 1–3 tháng

- Nâng nội dung trang danh mục lên 2.000–3.000 từ (bảng so sánh, hướng dẫn, quy trình).
- Bộ chọn hãng/dòng xe + bộ lọc sản phẩm.
- Trang tác giả + gán tên người thật cho nội dung.
- Landing local ("Độ xe Buôn Ma Thuột"...); `areaServed` mở rộng các huyện quanh BMT + Đắk Nông.
- Thanh gọi cố định mobile; nút "Chốt đơn Zalo" ở mỗi sản phẩm.

### P3 — Cân nhắc dài hạn

- Pre-render toàn site lúc build (SSG nhẹ) hoặc chuyển Astro/11ty.
- URL clean path (`/man-hinh-o-to` thay `?id=`) — cần redirect 301 rất cẩn thận.
- Live chat trên web.
- Nếu mở rộng nhiều cơ sở / bán online: đánh giá lại nền tảng.

---

## Kết luận

duchieuauto.vn **thiết kế sạch, nội dung tốt, mô hình đặt lịch phù hợp quy mô** — không cần đại tu. Khoảng cách với AKauto: (1) render (CSR làm trang chủ vô hình với bot), (2) schema sơ sài, (3) E-E-A-T (thiếu trang Giới thiệu, tác giả ẩn danh), (4) chiều sâu nội dung danh mục. AKauto hơn nhờ 12 năm tích luỹ + nền WordPress có sẵn công cụ SEO — không đuổi kịp về lượng trong ngắn hạn, nhưng thắng được ở Đắk Lắk – Tây Nguyên bằng local SEO + tốc độ + nội dung tập trung. Bắt đầu từ nhóm P0.
