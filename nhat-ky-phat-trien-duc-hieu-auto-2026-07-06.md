# Nhật ký phát triển – Website Đức Hiếu Auto

**Ngày tạo:** 2026-07-06

## Tổng quan dự án

Website tĩnh giới thiệu và bán sản phẩm cho **Đức Hiếu Auto** – trung tâm nâng cấp & chăm sóc xe hơi (đèn, âm thanh, phủ ceramic...).

Cấu trúc trang hiện có:
- `index.html` – Trang chủ
- `san-pham.html` – Danh mục sản phẩm
- `san-pham-chi-tiet.html` – Chi tiết sản phẩm
- `category-chi-tiet.html` – Chi tiết danh mục
- `brand-san-pham.html` – Trang thương hiệu sản phẩm
- `assets/css`, `assets/js`, `assets/images`, `assets/fonts` – Tài nguyên dùng chung

## Lịch sử commit gần đây

- `47bf49b` – Lần đầu tiên đẩy code lên
- `5ab57a2` – Thêm file nojekyll để fix lỗi deploy
- `935e6ff` – Cleanup and deploy

## Việc đã làm hôm nay (2026-07-06)

- [x] Bổ sung danh mục con "Âm thanh ô tô" (Loa & Âm Thanh) với 74 sản phẩm thật, dữ liệu lấy từ https://pgi.com.vn/am-thanh-o-to
  - 4 hãng: JBL (31 sp), Infinity (27 sp), Harman/Kardon (9 sp), Pioneer (7 sp)
  - Mỗi hãng chia theo 3 loại: Loa Ô Tô, Loa Sub, Âm Ly (tối đa 12 sp/loại)
  - Ảnh sản phẩm tải về cục bộ vào `assets/images/products/<id>/anh-1.jpg` (không hotlink)
  - Thêm cấp điều hướng mới: Danh mục → Hãng → Loại → Sản phẩm (cập nhật `catalog-render.js`, breadcrumb `brand-san-pham.html`)
  - Thêm bảng "Thông số kỹ thuật" (specs) vào trang chi tiết sản phẩm (`san-pham-chi-tiet.html` + CSS)
  - Dữ liệu thu thập song song qua 5 agent nền theo hãng để rút ngắn thời gian xử lý

