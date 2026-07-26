/* =========================================================
   GẮN MÃ TRACKING TOÀN SITE (Phase 5 - CMS)
   Đọc /api/settings (Ads admin cấu hình qua trang quản trị) rồi tự gắn Google Analytics, Facebook
   Pixel, thẻ xác minh Google Search Console. Cần nạp assets/js/api-config.js TRƯỚC file này.
   Lỗi khi gọi API (backend chưa chạy/đang ngủ) sẽ bị bỏ qua âm thầm - không được để hỏng trải
   nghiệm trang chính vì mã tracking.
   ========================================================= */
(async function () {
    if (typeof API_BASE_URL === "undefined") return;

    try {
        const res = await fetch(`${API_BASE_URL}/api/settings`);
        if (!res.ok) return;
        const settings = await res.json();

        if (settings.google_analytics_id) {
            const gaScript = document.createElement("script");
            gaScript.async = true;
            gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${settings.google_analytics_id}`;
            document.head.appendChild(gaScript);

            window.dataLayer = window.dataLayer || [];
            window.gtag = function () { window.dataLayer.push(arguments); };
            gtag("js", new Date());
            gtag("config", settings.google_analytics_id);
        }

        if (settings.facebook_pixel_id) {
            /* eslint-disable */
            !function (f, b, e, v, n, t, s) {
                if (f.fbq) return; n = f.fbq = function () {
                    n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)
                };
                if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0";
                n.queue = []; t = b.createElement(e); t.async = !0;
                t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s)
            }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
            /* eslint-enable */
            fbq("init", settings.facebook_pixel_id);
            fbq("track", "PageView");
        }

        if (settings.google_search_console_verification) {
            const meta = document.createElement("meta");
            meta.name = "google-site-verification";
            meta.content = settings.google_search_console_verification;
            document.head.appendChild(meta);
        }
    } catch (err) {
        // Im lặng bỏ qua - trang chính vẫn phải chạy bình thường kể cả khi backend tracking lỗi.
    }
})();
