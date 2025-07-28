const nodemailer = require('nodemailer');

// Cấu hình transporter với Gmail (nên dùng biến môi trường cho bảo mật)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // email gửi
    pass: process.env.EMAIL_PASS  // mật khẩu ứng dụng
  }
});

// Hàm gửi mail
async function sendMail({ to, subject, text, html }) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
    html
  };
  return transporter.sendMail(mailOptions);
}

module.exports = { transporter, sendMail }; 