- [x] Bổ sung danh mục "Màn Hình Ô Tô" — brand Zestech: 12 sản phẩm thật (dữ liệu từ zestech.com.vn), chia loại Có/Không Camera 360
- [x] Bổ sung danh mục "Camera Hành Trình" — brand VIETMAP: 12 sản phẩm thật (dữ liệu từ vietmap.vn)
- [x] Cấp quyền tự động (allow rules) cho project trong `.claude/settings.local.json`, thêm `.gitignore`
- [x] Push lên GitHub (`origin/master`) — GitHub Pages đã deploy bản mới
- [x] Thêm video nền cho Hero section (`assets/videos/hero-bg.mp4`, nguồn Pexels miễn phí bản quyền, thay Ferrari)
- [x] Bổ sung gallery 3 ảnh cho mục "Giới Thiệu" (#about) — `assets/images/about/`
- [x] Bổ sung ảnh poster cho 9 dịch vụ (Ceramic, Phim cách nhiệt, Độ đèn, Decal, PPF, Cách âm, Phủ gầm, Mâm xe, Bodykit) — `assets/images/service/<id>/poster.jpg`
- [x] Bổ sung logo chính hãng cho 6 brand đã có sản phẩm thật (JBL, Infinity, Harman/Kardon, Pioneer, Zestech, VIETMAP) — `assets/images/brands/<id>/logo.*`, hiển thị ở brand-card và brand-title
- [x] Thêm widget "Liên hệ nhanh" nổi góc phải (Zalo, Messenger, Điện thoại) trên cả 5 trang, có nút thu/mở, không đè lên nút back-to-top
- [x] Sửa lỗi thiếu file `assets/css/project.css` (mục "Công Trình Tiêu Biểu" trước đó không có style)
- [x] Ẩn top-bar (địa chỉ/email/hotline) trên mobile (≤768px) để tránh tràn ngang
- [x] **Tái cấu trúc lớn**: gộp `services` + `productCategories` thành 1 danh sách `categories` duy nhất, đúng 8 mục theo yêu cầu (tham khảo IA của 2tautocar.com.vn):
  1. Màn Hình Ô Tô (Gotech, Zestech*, Kovar, Teyes, Safeview)
  2. Âm Thanh - Cách Âm Ô Tô (JBL*, Infinity*, Harman/Kardon*, Pioneer*, German-Maestro, Audiotec Fischer, DrArtex, Vibrofiltr) — gộp "Loa & Âm Thanh" + "Cách Âm Ô Tô" cũ
  3. Android Box Ô Tô (mới, placeholder "Đang cập nhật")
  4. Film Cách Nhiệt (3M*, Titan, Global)
  5. Camera Hành Trình - 360 Độ (UTOUR, VIETMAP*, 70mai, FINEVU, BlackVue)
  6. PPF - Wrap Đổi Màu (XPEL, AX Film, 3M, Oracal, Avery Dennison) — gộp "PPF" + "Decal Đổi Màu" cũ
  7. Nâng Cấp Ánh Sáng (Fogway, GTR, X-Light, NAOEVO) — đổi tên từ "Độ Đèn Tăng Sáng"
  8. Đồ Bán Tải (mới, placeholder "Đang cập nhật")
  (*: hãng có sản phẩm thật)
  - **Đã loại bỏ** hoàn toàn: Phủ Ceramic, Phủ Gầm Ô Tô, Độ Mâm Xe Thể Thao, Độ Bodykit, Phuộc Hiệu Năng Cao, Mâm Độ (không nằm trong 8 mục yêu cầu) — xóa luôn sản phẩm placeholder mồ côi liên quan
  - Dùng chung 1 danh sách cho cả mục "Dịch Vụ" (trang chủ) và trang "Sản Phẩm"
  - Đơn giản hóa `catalog-render.js`: bỏ tham số `type=service/product` trên URL (giờ chỉ còn `?id=`, `?id=&brand=`, `?id=&brand=&loai=`)
  - Tải mới 4 ảnh poster còn thiếu: Màn Hình Ô Tô, Camera Hành Trình - 360 Độ, Android Box Ô Tô, Đồ Bán Tải
  - Sửa 3 link sản phẩm nổi bật ở trang chủ (Infinity/JBL/Pioneer) đang trỏ tới id sản phẩm cũ không còn tồn tại
- [x] Bổ sung brand **3M** trong danh mục "Film Cách Nhiệt" — 3 sản phẩm thật (dữ liệu từ muoihungauto.net/collections/phim-cach-nhiet-3m), phân loại theo dòng xe 4/5/7 chỗ, mỗi loại là 1 sản phẩm riêng (giá, ảnh, thông số UV/hồng ngoại/bảo hành)
- [x] Bổ sung `PowerShell`, `Artifact`, `SendMessage`, `ScheduleWakeup` vào allow-list `.claude/settings.local.json` (thiếu `PowerShell` khiến vẫn bị hỏi quyền)
- [x] **Chuyển toàn bộ project** từ `d:\OneDrive - Cong Ty TNHH Phuc Giang\Desktop\VANDUC\Claude-DUCHIEUAUTO` sang **`D:\Claude-DUCHIEUAUTO`** (ngoài vùng đồng bộ OneDrive) — do phát hiện OneDrive tự đồng bộ hoàn nguyên file về bản cũ sau mỗi lần commit, làm mất code vừa sửa. Đã xác minh git log/remote/working tree nguyên vẹn ở vị trí mới.
- [x] Bổ sung brand **Titan** và **Global** trong danh mục "Film Cách Nhiệt" — dữ liệu từ akauto.com.vn:
  - Titan: chia loại Sedan 4-5 chỗ / SUV 7 chỗ, mỗi loại 3 dòng phim (Black, Titanium, Titanium Plus) — 6 sản phẩm
  - Global: chia loại Xe 4-5 chỗ / Xe 7 chỗ, mỗi loại 2 dòng phim (Supreme Series, QDP Ceramic Series) — 4 sản phẩm
  - Danh mục "Film Cách Nhiệt" giờ đã đủ cả 3 brand thật (3M, Titan, Global)
- [x] Bổ sung logo chính hãng 3M, Global vào "Film Cách Nhiệt" (Titan: không tìm được logo chính hãng đáng tin cậy - trang titanwindowfilm.vn đã ngừng hoạt động, chưa thêm)
- [x] Bổ sung brand **Gotech** (12 sản phẩm, dữ liệu từ gotech.vn) và **Teyes** (8 sản phẩm, dữ liệu + giá thật từ teyes.vn) trong danh mục "Màn Hình Ô Tô" — cả 2 chia loại Có/Không Camera 360, kèm logo chính hãng
- [x] **Ẩn** brand Kovar và Safeview khỏi danh mục "Màn Hình Ô Tô" (cờ `hidden: true`, giữ nguyên dữ liệu, lọc ở `catalog-render.js` — có thể bật lại dễ dàng sau này)
- [x] **Thiết kế lại trang chi tiết danh mục** (`category-chi-tiet.html`) — áp dụng chung cho mọi danh mục:
  - Poster về chiều cao chuẩn (300/200/170px desktop/tablet/mobile), tiêu đề overlay trực tiếp lên poster + gợi ý cuộn xuống ("Xem thương hiệu" nhấp nháy) để khách biết bên dưới còn danh sách thương hiệu
  - Lưới thương hiệu chuyển sang flexbox: chuẩn 4 ô/hàng, hàng cuối thiếu ô (VD chỉ 3 hãng) tự canh giữa thay vì lệch trái, các ô luôn đồng đều kích thước
  - Logo thương hiệu to hơn (56px → 72px)
  - Giảm 50% khoảng cách breadcrumb/poster/tiêu đề

- [x] Bổ sung danh mục **"Android Box Ô Tô"** với 4 hãng, tổng 21 sản phẩm thật (thu thập song song qua 4 agent nền theo hãng):
  - VIETMAP: BS10, BS10 Lite, BM9 (3 sản phẩm, dữ liệu từ vietmap.vn)
  - Zestech: DX165, DX265, DX300, DX350, DX14 Plus (5 sản phẩm, dữ liệu từ zestech.vn — ảnh gốc định dạng WebP lưu đuôi .jpg)
  - Carlinkit: TBox Plus 8GB/4GB, TBox Ambient 8GB/4GB/SDM660, TBox S1 (6 sản phẩm)
  - Elliview (ICAR): D5 Premium+, D5 Plus 2, D5 Lite+, D5 Neo+, D5 Neo, D5PVF, D5VF (7 sản phẩm)
  - Logo chính hãng đủ cả 4 thương hiệu (VIETMAP/Zestech tái dùng logo có sẵn từ danh mục khác; Elliview lấy từ icar.vn; Carlinkit — logo trên CDN chính (carlinkit.com) bị chặn hotlink (403), người dùng gửi trực tiếp logo lấy từ carlinkit.com.au để tải về)
  - Xóa placeholder "Đang cập nhật" của mục này, đã push lên GitHub Pages và xác nhận deploy

- [x] Bổ sung dữ liệu thật cho danh mục **"Camera Hành Trình - 360 Độ"** (VIETMAP giữ nguyên, ẩn FINEVU theo yêu cầu):
  - UTOUR: C2L, C2 Max, C3L (combo trước-sau), C3 và C3M (gương điện tử AI ADAS) — 5 sản phẩm, đây là toàn bộ sản phẩm thật đang bán (dữ liệu từ utourvietnam.vn, akauto.com.vn)
  - 70mai: 4K T800, Omni X800 4K (360 độ), A810, 4K A800SE, A510, A500S, M310, T400 — 8 sản phẩm (dữ liệu từ shop70mai.vn)
  - BlackVue: ELITE 10, ELITE 9, ELITE 8, DR770X-2CH II — 4 sản phẩm (dữ liệu từ msport.vn, nhà phân phối chính hãng). Lưu ý: các model DR970X/DR750X từng thấy trong bài viết cũ trên msport.vn đã bị gỡ khỏi catalog hiện tại (URL redirect về trang chủ) nên không đưa vào để tránh dữ liệu sai/lỗi thời
  - Ẩn brand FINEVU (`hidden: true`, giữ nguyên dữ liệu cũ)
  - Logo chính hãng: UTOUR và BlackVue tải thành công từ trang phân phối VN; 70mai chưa tìm được logo đáng tin cậy (trang phân phối chỉ có logo shop riêng, không phải logo hãng)
  - 1 trong 3 agent nền (BlackVue) bị dừng giữa chừng do hết session limit — đã tự hoàn thành nốt phần còn lại thủ công (fetch trực tiếp + verify HTTP status các URL sản phẩm cũ để loại bỏ model không còn bán)

## Việc cần làm tiếp theo (TODO)

- [ ] Lấy dữ liệu sản phẩm thật cho mục "Đồ Bán Tải"
- [ ] Tìm logo chính hãng Titan (Film Cách Nhiệt) và 70mai khi có nguồn đáng tin cậy
- [ ] Bổ sung Kenwood (màn hình/đầu CD) nếu cần mở rộng danh mục Âm thanh ô tô
- [ ] Rà lại giá/thông số các sản phẩm có ghi chú "trang nguồn chưa cập nhật đầy đủ" khi có dữ liệu mới
