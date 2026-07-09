const AppError = require('../utils/appError');

/**
 * Role-based access control middleware
 * Usage: router.delete('/listings/:id', protect, restrictTo('host', 'admin'), ...)
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('You must be logged in to perform this action.', 401));
    }
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access denied. This action requires one of the following roles: ${roles.join(', ')}.`,
          403
        )
      );
    }
    next();
  };
};

/**
 * Require the user to be a host (isHost flag OR role === 'host'/'admin')
 */
const requireHost = (req, res, next) => {
  if (!req.user) {
    return next(new AppError('You must be logged in to perform this action.', 401));
  }
  if (!req.user.isHost && req.user.role !== 'admin') {
    return next(
      new AppError(
        'You must be a registered host to perform this action. Please upgrade your account.',
        403
      )
    );
  }
  next();
};

/**
 * Require email verification before proceeding
 */
const requireEmailVerified = (req, res, next) => {
  if (!req.user) {
    return next(new AppError('You must be logged in.', 401));
  }
  if (!req.user.isEmailVerified) {
    return next(
      new AppError(
        'Please verify your email address before performing this action. Check your inbox for the verification link.',
        403
      )
    );
  }
  next();
};

module.exports = { restrictTo, requireHost, requireEmailVerified };
