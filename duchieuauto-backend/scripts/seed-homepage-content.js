/**
 * Chèn đúng chữ/ảnh THẬT đang hiển thị trên trang chủ (index.html) vào bảng homepage_content,
 * để trang admin mở lên là thấy sẵn nội dung thật (sửa vài chữ nhỏ), không phải gõ lại từ đầu.
 * Dùng ON CONFLICT DO NOTHING - chạy lại an toàn, không ghi đè khoá nào admin đã lỡ sửa.
 * Chạy 1 lần: node scripts/seed-homepage-content.js
 */
require("dotenv").config();
const db = require("../models/db");

const SEED_VALUES = {
    hero_subtitle: "Premium Automotive Upgrade",
    hero_title_line1: "ĐỊNH HÌNH PHONG CÁCH",
    hero_title_line2: "ĐẲNG CẤP XẾ YÊU",
    hero_description: "Trung tâm chăm sóc và nâng cấp ô tô chuyên nghiệp hàng đầu.",
    hero_poster_image: "assets/images/nen1.webp",

    about_badge: "Về Đức Hiếu Auto",
    about_slogan_line1: "Nâng Tầm",
    about_slogan_line2: "Trải Nghiệm",
    about_description: "Mỗi chi tiết chúng tôi nâng cấp — một dàn âm thanh sống động hơn, một hệ thống đèn rực rỡ hơn, một lớp phim bảo vệ hoàn hảo hơn — đều không chỉ để chiếc xe đẹp hơn, mà để mỗi hành trình của bạn trở nên đáng nhớ hơn. Đội ngũ kỹ thuật viên giàu kinh nghiệm cùng trang thiết bị hiện đại tại Đức Hiếu Auto luôn đặt trải nghiệm khách hàng lên hàng đầu, trong từng sản phẩm chính hãng và từng công đoạn thi công.",
    about_stat1_number: "250",
    about_stat1_label: "Sản phẩm chính hãng",
    about_stat2_number: "35",
    about_stat2_label: "Thương hiệu quốc tế",
    about_stat3_number: "11",
    about_stat3_label: "Danh mục dịch vụ",
    about_image_main: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=1000&auto=format&fit=crop",
    about_image_detail1: "assets/images/about/detail-1.jpg",
    about_image_detail2: "assets/images/about/detail-2.jpg",

    service_section_title: "DỊCH VỤ CHUYÊN NGHIỆP",

    quick_actions_section_title: "SẴN SÀNG PHỤC VỤ NGAY",
    quick_actions_cta1_label: "Đặt Lịch Hẹn",
    quick_actions_cta1_title: "Giữ Chỗ Trước, Không Phải Chờ Đợi",
    quick_actions_cta1_desc: "Chọn ngày giờ phù hợp, đến đúng hẹn là được phục vụ ngay",
    quick_actions_cta2_label: "Nhắc Bảo Dưỡng",
    quick_actions_cta2_title: "Không Bao Giờ Quên Lịch Bảo Dưỡng Xe",
    quick_actions_cta2_desc: "Để lại thông tin, chúng tôi tự nhắc đúng thời điểm cần bảo dưỡng",

    product_section_title: "SẢN PHẨM CHIẾN LƯỢC",
    product_cta_label: "Khám Phá Thêm",
    product_cta_title: "Xem Tất Cả Danh Mục Sản Phẩm",
    product_cta_desc: "Hàng trăm sản phẩm chính hãng đang chờ bạn khám phá",

    tech_eyebrow: "Công Nghệ Thật - Sản Phẩm Thật",
    tech_section_title: "GIẢI MÃ CÔNG NGHỆ",
    tech_intro: `Không phải món "đồ chơi ô tô" nào cũng như nhau. Đây là 4 công nghệ thật sự đang được Đức Hiếu Auto tin dùng — mỗi sản phẩm một câu chuyện, một lý do khiến chúng tôi lựa chọn cho khách hàng.`,

    contact_eyebrow: "Luôn Sẵn Sàng Hỗ Trợ Bạn",
    contact_title_main: "KẾT NỐI VỚI",
    contact_title_accent: "ĐỨC HIẾU AUTO",
    contact_intro: "Dù bạn muốn gọi ngay, nhắn tin nhanh hay ghé trực tiếp cửa hàng — chọn cách thuận tiện nhất với bạn. Đội ngũ kỹ thuật viên luôn sẵn sàng tư vấn cho xế cưng của bạn.",
    contact_channel1_title: "Gọi Ngay",
    contact_channel1_desc: "Tư vấn trực tiếp, nhanh chóng",
    contact_channel2_title: "Chat Zalo",
    contact_channel2_desc: "Gửi ảnh xe, nhận báo giá tức thì",
    contact_channel3_title: "Messenger",
    contact_channel3_desc: "Kết nối qua Facebook",
    contact_channel4_title: "Ghé Cửa Hàng",
    contact_channel4_desc: "251 Lý Thái Tổ, Phường Buôn Ma Thuột, Đắk Lắk",
    contact_form_title: "Để Lại Lời Nhắn",
    contact_form_desc: "Điền thông tin bên dưới, chúng tôi sẽ liên hệ tư vấn trong thời gian sớm nhất.",

    footer_brand_desc: "Trung tâm nâng cấp và chăm sóc ô tô chuyên nghiệp tại Buôn Ma Thuột — màn hình, âm thanh, ánh sáng, PPF và phụ kiện bán tải chính hãng.",
    footer_col1_title: "Nội Thất Ô Tô",
    footer_col2_title: "Ngoại Thất & Khác",
    footer_col3_title: "Liên Kết Nhanh",
    footer_copyright: "© 2026 Đức Hiếu Auto. All rights reserved.",

    faq_page_title: "CÂU HỎI THƯỜNG GẶP",
    faq_page_intro: "Tổng hợp những thắc mắc khách hàng hỏi nhiều nhất về dịch vụ nâng cấp và chăm sóc ô tô tại Đức Hiếu Auto. Không tìm thấy câu trả lời bạn cần? Liên hệ trực tiếp qua Zalo/hotline để được tư vấn nhanh nhất.",
    policy_page_title: "CHÍNH SÁCH BẢO HÀNH - ĐỔI TRẢ - BẢO MẬT",
    booking_page_title: "ĐẶT LỊCH HẸN THI CÔNG",
    booking_page_intro: "Điền thông tin bên dưới, đội ngũ tư vấn Đức Hiếu Auto sẽ gọi điện xác nhận lịch hẹn trong thời gian sớm nhất — thường trong vòng 30-60 phút giờ hành chính."
};

(async () => {
    await db.ready;

    // DO NOTHING không phân biệt được "khoá đã tồn tại nhưng đang rỗng" (VD do lỡ dọn dữ liệu test)
    // với "khoá admin đã thật sự nhập chữ" - dùng CASE để chỉ ghi đè khi giá trị hiện tại đang rỗng,
    // giữ nguyên mọi khoá admin đã có nội dung thật.
    const insertIfMissing = db.prepare(`
        INSERT INTO homepage_content (key, value, updated_at) VALUES (@key, @value, @updated_at)
        ON CONFLICT(key) DO UPDATE SET
            value = CASE WHEN value IS NULL OR value = '' THEN excluded.value ELSE value END,
            updated_at = CASE WHEN value IS NULL OR value = '' THEN excluded.updated_at ELSE updated_at END
    `);
    const now = new Date().toISOString();

    for (const [key, value] of Object.entries(SEED_VALUES)) {
        await insertIfMissing.run({ key, value, updated_at: now });
    }

    console.log(`Đã xử lý ${Object.keys(SEED_VALUES).length} khoá - chỉ khoá đang rỗng được điền lại chữ/ảnh thật, khoá đã có nội dung admin nhập được giữ nguyên.`);
    process.exit(0);
})();
