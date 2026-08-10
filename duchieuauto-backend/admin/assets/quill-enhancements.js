/* =========================================================
   QUILL ENHANCEMENTS - dùng chung cho san-pham-form.html + bai-viet-form.html
   Gom mọi tiện ích thêm cho khung soạn thảo Quill vào 1 file riêng (không nhét vào admin.js dùng
   chung mọi trang) vì chỉ 2 trang này cần tới. Mỗi hàm độc lập, trang gọi hàm nào thì dùng tính
   năng đó - không có gì tự chạy nếu không được gọi.
   Cần nạp SAU quill.min.js, TRƯỚC cropperjs (nếu dùng cắt ảnh) và trước script khởi tạo trang.

   QUAN TRỌNG: sửa file này xong PHẢI tăng số "?v=N" ở thẻ <script> nạp file này trong
   san-pham-form.html/bai-viet-form.html (VD ?v=4 -> ?v=5) - phát hiện thật lúc sửa lỗi nút "Cắt
   ảnh"/Tìm & Thay thế: cache CDN của Cloudflare cho static asset đôi khi vẫn phục vụ bản cũ ở 1 số
   điểm cache dù đã deploy xong và đợi hết hạn cache thông thường, đổi tên URL (qua query string) là
   cách duy nhất chắc chắn ép tải bản mới ngay lập tức, không phụ thuộc thời gian cache hết hạn.
   ========================================================= */

// ---- CSS dùng chung cho mọi phần tử enhancement (modal, banner nháp, đếm chữ...) - tiêm 1 lần ----
function injectQuillEnhancementStyles() {
    if (document.getElementById("qeStyles")) return;
    const style = document.createElement("style");
    style.id = "qeStyles";
    style.textContent = `
        .qe-overlay { position: fixed; inset: 0; background: rgba(21,23,28,0.55); z-index: 9998; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .qe-modal { background: #fff; border-radius: 10px; box-shadow: var(--shadow); width: 100%; max-width: 420px; padding: 22px 24px; max-height: 88vh; overflow-y: auto; }
        .qe-modal h3 { margin: 0 0 14px; font-size: 16px; }
        .qe-modal .form-group { margin-bottom: 12px; }
        .qe-modal .form-group label { display: block; font-size: 13px; font-weight: 700; margin-bottom: 6px; }
        .qe-modal input[type="text"] { width: 100%; padding: 10px 12px; border: 1px solid var(--border); border-radius: 6px; font-size: 14px; font-family: inherit; }
        .qe-close { position: absolute; top: 14px; right: 16px; background: none; border: none; font-size: 20px; cursor: pointer; color: var(--text-muted); line-height: 1; }
        .qe-word-count { text-align: right; font-size: 12px; color: var(--text-muted); margin-top: 6px; }
        .qe-draft-banner { display: flex; align-items: center; justify-content: space-between; gap: 12px; background: #FFF8E6; border: 1px solid #F0C36D; color: #7A5B00; border-radius: 6px; padding: 10px 14px; margin-bottom: 10px; font-size: 13px; flex-wrap: wrap; }
        .qe-draft-banner .btn { padding: 6px 12px; font-size: 12.5px; }
        .ql-editor blockquote { border-left: 4px solid #F0C36D; background: #FFFBF0; padding: 10px 16px; margin: 12px 0; border-radius: 0 6px 6px 0; font-style: normal; color: #5B4A00; }
        .ql-editor blockquote::before { content: "💡 Lưu ý: "; font-weight: 700; }
        .ql-editor table { border-collapse: collapse; }
        .ql-editor table td { min-width: 60px; }
        .qe-crop-img-wrap { max-height: 55vh; overflow: hidden; background: #222; }
        .qe-crop-img-wrap img { display: block; max-width: 100%; }
        .qe-inline-crop-btn { position: absolute; z-index: 50; background: var(--dark); color: #fff; border: none; border-radius: 6px; padding: 6px 12px; font-size: 12.5px; cursor: pointer; box-shadow: var(--shadow); white-space: nowrap; }
        .qe-inline-crop-btn:hover { background: var(--primary); }
        .ql-editor img { cursor: pointer; }
        .qe-selection-toolbar { position: absolute; z-index: 60; display: flex; align-items: center; gap: 2px; background: var(--dark); border-radius: 8px; padding: 4px; box-shadow: var(--shadow); }
        .qe-selection-toolbar button { background: none; border: none; color: #fff; width: 30px; height: 28px; border-radius: 5px; font-size: 13px; cursor: pointer; }
        .qe-selection-toolbar button:hover { background: rgba(255,255,255,0.15); }
        .qe-selection-toolbar button.active { background: var(--primary); }
        .qe-sel-sep { width: 1px; height: 18px; background: rgba(255,255,255,0.25); margin: 0 2px; }

        /* Phóng to các điểm/cạnh kéo của Cropper.js - mặc định chỉ 5px (quá nhỏ, khó rê trúng chuột
           - user báo thật khó dùng), ghi đè luôn cả media query tự thu nhỏ ".point-se" về 5px trên
           màn hình rộng ≥1200px (mặc định Cropper coi đây là "nút chính" nên giữ to ở màn nhỏ, nhưng
           lại thu nhỏ đúng lúc màn hình admin desktop rộng - ngược với nhu cầu thật). */
        .cropper-point { width: 16px !important; height: 16px !important; opacity: 0.9 !important; background-color: var(--primary); border-radius: 50%; border: 2px solid #fff; box-shadow: 0 1px 3px rgba(0,0,0,.5); }
        .cropper-point.point-e, .cropper-point.point-w { margin-top: -8px !important; }
        .cropper-point.point-n, .cropper-point.point-s { margin-left: -8px !important; }
        .cropper-point.point-e, .cropper-point.point-ne, .cropper-point.point-se { right: -8px !important; }
        .cropper-point.point-w, .cropper-point.point-nw, .cropper-point.point-sw { left: -8px !important; }
        .cropper-point.point-n, .cropper-point.point-ne, .cropper-point.point-nw { top: -8px !important; }
        .cropper-point.point-s, .cropper-point.point-se, .cropper-point.point-sw { bottom: -8px !important; }
        .cropper-line.line-e, .cropper-line.line-w { width: 10px !important; }
        .cropper-line.line-e { right: -5px !important; }
        .cropper-line.line-w { left: -5px !important; }
        .cropper-line.line-n, .cropper-line.line-s { height: 10px !important; }
        .cropper-line.line-n { top: -5px !important; }
        .cropper-line.line-s { bottom: -5px !important; }

        /* Chuyển đổi Cắt/Làm mờ trong modal cắt ảnh - "Làm mờ" dùng để che logo/SĐT của bên khác khi
           dán ảnh có sẵn watermark, tách hẳn khỏi thao tác cắt để không xung đột thao tác kéo chuột. */
        .qe-crop-mode-toolbar { display: flex; gap: 8px; margin-bottom: 10px; }
        .qe-crop-mode-btn { padding: 7px 14px; border: 1px solid var(--border); border-radius: 6px; background: #fff; cursor: pointer; font-size: 13px; font-weight: 600; }
        .qe-crop-mode-btn.active { background: var(--dark); color: #fff; border-color: var(--dark); }
        .qe-blur-overlay { position: absolute; inset: 0; z-index: 50; cursor: crosshair; display: none; }
        .qe-blur-drag-box { position: absolute; border: 2px dashed #fff; background: rgba(57,153,255,0.25); pointer-events: none; }
    `;
    document.head.appendChild(style);
}

