const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }

    // Check if it's a NextAuth token
    if (token.startsWith('nextauth_jwt_')) {
      const userId = token.replace('nextauth_jwt_', '');
      
      // Check if user exists
      const user = await prisma.users.findUnique({
        where: { id: BigInt(userId) },
        select: { id: true, email: true, username: true }
      });
      
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Token is valid but user no longer exists' 
        });
      }

      // Add user info to request
      req.user = {
        id: user.id,
        email: user.email,
        username: user.username
      };
      
      return next();
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Check if user still exists
    const user = await prisma.users.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, username: true }
    });
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token is valid but user no longer exists' 
      });
    }

    // Add user info to request
    req.user = {
      id: user.id,
      email: user.email,
      username: user.username
    };
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired' 
      });
    }
    
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error during authentication' 
    });
  }
};

module.exports = authMiddleware;