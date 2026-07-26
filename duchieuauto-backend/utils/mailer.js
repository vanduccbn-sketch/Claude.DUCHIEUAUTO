const nodemailer = require("nodemailer");

// Gửi email qua Gmail SMTP dùng chính email cửa hàng (contact.duchieuauto47@gmail.com) - không
// cần đăng ký thêm dịch vụ email ngoài. Cần bật "Xác minh 2 bước" trên tài khoản Google đó rồi
// tạo "Mật khẩu ứng dụng" (App Password) tại myaccount.google.com/apppasswords, KHÔNG dùng mật
// khẩu Gmail thật (Google chặn đăng nhập SMTP bằng mật khẩu thường vì lý do bảo mật).
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
    },
    // Không đặt timeout thì khi mạng/Gmail chặn kết nối, request sẽ treo vô thời hạn thay vì báo
    // lỗi - khiến cả API "quên mật khẩu" bị treo theo (đã gặp thật khi test trên Render).
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000
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