// ---- 12. Công cụ làm mờ 1 vùng NGAY trong modal cắt ảnh (dùng chung cho cả 2 luồng cắt ảnh) -----
// Cần khi ảnh dán vào có sẵn logo/watermark/SĐT của bên khác (hay gặp khi copy nguyên trang web đối
// thủ) cần che trước khi dùng - làm ngay trong modal, không cần công cụ ngoài. Kéo chuột chọn vùng
// hình chữ nhật -> làm mờ NGAY vùng đó (không cần nút "xác nhận" riêng, làm mờ được nhiều vùng liên
// tiếp). Ghi đè ảnh đang hiện trong Cropper qua cropper.replace(url, true) để vùng mờ được GIỮ LẠI
// khi người dùng tiếp tục kéo/cắt/zoom - không dùng CSS filter (chỉ là hiệu ứng thị giác, không
// "khắc" vào dữ liệu ảnh thật, sẽ mất khi cắt/lưu ảnh cuối cùng).
// getCroppedCanvas() trả về null nếu bấm "Cắt & Thay Ảnh" ngay sau khi vừa dùng công cụ Làm Mờ (gọi
// cropper.replace() trước đó) - Cropper.js cần tải lại ảnh MỚI (qua 1 thẻ <img> nội bộ riêng) trước
// khi canvas/crop box sẵn sàng lại, việc này thật sự bất đồng bộ (đo thật: vài trăm ms, có lúc hơn
// 1 giây tuỳ tốc độ máy) - đợi 1 khung hình (requestAnimationFrame) là KHÔNG đủ (bug thật phát hiện
// qua test tự động: luôn luôn null nếu chỉ thử lại vài khung hình). Poll bằng setTimeout, đủ lâu để
// bao trọn cả trường hợp máy chậm, trước khi báo lỗi thật cho người dùng.
function qeGetCroppedCanvasSafe(cropper, options, attempt = 0) {
    return new Promise((resolve) => {
        const canvas = cropper.getCroppedCanvas(options);
        if (canvas || attempt >= 10) return resolve(canvas);
        setTimeout(() => resolve(qeGetCroppedCanvasSafe(cropper, options, attempt + 1)), 150);
    });
}

