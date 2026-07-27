/* =========================================================
   TRANG ADMIN - JS DÙNG CHUNG (auth, gọi API, layout, toast)
   Admin phục vụ cùng domain với API (Express serve static /admin) nên gọi fetch() bằng đường
   dẫn tương đối, không cần cấu hình CORS riêng cho trang admin.
   ========================================================= */
const STORAGE_KEY = "dha_admin";

// BẮT BUỘC dùng cho MỌI nội dung do khách công khai tự nhập (tên/SĐT/ghi chú liên hệ, tên/nhận
// xét đánh giá sản phẩm...) trước khi chèn vào innerHTML - nếu không, ai cũng gửi được 1 form công
// khai (liên hệ/đặt lịch/đánh giá) chứa HTML/script độc, và admin mở đúng trang quản lý tương ứng
// (Liên Hệ/Đánh Giá) sẽ VÔ TÌNH TỰ CHẠY SCRIPT đó trong phiên đăng nhập của mình - đủ để đánh cắp
// token admin lưu trong localStorage. Phát hiện thật lúc rà soát bảo mật (2026-07-27) - trước đó
// mọi field khách nhập đều bị chèn thẳng không escape.
function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

// Domain frontend thật (GitHub Pages) - dùng để dựng URL ảnh cho 242 sản phẩm gốc chưa từng
// upload lại qua Cloudinary (cột "image" trong DB đang NULL, quy ước cũ là đường dẫn tương đối
// "assets/images/products/<id>/anh-1.jpg" CHỈ đúng khi mở từ chính domain frontend - trang admin
// nằm ở domain Render hoàn toàn khác nên phải ghép domain này vào, không thể dùng đường dẫn tương
// đối hay "../" như code cũ (đã gây lỗi ảnh vỡ trong danh sách sản phẩm/form sửa).
const FRONTEND_BASE_URL = "https://vanduccbn-sketch.github.io/Claude.DUCHIEUAUTO";

// Trả về URL ảnh sản phẩm dùng được từ trang admin: ảnh mới (Cloudinary, đã là URL đầy đủ) giữ
// nguyên, ảnh cũ (đường dẫn tương đối hoặc chưa có) tự ghép domain frontend vào.
function productImageUrl(p) {
    if (p.image && /^https?:\/\//.test(p.image)) return p.image;
    return `${FRONTEND_BASE_URL}/${p.image || `assets/images/products/${p.id}/anh-1.jpg`}`;
}

function getAuth() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        return null;
    }
}

