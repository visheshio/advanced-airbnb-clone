const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: [true, 'Listing is required'],
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Booking is required'],
      unique: true, // One review per booking
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reviewer is required'],
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Host is required'],
    },

    // ─── Ratings ──────────────────────────────────────────────────────
    overallRating: {
      type: Number,
      required: [true, 'Overall rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    ratings: {
      cleanliness: {
        type: Number,
        required: true,
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5'],
      },
      accuracy: {
        type: Number,
        required: true,
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5'],
      },
      communication: {
        type: Number,
        required: true,
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5'],
      },
      location: {
        type: Number,
        required: true,
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5'],
      },
      checkIn: {
        type: Number,
        required: true,
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5'],
      },
      value: {
        type: Number,
        required: true,
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5'],
      },
    },

    // ─── Review Content ───────────────────────────────────────────────
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      minlength: [20, 'Review must be at least 20 characters'],
      maxlength: [1000, 'Review cannot exceed 1000 characters'],
      trim: true,
    },

    // ─── Host Response ────────────────────────────────────────────────
    hostResponse: {
      comment: {
        type: String,
        maxlength: [500, 'Host response cannot exceed 500 characters'],
        trim: true,
      },
      respondedAt: { type: Date },
    },

    // ─── Visibility ───────────────────────────────────────────────────
    isPublic: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ─────────────────────────────────────────────────────────────
reviewSchema.index({ listing: 1, createdAt: -1 });
reviewSchema.index({ reviewer: 1 });
reviewSchema.index({ host: 1 });

// ─── Post-save: Recalculate listing average rating ────────────────────────
reviewSchema.post('save', async function () {
  await mongoose.model('Listing').recalculateRatings(this.listing);
});

// ─── Post-remove: Recalculate listing average rating ─────────────────────
reviewSchema.post('deleteOne', { document: true }, async function () {
  await mongoose.model('Listing').recalculateRatings(this.listing);
});

module.exports = mongoose.model('Review', reviewSchema);