function qeSetupBlurTool(modalRoot, imgEl, cropper) {
    const cropBtn = modalRoot.querySelector('[data-crop-mode="crop"]');
    const blurBtn = modalRoot.querySelector('[data-crop-mode="blur"]');
    const hint = modalRoot.querySelector(".qe-crop-mode-hint");
    const container = modalRoot.querySelector(".cropper-container");
    if (!cropBtn || !blurBtn || !container) return;

    const overlay = document.createElement("div");
    overlay.className = "qe-blur-overlay";
    container.appendChild(overlay);

    let masterCanvas = null;
    let dragStart = null;
    let dragBox = null;
    let blurModeActive = false;

    function getMasterCanvas() {
        if (!masterCanvas) {
            masterCanvas = document.createElement("canvas");
            masterCanvas.width = imgEl.naturalWidth;
            masterCanvas.height = imgEl.naturalHeight;
            masterCanvas.getContext("2d").drawImage(imgEl, 0, 0);
        }
        return masterCanvas;
    }

    function setMode(mode) {
        blurModeActive = mode === "blur";
        cropBtn.classList.toggle("active", !blurModeActive);
        blurBtn.classList.toggle("active", blurModeActive);
        overlay.style.display = blurModeActive ? "block" : "none";
        // disable() thay vì setDragMode("none") - CHỈ disable() mới chặn được HẲN thao tác kéo/giãn
        // vùng cắt ĐANG CÓ SẴN của Cropper (setDragMode("none") chỉ chặn tạo vùng MỚI, để lọt thao
        // tác kéo/giãn vùng cũ đè lên overlay làm mờ - bug thật phát hiện qua test tự động: kéo
        // chuột thật lúc "Làm Mờ" vẫn kéo trúng vùng cắt của Cropper thay vì chọn vùng mờ).
        if (blurModeActive) cropper.disable(); else cropper.enable();
        if (hint) hint.textContent = blurModeActive
            ? "Kéo chuột để chọn vùng cần làm mờ (VD logo/SĐT của bên khác) - có thể làm mờ nhiều vùng liên tiếp, xong bấm lại \"Cắt\" để cắt như bình thường."
            : "Kéo góc/viền để chọn vùng cắt, kéo vào giữa để di chuyển.";
    }

    // Bắt sự kiện ở CAPTURE phase trên document (không phải bubble phase trên overlay) + luôn
    // stopPropagation() khi đang ở chế độ Làm Mờ - đảm bảo chạy TRƯỚC và CHẶN HẲN mọi listener kéo/
    // giãn vùng cắt có sẵn của chính Cropper.js (nằm đè lên/xung quanh overlay). Đây là kỹ thuật
    // tương tự đã dùng cho nút nổi "Cắt ảnh" (qeEnableInlineImageCrop) - đơn giản tắt setDragMode
    // hay cropper.disable() KHÔNG đủ: setDragMode("none") chỉ tắt tạo vùng cắt mới, không tắt di
    // chuyển/kéo giãn vùng cắt ĐANG CÓ (bug thật phát hiện qua test tự động: kéo chuột thật lúc Làm
    // Mờ vẫn kéo trúng vùng cắt của Cropper); còn cropper.disable() thì lại làm cropper.replace() về
    // sau không cập nhật được ảnh hiển thị nữa (bug thật KHÁC, cũng phát hiện qua test).
    document.addEventListener("mousedown", (e) => {
        if (!blurModeActive) return;
        const rect = overlay.getBoundingClientRect();
        if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) return;
        e.preventDefault();
        e.stopPropagation();
        dragStart = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        dragBox = document.createElement("div");
        dragBox.className = "qe-blur-drag-box";
        overlay.appendChild(dragBox);
    }, true);
    document.addEventListener("mousemove", (e) => {
        if (!dragStart) return;
        e.stopPropagation();
        const rect = overlay.getBoundingClientRect();
        const x = e.clientX - rect.left, y = e.clientY - rect.top;
        const left = Math.min(x, dragStart.x), top = Math.min(y, dragStart.y);
        dragBox.style.left = `${left}px`;
        dragBox.style.top = `${top}px`;
        dragBox.style.width = `${Math.abs(x - dragStart.x)}px`;
        dragBox.style.height = `${Math.abs(y - dragStart.y)}px`;
    }, true);
    document.addEventListener("mouseup", (e) => {
        if (!dragStart) return;
        e.stopPropagation();
        const box = {
            left: parseFloat(dragBox.style.left) || 0,
            top: parseFloat(dragBox.style.top) || 0,
            width: parseFloat(dragBox.style.width) || 0,
            height: parseFloat(dragBox.style.height) || 0
        };
        dragBox.remove();
        dragBox = null;
        dragStart = null;
        if (box.width < 4 || box.height < 4) return; // quá nhỏ, coi như bấm nhầm

        // Đổi toạ độ trong overlay (= toạ độ trong .cropper-container) sang toạ độ ảnh GỐC (pixel
        // thật) qua getCanvasData() - {left, top, width, height, naturalWidth, naturalHeight} đều
        // tính tương đối so với .cropper-container, cùng hệ toạ độ với overlay.
        const cd = cropper.getCanvasData();
        const scaleX = cd.naturalWidth / cd.width;
        const scaleY = cd.naturalHeight / cd.height;
        const nx = (box.left - cd.left) * scaleX;
        const ny = (box.top - cd.top) * scaleY;
        const nw = box.width * scaleX;
        const nh = box.height * scaleY;

        const canvas = getMasterCanvas();
        const ctx = canvas.getContext("2d");
        ctx.save();
        ctx.beginPath();
        ctx.rect(nx, ny, nw, nh);
        ctx.clip();
        ctx.filter = `blur(${Math.max(8, Math.min(nw, nh) * 0.06)}px)`;
        ctx.drawImage(canvas, 0, 0);
        ctx.restore();

        // cropper.replace() không cập nhật lại ảnh hiển thị nếu cropper đang ở trạng thái disable()
        // (bug thật khác phát hiện qua test tự động) - bật tạm lại enable() đúng lúc gọi replace(),
        // xong disable() lại ngay để tiếp tục chặn thao tác kéo/giãn vùng cắt cũ (vẫn đang ở chế độ
        // Làm Mờ, có thể làm mờ thêm vùng khác tiếp).
        cropper.enable();
        cropper.replace(canvas.toDataURL("image/png"), true);
        cropper.disable();
    }, true);

    cropBtn.addEventListener("click", () => setMode("crop"));
    blurBtn.addEventListener("click", () => setMode("blur"));
    setMode("crop");
}

// ---- Modal dùng chung (Alt Text, Tìm & Thay thế, Cắt ảnh đều tái dùng cái này) ----
// onClose (tuỳ chọn): gọi đúng 1 lần khi modal đóng theo BẤT KỲ cách nào - kể cả bấm nút "✕"/nhấn
// Esc/bấm ra ngoài, không chỉ riêng các nút bấm tự viết trong onMount(). Quan trọng cho các hàm trả
// về Promise (Alt Text, cắt ảnh...): thiếu hook này thì đóng modal theo cách khác ngoài nút chính sẽ
// làm Promise treo mãi mãi (không bao giờ resolve/reject), phải tải lại trang mới thoát được - bug
// thật phát hiện khi rà lại toàn bộ modal.
function qeOpenModal({ title, bodyHtml, onMount, width, onClose }) {
    injectQuillEnhancementStyles();
    const overlay = document.createElement("div");
    overlay.className = "qe-overlay";
    overlay.innerHTML = `
        <div class="qe-modal" style="${width ? `max-width:${width};` : ""}position:relative;">
            <button type="button" class="qe-close" aria-label="Đóng">✕</button>
            <h3>${title}</h3>
            <div class="qe-modal-body">${bodyHtml}</div>
        </div>`;
    document.body.appendChild(overlay);

    let closed = false;
    function close() {
        if (closed) return;
        closed = true;
        overlay.remove();
        document.removeEventListener("keydown", onEsc);
        if (onClose) onClose();
    }
    function onEsc(e) { if (e.key === "Escape") close(); }
    document.addEventListener("keydown", onEsc);
    overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
    overlay.querySelector(".qe-close").addEventListener("click", close);

    if (onMount) onMount(overlay.querySelector(".qe-modal-body"), close);
    return { close, overlay };
}

// ---- 1. Đếm số từ / ký tự - hiện ngay dưới khung soạn thảo ----
function qeInitWordCount(quill) {
    const el = document.createElement("div");
    el.className = "qe-word-count";
    quill.container.insertAdjacentElement("afterend", el);
    function update() {
        const text = quill.getText(); // luôn có \n ở cuối
        const trimmed = text.trim();
        const words = trimmed ? trimmed.split(/\s+/).length : 0;
        el.textContent = `${words} từ · ${Math.max(0, text.length - 1)} ký tự`;
    }
    quill.on("text-change", update);
    update();
}

