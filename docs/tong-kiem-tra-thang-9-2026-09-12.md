# Tổng kiểm tra nâng cấp T9 — 2026-09-12

- **Bản trực quan:** https://claude.ai/code/artifact/97a8fd35-337b-4253-920f-d12ccdcc66d5
- **Trạng thái:** 3 commit đang kẹt ở máy local, chưa lên `duchieuauto.vn`.
- **Chặn duy nhất:** cần đăng nhập lại Git (xem mục 2A).

## 0. Việc bắt buộc làm trước tiên

⚠️ Không việc nào khác lên được production cho tới khi làm xong bước 2A. Toàn bộ Phase 4/5/6/7
(đã xong, đã test) đang nằm ở 3 commit trên máy vì thông tin đăng nhập GitHub đã lưu bị hết hạn.

## 1. Đối chiếu Live vs Local (kiểm tra trực tiếp bằng curl lúc viết báo cáo)

| Hạng mục | Trên production ngay bây giờ | Trong commit đang chờ |
|---|---|---|
| canonical, schema cơ bản, sửa datePublished | ✅ Đã lên | — |
| Pre-render trang chủ + Action tự động | ✅ Đã lên, đang chạy (Action tự tạo 1 commit hôm 6/9) | — |
| `catalog-data.js` (227 KB) | ❌ Vẫn đang tải trên mọi trang | ✅ Đã gỡ |
| Schema `WebSite`, `areaServed` mở rộng | ❌ Chưa có | ✅ Sẵn sàng |
| AOS (thư viện hiệu ứng cuộn) | ⚠️ Vẫn tải từ unpkg (chậm) | ✅ Đã chuyển jsdelivr |
| Schema giá sản phẩm (`AggregateOffer`) | N/A - chưa có giá | ✅ Code sẵn sàng |
| Trang `/gioi-thieu.html` | 404 (đúng - chưa public) | Có trong commit, để `noindex` |
| `sw.js` (cache) | `v22` | `v25` |

**Nói cách khác:** mọi việc đã báo "xong" từ Phase 4 trở đi đều chưa thật sự tới tay khách hàng —
chỉ cần đẩy code lên (bước 2A) là toàn bộ có hiệu lực ngay.

## 2. Hướng dẫn từng bước

### A. Đẩy code lên production (bắt buộc, làm trước)

1. Mở PowerShell trên máy tính.
2. Dán đúng 2 dòng lệnh rồi Enter:
   ```
   cd "C:\Users\duc93\Desktop\Đức Hiếu Auto\Claude-DUCHIEUAUTO"
   git push origin master
   ```
3. Một cửa sổ đăng nhập GitHub sẽ hiện ra (trình duyệt hoặc hộp thoại nhỏ) — đăng nhập bằng
   tài khoản `vanduccbn-sketch`. Nếu không thấy gì hiện ra, kiểm tra có cửa sổ trình duyệt mới
   mở ẩn phía sau không.
4. Đăng nhập xong, lệnh tự chạy tiếp, báo `master -> master`. Xong — các lần push sau (kể cả
   khi Claude tự làm) sẽ không hỏi lại.

**Nếu bị hỏi "Username/Password" kiểu cũ** (không phải cửa sổ đăng nhập):
1. Vào https://github.com/settings/tokens (đã đăng nhập `vanduccbn-sketch`).
2. Generate new token → Generate new token (classic). Đặt tên bất kỳ, tick quyền `repo`, tạo.
3. Copy đoạn mã hiện ra (chỉ hiện đúng 1 lần, dạng `ghp_xxxxxxxx`).
4. Dán vào ô "Password" khi Git hỏi (username vẫn là `vanduccbn-sketch`).

Báo mình ngay khi push xong — mình sẽ kiểm tra lại bằng số liệu thật.

### B. Kiểm tra sau khi lên live (~5 phút, không cần kỹ thuật)

- Đợi 1-3 phút cho GitHub Pages build, mở `duchieuauto.vn` bằng **tab ẩn danh**.
- Rich Results Test: https://search.google.com/test/rich-results?url=https://duchieuauto.vn/
- PageSpeed Insights (tab Mobile): https://pagespeed.web.dev/analysis?url=https://duchieuauto.vn/

