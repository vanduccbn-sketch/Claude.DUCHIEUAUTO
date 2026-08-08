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
    `;
    document.head.appendChild(style);
}

// ---- Modal dùng chung (Alt Text, Tìm & Thay thế, Cắt ảnh đều tái dùng cái này) ----
function qeOpenModal({ title, bodyHtml, onMount, width }) {
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

    function close() {
        overlay.remove();
        document.removeEventListener("keydown", onEsc);
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

// ---- 3. Bắt nhập Alt Text khi chèn ảnh - gọi TRƯỚC khi insertEmbed, trả về Promise<string> ----
function qeAskImageAlt(suggestedText) {
    return new Promise((resolve) => {
        qeOpenModal({
            title: "Mô tả ảnh (Alt Text)",
            bodyHtml: `
                <p class="form-hint" style="margin-bottom:10px;">Mô tả ngắn gọn nội dung ảnh - giúp Google/AI hiểu ảnh này là gì (tốt cho SEO), và hiện thay ảnh nếu ảnh lỗi không tải được.</p>
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
                const confirm = () => { resolve(input.value.trim()); close(); };
                root.querySelector("#qeAltOk").addEventListener("click", confirm);
                root.querySelector("#qeAltSkip").addEventListener("click", () => { resolve(""); close(); });
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
        qeOpenModal({
            title: "Cắt Ảnh (Tuỳ Chọn)",
            width: "640px",
            bodyHtml: `
                <div class="qe-crop-img-wrap"><img id="qeCropImg" src="${objectUrl}"></div>
                <p class="form-hint" style="margin-top:10px;">Kéo góc/viền để chọn vùng cắt, kéo vào giữa để di chuyển. Không cắt gì cũng được, bấm "Dùng Ảnh Gốc".</p>
                <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:10px;">
                    <button type="button" class="btn btn-secondary" id="qeCropSkip">Dùng Ảnh Gốc</button>
                    <button type="button" class="btn btn-primary" id="qeCropConfirm">Cắt & Dùng Ảnh Này</button>
                </div>`,
            onMount: (root, close) => {
                const imgEl = root.querySelector("#qeCropImg");
                const finish = (result) => {
                    URL.revokeObjectURL(objectUrl);
                    if (cropper) cropper.destroy();
                    close();
                    resolve(result);
                };
                imgEl.addEventListener("load", () => {
                    cropper = new Cropper(imgEl, {
                        aspectRatio: aspectRatio || NaN,
                        viewMode: 1,
                        autoCropArea: 1,
                        background: false
                    });
                });
                root.querySelector("#qeCropSkip").addEventListener("click", () => finish(file));
                root.querySelector("#qeCropConfirm").addEventListener("click", () => {
                    if (!cropper) { finish(file); return; }
                    cropper.getCroppedCanvas().toBlob((blob) => {
                        finish(blob || file);
                    }, file.type && file.type.startsWith("image/") ? file.type : "image/jpeg", 0.92);
                });
            }
        });
    });
}

// ---- 9. Cắt lại 1 ảnh ĐÃ CÓ SẴN trong bài (dù chèn qua nút hay dán trực tiếp Ctrl+V) ----
// Dùng crossorigin="anonymous" khi tải lại ảnh để tránh canvas bị "tainted" (khoá bởi CORS) khi ảnh
// nằm ở domain khác (Cloudinary) - Cloudinary vốn đã trả về header CORS cho phép nên hoạt động được.
// Bấm "Huỷ" -> reject(null), nơi gọi PHẢI kiểm tra lỗi rỗng trước khi hiện toast để không báo lỗi
// nhầm lúc người dùng chỉ đơn giản đổi ý.
function qeCropRemoteImage(url) {
    return new Promise((resolve, reject) => {
        let cropper;
        qeOpenModal({
            title: "Cắt Lại Ảnh",
            width: "640px",
            bodyHtml: `
                <div class="qe-crop-img-wrap"><img id="qeCropImg2" crossorigin="anonymous" src="${url}"></div>
                <p class="form-hint" style="margin-top:10px;">Kéo góc/viền để chọn vùng cắt, kéo vào giữa để di chuyển.</p>
                <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:10px;">
                    <button type="button" class="btn btn-secondary" id="qeCropCancel2">Huỷ</button>
                    <button type="button" class="btn btn-primary" id="qeCropConfirm2">Cắt & Thay Ảnh</button>
                </div>`,
            onMount: (root, close) => {
                const imgEl = root.querySelector("#qeCropImg2");
                let settled = false;
                const finish = (fn) => { if (settled) return; settled = true; if (cropper) cropper.destroy(); close(); fn(); };
                imgEl.addEventListener("load", () => {
                    cropper = new Cropper(imgEl, { viewMode: 1, autoCropArea: 1, background: false });
                });
                imgEl.addEventListener("error", () => {
                    finish(() => reject(new Error("Không tải lại được ảnh để cắt (lỗi mạng hoặc ảnh đã bị xoá).")));
                });
                root.querySelector("#qeCropCancel2").addEventListener("click", () => finish(() => reject(null)));
                root.querySelector("#qeCropConfirm2").addEventListener("click", () => {
                    if (!cropper) { finish(() => reject(new Error("Ảnh chưa tải xong, thử lại."))); return; }
                    cropper.getCroppedCanvas().toBlob((blob) => {
                        finish(() => { if (blob) resolve(blob); else reject(new Error("Không cắt được ảnh.")); });
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
                const blob = await qeCropRemoteImage(img.src);
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