// ---- 2. Hoàn tác / Làm lại - gắn vào 2 nút có sẵn trong toolbar ----
function qeInitUndoRedo(quill, undoBtn, redoBtn) {
    if (undoBtn) undoBtn.addEventListener("click", (e) => { e.preventDefault(); quill.history.undo(); });
    if (redoBtn) redoBtn.addEventListener("click", (e) => { e.preventDefault(); quill.history.redo(); });
}

// ---- 3. Bắt nhập Alt Text khi chèn ảnh (KHÔNG bắt buộc, chỉ gợi ý - luôn bỏ qua được) - gọi TRƯỚC
// khi insertEmbed, trả về Promise<string>. Đóng modal bằng bất kỳ cách nào (kể cả "✕"/Esc/bấm ra
// ngoài) đều coi như bỏ qua, không chỉ riêng nút "Bỏ Qua" - tránh Promise treo mãi mãi.
function qeAskImageAlt(suggestedText) {
    return new Promise((resolve) => {
        let settled = false;
        const settle = (val) => { if (settled) return; settled = true; resolve(val); };
        qeOpenModal({
            title: "Mô tả ảnh (Alt Text) - không bắt buộc",
            onClose: () => settle(""),
            bodyHtml: `
                <p class="form-hint" style="margin-bottom:10px;">Gợi ý: mô tả ngắn gọn nội dung ảnh giúp Google/AI hiểu ảnh này là gì (tốt cho SEO). Không nhập gì cũng được, bấm "Bỏ Qua" hoặc đóng lại là chèn ảnh ngay.</p>
                <div class="form-group">
                    <input type="text" id="qeAltInput" placeholder="VD: Kỹ thuật viên đánh bóng xe ô tô tại Đức Hiếu Auto">
                </div>
                <div style="display:flex;gap:10px;justify-content:flex-end;">
                    <button type="button" class="btn btn-secondary" id="qeAltSkip">Bỏ Qua</button>
                    <button type="button" class="btn btn-primary" id="qeAltOk">Chèn Ảnh</button>
                </div>`,
            onMount: (root, close) => {
                const input = root.querySelector("#qeAltInput");
                input.value = suggestedText || "";
                input.focus();
                input.select();
                const confirm = () => { settle(input.value.trim()); close(); };
                root.querySelector("#qeAltOk").addEventListener("click", confirm);
                root.querySelector("#qeAltSkip").addEventListener("click", () => { settle(""); close(); });
                input.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); confirm(); } });
            }
        });
    });
}

// ---- 4. Tự động lưu nháp vào localStorage ----
// getExtraFields()/applyExtraFields(obj): lưu kèm các ô KHÁC ngoài nội dung Quill (VD tiêu đề, giá)
// để khôi phục đầy đủ, không chỉ riêng nội dung bài.
function qeInitAutosave({ storageKey, quill, getExtraFields, applyExtraFields, mountBefore }) {
    function save() {
        try {
            localStorage.setItem(storageKey, JSON.stringify({
                html: quill.root.innerHTML,
                extra: getExtraFields ? getExtraFields() : {},
                savedAt: Date.now()
            }));
        } catch (err) { /* localStorage đầy/bị chặn - bỏ qua, không chặn thao tác chính */ }
    }
    function clearDraft() {
        try { localStorage.removeItem(storageKey); } catch (err) { /* bỏ qua */ }
    }

    setInterval(save, 15000);
    window.addEventListener("beforeunload", save);

    // Gọi hàm này SAU khi đã tải xong dữ liệu thật (nếu là sửa) để tránh hiện banner nhầm lúc form
    // còn rỗng trong khoảnh khắc đầu trang vừa load.
    function checkAndShowBanner() {
        let draft;
        try {
            const raw = localStorage.getItem(storageKey);
            if (!raw) return;
            draft = JSON.parse(raw);
        } catch (err) { return; }
        if (!draft || !draft.html) return;
        const plainText = draft.html.replace(/<[^>]+>/g, "").trim();
        if (!plainText) return;

        const banner = document.createElement("div");
        banner.className = "qe-draft-banner";
        const time = new Date(draft.savedAt).toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" });
        banner.innerHTML = `
            <span>🗂️ Phát hiện bản nháp tự động lưu lúc ${time} (chưa bấm Lưu) - khôi phục?</span>
            <span>
                <button type="button" class="btn btn-secondary" id="qeDraftDismiss">Bỏ Qua</button>
                <button type="button" class="btn btn-primary" id="qeDraftRestore">Khôi Phục</button>
            </span>`;
        mountBefore.insertAdjacentElement("beforebegin", banner);
        banner.querySelector("#qeDraftDismiss").addEventListener("click", () => { clearDraft(); banner.remove(); });
        banner.querySelector("#qeDraftRestore").addEventListener("click", () => {
            quill.root.innerHTML = draft.html;
            if (applyExtraFields) applyExtraFields(draft.extra || {});
            banner.remove();
        });
    }

    return { clearDraft, checkAndShowBanner, saveNow: save };
}

// ---- 5. Dán từ Word/Google Docs tự dọn định dạng thừa ----
// Chỉ giữ lại định dạng Quill hiểu (đậm/nghiêng/gạch chân/link/danh sách) - bỏ hết style/class/font
// lạ mà Word hay tự chèn khi dán.
function qeInitPasteCleanup(quill) {
    quill.clipboard.addMatcher(Node.ELEMENT_NODE, (node, delta) => {
        delta.ops = (delta.ops || []).map(op => {
            if (typeof op.insert !== "string" || !op.attributes) return op;
            const allowed = {};
            ["bold", "italic", "underline", "link", "list", "header"].forEach(key => {
                if (op.attributes[key]) allowed[key] = op.attributes[key];
            });
            const next = { insert: op.insert };
            if (Object.keys(allowed).length) next.attributes = allowed;
            return next;
        });
        return delta;
    });
}

