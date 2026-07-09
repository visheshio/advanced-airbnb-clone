const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: [true, 'Listing is required'],
    },
    guest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Guest is required'],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner is required'],
    },

    // ─── Dates ────────────────────────────────────────────────────────
    checkIn: {
      type: Date,
      required: [true, 'Check-in date is required'],
    },
    checkOut: {
      type: Date,
      required: [true, 'Check-out date is required'],
    },
    nights: {
      type: Number,
      required: true,
      min: [1, 'Minimum 1 night required'],
    },

    // ─── Guests ───────────────────────────────────────────────────────
    adults: {
      type: Number,
      required: true,
      min: [1, 'At least 1 adult is required'],
    },
    children: { type: Number, default: 0, min: 0 },
    infants: { type: Number, default: 0, min: 0 },
    pets: { type: Number, default: 0, min: 0 },

    // ─── Pricing Breakdown ────────────────────────────────────────────
    pricing: {
      pricePerNight: { type: Number, required: true },
      subtotal: { type: Number, required: true }, // pricePerNight × nights
      cleaningFee: { type: Number, default: 0 },
      serviceFee: { type: Number, default: 0 },
      taxes: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      totalPrice: { type: Number, required: true },
      ownerPayout: { type: Number, required: true }, // totalPrice - serviceFee - taxes
      currency: { type: String, default: 'INR' },
    },

    // ─── Status ───────────────────────────────────────────────────────
    status: {
      type: String,
      enum: {
        values: ['pending', 'confirmed', 'completed', 'cancelled', 'declined', 'expired'],
        message: '{VALUE} is not a valid booking status',
      },
      default: 'pending',
    },

    // ─── Payment ──────────────────────────────────────────────────────
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'refunded', 'partially_refunded', 'failed'],
      default: 'unpaid',
    },
    stripeSessionId: { type: String },
    stripePaymentIntentId: { type: String },
    stripeRefundId: { type: String },

    // ─── Cancellation ─────────────────────────────────────────────────
    cancelledAt: { type: Date },
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    cancellationReason: { type: String, maxlength: 500 },
    refundAmount: { type: Number, default: 0 },

    // ─── Review Tracking ──────────────────────────────────────────────
    guestReviewed: { type: Boolean, default: false },
    ownerReviewed: { type: Boolean, default: false },

    // ─── Special Requests ─────────────────────────────────────────────
    specialRequests: { type: String, maxlength: 500 },

    // ─── Confirmation Code ────────────────────────────────────────────
    confirmationCode: { type: String, unique: true, sparse: true },

    // ─── Expiry (auto-expire pending bookings) ────────────────────────
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ─────────────────────────────────────────────────────────────
bookingSchema.index({ listing: 1, checkIn: 1, checkOut: 1 });
bookingSchema.index({ guest: 1, status: 1 });
bookingSchema.index({ owner: 1, status: 1 });
bookingSchema.index({ status: 1, expiresAt: 1 });
bookingSchema.index({ stripeSessionId: 1 });

// ─── Virtuals ────────────────────────────────────────────────────────────
bookingSchema.virtual('durationLabel').get(function () {
  return `${this.nights} night${this.nights > 1 ? 's' : ''}`;
});

bookingSchema.virtual('isUpcoming').get(function () {
  return this.checkIn > new Date() && this.status === 'confirmed';
});

bookingSchema.virtual('isPast').get(function () {
  return this.checkOut < new Date();
});

// ─── Validation: checkOut must be after checkIn ───────────────────────────
bookingSchema.pre('validate', function (next) {
  if (this.checkIn && this.checkOut && this.checkOut <= this.checkIn) {
    return next(new Error('Check-out date must be after check-in date'));
  }
  next();
});

// ─── Pre-save: Generate confirmation code ─────────────────────────────────
bookingSchema.pre('save', function (next) {
  if (this.isNew && !this.confirmationCode) {
    this.confirmationCode = `HR${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
  }
  next();
});

// ─── Pre-save: Calculate nights ───────────────────────────────────────────
bookingSchema.pre('save', function (next) {
  if (this.checkIn && this.checkOut) {
    const diffTime = Math.abs(this.checkOut - this.checkIn);
    this.nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
