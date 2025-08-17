const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { testSendMail, resetPassword, login, register, searchUsers } = require('../controllers/user.controller');

// Search
router.get('/search', searchUsers);

// Validation helper
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;

// Register
router.post('/register', register);

// Login
router.post('/login', login);

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

// Get all users (public - no auth required)
router.get('/public', async (req, res) => {
  try {
    const users = await prisma.users.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        avatar_url: true,
        image: true
      }
    });
    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi lấy danh sách người dùng' });
  }
});

// Get public user info by ID (no auth required)
router.get('/public/:id', async (req, res) => {
  try {
    const user = await prisma.users.findUnique({
      where: { id: parseInt(req.params.id) },
      select: {
        id: true,
        username: true,
        email: true,
        bio: true,
        avatar_url: true,
        image: true
      }
    });
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });

    res.status(200).json({ 
      success: true, 
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        avatar: user.avatar_url || user.image || '/img/user.png',
        name: user.username || `User ${user.id}`
      }
    });
  } catch (error) {
    console.error('Error getting public user:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi lấy người dùng' });
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

    // Hash password if provided
    if (updateData.password) {
      const hashedPassword = await bcrypt.hash(updateData.password, 10);
      updateData.password = hashedPassword;
    }

    const user = await prisma.users.update({
      where: { id: parseInt(id) },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        bio: true,
        avatar_url: true,
        gender: true,
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
    if (!email || !gender || !topics || !Array.isArray(topics)) {
      return res.status(400).json({
        success: false,
        message: 'Email, gender và topics là bắt buộc'
      });
    }

    // Tìm user theo email
    let user = await prisma.users.findUnique({ where: { email } });
    
    // Nếu user chưa tồn tại, tạo user mới (fallback)
    if (!user) {
      console.log('User not found, creating new user for onboarding:', email);
      user = await prisma.users.create({
        data: {
          email,
          username: email.split('@')[0], // Tạo username từ email
          createdAt: new Date(),
          updatedAt: new Date(),
          onboarded: false,
        }
      });
      console.log('New user created for onboarding:', user.id);
    }

    // Cập nhật thông tin onboarding
    const updatedUser = await prisma.users.update({
      where: { email },
      data: {
        onboarded: true,
        gender: gender,
        userTopics: {
          deleteMany: {},
          create: topics.map(topicId => ({
            topic: { connect: { id: topicId } }
          }))
        }
      },
      include: { 
        userTopics: { include: { topic: true } } 
      }
    });

    res.status(200).json({
      success: true,
      message: 'Onboarding completed successfully',
      user: updatedUser
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

router.get("/:id/feed", async (req, res) => {
  const userId = Number(req.params.id);
  if (!userId) return res.status(400).json({ message: "Invalid user ID" });

  try {
    // Lấy các topic của user
    const userTopics = await prisma.user_topics.findMany({
      where: { user_id: userId },
      select: { topic_id: true },
    });
    const topicIds = userTopics.map(ut => ut.topic_id);

    // Lấy posts theo topic
    const posts = await prisma.posts.findMany({
      where: {
        postTags: {
          some: {
            tag_id: { in: topicIds },
          },
        },
      },
      include: {
        postTags: {
          include: {
            tag: true,
          },
        },
        users: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const postsWithTags = posts.map(post => ({
      id: post.id,
      user_id: post.user_id,
      user_name: post.user_name,
      title: post.title,
      content: post.content,
      image_url: post.image_url,
      dominant_color: post.dominant_color,
      createdAt: post.createdAt,
      tags: post.postTags.map(pt => pt.tag.name),
    }));

    res.json(postsWithTags);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching feed" });
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
          onboarded: false,
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
        userTopics: {
          select: {
            topic: true
          }
        }
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

// Update user by email
router.put('/update', async (req, res) => {
  try {
    const { email, gender, password } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email là bắt buộc' 
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

    // Prepare update data
    const updateData = {};
    
    if (gender !== undefined) {
      updateData.gender = gender;
    }
    
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    // Update user
    const updatedUser = await prisma.users.update({
      where: { email },
      data: updateData,
      select: {
        id: true,
        email: true,
        username: true,
        gender: true,
        onboarded: true
      }
    });

    res.status(200).json({
      success: true,
      message: 'Cập nhật thành công',
      data: updatedUser
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server khi cập nhật user' 
    });
  }
});

router.post('/test-send-mail', testSendMail);
router.post('/send-otp', testSendMail.sendOtp || require('../controllers/user.controller').sendOtp);
router.post('/verify-otp', testSendMail.verifyOtp || require('../controllers/user.controller').verifyOtp);
router.post('/reset-password', resetPassword);

module.exports = router;
