# Đánh Giá Ảnh Hưởng SEO Khi Chuyển Sản Phẩm/Bài Viết Sang API (CMS)

Ngày: 2026-07-26. Bối cảnh: từ Phase 5-7, nội dung sản phẩm/danh mục/bài viết đã chuyển từ file
tĩnh (`catalog-data.js`) sang gọi API backend (`/api/products/*`, `/api/posts/*`) rồi render bằng
JavaScript phía trình duyệt (client-side rendering - CSR). Tài liệu này đánh giá việc đó ảnh hưởng
gì tới SEO, mức độ nghiêm trọng thực tế, và việc đã tự khắc phục được ngay.

## 1. Phát hiện quan trọng nhất: sitemap.xml thiếu 293 trang - ĐÃ SỬA

Trước khi bàn tới CSR, kiểm tra `sitemap.xml`/`robots.txt` hiện tại phát hiện 1 vấn đề độc lập,
nghiêm trọng hơn và **không liên quan gì tới việc trang có chạy JS hay không**: file `sitemap.xml`
là file viết tay 1 lần từ trước khi có CMS sản phẩm (Phase 7), chỉ liệt kê 18 URL cố định (trang
chủ, 8 danh mục, 4 bài viết mẫu ban đầu...) - **hoàn toàn không có URL riêng cho 242 sản phẩm hay
phần lớn trang thương hiệu/phân loại**. Sitemap không tự cập nhật khi admin thêm/sửa/xoá dữ liệu
qua CMS.

Hậu quả thực tế: Google có xu hướng ưu tiên crawl các URL được khai báo trong sitemap; thiếu sitemap
không có nghĩa Google không bao giờ tìm ra trang sản phẩm (vẫn có thể tìm qua link nội bộ), nhưng
làm chậm việc phát hiện, giảm tần suất crawl lại, và là tín hiệu gián tiếp về mức độ đầy đủ của site.
Với 242 sản phẩm thực tế đang bán, đây là thất thoát traffic tìm kiếm dài hạn ("long-tail") đáng kể.

**Đã khắc phục:** viết `duchieuauto-backend/scripts/generate-sitemap.js` - đọc trực tiếp dữ liệu
thật từ Turso (danh mục, thương hiệu/nhóm sản phẩm, phân loại con, sản phẩm không ẩn, bài viết đã
xuất bản) và sinh lại `sitemap.xml` đầy đủ, có `<lastmod>` lấy từ `updated_at` thật (sitemap cũ
không có `lastmod` nào). Đã chạy: **311 URL** (7 trang tĩnh + 8 danh mục + 31 thương hiệu/nhóm +
242 sản phẩm + 4 bài viết), so với 18 URL trước đó.

**Giới hạn cần biết:** đây KHÔNG phải cơ chế tự động hoàn toàn - vì frontend là site tĩnh trên
GitHub Pages (không có server để sinh sitemap theo từng request), sitemap vẫn là 1 file tĩnh cần
**chạy lại `node scripts/generate-sitemap.js` rồi `git push`** mỗi khi thêm/xoá nhiều sản phẩm
hoặc bài viết. Sẽ ghi chú việc này vào `huong-dan-viet-content-nhan-vien.md`. Nếu muốn tự động
hoàn toàn (sitemap luôn khớp DB không cần chạy tay), cần 1 route backend trả sitemap động - khả thi
nhưng đòi hỏi đổi domain khai báo trong `robots.txt` sang domain Render, rủi ro Google không công
nhận sitemap khác domain nếu không xác minh riêng qua Search Console; **để dành quyết định này cho
khi có domain riêng**, không tự làm ngay vì đổi domain sitemap ảnh hưởng cấu hình đã có.

## 2. Rủi ro thật từ việc render nội dung bằng JavaScript (CSR)

### 2a. Googlebot - rủi ro THẤP, không cần hành động ngay
Googlebot render JavaScript tốt (dùng Chromium thật) nên vẫn index được nội dung sản phẩm/bài viết.
Rủi ro duy nhất là **độ trễ**: crawl HTML thô và render JS là 2 hàng đợi riêng, việc render có thể
trễ vài ngày đến vài tuần sau khi trang được crawl lần đầu - nghĩa là sản phẩm mới thêm hôm nay có
thể mất thời gian dài hơn bình thường mới xuất hiện trên kết quả tìm kiếm với nội dung đầy đủ. Có
thể theo dõi thực tế qua Google Search Console (mục "Kiểm tra URL") thay vì đoán.