// Tìm mọi vị trí khớp "term" theo ĐÚNG không gian chỉ số của Quill (dùng được với deleteText()/
// insertText()/setSelection()) - KHÔNG dùng quill.getText() để tìm vị trí vì hàm đó bỏ hẳn ảnh/embed
// ra khỏi chuỗi trả về (chỉ nối các đoạn "insert" dạng string), làm chỉ số bị lệch dần với chỉ số
// thật của Quill ngay sau tấm ảnh ĐẦU TIÊN trong bài - đây chính là bug thật gây xoá/chèn nhầm chỗ
// (lặp chữ liên tục) khi bài viết có chèn ảnh giữa bài, user báo lại kèm ảnh chụp màn hình cụ thể.
// Duyệt thẳng qua Delta gốc, chỉ tìm khớp bên trong từng đoạn text (không khớp xuyên qua ranh giới
// ảnh), tự cộng dồn đúng 1 đơn vị chỉ số cho mỗi ảnh/embed - khớp chính xác cách Quill đánh số nội bộ.
function qeFindAllPositions(quill, term) {
    const positions = [];
    if (!term) return positions;
    const ops = quill.getContents().ops || [];
    let docIndex = 0;
    ops.forEach(op => {
        if (typeof op.insert === "string") {
            const text = op.insert;
            let from = 0, idx;
            while ((idx = text.indexOf(term, from)) !== -1) {
                positions.push(docIndex + idx);
                from = idx + term.length;
            }
            docIndex += text.length;
        } else {
            docIndex += 1; // ảnh/embed khác - luôn chiếm đúng 1 vị trí trong chỉ số của Quill.
        }
    });
    return positions;
}

// ---- 6. Tìm & Thay thế hàng loạt ----
// Thay theo VĂN BẢN THUẦN (không giữ định dạng riêng của đúng đoạn bị thay) - đủ dùng cho nhu cầu
// sửa lỗi chính tả/đổi tên hàng loạt, không nhằm thay thế công cụ soạn thảo phức tạp.
function qeInitFindReplace(quill, triggerBtn) {
    triggerBtn.addEventListener("click", (e) => {
        e.preventDefault();
        qeOpenModal({
            title: "Tìm & Thay Thế",
            bodyHtml: `
                <div class="form-group">
                    <label>Tìm</label>
                    <input type="text" id="qeFindInput" placeholder="Chữ cần tìm...">
                </div>
                <div class="form-group">
                    <label>Thay bằng</label>
                    <input type="text" id="qeReplaceInput" placeholder="Chữ thay thế...">
                </div>
                <p class="form-hint" id="qeFindStatus">&nbsp;</p>
                <div style="display:flex;gap:10px;justify-content:flex-end;">
                    <button type="button" class="btn btn-secondary" id="qeFindNext">Tìm Tiếp</button>
                    <button type="button" class="btn btn-primary" id="qeReplaceAll">Thay Tất Cả</button>
                </div>`,
            onMount: (root) => {
                const findInput = root.querySelector("#qeFindInput");
                const replaceInput = root.querySelector("#qeReplaceInput");
                const status = root.querySelector("#qeFindStatus");
                findInput.focus();
                let searchFrom = 0;

                function findNext() {
                    const term = findInput.value;
                    if (!term) return;
                    const positions = qeFindAllPositions(quill, term);
                    if (positions.length === 0) { status.textContent = "Không tìm thấy."; return; }
                    let idx = positions.find(p => p >= searchFrom);
                    if (idx === undefined) {
                        idx = positions[0];
                        status.textContent = "Đã quay lại từ đầu bài.";
                    } else {
                        status.textContent = "";
                    }
                    quill.setSelection(idx, term.length);
                    searchFrom = idx + term.length;
                }

                function replaceAll() {
                    const term = findInput.value;
                    if (!term) return;
                    const replacement = replaceInput.value;
                    const positions = qeFindAllPositions(quill, term);
                    // Thay từ cuối bài lên đầu để vị trí các chỗ chưa xử lý không bị lệch.
                    for (let i = positions.length - 1; i >= 0; i--) {
                        quill.deleteText(positions[i], term.length, "user");
                        quill.insertText(positions[i], replacement, "user");
                    }
                    status.textContent = positions.length > 0 ? `Đã thay ${positions.length} chỗ.` : "Không tìm thấy.";
                    searchFrom = 0;
                }

                root.querySelector("#qeFindNext").addEventListener("click", findNext);
                root.querySelector("#qeReplaceAll").addEventListener("click", replaceAll);
                findInput.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); findNext(); } });
            }
        });
    });
}

// ---- 7. Chèn Bảng đơn giản (3x3, gõ trực tiếp vào từng ô) ----
// KHÔNG có nút thêm/xoá dòng-cột tự động (Quill 1.3.7 không có sẵn blot bảng thật, tự viết thêm rủi
// ro cao làm hỏng cả khung soạn thảo) - đủ dùng cho bảng so sánh thông số/giá đơn giản trong bài.
function qeInitTableInsert(quill, triggerBtn) {
    triggerBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const range = quill.getSelection(true) || { index: quill.getLength() };
        const cell = `<td style="border:1px solid #ccc;padding:8px;min-width:60px;">&nbsp;</td>`;
        const row = `<tr>${cell}${cell}${cell}</tr>`;
        const tableHtml = `<table style="width:100%;border-collapse:collapse;margin:12px 0;"><tbody>${row}${row}${row}</tbody></table><p><br></p>`;
        quill.clipboard.dangerouslyPasteHTML(range.index, tableHtml, "user");
    });
}

