require('dotenv').config();
const { sendMail } = require('./utils/mailer');

async function testEmail() {
  console.log('🧪 Testing email configuration...');
  
  try {
    // Kiểm tra biến môi trường
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('❌ EMAIL_USER hoặc EMAIL_PASS không được cấu hình!');
      console.error('📧 Vui lòng tạo file .env với:');
      console.error('   EMAIL_USER=your-email@gmail.com');
      console.error('   EMAIL_PASS=your-app-password');
      return;
    }
    
    console.log('✅ Biến môi trường đã được cấu hình');
    console.log(`📧 Email: ${process.env.EMAIL_USER}`);
    console.log(`🔑 Password: ${process.env.EMAIL_PASS.substring(0, 4)}...`);
    
    // Test gửi email
    console.log('📤 Đang test gửi email...');
    
    await sendMail({
      to: process.env.EMAIL_USER, // Gửi cho chính mình để test
      subject: '🧪 Test Email Configuration',
      text: 'Email này được gửi để test cấu hình email cho OTP system.',
      html: `
        <h2>🧪 Test Email Configuration</h2>
        <p>Email này được gửi để test cấu hình email cho OTP system.</p>
        <p><strong>Thời gian:</strong> ${new Date().toLocaleString('vi-VN')}</p>
        <p>✅ Nếu bạn nhận được email này, cấu hình email đã hoạt động!</p>
      `
    });
    
    console.log('✅ Email test đã được gửi thành công!');
    console.log('📧 Kiểm tra inbox của bạn để xác nhận.');
    
  } catch (error) {
    console.error('❌ Lỗi test email:', error.message);
    
    if (error.message.includes('authentication failed')) {
      console.error('🔑 Lỗi xác thực: Kiểm tra EMAIL_USER và EMAIL_PASS');
      console.error('💡 EMAIL_PASS phải là "App Password" từ Google, không phải mật khẩu thường');
    } else if (error.message.includes('connection failed')) {
      console.error('🌐 Lỗi kết nối: Kiểm tra internet và firewall');
    } else {
      console.error('❓ Lỗi không xác định, vui lòng kiểm tra console để biết thêm chi tiết');
    }
  }
}

// Chạy test
testEmail(); 