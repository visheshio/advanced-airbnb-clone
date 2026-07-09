const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/appError');

/**
 * Protect routes — verifies JWT access token
 * Attaches req.user to the request
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // 1. Get token from Authorization header or cookie
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return next(new AppError('Access denied. Please log in to continue.', 401));
    }

    // 2. Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return next(new AppError('Your session has expired. Please log in again.', 401));
      }
      return next(new AppError('Invalid token. Please log in again.', 401));
    }

    // 3. Find user
    const user = await User.findById(decoded.id).select('+refreshTokens');
    if (!user) {
      return next(new AppError('The user associated with this token no longer exists.', 401));
    }

    // 4. Check if user is banned
    if (user.isBanned) {
      return next(new AppError('Your account has been suspended. Please contact support.', 403));
    }

    // 5. Check if user is active
    if (!user.isActive) {
      return next(new AppError('Your account is deactivated.', 403));
    }

    // 6. Attach user to request (exclude sensitive fields)
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional auth — doesn't reject if no token, just attaches user if valid
 * Useful for routes that work for both guests and authenticated users
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        const user = await User.findById(decoded.id);
        if (user && !user.isBanned && user.isActive) {
          req.user = user;
        }
      } catch {
        // Token invalid — continue without user
      }
    }
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { protect, optionalAuth };