### C. Nội dung & dữ liệu — việc chỉ anh Đức làm được

| Việc | Ở đâu | Vì sao |
|---|---|---|
| **Sửa hero + "Giới thiệu" trong CMS** (bỏ "ĐẢNG CẤP XẾ YÊU"/"tuyệt vời") | `admin.duchieuauto.vn` → Trang Chủ | Vẫn đang hiện trên live — đã nhắc nhiều lần |
| Hoàn thiện trang Giới thiệu (điền `[ĐIỀN:]` + 5-10 ảnh xưởng) | `gioi-thieu.html` | Phase 2 — cần trước khi gỡ noindex + nối menu |
| Đọc & dán 3 bài nội dung danh mục vào Quill | `admin.duchieuauto.vn` → Danh Mục → chọn danh mục → "Nội dung SEO" | Phase 7 |
| Nhập giá 15-20 sản phẩm chủ lực | `admin.duchieuauto.vn` → Sản Phẩm | Phase 5 — không giá thì schema không hiện |
| Làm theo checklist Google Business Profile | `docs/checklist-google-business-profile.md` | Phase 6 |
| Xác nhận danh sách khu vực nhận khách | báo mình sửa `index.html` | Phase 6 — đã tạm điền Cư M'gar/Buôn Đôn/Krông Pắc/Ea Kar + Đắk Nông |
| Gửi 2-3 ảnh thật thay Unsplash (khối About) | gửi ảnh cho mình | Phase 4 |

3 bài nội dung danh mục ↔ danh mục tương ứng:
- `docs/noi-dung-danh-muc-man-hinh-o-to-NHAP.md` → **Màn Hình Ô Tô**
- `docs/noi-dung-danh-muc-phim-cach-nhiet-NHAP.md` → **Film Cách Nhiệt**
- `docs/noi-dung-danh-muc-ppf-NHAP.md` → **PPF - Wrap Đổi Màu**

### D. Việc kỹ thuật không cần anh nhưng cần biết (tuỳ chọn)

Repo có 2 bản backend: `duchieuauto-backend` (đang chạy thật trên Render, tự deploy khi push)
và `duchieuauto-worker` (Cloudflare, đang chuyển dần sang, **phải deploy tay**). Phase 5 đã sửa
đồng bộ cả 2 bản. Nếu muốn chắc chắn bản Cloudflare cũng mới nhất:
```
cd duchieuauto-worker
npm run deploy
```
Không bắt buộc ngay — chỉ cần khi chính thức chuyển hẳn sang Cloudflare.

## 3. Toàn cảnh 7 phase

| Phase | Nội dung | Trạng thái |
|---|---|---|
| 1 | SEO nền tảng — canonical, schema, sửa lỗi ngày tháng | ✅ Đã lên live |
| 2 | Trang Giới thiệu | ⏳ Nháp xong, chờ nội dung thật |
| 3 | Pre-render trang chủ cho bot + Action tự động | ✅ Đã lên live, đang chạy |
| 4 | Hiệu năng — bỏ 227KB JS thừa, AOS, preconnect/preload | ⏳ Xong, chờ push |
| 4+ | Gộp CSS, cắt Font Awesome | ⛔ Chưa làm — để dành, rủi ro cao hơn |
| 5 | Schema giá sản phẩm (AggregateOffer) | ⏳ Code xong, chờ push + chờ nhập giá |
| 6 | Local SEO, sitemap, checklist GBP | ⏳ Xong, chờ push + chờ anh làm GBP |
| 7 | Nội dung 3 danh mục ưu tiên | ✅ Đủ 3/3 bản nháp, chờ anh duyệt |

## Tóm lại

Đã kiểm tra kỹ, không thấy phần code nào bị bỏ sót so với kế hoạch — mọi thứ làm được mà không
cần thêm dữ liệu đều đã xong và test qua. Nút thắt duy nhất bây giờ là bước 2A (đăng nhập git) —
làm xong, gần như toàn bộ Phase 1–7 sẽ đồng loạt lên live. Sau đó việc còn lại chủ yếu là nội
dung/ảnh/giá — không gấp, gửi dần khi có thời gian.
