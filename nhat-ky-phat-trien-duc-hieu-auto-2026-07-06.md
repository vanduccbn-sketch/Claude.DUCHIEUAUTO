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

## Việc cần làm tiếp theo (TODO)

- [ ] Triển khai tương tự cho các brand còn lại trong Màn hình (Gotech, Kovar, Teyes, Safeview) và Camera hành trình (UTOUR, 70mai, FINEVU, BlackVue)
- [ ] Triển khai danh mục Phuộc, Mâm độ (còn placeholder)
- [ ] Bổ sung Kenwood (màn hình/đầu CD) nếu cần mở rộng danh mục Âm thanh ô tô
- [ ] Rà lại giá/thông số các sản phẩm có ghi chú "trang nguồn chưa cập nhật đầy đủ" khi có dữ liệu mới
