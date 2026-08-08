// Port từ duchieuauto-backend/utils/sanitize-content.js (Phase 13) - giữ nguyên 100%, đã xác nhận
// sanitize-html chạy đúng dưới nodejs_compat qua spike test (Phase 13.0).
import sanitizeHtml from "sanitize-html";

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

export function sanitizeContent(html) {
    return sanitizeHtml(html, SANITIZE_OPTIONS);
}