// ---- 8. Cắt ảnh tuỳ chỉnh (Cropper.js) - gọi TRƯỚC khi upload, trả về Promise<Blob|File> ----
// Cần nạp cropperjs (JS + CSS) trước khi dùng hàm này. aspectRatio bỏ trống = cắt tự do.
function qeCropImageBeforeUpload(file, aspectRatio) {
    return new Promise((resolve) => {
        const objectUrl = URL.createObjectURL(file);
        let cropper;
        let settled = false;
        const finish = (result) => {
            if (settled) return;
            settled = true;
            URL.revokeObjectURL(objectUrl);
            if (cropper) cropper.destroy();
            resolve(result);
        };
        qeOpenModal({
            title: "Cắt Ảnh (Tuỳ Chọn)",
            width: "640px",
            // Đóng modal bằng bất kỳ cách nào khác ngoài 2 nút chính (bấm "✕"/Esc/bấm ra ngoài) -
            // coi như "Dùng Ảnh Gốc", không để Promise treo mãi mãi.
            onClose: () => finish(file),
            bodyHtml: `
                <div class="qe-crop-mode-toolbar">
                    <button type="button" class="qe-crop-mode-btn" data-crop-mode="crop">✂️ Cắt</button>
                    <button type="button" class="qe-crop-mode-btn" data-crop-mode="blur">💧 Làm Mờ</button>
                </div>
                <div class="qe-crop-img-wrap"><img id="qeCropImg" src="${objectUrl}"></div>
                <p class="form-hint qe-crop-mode-hint" style="margin-top:10px;">Kéo góc/viền để chọn vùng cắt, kéo vào giữa để di chuyển. Không cắt gì cũng được, bấm "Dùng Ảnh Gốc".</p>
                <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:10px;">
                    <button type="button" class="btn btn-secondary" id="qeCropSkip">Dùng Ảnh Gốc</button>
                    <button type="button" class="btn btn-primary" id="qeCropConfirm">Cắt & Dùng Ảnh Này</button>
                </div>`,
            onMount: (root, close) => {
                const imgEl = root.querySelector("#qeCropImg");
                // { once: true } - BẮT BUỘC: cropper.replace() (dùng trong công cụ Làm Mờ) tự đổi lại
                // imgEl.src, khiến trình duyệt bắn "load" LẦN NỮA - nếu listener này còn gắn, nó sẽ
                // tạo THÊM 1 Cropper instance mới đè lên biến `cropper` dùng chung, làm nút "Cắt" sau
                // đó thao tác nhầm lên instance cũ/hỏng (bug thật phát hiện qua test tự động:
                // getCroppedCanvas() trả về null vì cropper bên trong nút bấm khác hẳn cropper thật).
                imgEl.addEventListener("load", () => {
                    cropper = new Cropper(imgEl, {
                        aspectRatio: aspectRatio || NaN,
                        viewMode: 1,
                        autoCropArea: 1,
                        background: false,
                        // .cropper-container chỉ thực sự tồn tại trong DOM sau sự kiện "ready" (Cropper
                        // dựng DOM không đồng bộ, không xong ngay lúc constructor return) - gọi
                        // qeSetupBlurTool() sớm hơn sẽ không tìm thấy container, bug thật gặp lúc test.
                        ready: () => qeSetupBlurTool(root, imgEl, cropper)
                    });
                }, { once: true });
                root.querySelector("#qeCropSkip").addEventListener("click", () => { finish(file); close(); });
                const confirmBtn = root.querySelector("#qeCropConfirm");
                confirmBtn.addEventListener("click", async () => {
                    if (!cropper) { finish(file); close(); return; }
                    confirmBtn.disabled = true;
                    confirmBtn.textContent = "Đang xử lý...";
                    const canvas = await qeGetCroppedCanvasSafe(cropper);
                    if (!canvas) { finish(file); close(); return; }
                    canvas.toBlob((blob) => {
                        finish(blob || file);
                        close();
                    }, file.type && file.type.startsWith("image/") ? file.type : "image/jpeg", 0.92);
                });
            }
        });
    });
}

// ---- 9. Cắt lại 1 ảnh ĐÃ CÓ SẴN trong bài (dù chèn qua nút, dán trực tiếp Ctrl+V, hay dán nguyên
// cả trang có ảnh hotlink từ site khác) ----
// Ảnh Cloudinary: dùng crossorigin="anonymous" tải lại trực tiếp là cắt được ngay (Cloudinary vốn
// đã trả về header CORS cho phép). Ảnh domain KHÁC (hotlink từ trang dán vào, VD dán nguyên cả 1
// trang web có nhiều ảnh) - trình duyệt KHÔNG đọc được dữ liệu ảnh đó để cắt do domain gốc không
// cấp quyền CORS cho domain admin, dù có gắn crossorigin cũng chỉ làm ảnh tải lỗi hẳn (bug thật
// user báo kèm ảnh chụp "Không tải lại được ảnh để cắt"). Xử lý: gọi trước
// POST /api/uploads/from-url để SERVER tải hộ ảnh đó về lưu thật lên Cloudinary (server gọi domain
// khác không bị CORS chặn vì CORS chỉ áp dụng cho trình duyệt), rồi cắt trên bản đã lưu này - nhờ
// vậy ảnh ở BẤT KỲ domain nào cũng cắt được, không riêng ảnh dán từng cái một.
async function qeCropRemoteImage(url, purpose) {
    let cropUrl = url;
    if (!/^https:\/\/res\.cloudinary\.com\//.test(url)) {
        const rehostRes = await apiFetch("/api/uploads/from-url", { method: "POST", body: { url, purpose: purpose || "content" } });
        const rehostData = await rehostRes.json();
        if (!rehostRes.ok) throw new Error(rehostData.error || "Không tải được ảnh nguồn để cắt");
        cropUrl = rehostData.url;
    }

    return new Promise((resolve, reject) => {
        let cropper;
        let settled = false;
        const finish = (fn) => { if (settled) return; settled = true; if (cropper) cropper.destroy(); fn(); };
        qeOpenModal({
            title: "Cắt Lại Ảnh",
            width: "640px",
            onClose: () => finish(() => reject(null)),
            bodyHtml: `
                <div class="qe-crop-mode-toolbar">
                    <button type="button" class="qe-crop-mode-btn" data-crop-mode="crop">✂️ Cắt</button>
                    <button type="button" class="qe-crop-mode-btn" data-crop-mode="blur">💧 Làm Mờ</button>
                </div>
                <div class="qe-crop-img-wrap"><img id="qeCropImg2" crossorigin="anonymous" src="${cropUrl}"></div>
                <p class="form-hint qe-crop-mode-hint" style="margin-top:10px;">Kéo góc/viền để chọn vùng cắt, kéo vào giữa để di chuyển.</p>
                <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:10px;">
                    <button type="button" class="btn btn-secondary" id="qeCropCancel2">Huỷ</button>
                    <button type="button" class="btn btn-primary" id="qeCropConfirm2">Cắt & Thay Ảnh</button>
                </div>`,
            onMount: (root, close) => {
                const imgEl = root.querySelector("#qeCropImg2");
                // { once: true } - xem giải thích đầy đủ ở bản qeCropImageBeforeUpload phía trên:
                // cropper.replace() tự đổi imgEl.src, bắn "load" lần nữa, nếu không chặn sẽ tạo thêm
                // 1 Cropper instance đè lên biến dùng chung, làm nút Cắt sau đó thao tác nhầm instance.
                imgEl.addEventListener("load", () => {
                    cropper = new Cropper(imgEl, {
                        viewMode: 1,
                        autoCropArea: 1,
                        background: false,
                        ready: () => qeSetupBlurTool(root, imgEl, cropper)
                    });
                }, { once: true });
                imgEl.addEventListener("error", () => {
                    finish(() => reject(new Error("Không tải lại được ảnh để cắt (lỗi mạng hoặc ảnh đã bị xoá).")));
                    close();
                });
                root.querySelector("#qeCropCancel2").addEventListener("click", () => { finish(() => reject(null)); close(); });
                const confirmBtn2 = root.querySelector("#qeCropConfirm2");
                confirmBtn2.addEventListener("click", async () => {
                    if (!cropper) { finish(() => reject(new Error("Ảnh chưa tải xong, thử lại."))); close(); return; }
                    confirmBtn2.disabled = true;
                    confirmBtn2.textContent = "Đang xử lý...";
                    const canvas = await qeGetCroppedCanvasSafe(cropper);
                    if (!canvas) { finish(() => reject(new Error("Không cắt được ảnh, thử lại."))); close(); return; }
                    canvas.toBlob((blob) => {
                        finish(() => { if (blob) resolve(blob); else reject(new Error("Không cắt được ảnh.")); });
                        close();
                    }, "image/jpeg", 0.92);
                });
            }
        });
    });
}

