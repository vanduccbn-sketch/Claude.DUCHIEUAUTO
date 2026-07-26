/**
 * Migrate 4 bài viết tĩnh (Phase 1, từng nằm ở assets/js/blog-data.js phía frontend) vào database
 * thật, để Phase 5 chuyển trang Tin Tức sang gọi API mà không mất nội dung đã viết sẵn.
 * Chạy 1 lần: node scripts/migrate-static-posts.js
 */
require("dotenv").config();
const db = require("../models/db");

function slugify(str) {
    return str
        .toLowerCase()
        .normalize("NFD").replace(/[̀-ͯ]/g, "")
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

const STATIC_POSTS = [
    {
        slug: "5-dau-hieu-nen-dan-phim-cach-nhiet-ngay",
        title: "5 Dấu Hiệu Cho Thấy Xe Bạn Cần Dán Phim Cách Nhiệt Ngay",
        category: "Film Cách Nhiệt",
        cover_image: "assets/images/service/dan-phim-cach-nhiet/poster.jpg",
        excerpt: "Nắng nóng Buôn Ma Thuột khiến nội thất xe nóng rát, tia UV làm bạc màu ghế da theo thời gian. Đây là 5 dấu hiệu rõ ràng nhất cho thấy đã đến lúc dán phim cách nhiệt chính hãng cho xe của bạn.",
        intro: "Phim cách nhiệt không chỉ giúp xe mát hơn mà còn bảo vệ sức khoẻ và nội thất xe về lâu dài. Dưới đây là những dấu hiệu thường gặp nhất mà Đức Hiếu Auto ghi nhận từ khách hàng trước khi quyết định dán phim.",
        sections: [
            { heading: "1. Cabin nóng bức dù đã bật điều hoà tối đa", body: "Nếu xe của bạn vẫn nóng hầm hập sau vài phút bật điều hoà, đặc biệt vào buổi trưa nắng gắt, khả năng cao lớp kính nguyên bản không đủ khả năng cản nhiệt. Phim cách nhiệt chính hãng như 3M hay Titan có thể cản tới 97% tia hồng ngoại, giúp cabin mát nhanh hơn và giảm tải cho hệ thống điều hoà." },
            { heading: "2. Vô lăng, táp-lô nóng rát khi vừa lên xe", body: "Đây là hậu quả trực tiếp của tia hồng ngoại xuyên qua kính chưa được xử lý. Về lâu dài, nhiệt độ cao còn khiến nhựa táp-lô nhanh lão hoá, nứt nẻ, bạc màu." },
            { heading: "3. Ghế da hoặc nội thất bắt đầu bạc màu, nứt nẻ", body: "Tia UV là nguyên nhân chính khiến ghế da, ốp gỗ, taplo xuống cấp nhanh theo thời gian dù xe ít khi đỗ ngoài trời. Phim cách nhiệt chất lượng tốt cản đến 99.9% tia UV, bảo vệ nội thất bền đẹp hơn hẳn." },
            { heading: "4. Chói mắt khi lái xe ban ngày hoặc gặp đèn pha ban đêm", body: "Phim cách nhiệt đúng chuẩn (độ trong phù hợp quy định giao thông) giúp giảm chói, giảm mỏi mắt khi lái xe đường dài mà vẫn đảm bảo tầm nhìn an toàn, không vi phạm luật về độ tối kính lái." },
            { heading: "5. Kính xe hiện tại đã dán phim rẻ tiền, bị bong tróc, ố màu", body: "Phim kém chất lượng sau 1-2 năm thường bị bong mép, nổi bong bóng hoặc ố vàng làm mất thẩm mỹ. Đây là lúc nên thay bằng phim chính hãng có bảo hành rõ ràng thay vì dán lại phim giá rẻ." }
        ],
        cta_text: "Xem chi tiết dịch vụ Film Cách Nhiệt",
        cta_link: "category-chi-tiet.html?id=dan-phim-cach-nhiet"
    },
    {
        slug: "kinh-nghiem-chon-loa-o-to-phu-hop",
        title: "Kinh Nghiệm Chọn Loa Ô Tô Phù Hợp Với Từng Dòng Xe",
        category: "Âm Thanh - Cách Âm",
        cover_image: "assets/images/service/cach-am-oto/poster.jpg",
        excerpt: "Loa zin theo xe thường chỉ đáp ứng nhu cầu nghe cơ bản. Nếu bạn muốn nâng cấp dàn âm thanh, đây là những yếu tố quan trọng cần cân nhắc trước khi chọn loa.",
        intro: "Không phải cứ loa đắt tiền là phù hợp với mọi xe. Việc chọn đúng loại loa còn phụ thuộc vào không gian cabin, nhu cầu nghe nhạc và ngân sách của từng khách hàng.",
        sections: [
            { heading: "Hiểu sự khác biệt giữa loa Coaxial và loa phân tần (Component)", body: "Loa Coaxial (đồng trục) tích hợp loa treble ngay trên loa mid-bass, dễ lắp đặt, giá hợp lý - phù hợp nâng cấp nhanh mà không cần độ chế nhiều. Loa phân tần tách rời loa treble và mid-bass, cho âm thanh chi tiết, có chiều sâu hơn nhưng cần thi công kỹ để bố trí đúng vị trí, phù hợp người thực sự yêu âm thanh." },
            { heading: "Cân nhắc công suất loa phù hợp với amply/đầu phát", body: "Loa công suất lớn nhưng đầu phát/amply zin theo xe yếu sẽ không phát huy hết khả năng. Nên nâng cấp đồng bộ loa - amply, hoặc chọn dòng loa tích hợp sẵn amply Class D như JBL Bass Pro LITE nếu chỉ muốn bổ sung độ trầm mà không độ lại toàn bộ dàn âm thanh." },
            { heading: "Kết hợp cách âm để tối ưu hiệu quả", body: "Khoang cửa xe phổ thông thường không được thiết kế tối ưu cho âm thanh (thành mỏng, rung ở dải bass, tiếng ồn lọt vào liên tục). Dán cách âm khoang cửa trước khi lắp loa mới giúp âm bass chắc hơn, giảm rung và tiếng ồn đường phố lọt vào cabin rõ rệt." },
            { heading: "Một số gợi ý theo nhu cầu", body: "Nghe nhạc nhẹ, giọng hát rõ: ưu tiên dòng Coaxial JBL Club hoặc Infinity. Yêu cầu bass sâu, chắc: nên bổ sung loa sub như JBL Bass Pro LITE. Đam mê âm thanh, muốn trải nghiệm 'sân khấu âm nhạc' đúng nghĩa: nên đầu tư loa phân tần cao cấp như JBL Club 605CSQ kết hợp cách âm toàn xe." }
        ],
        cta_text: "Xem các dòng loa JBL, Infinity, Harman/Kardon, Pioneer",
        cta_link: "category-chi-tiet.html?id=am-thanh-cach-am-oto"
    },
    {
        slug: "ppf-la-gi-co-nen-dan-cho-xe-moi",
        title: "PPF Là Gì? Có Nên Dán PPF Cho Xe Mới Mua?",
        category: "PPF - Wrap Đổi Màu",
        cover_image: "assets/images/service/ppf-bao-ve-son-xe/poster.jpg",
        excerpt: "PPF (Paint Protection Film) đang là lựa chọn phổ biến để bảo vệ lớp sơn xe mới. Vậy PPF thực sự là gì, có những loại nào và có thực sự cần thiết?",
        intro: "Với xe mới mua, lớp sơn zin là phần khó phục hồi nguyên bản nhất nếu bị trầy xước. PPF ra đời để giải quyết đúng vấn đề này.",
        sections: [
            { heading: "PPF là gì?", body: "PPF là một lớp phim polyurethane trong suốt, dán trực tiếp lên bề mặt sơn xe, có khả năng chịu va đập nhẹ, đá văng, trầy xước do rửa xe/cành cây. Nhiều dòng PPF cao cấp như XPEL Ultimate Plus còn có công nghệ tự phục hồi (self-healing) - vết xước nhỏ tự mờ đi dưới tác động của nhiệt." },
            { heading: "PPF khác gì với dán decal đổi màu (Wrap)?", body: "PPF tập trung vào BẢO VỆ (thường trong suốt hoặc bóng, giữ nguyên màu sơn gốc). Decal/Wrap tập trung vào THẨM MỸ (đổi màu, đổi kiểu dáng theo sở thích). Một số dòng cao cấp có thể kết hợp cả 2 chức năng, nhưng đây là 2 mục đích sử dụng khác nhau nên cần xác định rõ nhu cầu trước khi chọn." },
            { heading: "Có nên dán PPF ngay khi mới mua xe?", body: "Câu trả lời gần như luôn là CÓ, đặc biệt với xe đi thường xuyên trên cao tốc, đường có nhiều đá dăm, hoặc khu vực có cây cối nhiều bụi/nhựa cây. Dán PPF ngay khi sơn còn mới giúp giữ được độ bóng nguyên bản, tránh phải xử lý các vết xước tích tụ về sau (chi phí đánh bóng/sơn lại luôn tốn kém hơn phí dán PPF ban đầu)." },
            { heading: "Nên dán toàn xe hay chỉ khu vực dễ trầy?", body: "Nếu ngân sách hạn chế, có thể ưu tiên dán các khu vực dễ trầy xước nhất: capo, cản trước, gương chiếu hậu, viền cửa. Nếu có điều kiện, dán toàn xe sẽ cho hiệu quả bảo vệ đồng bộ và thẩm mỹ tốt nhất về lâu dài." }
        ],
        cta_text: "Xem các dòng PPF: XPEL, AX Film, 3M, Oracal, Avery Dennison",
        cta_link: "category-chi-tiet.html?id=ppf-wrap-doi-mau"
    },
    {
        slug: "huong-dan-chon-den-bi-led-khong-choi-mat",
        title: "Hướng Dẫn Chọn Đèn Bi LED Đúng Chuẩn, Không Chói Mắt Xe Đối Diện",
        category: "Nâng Cấp Ánh Sáng",
        cover_image: "assets/images/service/do-den/poster.jpg",
        excerpt: "Độ đèn bi LED sai kỹ thuật là nguyên nhân phổ biến gây chói mắt xe đối diện, tiềm ẩn nguy hiểm khi lái xe ban đêm. Đây là những tiêu chí cần biết trước khi nâng cấp đèn.",
        intro: "Ánh sáng tốt vào ban đêm là yếu tố an toàn quan trọng, nhưng đèn độ sai cách lại gây nguy hiểm ngược lại cho người đi đường khác. Dưới đây là hướng dẫn chọn đèn bi LED đúng chuẩn từ Đức Hiếu Auto.",
        sections: [
            { heading: "Vì sao đèn độ dễ gây chói xe đối diện?", body: "Nguyên nhân phổ biến nhất là lắp sai tiêu cự bi cầu (chóa đèn), khiến chùm sáng không hội tụ đúng điểm cắt (cut-off line) như thiết kế ban đầu. Đèn giá rẻ, không rõ nguồn gốc thường không được kiểm định tiêu cự chuẩn, dễ gây loá cho xe ngược chiều dù cường độ sáng không quá cao." },
            { heading: "Chọn đèn có tiêu cự và cut-off line rõ ràng", body: "Các dòng bi LED chính hãng như GTR, X-Light, Aozoom đều được thiết kế với tiêu cự chuẩn, tạo ra đường cắt sáng-tối (cut-off line) rõ ràng - ánh sáng chiếu đúng mặt đường phía trước, không hắt lên cao gây chói xe đối diện." },
            { heading: "Nhiệt độ màu phù hợp", body: "Nhiệt độ màu khoảng 5500K-6000K (ánh sáng trắng tự nhiên) thường cho khả năng nhìn rõ tốt nhất trong điều kiện mưa/sương mù, tốt hơn hẳn ánh sáng quá xanh (7000K+) dễ gây loá và giảm khả năng nhìn xuyên màn mưa." },
            { heading: "Nên lắp đặt tại nơi có kỹ thuật viên căn chỉnh tiêu cự", body: "Dù đèn tốt đến đâu, nếu lắp đặt không căn chỉnh đúng góc chiếu vẫn có thể gây chói. Đức Hiếu Auto luôn kiểm tra và căn chỉnh góc chiếu sáng thực tế sau khi lắp đặt, đảm bảo đèn vừa sáng rõ vừa không ảnh hưởng người tham gia giao thông khác." }
        ],
        cta_text: "Xem các dòng đèn bi LED: GTR, X-Light, Aozoom, Fogway",
        cta_link: "category-chi-tiet.html?id=do-den"
    }
];

(async () => {
    await db.ready;

    let inserted = 0, skipped = 0;
    for (const post of STATIC_POSTS) {
        const exists = await db.prepare("SELECT id FROM posts WHERE slug = ?").get(post.slug);
        if (exists) {
            console.log(`Bỏ qua (đã có): ${post.slug}`);
            skipped++;
            continue;
        }

        const contentHtml = `<p>${post.intro}</p>` +
            post.sections.map(s => `<h2>${s.heading}</h2><p>${s.body}</p>`).join("");

        await db.prepare(`
            INSERT INTO posts (slug, title, category, excerpt, cover_image, content, meta_title, meta_description, cta_text, cta_link, published)
            VALUES (@slug, @title, @category, @excerpt, @cover_image, @content, @meta_title, @meta_description, @cta_text, @cta_link, 1)
        `).run({
            slug: post.slug,
            title: post.title,
            category: post.category,
            excerpt: post.excerpt,
            cover_image: post.cover_image,
            content: contentHtml,
            meta_title: post.title,
            meta_description: post.excerpt,
            cta_text: post.cta_text,
            cta_link: post.cta_link
        });
        console.log(`Đã thêm: ${post.slug}`);
        inserted++;
    }

    console.log(`\nHoàn tất: thêm mới ${inserted}, bỏ qua ${skipped} (đã tồn tại).`);
})();
