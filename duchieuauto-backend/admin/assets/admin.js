/* =========================================================
   TRANG ADMIN - JS DÙNG CHUNG (auth, gọi API, layout, toast)
   Admin phục vụ cùng domain với API (Express serve static /admin) nên gọi fetch() bằng đường
   dẫn tương đối, không cần cấu hình CORS riêng cho trang admin.
   ========================================================= */
const STORAGE_KEY = "dha_admin";

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
    links.push({ href: "lien-he.html", label: "Liên Hệ / Đặt Lịch", key: "lien-he" });
    if (canManageAds) links.push({ href: "banner.html", label: "Banner", key: "banner" });
    if (canManageAds) links.push({ href: "cau-hinh.html", label: "Cấu Hình", key: "cau-hinh" });
    if (auth.role === "super_admin") links.push({ href: "lich-su.html", label: "Lịch Sử", key: "lich-su" });

    nav.innerHTML = `
        <div class="brand">ĐỨC HIẾU <span>ADMIN</span></div>
        <nav class="admin-nav">
            ${links.map(l => `<a href="${l.href}" class="${l.key === activePage ? "active" : ""}">${l.label}</a>`).join("")}
        </nav>
        <div class="admin-user">
            <span>${auth.username}</span>
            <span class="role-badge ${auth.role}">${ROLE_LABEL[auth.role] || auth.role}</span>
            <button type="button" id="logoutBtn">Đăng Xuất</button>
        </div>
    `;
    document.getElementById("logoutBtn").addEventListener("click", logout);
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
