/* =========================================================
   PRE-RENDER TRANG CHỦ (Phase 3B - kế hoạch nâng cấp tháng 9/2026)
   ---------------------------------------------------------
   Nạp trang chủ bằng trình duyệt thật (Puppeteer), đợi JS render xong 4 khối động
   (Dịch Vụ / Sản Phẩm Chiến Lược / Giải Mã Công Nghệ / dải logo thương hiệu), rồi ghi
   HTML đã render thẳng vào index.html giữa các marker <!--PR:xxx:START--> ... <!--PR:xxx:END-->.
   Nhờ đó Google/Facebook/Zalo và cả người dùng thật nhận trang chủ có sẵn nội dung, không
   phải chờ 13 file JS + gọi API mới thấy gì.

   Client JS vẫn chạy đè bình thường (idempotent - render lại đúng nội dung đó); nếu API lỗi
   thì catalog-render.js giữ nguyên nội dung prerender (đã sửa: chỉ ẩn khi container trống).

   CÁCH CHẠY (cần Node >= 18 + `npm i puppeteer` trong thư mục scripts/):
       node scripts/prerender-home.mjs
   Chạy lại mỗi khi đổi "Sản Phẩm Chiến Lược" / "Giải Mã Công Nghệ" / dịch vụ, rồi commit index.html.
   (Xem .github/workflows/prerender-home.yml để chạy tự động - nếu đã tạo.)

   LƯU Ý ENCODING: đọc/ghi index.html BẮT BUỘC dùng utf-8 tường minh - repo có nhiều tiếng Việt.
   ========================================================= */

import { readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { dirname, join, extname } from "node:path";
import puppeteer from "puppeteer";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const INDEX = join(ROOT, "index.html");
const PORT = 8791;

const MIME = {
    ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8", ".json": "application/json; charset=utf-8",
    ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml", ".ico": "image/x-icon", ".mp4": "video/mp4",
    ".woff": "font/woff", ".woff2": "font/woff2", ".ttf": "font/ttf"
};

// Khối động -> class container để dựng lại <div class="..."> quanh nội dung đã render.
const TARGETS = {
    services: "swiper-wrapper service-catalog-grid",
    strategic: "swiper-wrapper strategic-products-grid",
    tech: "swiper-wrapper tech-stories-grid",
    brands: "brand-marquee-track"
};

function serveStatic() {
    return new Promise((resolve) => {
        const server = createServer(async (req, res) => {
            try {
                let p = decodeURIComponent(req.url.split("?")[0]);
                if (p === "/" || p.endsWith("/")) p += "index.html";
                if (!extname(p)) {
                    // đường dẫn đẹp không đuôi (vd /product) -> thử thêm .html
                    try { await readFile(join(ROOT, p + ".html")); p += ".html"; } catch {}
                }
                const buf = await readFile(join(ROOT, p));
                res.writeHead(200, { "Content-Type": MIME[extname(p)] || "application/octet-stream" });
                res.end(buf);
            } catch {
                res.writeHead(404); res.end("404");
            }
        });
        server.listen(PORT, "127.0.0.1", () => resolve(server));
    });
}

const CLEAN_IN_PAGE = (targets) => {
    const out = {};
    const strip = (el) => {
        if (!el) return "";
        const c = el.cloneNode(true);
        c.querySelectorAll(".swiper-slide").forEach((s) => {
            s.className = (s.className || "")
                .replace(/\bswiper-slide-(active|next|prev|visible|fully-visible|duplicate|duplicate-active|duplicate-next|duplicate-prev)\b/g, "")
                .replace(/\s{2,}/g, " ").trim();
            ["style", "role", "aria-label", "data-swiper-slide-index", "aria-hidden"].forEach((a) => s.removeAttribute(a));
        });
        c.querySelectorAll(".aos-init, .aos-animate").forEach((e) => {
            e.classList.remove("aos-init", "aos-animate");
            if (!e.getAttribute("class")) e.removeAttribute("class");
        });
        return c.innerHTML.trim();
    };
    for (const [key, cls] of Object.entries(targets)) {
        out[key] = strip(document.querySelector("." + cls.split(" ").pop()));
    }
    return out;
};

async function main() {
    const server = await serveStatic();
    const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 900 });
        // hostname không phải localhost/127.0.0.1 -> api-config.js gọi thẳng api.duchieuauto.vn
        // (API cho phép origin 127.0.0.1 sẵn - xem duchieuauto-worker/src/index.js isOriginAllowed)
        await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: "networkidle0", timeout: 60000 });
        await page.waitForFunction(
            () => document.querySelectorAll(".service-catalog-grid > *").length > 0
               && document.querySelectorAll(".strategic-products-grid > *").length > 0
               && document.querySelectorAll(".tech-stories-grid > *").length > 0
               && document.querySelectorAll(".brand-marquee-track > *").length > 0,
            { timeout: 30000 }
        );
        const fragments = await page.evaluate(CLEAN_IN_PAGE, TARGETS);

        let html = await readFile(INDEX, "utf-8");
        let changed = 0;
        for (const [key, cls] of Object.entries(TARGETS)) {
            const inner = fragments[key];
            if (!inner) { console.warn(`  [bo qua] ${key}: rong`); continue; }
            const re = new RegExp(`<!--PR:${key}:START-->[\\s\\S]*?<!--PR:${key}:END-->`);
            if (!re.test(html)) throw new Error(`Khong tim thay marker PR:${key} trong index.html`);
            const repl = `<!--PR:${key}:START--><div class="${cls}">${inner}</div><!--PR:${key}:END-->`;
            const next = html.replace(re, () => repl);
            if (next !== html) { html = next; changed++; }
            console.log(`  ${key}: ${inner.length} ky tu`);
        }
        // giữ CRLF cho khớp phần còn lại của repo
        html = html.replace(/\r\n|\n/g, "\r\n");
        await writeFile(INDEX, html, "utf-8");
        console.log(`\nDONE - da cap nhat ${changed}/4 khoi trong index.html`);
    } finally {
        await browser.close();
        server.close();
    }
}

main().catch((e) => { console.error(e); process.exit(1); });