// Gắn sự kiện: bấm vào BẤT KỲ ảnh nào đã có sẵn trong bài -> hiện nút nổi "✂️ Cắt ảnh" ngay cạnh ảnh
// đó -> cắt xong tự tải ảnh mới lên (purpose "content") rồi thay thế src tại chỗ, giữ nguyên vị trí
// trong bài. quill.update() để Quill nhận biết DOM vừa bị đổi bằng tay (ngoài API của Quill) và lưu
// đúng khi bấm Lưu.
function qeEnableInlineImageCrop(quill, purpose) {
    let activeBtn = null;
    function clearBtn() { if (activeBtn) { activeBtn.remove(); activeBtn = null; } }

    // Tìm ảnh nằm NGAY DƯỚI toạ độ bấm thay vì chỉ kiểm tra e.target === IMG - module resize ảnh
    // (imageResize) chèn 1 lớp phủ trong suốt đè lên trên ảnh đang chọn để bắt thao tác kéo, khiến
    // e.target thực tế là lớp phủ đó chứ không phải chính thẻ <img> (bug thật phát hiện lúc user
    // báo không thấy nút "Cắt ảnh" hiện ra dù bấm đúng vào ảnh).
    function findImageAtPoint(x, y) {
        const imgs = quill.root.querySelectorAll("img");
        for (const img of imgs) {
            const r = img.getBoundingClientRect();
            if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return img;
        }
        return null;
    }

    // Gắn ở CAPTURE phase trên document (không phải bubble phase trên quill.root) để chạy TRƯỚC
    // khi lớp phủ của module resize có cơ hội chặn/dừng sự kiện (stopPropagation) - đảm bảo luôn
    // phát hiện được đúng thời điểm bấm dù phần tử nhận click thực tế là gì.
    document.addEventListener("click", (e) => {
        // Bấm đúng vào nút "Cắt ảnh" đang hiện -> để nút tự xử lý click của chính nó, không dọn nút
        // giữa chừng (nút không nằm đè lên ảnh nên findImageAtPoint() sẽ trả về null cho cú bấm
        // này, nhưng vẫn cần chặn sớm để rõ ràng, không dựa vào thứ tự capture/bubble tình cờ đúng).
        if (activeBtn && (e.target === activeBtn || activeBtn.contains(e.target))) return;
        clearBtn();
        const img = findImageAtPoint(e.clientX, e.clientY);
        if (!img) return;

        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "qe-inline-crop-btn";
        btn.textContent = "✂️ Cắt ảnh";
        document.body.appendChild(btn);
        activeBtn = btn;
        const rect = img.getBoundingClientRect();
        btn.style.top = `${window.scrollY + rect.top - 34}px`;
        btn.style.left = `${window.scrollX + rect.left}px`;

        btn.addEventListener("click", async (ev) => {
            ev.stopPropagation();
            clearBtn();
            try {
                const blob = await qeCropRemoteImage(img.src, purpose);
                const fd = new FormData();
                fd.append("image", blob, "cropped.jpg");
                fd.append("purpose", purpose || "content");
                const res = await apiFetch("/api/uploads", { method: "POST", body: fd });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Tải ảnh thất bại");
                img.src = data.url;
                quill.update("user");
            } catch (err) {
                if (err) showToast(err.message, true);
            }
        });
    }, true);

    document.addEventListener("scroll", clearBtn, true);
    window.addEventListener("resize", clearBtn);
}