### 2b. Bot mạng xã hội (Facebook/Zalo/Telegram) - rủi ro TRUNG BÌNH, ảnh hưởng chia sẻ
Các bot này **không chạy JavaScript**, chỉ đọc đúng HTML gốc trả về từ server. Với trang sản phẩm/
bài viết, thẻ `<title>`/`<meta description>`/Open Graph **được cập nhật bằng JS** sau khi gọi API
xong (xem `renderProductDetail()`/`renderBlogDetail()` trong `catalog-render.js`/`blog-render.js`).
Khi khách chia sẻ 1 link sản phẩm/bài viết cụ thể lên Zalo/Facebook, preview hiện ra sẽ là tiêu đề/
mô tả **mặc định chung của trang** (khai báo cứng trong HTML gốc) thay vì đúng tên/giá/ảnh sản phẩm
đó - giảm độ hấp dẫn khi khách chia sẻ link cho người khác, gián tiếp giảm traffic từ mạng xã hội.

### 2c. AI crawler / GEO (GPTBot, ClaudeBot, PerplexityBot...) - rủi ro CAO nhất, đáng quan tâm nhất
Phần lớn crawler của các AI answer engine hiện tại **không chạy JavaScript** (khác Googlebot), chỉ
đọc HTML thô. Với các trang phụ thuộc hoàn toàn vào API để hiển thị nội dung chính (sản phẩm, bài
viết, JSON-LD schema đều được `injectJsonLd()`/`injectBreadcrumbSchema()` chèn bằng JS), các bot
này gần như **không thấy được nội dung thật** - chỉ thấy khung trang rỗng. Trong bối cảnh tìm kiếm
qua AI (ChatGPT, Perplexity...) đang tăng, đây là rủi ro thực tế nhất trong 3 loại: dù nội dung đã
viết chuẩn SEO/GEO (theo Phase 9.4/9.6), các AI này có thể hoàn toàn không "nhìn thấy" để trích dẫn.

### 2d. Core Web Vitals (LCP) - rủi ro THẤP-TRUNG BÌNH, ảnh hưởng thứ hạng
Nội dung chính (ảnh sản phẩm, tiêu đề) chỉ render sau khi round-trip gọi API xong, thay vì có sẵn
ngay trong HTML - làm tăng "Largest Contentful Paint", 1 tín hiệu xếp hạng của Google. Mức ảnh hưởng
thực tế phụ thuộc tốc độ API (Render free tier có thể "ngủ" sau thời gian không dùng, lần gọi đầu
chậm vài giây) - xem thêm mục Lighthouse để có số đo cụ thể thay vì suy đoán.

## 3. Mức độ ưu tiên theo loại trang

| Trang | Rủi ro CSR | Đã có gì giảm nhẹ |
|---|---|---|
| Trang chủ (`index.html`) | Thấp | Phần lớn nội dung SEO chính (hero, giới thiệu) đã nằm sẵn trong HTML tĩnh; chỉ carousel sản phẩm chiến lược/công nghệ phụ thuộc API |
| Danh mục/thương hiệu | Trung bình | Có `seo.intro`/`seo.image` tĩnh cho trang danh mục (Phase claude-seo); breadcrumb/ItemList schema qua JS |
| Chi tiết sản phẩm | Trung bình-Cao | Chưa có gì - title/meta/OG/schema đều set bằng JS sau khi gọi API |
| Chi tiết bài viết | Trung bình-Cao | Chưa có gì - tương tự sản phẩm |

## 4. Hướng khắc phục (không tự triển khai - cần quyết định theo effort/lợi ích)

Xếp theo effort tăng dần:

1. **Sitemap đầy đủ + `lastmod`** - ĐÃ LÀM (mục 1).
2. **Dynamic rendering cho bot** (effort trung bình): thêm middleware ở backend, khi phát hiện
   User-Agent là bot (Googlebot cũ hơn/social bot/AI crawler) thì trả về HTML đã pre-render sẵn
   (dùng Puppeteer chạy 1 lần, cache lại) thay vì để bot tự chạy JS. Cải thiện đồng thời cả mục
   2b và 2c mà không cần đổi kiến trúc frontend hiện tại. Google từng khuyến nghị cách này cho các
   site JS nặng; vẫn hoạt động tốt với social bot/AI bot không chạy JS.
