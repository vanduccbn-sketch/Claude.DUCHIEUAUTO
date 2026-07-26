/* Đăng ký service worker (PWA) - im lặng bỏ qua nếu trình duyệt không hỗ trợ hoặc đang mở qua
   file:// (đa số trình duyệt chặn service worker ở file://, chỉ hoạt động khi phục vụ qua http/https). */
if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("sw.js").catch(() => { /* không chặn trang nếu đăng ký thất bại */ });
    });
}
