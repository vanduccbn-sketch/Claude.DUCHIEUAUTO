/**
 * Chạy 1 lần duy nhất khi chuyển "Sản Phẩm Chiến Lược"/"Giải Mã Công Nghệ" từ HTML viết cứng
 * trong index.html sang quản lý qua CMS (bảng homepage_highlights) - giữ nguyên đúng nội dung
 * đang hiển thị thật để trang chủ không bị trống ngay sau khi đổi cơ chế.
 *
 * Chạy: node scripts/seed-homepage-highlights.js
 */
require("dotenv").config();
const db = require("../models/db");

const STRATEGIC = [
    { product_id: "jbl-basspro-lite", badge_text: "Giá Sốc", price_tag: "Ưu đãi hôm nay", description: "Loa siêu trầm gầm ghế tích hợp sẵn amply Class D 100W RMS, âm bass chặt chẽ trong thiết kế nhỏ gọn nhất phân khúc." },
    { product_id: "zestech-zx10-cao-cap", badge_text: "Giá Sốc", price_tag: "Giá tốt nhất tháng", description: "Màn hình Android cao cấp chip UIS7862S, khung hợp kim titan tản nhiệt, điều khiển giọng nói AI Kiki, cảnh báo tốc độ/bắn tốc độ." },
    { product_id: "3m-film-4-cho", badge_text: "Giá Sốc", price_tag: "Số lượng có hạn", description: "Trọn gói dán phim cách nhiệt 3M chính hãng, cản tia UV đến 99.9%, cản hồng ngoại đến 97%, giảm chói cả ngày lẫn đêm." }
];

const TECH = [
    { product_id: "xpel-ultimate-plus", tag_text: "PPF - Bảo Vệ Sơn Xe", story_title: "Vết Xước Tự Biến Mất", description: "Một lớp phim trong suốt có thể tự \"chữa lành\" vết xước chỉ sau vài phút dưới nắng — đó là điều <strong>XPEL Ultimate Plus</strong> làm được nhờ công nghệ Clear Coat tự phục hồi 4 lớp, gần như vô hình trên thân xe, chặn đứng tia UV và đá văng trên mọi hành trình." },
    { product_id: "gtr-premium-2-0", tag_text: "Bi LED - Nâng Cấp Ánh Sáng", story_title: "Ánh Sáng Đầu Tiên Trên Thế Giới", description: "<strong>GTR Premium 2.0</strong> là mẫu đèn bi LED đầu tiên trên thế giới dùng 14 nhân LED Osram, đạt chuẩn sản xuất Nhật Bản. Tản nhiệt độc quyền GTR Cooling Ai giữ ánh sáng ổn định suốt hành trình, lớp phủ AR Pro loại bỏ chói mắt xe đối diện — lái đêm an toàn và tự tin hơn." },
    { product_id: "jbl-club-605csq", tag_text: "Loa Phân Tần - Âm Thanh", story_title: "Sân Khấu Âm Nhạc Trong Cabin", description: "Với bộ loa mid-bass, tweeter và phân tần tách rời, <strong>JBL Club 605CSQ</strong> cho phép bố trí \"sân khấu âm thanh\" theo đúng ý bạn — âm thanh tách bạch, chi tiết đến từng nốt nhạc. Lựa chọn của những ai không chấp nhận dàn âm thanh nguyên bản tầm thường." },
    { product_id: "warn-vr-evo-12s", tag_text: "Tời Điện - Cứu Hộ Địa Hình", story_title: "Sẵn Sàng Cho Mọi Địa Hình", description: "Khi bánh xe lún sâu trong bùn hay cần vượt chướng ngại, <strong>WARN VR EVO 12-S</strong> là người bạn đồng hành đáng tin cậy — chuẩn chống nước IP68, thân nhôm nguyên khối, sản xuất tại Hoa Kỳ, điều khiển 2 trong 1 có dây và không dây." }
];

async function run() {
    await db.ready;

    const existing = await db.prepare("SELECT COUNT(*) as c FROM homepage_highlights").get();
    if (existing.c > 0) {
        console.log(`Bảng homepage_highlights đã có ${existing.c} dòng - bỏ qua, không chèn lại (tránh trùng lặp).`);
        process.exit(0);
    }

    for (let i = 0; i < STRATEGIC.length; i++) {
        const it = STRATEGIC[i];
        await db.prepare(`
            INSERT INTO homepage_highlights (section, product_id, badge_text, price_tag, description, sort_order)
            VALUES ('strategic', ?, ?, ?, ?, ?)
        `).run(it.product_id, it.badge_text, it.price_tag, it.description, i);
        console.log("Đã thêm strategic:", it.product_id);
    }

    for (let i = 0; i < TECH.length; i++) {
        const it = TECH[i];
        await db.prepare(`
            INSERT INTO homepage_highlights (section, product_id, tag_text, story_title, description, sort_order)
            VALUES ('tech', ?, ?, ?, ?, ?)
        `).run(it.product_id, it.tag_text, it.story_title, it.description, i);
        console.log("Đã thêm tech:", it.product_id);
    }

    console.log("Xong.");
    process.exit(0);
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
