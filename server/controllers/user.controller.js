const prisma = require('../lib/prisma');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendMail } = require('../utils/mailer');

// Validation helper functions
const validatePassword = (password) => {
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Biến lưu OTP tạm thời (email -> { otp, expires })
const otpStore = {};

// API gửi OTP
exports.sendOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  // Tạo OTP 4 số
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  // Lưu vào memory, hết hạn sau 5 phút
  otpStore[email] = { otp, expires: Date.now() + 5 * 60 * 1000 };

  try {
    console.log(`📧 Đang gửi OTP ${otp} đến email: ${email}`);
    
    await sendMail({
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP code is: ${otp}`,
      html: `<b>Your OTP code is: ${otp}</b>`
    });
    
    console.log(`✅ OTP đã được gửi thành công đến ${email}`);
    res.json({ message: 'OTP sent to email!' });
  } catch (err) {
    console.error(`❌ Lỗi gửi OTP đến ${email}:`, err);
    
    // Xóa OTP khỏi store nếu gửi thất bại
    delete otpStore[email];
    
    res.status(500).json({ 
      message: 'Failed to send OTP', 
      error: err.message,
      details: 'Please check your email configuration and try again'
    });
  }
};

// API xác thực OTP
exports.verifyOtp = (req, res) => {
  const { email, otp } = req.body;
  const record = otpStore[email];
  if (!record) return res.status(400).json({ message: 'No OTP sent to this email' });
  if (Date.now() > record.expires) return res.status(400).json({ message: 'OTP expired' });
  if (record.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });
  // Xác thực thành công, xóa OTP
  delete otpStore[email];
  res.json({ message: 'OTP verified' });
};

exports.register = async (req, res) => {
  try {
    console.log('📝 Registration request received:', {
      body: req.body,
      headers: req.headers,
      method: req.method,
      url: req.url
    });

    const { username, email, password, confirmPassword } = req.body;
    console.log('📝 Registration data:', { username, email, hasPassword: !!password, hasConfirmPassword: !!confirmPassword });

    // Input validation
    if (!username || !email || !password || !confirmPassword) {
      console.log('❌ Validation failed - missing fields:', {
        hasUsername: !!username,
        hasEmail: !!email,
        hasPassword: !!password,
        hasConfirmPassword: !!confirmPassword
      });
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    // Email validation
    if (!validateEmail(email)) {
      console.log('❌ Email validation failed:', email);
      return res.status(400).json({ 
        success: false, 
        message: 'Please enter a valid email address' 
      });
    }

    // Password confirmation check
    if (password !== confirmPassword) {
      console.log('❌ Password confirmation failed:', {
        passwordLength: password?.length,
        confirmPasswordLength: confirmPassword?.length,
        passwordsMatch: password === confirmPassword
      });
      return res.status(400).json({ 
        success: false, 
        message: 'Passwords do not match' 
      });
    }

    // Password strength validation
    if (!validatePassword(password)) {
      console.log('❌ Password strength validation failed:', {
        passwordLength: password?.length,
        hasLetters: /[a-zA-Z]/.test(password),
        hasNumbers: /\d/.test(password)
      });
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 8 characters long and contain both letters and numbers' 
      });
    }

    // Check if email already exists
    console.log('🔍 Checking if email already exists:', email);
    const existingUser = await prisma.users.findUnique({ where: { email } });
    if (existingUser) {
      console.log('❌ Email already exists:', email);
      return res.status(400).json({ 
        success: false, 
        message: 'Email already exists' 
      });
    }
    console.log('✅ Email is available');

    // Check if username already exists
    console.log('🔍 Checking if username already exists:', username);
    const existingUsername = await prisma.users.findUnique({ where: { username } });
    if (existingUsername) {
      console.log('❌ Username already exists:', username);
      return res.status(400).json({ 
        success: false, 
        message: 'Username already exists' 
      });
    }
    console.log('✅ Username is available');

    // Hash password
    console.log('🔐 Hashing password...');
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log('✅ Password hashed successfully');

    // Create user
    console.log('👤 Creating user in database...');
    const newUser = await prisma.users.create({
      data: {
        username,
        email,
        password: hashedPassword
      }
    });
    console.log('✅ User created successfully:', {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email
    });

    // Generate JWT token
    console.log('🔑 Generating JWT token...');
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    console.log('🔑 JWT Secret available:', !!jwtSecret, 'Length:', jwtSecret?.length);
    
          const token = jwt.sign(
        { 
          id: Number(newUser.id), // Convert BigInt to Number
          email: newUser.email, 
          username: newUser.username 
        },
        jwtSecret,
        { expiresIn: '24h' }
      );
    console.log('✅ JWT token generated successfully');

          // Return success response (without password)
      const userResponse = {
        id: Number(newUser.id), // Convert BigInt to Number
        username: newUser.username,
        email: newUser.email,
        bio: newUser.bio,
        avatar_url: newUser.avatar_url,
        createdAt: newUser.createdAt
      };

    console.log('📤 Sending success response...');
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: userResponse
    });
    console.log('✅ Registration completed successfully');

  } catch (error) {
    console.error('❌ Registration error:', error);
    
    // Nếu có response đã được gửi, không gửi thêm
    if (res.headersSent) {
      return;
    }
    
    // Log chi tiết lỗi database
    if (error.code === 'P2002') {
      console.error('🔍 Duplicate constraint error - Field:', error.meta?.target);
      return res.status(400).json({ 
        success: false, 
        message: 'Email hoặc username đã tồn tại trong hệ thống' 
      });
    } else if (error.code === 'P2003') {
      console.error('🔍 Foreign key constraint error');
      return res.status(400).json({ 
        success: false, 
        message: 'Dữ liệu không hợp lệ - Lỗi ràng buộc database' 
      });
    } else if (error.code === 'P2014') {
      console.error('🔍 Invalid ID error');
      return res.status(400).json({ 
        success: false, 
        message: 'ID không hợp lệ' 
      });
    } else if (error.code === 'P2025') {
      console.error('🔍 Record not found error');
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy dữ liệu cần thiết' 
      });
    } else if (error.message === 'Email already exists') {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already exists' 
      });
    } else if (error.message === 'Username already exists') {
      return res.status(400).json({ 
        success: false, 
        message: 'Username already exists' 
      });
    } else {
      console.error('🔍 Unknown error:', error.message);
      return res.status(500).json({ 
        success: false, 
        message: 'Lỗi server trong quá trình đăng ký. Vui lòng thử lại sau.',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    // Find user by email
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: Number(user.id), // Convert BigInt to Number
        email: user.email, 
        username: user.username 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Return success response (without password)
    const userResponse = {
      id: Number(user.id), // Convert BigInt to Number
      username: user.username,
      email: user.email,
      bio: user.bio,
      avatar_url: user.avatar_url,
      createdAt: user.createdAt
    };

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    
    // Log chi tiết lỗi
    if (error.code === 'P2002') {
      console.error('🔍 Duplicate constraint error - Field:', error.meta?.target);
      res.status(400).json({ 
        success: false, 
        message: 'Dữ liệu không hợp lệ - Lỗi ràng buộc database' 
      });
    } else if (error.code === 'P2003') {
      console.error('🔍 Foreign key constraint error');
      res.status(400).json({ 
        success: false, 
        message: 'Dữ liệu không hợp lệ - Lỗi ràng buộc database' 
      });
    } else if (error.code === 'P2014') {
      console.error('🔍 Invalid ID error');
      res.status(400).json({ 
        success: false, 
        message: 'ID không hợp lệ' 
      });
    } else if (error.code === 'P2025') {
      console.error('🔍 Record not found error');
      res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy dữ liệu cần thiết' 
      });
    } else {
      console.error('🔍 Unknown database error:', error.code, error.message);
      res.status(500).json({ 
        success: false, 
        message: 'Lỗi server trong quá trình đăng nhập. Vui lòng thử lại sau.',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
};

exports.searchUsers = async (req, res) => {
  try {
    const { keyword } = req.query;
    if (!keyword) return res.status(400).json({ success: false, users: [], message: 'Keyword is required' });

    const users = await prisma.users.findMany({
      where: {
        OR: [
          { username: { contains: keyword } },
        ]
      },
      select: {
        id: true,
        username: true,
        avatar_url: true
      },
      take: 10
    });

    res.status(200).json(users);
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ success: false, users: [], message: 'Error searching users' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.users.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        bio: true,
        avatar_url: true,
        createdAt: true
      }
    });
    res.status(200).json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching users' 
    });
  }
};

// Get user by ID (public info only)
exports.getUserById = async (req, res) => {
    try {
        const userId = Number(req.params.id);
        
        const user = await prisma.users.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                avatar_url: true
            }
        });

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        res.status(200).json({
            success: true,
            user: {
                id: Number(user.id), // Convert BigInt to Number
                username: user.username,
                avatar: user.avatar_url || '/img/user.png',
                name: user.username
            }
        });
    } catch (error) {
        console.error('Error getting user by ID:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error getting user information' 
        });
    }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    // Remove password from update data if present
    delete updateData.password;
    
    const updatedUser = await prisma.users.update({
      where: { id: Number(id) },
      data: updateData
    });
    
    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: {
        ...updatedUser,
        id: Number(updatedUser.id) // Convert BigInt to Number
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(400).json({ 
      success: false, 
      message: 'Error updating user' 
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const deletedUser = await prisma.users.delete({
      where: { id: Number(req.params.id) }
    });

    if (!deletedUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: 'User deleted successfully' 
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting user' 
    });
  }
};

exports.resetPassword = async (req, res) => {
  console.log('RESET PASSWORD API CALLED', req.body);
  const { email, password, confirmPassword } = req.body;
  
  if (!email || !password || !confirmPassword) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  
  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }
  
  if (!validatePassword(password)) {
    return res.status(400).json({ message: 'Password must be at least 8 characters long and contain both letters and numbers' });
  }
  
  try {
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'Email not found' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 12);
    const updatedUser = await prisma.users.update({
      where: { email },
      data: { password: hashedPassword }
    });
    
    res.json({ 
      message: 'Password reset successful',
      user: {
        id: Number(updatedUser.id), // Convert BigInt to Number
        email: updatedUser.email,
        username: updatedUser.username
      }
    });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ 
      message: 'Server error', 
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error' 
    });
  }
};

// Thêm alias cho register
exports.createUser = exports.register;

exports.onboarding = async (req, res) => {
  try {
    const { email, gender, topics } = req.body; // topics = [1,2,3]

    // 1. Validate input
    if (!email || !gender || !topics || !Array.isArray(topics)) {
      return res.status(400).json({ 
        success: false, 
        message: "Email, gender và topics là bắt buộc" 
      });
    }

    // 2. Tìm user theo email
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "Không tìm thấy user" 
      });
    }

    // 3. Thêm dữ liệu vào bảng user_topics
    await prisma.user_topics.createMany({
      data: topics.map(topicId => ({
        user_id: user.id,
        topic_id: topicId
      })),
      skipDuplicates: true // tránh lỗi trùng lặp
    });

    // 4. Update user: chỉ cập nhật gender + onboarded
    const updatedUser = await prisma.users.update({
      where: { email },
      data: {
        gender,
        onboarded: true
      },
      include: {
        userTopics: {
          include: { topic: true }
        }
      }
    });

    // 5. Trả về kết quả
    res.status(200).json({
      success: true,
      message: "Onboarding completed successfully",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        gender: updatedUser.gender,
        onboarded: updatedUser.onboarded,
        topics: updatedUser.userTopics.map(ut => ut.topic)
      }
    });

  } catch (error) {
    console.error("Onboarding error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Lỗi server trong quá trình onboarding" 
    });
  }
};


// Thêm route test gửi mail
exports.testSendMail = async(req, res) => {
  try {
    await sendMail({
      to: req.body.to || process.env.EMAIL_USER,
      subject: 'Test Nodemailer',
      text: 'Đây là email test từ Social Media App!',
      html: '<b>Đây là email test từ Social Media App!</b>'
    });
    res.status(200).json({ message: 'Đã gửi email thành công!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
exports.getUserFeed = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    // 1. Lấy topics user đã chọn
    const userTopics = await prisma.user_topics.findMany({
      where: { user_id: userId },
      include: { topic: true },
    });

    // 2. Lấy posts có tag trùng topic
    const posts = await prisma.posts.findMany({
      where: {
        post_topics: {
          some: {
            topic_id: { in: userTopics.map((ut) => ut.topic_id) },
          },
        },
      },
      include: {
        users: true,
        post_topics: { include: { topics: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    res.json(posts);
  } catch (err) {
    console.error("Error fetching feed:", err);
    res.status(500).json({ error: "Failed to fetch feed" });
  }
};

