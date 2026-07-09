const express = require('express');
const router = express.Router();
const {
  register, login, googleAuth, forgotPassword, resetPassword,
  verifyEmail, refreshToken, logout, getMe,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter, passwordResetLimiter } = require('../middleware/rateLimit');
const validate = require('../middleware/validate');
const {
  registerValidator, loginValidator, forgotPasswordValidator, resetPasswordValidator,
} = require('../utils/validators/authValidator');

router.post('/register', authLimiter, registerValidator, validate, register);
router.post('/login', authLimiter, loginValidator, validate, login);
router.post('/google', authLimiter, googleAuth);
router.post('/forgot-password', passwordResetLimiter, forgotPasswordValidator, validate, forgotPassword);
router.post('/reset-password/:token', authLimiter, resetPasswordValidator, validate, resetPassword);
router.get('/verify-email/:token', verifyEmail);
router.post('/refresh-token', refreshToken);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

module.exports = router;
