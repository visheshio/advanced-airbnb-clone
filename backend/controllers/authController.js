const crypto = require('crypto');
const User = require('../models/User');
const Wishlist = require('../models/Wishlist');
const AppError = require('../utils/appError');
const {
  generateAccessToken,
  generateRefreshToken,
  generateTokensAndSetCookie,
  clearTokenCookie,
  verifyRefreshToken,
} = require('../utils/generateToken');
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
} = require('../utils/sendEmail');

// ─── Helper: Ensure user has default wishlist ───────────────────────────────
const ensureDefaultWishlist = async (userId) => {
  try {
    const existing = await Wishlist.findOne({ user: userId, name: 'Favorites' });
    if (!existing) {
      await Wishlist.create({
        user: userId,
        name: 'Favorites',
        description: 'My favorite listings',
      });
    }
  } catch (error) {
    console.error(`Error creating default wishlist for user ${userId}:`, error.message);
  }
};

// ─── Helper: send token response ────────────────────────────────────────────
const sendTokenResponse = async (user, statusCode, res, message = 'Success') => {
  const { accessToken, refreshToken } = generateTokensAndSetCookie(user._id, res);

  // Ensure user has default wishlist
  await ensureDefaultWishlist(user._id);

  // Store refresh token in DB
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  user.refreshTokens.push({ token: refreshToken, expiresAt });
  user.cleanExpiredTokens();
  await user.save({ validateBeforeSave: false });

  // Remove sensitive fields
  user.password = undefined;
  user.refreshTokens = undefined;

  res.status(statusCode).json({
    success: true,
    message,
    data: {
      user,
      accessToken,
    },
  });
};

// ─── POST /api/auth/register ────────────────────────────────────────────────
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return next(new AppError('An account with this email already exists. Please log in.', 409));
    }

    // Create user
    const user = await User.create({ name, email, password, provider: 'local' });

    // Generate email verification token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    // Send verification email
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
    try {
      await sendVerificationEmail(user, verificationUrl);
    } catch (emailError) {
      // Don't fail registration if email fails
      console.error('Email send error:', emailError.message);
    }

    await sendTokenResponse(user, 201, res, 'Account created successfully! Please verify your email.');
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/auth/login ───────────────────────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user with password
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password +refreshTokens');
    if (!user || !user.password) {
      return next(new AppError('Invalid email or password.', 401));
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(new AppError('Invalid email or password.', 401));
    }

    // Check if banned
    if (user.isBanned) {
      return next(new AppError(`Your account has been suspended. Reason: ${user.banReason || 'Policy violation'}`, 403));
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    await sendTokenResponse(user, 200, res, 'Logged in successfully.');
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/auth/google ──────────────────────────────────────────────────
exports.googleAuth = async (req, res, next) => {
  try {
    const { googleId, email, name, avatar } = req.body;

    if (!googleId || !email) {
      return next(new AppError('Google authentication data is incomplete.', 400));
    }

    // Find or create user
    let user = await User.findOne({ $or: [{ googleId }, { email: email.toLowerCase() }] }).select('+refreshTokens');

    if (user) {
      // Update Google ID if missing
      if (!user.googleId) {
        user.googleId = googleId;
        user.provider = 'google';
        user.isEmailVerified = true;
      }
      user.lastLogin = new Date();
      await user.save({ validateBeforeSave: false });
    } else {
      // Create new user via Google
      user = await User.create({
        name,
        email: email.toLowerCase(),
        googleId,
        provider: 'google',
        isEmailVerified: true,
        avatar: { url: avatar || '' },
        refreshTokens: [],
      });
    }

    if (user.isBanned) {
      return next(new AppError('Your account has been suspended.', 403));
    }

    await sendTokenResponse(user, 200, res, 'Google authentication successful.');
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/auth/forgot-password ────────────────────────────────────────
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Return success even if user not found (security — don't reveal emails)
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a reset link has been sent.',
      });
    }

    const resetToken = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    try {
      await sendPasswordResetEmail(user, resetUrl);
    } catch (emailError) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return next(new AppError('Failed to send password reset email. Please try again.', 500));
    }

    res.status(200).json({
      success: true,
      message: 'Password reset link sent to your email.',
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/auth/reset-password/:token ──────────────────────────────────
exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Hash the incoming token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    }).select('+refreshTokens');

    if (!user) {
      return next(new AppError('Invalid or expired password reset token. Please request a new one.', 400));
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    user.refreshTokens = []; // Invalidate all sessions
    await user.save();

    await sendTokenResponse(user, 200, res, 'Password reset successful. You are now logged in.');
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/auth/verify-email/:token ─────────────────────────────────────
exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpire: { $gt: Date.now() },
    });

    if (!user) {
      return next(new AppError('Invalid or expired verification token. Please request a new one.', 400));
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! Your account is now active.',
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/auth/refresh-token ──────────────────────────────────────────
exports.refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!token) {
      return next(new AppError('Refresh token not provided.', 401));
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch {
      return next(new AppError('Invalid or expired refresh token. Please log in again.', 401));
    }

    // Find user and check if refresh token exists in DB
    const user = await User.findById(decoded.id).select('+refreshTokens');
    if (!user) {
      return next(new AppError('User not found.', 401));
    }

    const storedToken = user.refreshTokens.find((rt) => rt.token === token);
    if (!storedToken) {
      return next(new AppError('Refresh token has been revoked. Please log in again.', 401));
    }

    if (new Date() > storedToken.expiresAt) {
      return next(new AppError('Refresh token has expired. Please log in again.', 401));
    }

    // Issue new access token
    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    // Rotate refresh token
    user.refreshTokens = user.refreshTokens.filter((rt) => rt.token !== token);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    user.refreshTokens.push({ token: newRefreshToken, expiresAt });
    user.cleanExpiredTokens();
    await user.save({ validateBeforeSave: false });

    // Set new refresh token cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api/auth/refresh-token',
    });

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully.',
      data: { accessToken: newAccessToken },
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/auth/logout ──────────────────────────────────────────────────
exports.logout = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;

    if (token && req.user) {
      // Remove refresh token from DB
      req.user.refreshTokens = req.user.refreshTokens.filter((rt) => rt.token !== token);
      await req.user.save({ validateBeforeSave: false });
    }

    clearTokenCookie(res);

    res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/auth/me ───────────────────────────────────────────────────────
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return next(new AppError('User not found.', 404));
    }

    res.status(200).json({
      success: true,
      message: 'User profile fetched successfully.',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};
