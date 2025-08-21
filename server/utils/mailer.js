const nodemailer = require('nodemailer');

// Kiểm tra cấu hình email
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error('❌ EMAIL_USER hoặc EMAIL_PASS không được cấu hình!');
  console.error('📧 Vui lòng thêm vào file .env:');
  console.error('   EMAIL_USER=your-email@gmail.com');
  console.error('   EMAIL_PASS=your-app-password');
  console.error('🔑 Lưu ý: EMAIL_PASS phải là "App Password" từ Google, không phải mật khẩu thường!');
}

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
  // Kiểm tra cấu hình email
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('Email configuration missing. Please set EMAIL_USER and EMAIL_PASS in .env file');
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
    html
  };
  
  try {
    return await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('❌ Lỗi gửi email:', error);
    
    // Cung cấp thông tin lỗi chi tiết hơn
    if (error.code === 'EAUTH') {
      throw new Error('Email authentication failed. Please check EMAIL_USER and EMAIL_PASS');
    } else if (error.code === 'ECONNECTION') {
      throw new Error('Email connection failed. Please check your internet connection');
    } else {
      throw new Error(`Email sending failed: ${error.message}`);
    }
  }
}

module.exports = { transporter, sendMail }; 