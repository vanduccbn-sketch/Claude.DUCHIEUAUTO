/**
 * Thay thế `cloudinary` npm SDK (dùng Node stream/https client nội bộ, không kiểm chứng tương
 * thích Workers) bằng gọi thẳng REST API của Cloudinary qua fetch() - xem quyết định trong
 * docs/nhat-ky-phat-trien-duc-hieu-auto-2026-07-06.md Phase 13. Tự tính chữ ký theo đúng thuật
 * toán Cloudinary công bố (SHA-1 của các tham số đã sắp xếp + api_secret), dùng `crypto` qua
 * nodejs_compat (đã xác nhận hoạt động ở spike test Phase 13.0).
 */
import crypto from "node:crypto";

function signParams(params, apiSecret) {
    const sorted = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join("&");
    return crypto.createHash("sha1").update(sorted + apiSecret).digest("hex");
}

export async function uploadImage(blob, folder, env) {
    const timestamp = Math.floor(Date.now() / 1000);
    const paramsToSign = { folder, timestamp };
    const signature = signParams(paramsToSign, env.CLOUDINARY_API_SECRET);

    const formData = new FormData();
    formData.append("file", blob);
    formData.append("api_key", env.CLOUDINARY_API_KEY);
    formData.append("timestamp", String(timestamp));
    formData.append("folder", folder);
    formData.append("signature", signature);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formData
    });
    const result = await res.json();
    if (!res.ok) {
        throw new Error(result.error?.message || "Tải ảnh lên Cloudinary thất bại");
    }
    return result;
}

export async function listImages(env) {
    const auth = btoa(`${env.CLOUDINARY_API_KEY}:${env.CLOUDINARY_API_SECRET}`);
    const params = new URLSearchParams({ type: "upload", prefix: "duchieuauto/", max_results: "200", direction: "desc" });
    const res = await fetch(`https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/resources/image/upload?${params}`, {
        headers: { Authorization: `Basic ${auth}` }
    });
    const result = await res.json();
    if (!res.ok) {
        throw new Error(result.error?.message || "Không tải được thư viện ảnh Cloudinary");
    }
    return result.resources;
}

export async function deleteImage(publicId, env) {
    const timestamp = Math.floor(Date.now() / 1000);
    const paramsToSign = { public_id: publicId, timestamp };
    const signature = signParams(paramsToSign, env.CLOUDINARY_API_SECRET);

    const formData = new FormData();
    formData.append("public_id", publicId);
    formData.append("api_key", env.CLOUDINARY_API_KEY);
    formData.append("timestamp", String(timestamp));
    formData.append("signature", signature);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/image/destroy`, {
        method: "POST",
        body: formData
    });
    const result = await res.json();
    if (!res.ok || (result.result !== "ok" && result.result !== "not found")) {
        throw new Error("Xoá ảnh Cloudinary thất bại");
    }
    return result;
}

// Phase 9.4 - giữ nguyên nguyên văn preset transform từ bản gốc.
const TRANSFORM_PRESETS = {
    square: "c_fill,g_auto,ar_1:1,w_600,q_auto,f_auto",
    cover: "c_fill,g_auto,ar_16:9,w_1200,q_auto,f_auto",
    product: "c_fill,g_auto,ar_4:3,w_800,q_auto,f_auto",
    content: "c_limit,w_1600,q_auto,f_auto"
};

export function applyTransform(url, purpose) {
    const preset = TRANSFORM_PRESETS[purpose];
    if (!preset) return url;
    return url.replace("/upload/", `/upload/${preset}/`);
}
