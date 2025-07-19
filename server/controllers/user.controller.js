const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Validation helper functions
const validatePassword = (password) => {
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

exports.register = async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    // Input validation
    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    // Email validation
    if (!validateEmail(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please enter a valid email address' 
      });
    }

    // Password confirmation check
    if (password !== confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Passwords do not match' 
      });
    }

    // Password strength validation
    if (!validatePassword(password)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 8 characters long and contain both letters and numbers' 
      });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already exists' 
      });
    }

    // Check if username already exists
    const existingUsername = await prisma.user.findUnique({ where: { username } });
    if (existingUsername) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username already exists' 
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: newUser.id, 
        email: newUser.email, 
        username: newUser.username 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Return success response (without password)
    const userResponse = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      bio: newUser.bio,
      avatar_url: newUser.avatar_url,
      createdAt: newUser.createdAt
    };

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error during registration' 
    });
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
    const user = await prisma.user.findUnique({ where: { email } });
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
        id: user.id, 
        email: user.email, 
        username: user.username 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Return success response (without password)
    const userResponse = {
      id: user.id,
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
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error during login' 
    });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
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

exports.getUserById = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(req.params.id) },
      select: {
        id: true,
        username: true,
        email: true,
        bio: true,
        avatar_url: true,
        createdAt: true
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
      user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching user' 
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    // Remove password from update data if present
    delete updateData.password;
    
    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: updateData
    });
    
    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: updatedUser
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
    const deletedUser = await prisma.user.delete({
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

// Thêm alias cho register
exports.createUser = exports.register;

exports.onboarding = async (req, res) => {
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
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy user' 
      });
    }

    // Cập nhật thông tin onboarding
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        gender,
        topics: Array.isArray(topics) ? topics : [topics],
        onboarded: true
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

  } catch (error) {
    console.error('Onboarding error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server trong quá trình onboarding' 
    });
  }
};