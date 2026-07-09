const rateLimit = require('express-rate-limit');

const makeResponse = (message) => ({
  success: false,
  message,
  error: 'RATE_LIMIT_EXCEEDED',
  statusCode: 429,
});

// ─── Auth rate limiter: 10 attempts per 15 minutes ────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: makeResponse('Too many login attempts. Please try again in 15 minutes.'),
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── API rate limiter: 100 requests per 15 minutes ────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: makeResponse('Too many requests. Please slow down.'),
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── Upload rate limiter: 20 uploads per hour ─────────────────────────────
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: makeResponse('Too many uploads. Please try again in an hour.'),
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── Password reset limiter: 3 requests per hour ──────────────────────────
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: makeResponse('Too many password reset attempts. Please try again in 1 hour.'),
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { authLimiter, apiLimiter, uploadLimiter, passwordResetLimiter };
