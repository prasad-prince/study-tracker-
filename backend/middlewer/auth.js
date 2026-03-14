const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * ⭐ CRITICAL: Authentication Middleware
 * This middleware MUST be applied to ALL protected routes
 * It extracts userId from JWT token and attaches it to req.user
 */
const authenticateToken = async (req, res, next) => {
  try {
    // ⭐ Extract token from Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    // ⭐ Check if token exists
    if (!token) {
      return res.status(401).json({ 
        success: false,
        error: 'Access denied. No token provided.',
        code: 'NO_TOKEN'
      });
    }

    // ⭐ Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          success: false,
          error: 'Token has expired. Please login again.',
          code: 'TOKEN_EXPIRED'
        });
      }
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          success: false,
          error: 'Invalid token. Please login again.',
          code: 'INVALID_TOKEN'
        });
      }
      throw error;
    }

    // ⭐ CRITICAL: Extract userId from decoded token
    const userId = decoded.id || decoded.userId || decoded._id;

    if (!userId) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid token payload. User ID not found.',
        code: 'INVALID_PAYLOAD'
      });
    }

    // ⭐ Optional: Verify user still exists in database
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        error: 'User not found. Account may have been deleted.',
        code: 'USER_NOT_FOUND'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({ 
        success: false,
        error: 'Account is deactivated. Please contact support.',
        code: 'ACCOUNT_INACTIVE'
      });
    }

    // ⭐ CRITICAL: Attach user info to request object
    req.user = {
      id: user._id.toString(), // ⭐ Convert ObjectId to string
      email: user.email,
      name: user.name,
      role: user.role
    };

    // ⭐ Also attach full user object for convenience
    req.userDoc = user;

    next();
  } catch (error) {
    console.error('❌ Authentication Error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Authentication failed',
      code: 'AUTH_ERROR'
    });
  }
};

/**
 * ⭐ Role-based authorization middleware
 * Use after authenticateToken to check user roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        error: 'Authentication required',
        code: 'NOT_AUTHENTICATED'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false,
        error: 'Access denied. Insufficient permissions.',
        code: 'INSUFFICIENT_PERMISSIONS',
        requiredRoles: roles,
        userRole: req.user.role
      });
    }

    next();
  };
};

/**
 * ⭐ Optional authentication (doesn't fail if no token)
 * Useful for public routes that have optional user-specific features
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id || decoded.userId || decoded._id;

    if (userId) {
      const user = await User.findById(userId).select('-password');
      if (user && user.isActive) {
        req.user = {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role
        };
        req.userDoc = user;
      }
    }

    next();
  } catch (error) {
    // Don't fail, just continue without user
    req.user = null;
    next();
  }
};

module.exports = {
  authenticateToken,
  authorize,
  optionalAuth
};