// ---- 11. Bảng công cụ mini nổi khi tô chọn chữ (giống Word) - Đậm/Nghiêng/Căn lề/Tiêu đề ----
function qeInitSelectionToolbar(quill) {
    let toolbarEl = null;
    function removeToolbar() { if (toolbarEl) { toolbarEl.remove(); toolbarEl = null; } }

    function buildToolbar(range) {
        removeToolbar();
        const el = document.createElement("div");
        el.className = "qe-selection-toolbar";
        el.innerHTML = `
            <button type="button" data-fmt="bold" title="Đậm"><b>B</b></button>
            <button type="button" data-fmt="italic" title="Nghiêng"><i>I</i></button>
            <span class="qe-sel-sep"></span>
            <button type="button" data-align="" title="Căn trái">☰⟸</button>
            <button type="button" data-align="center" title="Căn giữa">☰⟺</button>
            <button type="button" data-align="right" title="Căn phải">☰⟹</button>
            <span class="qe-sel-sep"></span>
            <button type="button" data-header="2" title="Tiêu đề lớn">H2</button>
            <button type="button" data-header="3" title="Tiêu đề nhỏ">H3</button>
            <button type="button" data-header="" title="Chữ thường">P</button>
        `;
        document.body.appendChild(el);
        toolbarEl = el;

        // preventDefault() ở mousedown (KHÔNG phải click) - đây là cách chuẩn để giữ nguyên vùng
        // đang tô chọn khi bấm nút trên toolbar nổi: nếu không chặn, trình duyệt tự bỏ chọn/chuyển
        // focus ra khỏi khung soạn thảo NGAY khi bấm chuột xuống (trước cả khi sự kiện click tới
        // nút), khiến Quill bắn selection-change về rỗng và toolbar này tự ẩn mất trước khi nút kịp
        // xử lý xong - bug thật gặp phải lúc thử nghiệm ban đầu.
        el.querySelectorAll("button").forEach(btn => btn.addEventListener("mousedown", (e) => e.preventDefault()));

        function updateActiveStates() {
            const current = quill.getFormat(range.index, range.length);
            el.querySelectorAll("[data-fmt]").forEach(b => b.classList.toggle("active", !!current[b.dataset.fmt]));
            el.querySelectorAll("[data-align]").forEach(b => b.classList.toggle("active", (current.align || "") === b.dataset.align));
            el.querySelectorAll("[data-header]").forEach(b => b.classList.toggle("active", String(current.header || "") === b.dataset.header));
        }

        // QUAN TRỌNG: dùng formatText()/formatLine() với ĐÚNG (range.index, range.length) truyền
        // vào - KHÔNG dùng quill.format() (bug thật phát hiện qua test tự động: quill.format() áp
        // dụng theo selection HIỆN TẠI của Quill tại thời điểm gọi, không phải theo range đã ghi
        // nhớ lúc mở toolbar; dù đã preventDefault() mousedown để giữ vùng chọn, selection nội bộ
        // của Quill vẫn có thể lệch/mất theo focus thực tế của trình duyệt khi bấm nút nằm NGOÀI
        // #quillEditor, khiến định dạng bị áp dụng nhầm vào con trỏ rỗng thay vì đúng đoạn đã chọn -
        // bấm "Đậm" không có tác dụng gì). formatText()/formatLine() nhận thẳng toạ độ, không phụ
        // thuộc trạng thái selection hiện tại.
        el.querySelectorAll("[data-fmt]").forEach(btn => {
            btn.addEventListener("click", () => {
                const fmt = btn.dataset.fmt;
                const current = quill.getFormat(range.index, range.length);
                quill.formatText(range.index, range.length, fmt, !current[fmt], "user");
                quill.setSelection(range.index, range.length, "silent");
                updateActiveStates();
            });
        });
        el.querySelectorAll("[data-align]").forEach(btn => {
            btn.addEventListener("click", () => {
                quill.formatLine(range.index, range.length, "align", btn.dataset.align || false, "user");
                quill.setSelection(range.index, range.length, "silent");
                updateActiveStates();
            });
        });
        el.querySelectorAll("[data-header]").forEach(btn => {
            btn.addEventListener("click", () => {
                quill.formatLine(range.index, range.length, "header", btn.dataset.header ? Number(btn.dataset.header) : false, "user");
                quill.setSelection(range.index, range.length, "silent");
                updateActiveStates();
            });
        });

        const bounds = quill.getBounds(range.index, range.length);
        const editorRect = quill.root.getBoundingClientRect();
        const top = window.scrollY + editorRect.top + bounds.top - el.offsetHeight - 10;
        const left = window.scrollX + editorRect.left + bounds.left;
        el.style.top = `${Math.max(window.scrollY + 4, top)}px`;
        el.style.left = `${Math.max(0, left)}px`;

        updateActiveStates();
    }

    quill.on("selection-change", (range) => {
        if (!range || range.length === 0) { removeToolbar(); return; }
        buildToolbar(range);
    });

    // Cuộn/resize trang thì ẩn đi luôn (không tính lại vị trí cho đơn giản) - tô chọn lại chữ sẽ
    // hiện lại đúng vị trí mới.
    document.addEventListener("scroll", removeToolbar, true);
    window.addEventListener("resize", removeToolbar);
}

// ---- 10. Dán ảnh trực tiếp (Ctrl+V, VD ảnh chụp màn hình/copy từ nơi khác) - tự upload lên
// Cloudinary thay vì để Quill nhúng thẳng base64 vào nội dung (mặc định của Quill nếu không chặn) ----
// Nhúng base64 làm nội dung lưu trong DB phình to bất thường VÀ không đi qua được bước cắt ảnh/Alt
// Text như ảnh chèn qua nút - chặn hành vi mặc định NGAY khi phát hiện đúng có file ảnh trong
// clipboard, các loại dán khác (chữ/HTML thường) vẫn để Quill xử lý binh thường như cũ.
function qeInterceptImagePaste(quill, purpose) {
    quill.root.addEventListener("paste", (e) => {
        const clipboardData = e.clipboardData || (e.originalEvent && e.originalEvent.clipboardData);
        const items = clipboardData && clipboardData.items;
        if (!items) return;
        const imageItem = Array.from(items).find(it => it.type && it.type.startsWith("image/"));
        if (!imageItem) return; // Không phải ảnh (chữ/HTML) - để Quill tự xử lý như cũ.

        e.preventDefault();
        e.stopPropagation();
        const file = imageItem.getAsFile();
        if (!file) return;

        (async () => {
            const range = quill.getSelection(true) || { index: quill.getLength() };
            try {
                const finalFile = await qeCropImageBeforeUpload(file);
                const altText = await qeAskImageAlt("");
                const fd = new FormData();
                fd.append("image", finalFile, "pasted-image.png");
                fd.append("purpose", purpose || "content");
                const res = await apiFetch("/api/uploads", { method: "POST", body: fd });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Tải ảnh thất bại");
                quill.insertEmbed(range.index, "image", data.url, "user");
                if (altText) {
                    const [leafBlot] = quill.getLeaf(range.index);
                    if (leafBlot && leafBlot.domNode) leafBlot.domNode.alt = altText;
                }
                quill.setSelection(range.index + 1);
            } catch (err) {
                showToast(err.message, true);
            }
        })();
    });
}
