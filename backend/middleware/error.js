const AppError = require('../utils/appError');

/**
 * Handle Mongoose CastError (invalid ObjectId)
 */
const handleCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}. Please provide a valid ID.`;
  return new AppError(message, 400);
};

/**
 * Handle Mongoose duplicate key error (code 11000)
 */
const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `An account with ${field} "${value}" already exists. Please use a different ${field}.`;
  return new AppError(message, 409);
};

/**
 * Handle Mongoose validation errors
 */
const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((e) => e.message);
  const message = `Validation failed: ${errors.join('. ')}`;
  return new AppError(message, 400);
};

/**
 * Handle JWT errors
 */
const handleJWTError = () =>
  new AppError('Invalid token. Please log in again.', 401);

const handleJWTExpiredError = () =>
  new AppError('Your session has expired. Please log in again.', 401);

/**
 * Handle Multer file size errors
 */
const handleMulterError = (err) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return new AppError('File size too large. Maximum allowed size is 5MB.', 400);
  }
  if (err.code === 'LIMIT_FILE_COUNT') {
    return new AppError('Too many files. Maximum 10 images allowed per listing.', 400);
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return new AppError(`Unexpected field: ${err.field}`, 400);
  }
  return new AppError(err.message, 400);
};

/**
 * Send error response in development (verbose)
 */
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    error: err.errorCode || 'ERROR',
    statusCode: err.statusCode,
    stack: err.stack,
    details: err,
  });
};

/**
 * Send error response in production (clean)
 */
const sendErrorProd = (err, res) => {
  // Operational errors — safe to send to client
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      error: err.errorCode || 'ERROR',
      statusCode: err.statusCode,
    });
  }

  // Programming errors — don't leak details to client
  console.error('💥 UNEXPECTED ERROR:', err);
  res.status(500).json({
    success: false,
    message: 'Something went wrong. Please try again later.',
    error: 'INTERNAL_SERVER_ERROR',
    statusCode: 500,
  });
};

/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';

  // Transform specific errors to AppError format
  let error = { ...err, message: err.message, name: err.name };

  if (error.name === 'CastError') error = handleCastError(error);
  if (error.code === 11000) error = handleDuplicateKeyError(error);
  if (error.name === 'ValidationError') error = handleValidationError(error);
  if (error.name === 'JsonWebTokenError') error = handleJWTError();
  if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
  if (error.name === 'MulterError') error = handleMulterError(error);

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};

module.exports = errorHandler;
