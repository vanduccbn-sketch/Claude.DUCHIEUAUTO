/* =========================================================
   NỘI DUNG CHỮ/ẢNH TRANG CHỦ - admin sửa qua trang quản trị "Trang Chủ"
   Đọc /api/homepage-content, quét toàn trang tìm phần tử có gắn data-content-key /
   data-content-image-key / data-content-count-key rồi điền giá trị tương ứng. Khoá nào admin
   chưa nhập (chuỗi rỗng) thì GIỮ NGUYÊN chữ/ảnh mặc định đã viết sẵn trong index.html - trang chủ
   không bao giờ bị trống dù admin chưa cấu hình gì.
   Thêm 1 chỗ sửa được mới KHÔNG cần sửa file này - chỉ cần gắn data-content-key="ten_khoa" (chữ),
   data-content-image-key="ten_khoa" (ảnh/video poster) hoặc data-content-count-key="ten_khoa" (số
   đếm data-count) vào HTML + thêm khoá vào ALLOWED_KEYS (routes/homepage-content.js) + thêm ô nhập
   ở trang admin.

   CHẾ ĐỘ XEM TRƯỚC: nếu URL có ?preview=<json mã hoá> (mở từ nút "Xem Trước Trang Chủ" ở
   admin/trang-chu.html), dùng THẲNG dữ liệu trong URL thay vì gọi API - cho phép xem trước nội dung
   đang gõ dở, kể cả chưa bấm Lưu, mà không cần ghi tạm vào DB thật rồi phải dọn lại.
   ========================================================= */
(async function () {
    function applyContent(content) {
        document.querySelectorAll("[data-content-key]").forEach(el => {
            const value = content[el.dataset.contentKey];
            if (value) el.textContent = value;
        });

        document.querySelectorAll("[data-content-count-key]").forEach(el => {
            const raw = content[el.dataset.contentCountKey];
            const num = parseInt(raw, 10);
            if (!raw || Number.isNaN(num)) return;
            el.dataset.count = String(num);
        });

        document.querySelectorAll("[data-content-image-key]").forEach(el => {
            const value = content[el.dataset.contentImageKey];
            if (!value) return;
            if (el.tagName === "VIDEO") el.poster = value;
            else el.src = value;
        });
    }

    function showPreviewBanner() {
        const banner = document.createElement("div");
        banner.textContent = "ĐANG XEM TRƯỚC - nội dung chưa lưu, chỉ hiện ở tab này";
        banner.style.cssText = "position:fixed;top:0;left:0;right:0;z-index:99999;background:#f59e0b;color:#1a1a1a;text-align:center;font-weight:700;font-size:13px;padding:8px;letter-spacing:0.3px;";
        document.body.prepend(banner);
    }

    const previewParam = new URLSearchParams(location.search).get("preview");
    if (previewParam) {
        try {
            applyContent(JSON.parse(previewParam));
            showPreviewBanner();
            return;
        } catch (err) {
            // Tham số preview hỏng -> rơi xuống tải bình thường từ API bên dưới.
        }
    }

    if (typeof API_BASE_URL === "undefined") return;

    try {
        const res = await fetch(`${API_BASE_URL}/api/homepage-content`);
        if (!res.ok) return;
        applyContent(await res.json());
    } catch (err) {
        // Im lặng bỏ qua - trang chủ vẫn phải hiện đúng chữ/ảnh mặc định kể cả khi API lỗi/backend ngủ.
    }
})();
