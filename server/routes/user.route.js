const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Validation helper
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;

// Register
router.post('/register', async (req, res) => {
  const { email, name, password, confirmPassword } = req.body;

  if (!email || !name || !password || !confirmPassword) {
    return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Mật khẩu xác nhận không khớp' });
  }

  if (!passwordRegex.test(password)) {
    return res.status(400).json({ message: 'Mật khẩu phải ít nhất 6 ký tự, bao gồm chữ và số' });
  }

  try {
    const existingUser = await prisma.users.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email đã được sử dụng' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.users.create({
      data: {
        email,
        username: name,
        password: hashedPassword,
      },
    });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'my-secret-key',
      { expiresIn: '1h' }
    );

    res.status(201).json({ 
      message: 'User created', 
      token, 
      user: { id: user.id, email: user.email, name: user.username } 
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ message: 'Email không tồn tại' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: 'Sai mật khẩu' });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'my-secret-key',
      { expiresIn: '1h' }
    );

    res.json({ token, name: user.username });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

// Get all users
router.get('/', authMiddleware, async (req, res) => {
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
    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi lấy danh sách người dùng' });
  }
});

// Get user by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.users.findUnique({
      where: { id: parseInt(req.params.id) },
      select: {
        id: true,
        username: true,
        email: true,
        bio: true,
        avatar_url: true,
        createdAt: true
      }
    });
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });

    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi lấy người dùng' });
  }
});

// Update user
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Không cho update password trực tiếp qua API này
    delete updateData.password;

    const user = await prisma.users.update({
      where: { id: parseInt(id) },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        bio: true,
        avatar_url: true,
        createdAt: true
      }
    });

    res.status(200).json({ success: true, message: 'Cập nhật thành công', user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi cập nhật người dùng', error: error.message });
  }
});

// Delete user
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await prisma.users.delete({ where: { id: parseInt(req.params.id) } });
    res.status(200).json({ success: true, message: 'Xoá người dùng thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi xoá người dùng', error: error.message });
  }
});

// Onboarding route
router.post('/onboarding', async (req, res) => {
  try {
    const { email, gender, topics } = req.body;

    // Input validation
    if (!email || !gender || !topics) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email, gender và topics là bắt buộc' 
      });
    }

    // Tìm user theo email
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy user' 
      });
    }

    // Cập nhật thông tin onboarding
    const updatedUser = await prisma.users.update({
      where: { email },
      data: {
        onboarded: true,
        gender: gender,
        topics: topics
      }
    });

    res.status(200).json({
      success: true,
      message: 'Onboarding completed successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        gender: updatedUser.gender,
        topics: updatedUser.topics,
        onboarded: updatedUser.onboarded
      }
    });
    
    console.log('Onboarding completed for user:', updatedUser.email, 'onboarded:', updatedUser.onboarded);

  } catch (error) {
    console.error('Onboarding error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server trong quá trình onboarding' 
    });
  }
});

// Reset onboarding route (for testing)
router.post('/reset-onboarding', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email là bắt buộc' 
      });
    }

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy user' 
      });
    }

    const updatedUser = await prisma.users.update({
      where: { email },
      data: {
        onboarded: false
      }
    });

    res.status(200).json({
      success: true,
      message: 'Onboarding reset successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        onboarded: updatedUser.onboarded
      }
    });

  } catch (error) {
    console.error('Reset onboarding error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server trong quá trình reset onboarding' 
    });
  }
});

// Google OAuth route
router.post('/auth/google', async (req, res) => {
  try {
    const { email, name, image, provider, providerAccountId } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email là bắt buộc' 
      });
    }

    // Tìm user theo email
    let user = await prisma.users.findUnique({ where: { email } });

    if (!user) {
      // Tạo user mới
      user = await prisma.users.create({
        data: {
          email,
          username: name,
          image,
          createdAt: new Date(),
          updatedAt: new Date(),
          onboarded: false
        }
      });
      console.log('New user created:', user.id);
    } else {
      // Cập nhật user hiện tại
      user = await prisma.users.update({
        where: { email },
        data: {
          username: name,
          image,
          updatedAt: new Date()
        }
      });
      console.log('User updated:', user.id);
    }

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        onboarded: user.onboarded
      }
    });

  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server trong quá trình xác thực Google' 
    });
  }
});

// Get user by email
router.get('/email/:email', async (req, res) => {
  try {
    const { email } = req.params;

    const user = await prisma.users.findUnique({ 
      where: { email },
      select: {
        id: true,
        email: true,
        username: true,
        onboarded: true,
        gender: true,
        topics: true
      }
    });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy user' 
      });
    }

    res.status(200).json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Get user by email error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server khi lấy thông tin user' 
    });
  }
});

module.exports = router;
