// Tạo bản ảnh nhỏ "-400w" cho từng ảnh sản phẩm local (assets/images/products/**) để trang web
// dùng srcset phục vụ đúng kích thước ảnh theo màn hình (di động khỏi tải nguyên bản ảnh 800-1200px
// khi chỉ hiển thị ~300px trong lưới sản phẩm) - phần còn lại của "Ảnh responsive (srcset) cho sản
// phẩm". Ảnh sản phẩm mới upload qua trang quản trị đã ở Cloudinary nên tự resize on-the-fly, không
// cần chạy script này (xem cloudinarySrcset() trong assets/js/catalog-render.js).
// Chạy lại an toàn nhiều lần: bỏ qua ảnh đã có bản -400w hoặc ảnh đã đủ nhỏ.
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const PRODUCTS_DIR = path.join(__dirname, "..", "..", "assets", "images", "products");
const SMALL_WIDTH = 400;
const EXT_RE = /\.(jpe?g|png|webp)$/i;

async function run() {
    const productDirs = fs.readdirSync(PRODUCTS_DIR, { withFileTypes: true }).filter(d => d.isDirectory());
    let created = 0, skippedSmallSource = 0, skippedExists = 0, failed = 0;

    for (const dirent of productDirs) {
        const dir = path.join(PRODUCTS_DIR, dirent.name);
        const files = fs.readdirSync(dir).filter(f => EXT_RE.test(f) && !f.includes("-400w"));

        for (const file of files) {
            const fullPath = path.join(dir, file);
            const dot = file.lastIndexOf(".");
            const smallPath = path.join(dir, `${file.slice(0, dot)}-400w${file.slice(dot)}`);

            if (fs.existsSync(smallPath)) { skippedExists++; continue; }

            try {
                const meta = await sharp(fullPath).metadata();
                if (!meta.width || meta.width <= SMALL_WIDTH + 50) { skippedSmallSource++; continue; }

                // Giữ đúng định dạng gốc (jpg/png/webp) để đuôi file bản nhỏ khớp bản gốc.
                const format = /\.png$/i.test(file) ? "png" : /\.webp$/i.test(file) ? "webp" : "jpeg";
                await sharp(fullPath).resize({ width: SMALL_WIDTH })[format]({ quality: 78 }).toFile(smallPath);
                created++;
            } catch (err) {
                console.error(`Lỗi xử lý ${fullPath}:`, err.message);
                failed++;
            }
        }
    }

    console.log(`Xong. Tạo mới: ${created}, đã có sẵn: ${skippedExists}, ảnh gốc đã đủ nhỏ: ${skippedSmallSource}, lỗi: ${failed}`);
}

run();
