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
    }
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
