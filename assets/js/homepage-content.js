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
   ========================================================= */
(async function () {
    if (typeof API_BASE_URL === "undefined") return;

    try {
        const res = await fetch(`${API_BASE_URL}/api/homepage-content`);
        if (!res.ok) return;
        const content = await res.json();

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
    } catch (err) {
        // Im lặng bỏ qua - trang chủ vẫn phải hiện đúng chữ/ảnh mặc định kể cả khi API lỗi/backend ngủ.
    }
})();
