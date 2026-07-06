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

## Việc cần làm tiếp theo (TODO)

- [ ] Triển khai tương tự cho các danh mục sản phẩm còn lại (Màn hình, Camera hành trình, Phuộc, Mâm độ...)
- [ ] Bổ sung Kenwood (màn hình/đầu CD) nếu cần mở rộng danh mục Âm thanh ô tô
- [ ] Rà lại giá/thông số các sản phẩm có ghi chú "trang nguồn chưa cập nhật đầy đủ" khi có dữ liệu mới
