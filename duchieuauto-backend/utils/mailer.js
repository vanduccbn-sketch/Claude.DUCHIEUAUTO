const nodemailer = require("nodemailer");
const dns = require("dns");

// Ép mọi lần phân giải DNS của transporter này chỉ trả về địa chỉ IPv4 - phát hiện thật trên
// Render: smtp.gmail.com trả về cả bản ghi IPv4 lẫn IPv6, mạng outbound của Render không route
// được IPv6 nên kết nối SMTP báo ENETUNREACH khi chọn nhầm IPv6. Đã thử `family: 4` và
// `dns.setDefaultResultOrder("ipv4first")` riêng lẻ nhưng nodemailer (dùng shorthand
// service:"gmail") vẫn chọn IPv6 - dùng thẳng option `lookup` (chạy đúng hàm này để phân giải,
// không qua logic nội bộ nào khác) mới chắc chắn ép được IPv4.
function lookupIpv4Only(hostname, options, callback) {
    return dns.lookup(hostname, { family: 4 }, callback);
}

// Gửi email qua Gmail SMTP dùng chính email cửa hàng (contact.duchieuauto47@gmail.com) - không
// cần đăng ký thêm dịch vụ email ngoài. Cần bật "Xác minh 2 bước" trên tài khoản Google đó rồi
// tạo "Mật khẩu ứng dụng" (App Password) tại myaccount.google.com/apppasswords, KHÔNG dùng mật
// khẩu Gmail thật (Google chặn đăng nhập SMTP bằng mật khẩu thường vì lý do bảo mật).
// Dùng thẳng host/port 587 (STARTTLS) thay vì shorthand service:"gmail" (mặc định cổng 465, SSL
// trực tiếp) - phát hiện thật trên Render: sau khi ép IPv4 xong, cổng 465 vẫn bị treo "Connection
// timeout" (gói tin không có phản hồi, khác hẳn ENETUNREACH lúc trước) - dấu hiệu cổng 465 bị
// chặn ở tầng mạng outbound của Render. Nhiều nhà cung cấp host chỉ chặn 465, vẫn cho qua 587.
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
    },
    // Không đặt timeout thì khi mạng/Gmail chặn kết nối, request sẽ treo vô thời hạn thay vì báo
    // lỗi - khiến cả API "quên mật khẩu" bị treo theo (đã gặp thật khi test trên Render).
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
    family: 4,
    lookup: lookupIpv4Only
});

async function sendMail({ to, subject, html, text }) {
    await transporter.sendMail({
        from: `"Đức Hiếu Auto Admin" <${process.env.GMAIL_USER}>`,
        to,
        subject,
        text,
        html
    });
}

module.exports = { sendMail };
