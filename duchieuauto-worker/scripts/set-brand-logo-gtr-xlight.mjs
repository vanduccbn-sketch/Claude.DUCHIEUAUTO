/**
 * Chạy 1 lần: gán logo cho 2 brand "gtr-light" và "x-light" (danh mục "do-den") - 2 brand này chưa
 * từng có logo từ trước tới giờ (kể cả dữ liệu tĩnh cũ), và hiện KHÔNG có route API nào cho phép sửa
 * logo cấp "brand" qua CMS (chỉ có route cho brand_type) nên phải cập nhật thẳng qua script, theo
 * đúng cách các script một lần khác trong thư mục này (VD rehash-cost10.mjs).
 */
import { createClient } from "@libsql/client";

const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN
});

const updates = [
    { category_id: "do-den", id: "gtr-light", logo: "assets/images/brands/gtr-light/logo.png" },
    { category_id: "do-den", id: "x-light", logo: "assets/images/brands/x-light/logo.png" }
];

for (const u of updates) {
    const before = await client.execute({
        sql: "SELECT logo FROM brands WHERE category_id = ? AND id = ?",
        args: [u.category_id, u.id]
    });
    if (!before.rows[0]) {
        console.log(`BO QUA: khong tim thay brand ${u.category_id}/${u.id}`);
        continue;
    }
    console.log(`Truoc: ${u.id} logo = "${before.rows[0].logo ?? ""}"`);

    await client.execute({
        sql: "UPDATE brands SET logo = ? WHERE category_id = ? AND id = ?",
        args: [u.logo, u.category_id, u.id]
    });

    const after = await client.execute({
        sql: "SELECT logo FROM brands WHERE category_id = ? AND id = ?",
        args: [u.category_id, u.id]
    });
    console.log(`Sau: ${u.id} logo = "${after.rows[0].logo}"`);
}