3. **SSR/SSG thật** (effort cao): viết lại bằng framework có render phía server (Next.js hoặc
   tương tự) hoặc build tĩnh (generate sẵn 1 file HTML/sản phẩm mỗi khi admin lưu). Giải quyết
   triệt để mọi rủi ro ở mục 2, nhưng đòi hỏi viết lại toàn bộ frontend đang hoạt động ổn định -
   **không khuyến nghị làm ngay**, chỉ cân nhắc nếu traffic từ tìm kiếm/AI trở thành vấn đề đo
   được rõ ràng qua Search Console, hoặc khi có nhu cầu nâng cấp lớn khác trùng thời điểm.

## 5. Đo lường thực tế bằng Lighthouse (trên production thật)

Chạy Lighthouse desktop thật (không phải suy đoán) trên 2 trang đại diện:

| Trang | Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|---|
| Trang chủ | 87 | 93 | 96 | 100 |
| Chi tiết sản phẩm (`jbl-club-64`) | 82 | 95 | 100 | 100 |

Lưu ý điểm **SEO 100 ở cả 2 trang không mâu thuẫn** với rủi ro nêu ở mục 2: Lighthouse dùng Chrome
thật (có chạy JS) để chấm điểm, nên nó đánh giá đúng những gì **Googlebot** thấy - không đại diện
cho những gì social bot/AI crawler (không chạy JS) thấy. Đây chính là lý do phải phân tích riêng ở
mục 2 thay vì chỉ dựa vào điểm Lighthouse.

**Phát hiện cụ thể đáng chú ý:** trang chi tiết sản phẩm có `Cumulative Layout Shift = 0.234`
(ngưỡng "tốt" là dưới 0.1) - tức 1 trang bị coi là kém ổn định về mặt hiển thị. Truy nguyên bằng
audit "layout-shifts" của Lighthouse: nguyên nhân chính đến từ `#relatedProductsSection` và
`#recentlyViewedSection` - 2 khối này khai báo `hidden` trong HTML gốc, chỉ gỡ `hidden` bằng JS
sau khi gọi API xong, khiến toàn bộ chiều cao của chúng xuất hiện đột ngột và đẩy nội dung bên dưới
(phần đánh giá, footer) dịch chuyển - hệ quả trực tiếp của CSR (mục 2d).

**Đã sửa 1 phần:** thêm `min-height: 90px` cho `.reviews-list` (`assets/css/catalog-pages.css`) -
giảm nhẹ biên độ shift cho riêng phần đánh giá. **Chưa sửa root cause chính** (2 section ẩn/hiện
đột ngột): cách sửa triệt để đòi hỏi đổi từ `hidden` sang hiện sẵn khung skeleton chờ trước (thay
đổi hành vi hiển thị khi section không có dữ liệu) - vượt phạm vi "kiểm tra Lighthouse" của việc
này, để lại như 1 việc cụ thể có thể làm sau nếu muốn cải thiện thêm điểm Performance/CWV.

## 6. Khuyến nghị hành động

- **Ngắn hạn (đã làm):** sitemap đầy đủ.
- **Theo dõi thay vì đoán:** dùng Google Search Console (miễn phí, chỉ cần xác minh domain) để xem
  thực tế Google có index đúng nội dung sản phẩm/bài viết không, và tốc độ crawl lại sau khi sitemap
  mới được nộp. Nếu số liệu vẫn ổn, không cần vội đầu tư vào mục 4.2/4.3.
- **Trung hạn, nếu muốn cải thiện chia sẻ mạng xã hội cụ thể (mục 2b) mà chưa cần làm dynamic
  rendering toàn diện:** có thể cân nhắc thêm 1 vài trang sản phẩm/bài viết được ghé thăm nhiều
  nhất dưới dạng HTML tĩnh có sẵn meta đúng (không cần làm cho toàn bộ 242 sản phẩm).
- **Dài hạn:** cân nhắc mục 4.2 (dynamic rendering) khi có thời gian, đặc biệt nếu muốn ưu tiên
  hiển thị tốt trên các AI answer engine (rủi ro cao nhất, mục 2c).
