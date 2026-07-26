const sanitizeHtml = require("sanitize-html");

// Cấu hình dùng chung cho mọi nội dung rich-text do trình soạn thảo Quill tạo ra (bài viết Tin
// Tức - routes/posts.js, và mô tả chi tiết sản phẩm - routes/products.js). Chặn stored-XSS (VD
// <script>, onerror=...) vì nội dung được lưu vào DB rồi hiển thị lại cho MỌI khách xem trang
// công khai.
const SANITIZE_OPTIONS = {
    allowedTags: [
        "p", "br", "strong", "b", "em", "i", "u", "s", "blockquote",
        "h2", "h3", "h4", "ul", "ol", "li", "a", "img", "figure", "figcaption"
    ],
    allowedAttributes: {
        a: ["href", "target", "rel"],
        img: ["src", "alt", "loading"]
    },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
        a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer", target: "_blank" })
    }
};

function sanitizeContent(html) {
    return sanitizeHtml(html, SANITIZE_OPTIONS);
}

module.exports = { sanitizeContent, SANITIZE_OPTIONS };
