const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Never return password in queries
    },
    avatar: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[+]?[\d\s\-()]{7,15}$/, 'Please enter a valid phone number'],
    },
    role: {
      type: String,
      enum: ['guest', 'host', 'admin'],
      default: 'guest',
    },

    // ─── Host specific ───────────────────────────────────────────────
    isHost: { type: Boolean, default: false },
    isSuperhost: { type: Boolean, default: false },
    hostSince: { type: Date },
    bio: { type: String, maxlength: [500, 'Bio cannot exceed 500 characters'] },
    languages: [{ type: String }],
    responseRate: { type: Number, default: 0, min: 0, max: 100 },
    responseTime: { type: String, default: 'within a day' },

    // ─── Verification ────────────────────────────────────────────────
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpire: { type: Date, select: false },

    // ─── Password Reset ──────────────────────────────────────────────
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpire: { type: Date, select: false },

    // ─── OAuth ───────────────────────────────────────────────────────
    googleId: { type: String, select: false },
    provider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },

    // ─── Account ─────────────────────────────────────────────────────
    isActive: { type: Boolean, default: true },
    isBanned: { type: Boolean, default: false },
    banReason: { type: String },

    // ─── Stripe ──────────────────────────────────────────────────────
    stripeCustomerId: { type: String },
    stripeAccountId: { type: String }, // For hosts to receive payouts

    // ─── Preferences ─────────────────────────────────────────────────
    currency: { type: String, default: 'INR' },
    language: { type: String, default: 'en' },

    // ─── Refresh Tokens ──────────────────────────────────────────────
    refreshTokens: [
      {
        token: { type: String },
        createdAt: { type: Date, default: Date.now },
        expiresAt: { type: Date },
      },
    ],

    lastLogin: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ─────────────────────────────────────────────────────────────
userSchema.index({ googleId: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1, isBanned: 1 });

// ─── Virtuals ────────────────────────────────────────────────────────────
userSchema.virtual('listings', {
  ref: 'Listing',
  localField: '_id',
  foreignField: 'host',
});

// ─── Pre-save: Hash password ──────────────────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ─── Method: Compare password ─────────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// ─── Method: Generate Email Verification Token ────────────────────────────
userSchema.methods.generateEmailVerificationToken = function () {
  const token = crypto.randomBytes(32).toString('hex');
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  this.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  return token; // Return unhashed token (sent via email)
};

// ─── Method: Generate Password Reset Token ────────────────────────────────
userSchema.methods.generatePasswordResetToken = function () {
  const token = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  this.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour
  return token; // Return unhashed token (sent via email)
};

// ─── Method: Clean expired refresh tokens ─────────────────────────────────
userSchema.methods.cleanExpiredTokens = function () {
  this.refreshTokens = this.refreshTokens.filter(
    (rt) => rt.expiresAt > new Date()
  );
};

module.exports = mongoose.model('User', userSchema);
