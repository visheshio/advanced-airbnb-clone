const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient is required'],
    },
    type: {
      type: String,
      required: [true, 'Notification type is required'],
      enum: [
        'booking_request',      // Host receives: new booking request
        'booking_confirmed',    // Guest receives: booking confirmed
        'booking_cancelled',    // Both receive: booking cancelled
        'booking_completed',    // Guest receives: stay completed
        'booking_declined',     // Guest receives: booking declined
        'new_message',          // User receives: new message
        'new_review',           // Host receives: new review
        'review_response',      // Guest receives: host responded to review
        'payment_received',     // Host receives: payout processed
        'payment_failed',       // Guest receives: payment failed
        'listing_approved',     // Host receives: listing approved
        'listing_suspended',    // Host receives: listing suspended
        'system',               // General system notification
      ],
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      maxlength: [500, 'Message cannot exceed 500 characters'],
    },

    // ─── References ───────────────────────────────────────────────────
    relatedBooking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    relatedListing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing' },
    relatedReview: { type: mongoose.Schema.Types.ObjectId, ref: 'Review' },
    relatedConversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' },
    relatedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // ─── Action ───────────────────────────────────────────────────────
    actionUrl: { type: String }, // Frontend route to navigate to
    actionLabel: { type: String }, // Button text (e.g., "View Booking")

    // ─── State ────────────────────────────────────────────────────────
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ─────────────────────────────────────────────────────────────
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });

// ─── TTL Index: Auto-delete notifications older than 90 days ─────────────
notificationSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 90 * 24 * 60 * 60 } // 90 days
);

module.exports = mongoose.model('Notification', notificationSchema);