function setAuth(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function clearAuth() {
    localStorage.removeItem(STORAGE_KEY);
}

function logout() {
    clearAuth();
    window.location.href = "login.html";
}

// Gọi mọi trang (trừ login.html) ngay đầu <script> để chặn truy cập khi chưa đăng nhập/không đủ
// quyền. allowedRoles rỗng/không truyền = chỉ cần đăng nhập, không giới hạn vai trò.
function requireAuth(allowedRoles) {
    const auth = getAuth();
    if (!auth || !auth.token) {
        window.location.href = "login.html";
        return null;
    }
    if (allowedRoles && allowedRoles.length && !allowedRoles.includes(auth.role)) {
        window.location.href = "dashboard.html";
        return null;
    }
    return auth;
}

async function apiFetch(path, options = {}) {
    const auth = getAuth();
    const headers = { ...(options.headers || {}) };
    if (auth && auth.token) headers["Authorization"] = "Bearer " + auth.token;
    // Không tự set Content-Type khi body là FormData (upload ảnh) - để trình duyệt tự thêm
    // đúng boundary multipart/form-data.
    if (options.body && !(options.body instanceof FormData) && typeof options.body !== "string") {
        headers["Content-Type"] = "application/json";
        options.body = JSON.stringify(options.body);
    } else if (options.body && typeof options.body === "string") {
        headers["Content-Type"] = "application/json";
    }

    const res = await fetch(path, { ...options, headers });
    if (res.status === 401) {
        clearAuth();
        window.location.href = "login.html";
        throw new Error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
    }
    return res;
}

const ROLE_LABEL = { content: "Content Admin", ads: "Ads Admin", super_admin: "Super Admin" };

// Dựng thanh điều hướng trên cùng, tự ẩn/hiện mục theo vai trò đăng nhập. Gọi ở mỗi trang sau
// khi requireAuth() thành công, truyền vào tên trang hiện tại để tô sáng mục đang chọn.
function renderAdminNav(auth, activePage) {
    const nav = document.getElementById("adminTopbar");
    if (!nav) return;

    const canEditPosts = auth.role === "content" || auth.role === "super_admin";
    const canManageAds = auth.role === "ads" || auth.role === "super_admin";
    const links = [{ href: "dashboard.html", label: "Tổng Quan", key: "dashboard" }];
    if (canEditPosts) links.push({ href: "san-pham.html", label: "Sản Phẩm", key: "san-pham" });
    if (canEditPosts) links.push({ href: "bai-viet.html", label: "Bài Viết", key: "bai-viet" });
    if (canEditPosts) links.push({ href: "danh-muc.html", label: "Danh Mục / FAQ", key: "danh-muc" });
    if (canEditPosts) links.push({ href: "danh-gia.html", label: "Đánh Giá", key: "danh-gia" });
    if (canEditPosts) links.push({ href: "trang-chu.html", label: "Trang Chủ", key: "trang-chu" });
    links.push({ href: "lien-he.html", label: "Liên Hệ / Đặt Lịch", key: "lien-he" });
    if (canEditPosts || canManageAds) links.push({ href: "thu-vien-anh.html", label: "Thư Viện Ảnh", key: "thu-vien-anh" });
    if (canManageAds) links.push({ href: "banner.html", label: "Banner", key: "banner" });
    if (canManageAds) links.push({ href: "cau-hinh.html", label: "Cấu Hình", key: "cau-hinh" });
    if (auth.role === "super_admin") links.push({ href: "lich-su.html", label: "Lịch Sử", key: "lich-su" });
    links.push({ href: "tai-khoan.html", label: "Tài Khoản", key: "tai-khoan" });

    nav.innerHTML = `
        <div class="brand">ĐỨC HIẾU <span>ADMIN</span></div>
        <nav class="admin-nav">
            ${links.map(l => `<a href="${l.href}" class="${l.key === activePage ? "active" : ""}">${l.label}</a>`).join("")}
        </nav>
        <div class="global-search" id="globalSearch">
            <input type="text" id="globalSearchInput" placeholder="Tìm sản phẩm, bài viết, liên hệ...">
            <div class="global-search-results" id="globalSearchResults" hidden></div>
        </div>
        <div class="admin-user">
            <span>${auth.username}</span>
            <span class="role-badge ${auth.role}">${ROLE_LABEL[auth.role] || auth.role}</span>
            <button type="button" id="logoutBtn">Đăng Xuất</button>
        </div>
    `;
    document.getElementById("logoutBtn").addEventListener("click", logout);
    loadContactBadge();
    initGlobalSearch(canEditPosts);
}

// Tìm nhanh xuyên suốt admin (sản phẩm/bài viết/liên hệ) ngay từ ô tìm kiếm trên thanh menu -
// trước đây phải vào đúng trang rồi mới lọc/tìm được, không tra cứu nhanh 1 khách hàng hay 1 sản
// phẩm cụ thể từ bất kỳ đâu. Chỉ tìm sản phẩm/bài viết nếu role đang xem được (canEditPosts) -
// liên hệ thì mọi role admin đều xem được nên luôn tìm.
function initGlobalSearch(canEditPosts) {
    const input = document.getElementById("globalSearchInput");
    const resultsBox = document.getElementById("globalSearchResults");
    let debounceTimer;

    input.addEventListener("input", () => {
        clearTimeout(debounceTimer);
        const q = input.value.trim();
        if (q.length < 2) { resultsBox.hidden = true; return; }
        debounceTimer = setTimeout(() => runGlobalSearch(q, canEditPosts, resultsBox), 300);
    });

    document.addEventListener("click", (e) => {
        if (!document.getElementById("globalSearch").contains(e.target)) resultsBox.hidden = true;
    });
}

async function runGlobalSearch(q, canEditPosts, resultsBox) {
    resultsBox.hidden = false;
    resultsBox.innerHTML = `<div class="gsr-loading">Đang tìm...</div>`;

    const sections = [];
    try {
        if (canEditPosts) {
            const [productsRes, postsRes] = await Promise.all([
                apiFetch(`/api/products/admin/list?q=${encodeURIComponent(q)}`),
                apiFetch("/api/posts/admin/all")
            ]);
            const products = await productsRes.json();
            const posts = (await postsRes.json()).filter(p => p.title.toLowerCase().includes(q.toLowerCase()));

            if (products.length) sections.push({
                label: "Sản phẩm", items: products.slice(0, 6).map(p => ({
                    text: `${p.name} <span class="gsr-sub">${p.brand_name}</span>`,
                    href: `san-pham-form.html?id=${p.id}`
                }))
            });
            if (posts.length) sections.push({
                label: "Bài viết", items: posts.slice(0, 6).map(p => ({
                    text: p.title, href: `bai-viet-form.html?id=${p.id}`
                }))
            });
        }

        const contactsRes = await apiFetch("/api/contacts");
        const contacts = (await contactsRes.json()).filter(c =>
            c.name.toLowerCase().includes(q.toLowerCase()) || c.phone.includes(q)
        );
        if (contacts.length) sections.push({
            label: "Liên hệ / Đặt lịch", items: contacts.slice(0, 6).map(c => ({
                text: `${c.name} <span class="gsr-sub">${c.phone}</span>`, href: "lien-he.html"
            }))
        });

        if (sections.length === 0) {
            resultsBox.innerHTML = `<div class="gsr-empty">Không tìm thấy kết quả cho "${q}"</div>`;
            return;
        }
        resultsBox.innerHTML = sections.map(s => `
            <div class="gsr-section">
                <div class="gsr-label">${s.label}</div>
                ${s.items.map(i => `<a href="${i.href}" class="gsr-item">${i.text}</a>`).join("")}
            </div>`).join("");
    } catch (err) {
        resultsBox.innerHTML = `<div class="gsr-empty">Lỗi tìm kiếm, vui lòng thử lại.</div>`;
    }
}

// Số liên hệ/đặt lịch "Mới" chưa xử lý - hiện thẳng trên menu để không phải bấm vào mới biết có
// khách mới, tránh bỏ sót (mọi vai trò admin đều xem được trang Liên Hệ nên gọi chung ở đây).
async function loadContactBadge() {
    try {
        const res = await apiFetch("/api/contacts");
        if (!res.ok) return;
        const contacts = await res.json();
        const newCount = contacts.filter(c => c.status === "new").length;
        if (newCount === 0) return;
        const link = document.querySelector('.admin-nav a[href="lien-he.html"]');
        if (link) link.insertAdjacentHTML("beforeend", ` <span class="nav-badge">${newCount}</span>`);
    } catch (err) { /* chỉ là gợi ý phụ - lỗi không chặn nav chính */ }
}

function showToast(message, isError) {
    let toast = document.getElementById("adminToast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "adminToast";
        toast.className = "toast";
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.className = "toast show" + (isError ? " error" : "");
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove("show"), 3200);
}

function formatDateTime(sqlDateStr) {
    if (!sqlDateStr) return "";
    const d = new Date(sqlDateStr.replace(" ", "T") + "Z");
    return d.toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
