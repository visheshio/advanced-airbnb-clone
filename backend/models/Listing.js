const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [10, 'Title must be at least 10 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      minlength: [50, 'Description must be at least 50 characters'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },

    // ─── Property Classification ──────────────────────────────────────
    propertyType: {
      type: String,
      required: [true, 'Property type is required'],
      enum: {
        values: ['house', 'apartment', 'villa', 'cabin', 'treehouse', 'boat', 'studio', 'cottage'],
        message: '{VALUE} is not a valid property type',
      },
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ['beach', 'mountain', 'city', 'countryside', 'cabin', 'tropical', 'lake', 'desert', 'arctic', 'camping', 'island', 'luxury'],
        message: '{VALUE} is not a valid category',
      },
    },

    // ─── Location ─────────────────────────────────────────────────────
    location: {
      address: { type: String, required: [true, 'Address is required'], trim: true },
      city: { type: String, required: [true, 'City is required'], trim: true },
      state: { type: String, trim: true },
      country: { type: String, required: [true, 'Country is required'], trim: true },
      zipCode: { type: String, trim: true },
      // GeoJSON Point for geospatial queries
      coordinates: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point',
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          required: [true, 'Coordinates are required'],
          validate: {
            validator: (v) => v.length === 2 &&
              v[0] >= -180 && v[0] <= 180 &&  // longitude
              v[1] >= -90 && v[1] <= 90,       // latitude
            message: 'Invalid coordinates. Provide [longitude, latitude]',
          },
        },
      },
    },

    // ─── Media ────────────────────────────────────────────────────────
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
        caption: { type: String, default: '' },
        isPrimary: { type: Boolean, default: false },
      },
    ],

    // ─── Capacity ─────────────────────────────────────────────────────
    totalRooms: {
      type: Number,
      required: true,
      default: 1,
      min: [1, 'Must have at least 1 room available for booking'],
    },
    maxGuests: {
      type: Number,
      required: [true, 'Max guests is required'],
      min: [1, 'Must accommodate at least 1 guest'],
      max: [50, 'Cannot exceed 50 guests'],
    },
    bedrooms: { type: Number, required: true, min: 0 },
    beds: { type: Number, required: true, min: 1 },
    bathrooms: { type: Number, required: true, min: 0.5 },

    // ─── Pricing ──────────────────────────────────────────────────────
    pricePerNight: {
      type: Number,
      required: [true, 'Price per night is required'],
      min: [100, 'Minimum price is ₹100 per night'],
    },
    cleaningFee: { type: Number, default: 0, min: 0 },
    serviceFee: { type: Number, default: 0, min: 0 },
    weeklyDiscount: { type: Number, default: 0, min: 0, max: 80 }, // %
    monthlyDiscount: { type: Number, default: 0, min: 0, max: 80 }, // %

    // ─── Amenities ────────────────────────────────────────────────────
    amenities: [
      {
        type: String,
        enum: [
          'wifi', 'pool', 'kitchen', 'ac', 'parking', 'tv', 'washer', 'dryer',
          'heating', 'gym', 'hotTub', 'bbq', 'fireplace', 'balcony', 'garden',
          'breakfast', 'workspace', 'elevator', 'petsAllowed', 'smokingAllowed',
          'beachfront', 'waterfront', 'skiInOut', 'oceanView', 'mountainView',
          'cityView', 'lakeView', 'securityCamera', 'smokeAlarm', 'firstAidKit',
        ],
      },
    ],

    // ─── House Rules ──────────────────────────────────────────────────
    houseRules: {
      checkInTime: { type: String, default: '15:00' },
      checkOutTime: { type: String, default: '11:00' },
      selfCheckIn: { type: Boolean, default: false },
      petsAllowed: { type: Boolean, default: false },
      smokingAllowed: { type: Boolean, default: false },
      partiesAllowed: { type: Boolean, default: false },
      additionalRules: [{ type: String }],
    },

    // ─── Availability ─────────────────────────────────────────────────
    availableFrom: { type: Date },
    availableTo: { type: Date },
    minNights: { type: Number, default: 1, min: 1 },
    maxNights: { type: Number, default: 365, max: 365 },
    instantBook: { type: Boolean, default: false },
    advanceNotice: { type: Number, default: 1 }, // Days

    // ─── Ratings (auto-calculated) ────────────────────────────────────
    avgRating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0, min: 0 },
    ratingBreakdown: {
      cleanliness: { type: Number, default: 0 },
      accuracy: { type: Number, default: 0 },
      communication: { type: Number, default: 0 },
      location: { type: Number, default: 0 },
      checkIn: { type: Number, default: 0 },
      value: { type: Number, default: 0 },
    },

    // ─── Status ───────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ['draft', 'active', 'paused'],
      default: 'draft',
    },
    isFeatured: { type: Boolean, default: false },
    viewCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ─────────────────────────────────────────────────────────────
listingSchema.index({ 'location.coordinates': '2dsphere' }); // Geospatial
listingSchema.index({ title: 'text', description: 'text', 'location.city': 'text', 'location.country': 'text' }); // Full-text
listingSchema.index({ status: 1, category: 1 });
listingSchema.index({ status: 1, pricePerNight: 1 });
listingSchema.index({ status: 1, avgRating: -1 });
listingSchema.index({ owner: 1, status: 1 });
listingSchema.index({ isFeatured: 1, status: 1 });

// ─── Virtuals ────────────────────────────────────────────────────────────
listingSchema.virtual('coverImage').get(function () {
  const primary = this.images.find((img) => img.isPrimary);
  return primary?.url || this.images[0]?.url || '';
});

listingSchema.virtual('totalPrice').get(function () {
  return this.pricePerNight + (this.cleaningFee || 0) + (this.serviceFee || 0);
});

// ─── Pre-save: Generate slug ──────────────────────────────────────────────
listingSchema.pre('save', function (next) {
  if (this.isModified('title') || this.isNew) {
    const baseSlug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    this.slug = `${baseSlug}-${this._id.toString().slice(-6)}`;
  }
  next();
});

// ─── Pre-save: Ensure first image is primary if none set ─────────────────
listingSchema.pre('save', function (next) {
  if (this.images.length > 0 && !this.images.some((img) => img.isPrimary)) {
    this.images[0].isPrimary = true;
  }
  next();
});

// ─── Static: Recalculate average rating ──────────────────────────────────
listingSchema.statics.recalculateRatings = async function (listingId) {
  const Review = require('./Review');

  const stats = await Review.aggregate([
    { $match: { listing: mongoose.Types.ObjectId.createFromHexString(listingId.toString()) } },
    {
      $group: {
        _id: '$listing',
        avgRating: { $avg: '$overallRating' },
        totalReviews: { $sum: 1 },
        avgCleanliness: { $avg: '$ratings.cleanliness' },
        avgAccuracy: { $avg: '$ratings.accuracy' },
        avgCommunication: { $avg: '$ratings.communication' },
        avgLocation: { $avg: '$ratings.location' },
        avgCheckIn: { $avg: '$ratings.checkIn' },
        avgValue: { $avg: '$ratings.value' },
      },
    },
  ]);

  if (stats.length > 0) {
    const s = stats[0];
    await this.findByIdAndUpdate(listingId, {
      avgRating: Math.round(s.avgRating * 10) / 10,
      totalReviews: s.totalReviews,
      ratingBreakdown: {
        cleanliness: Math.round((s.avgCleanliness || 0) * 10) / 10,
        accuracy: Math.round((s.avgAccuracy || 0) * 10) / 10,
        communication: Math.round((s.avgCommunication || 0) * 10) / 10,
        location: Math.round((s.avgLocation || 0) * 10) / 10,
        checkIn: Math.round((s.avgCheckIn || 0) * 10) / 10,
        value: Math.round((s.avgValue || 0) * 10) / 10,
      },
    });
  } else {
    // No reviews — reset
    await this.findByIdAndUpdate(listingId, {
      avgRating: 0,
      totalReviews: 0,
      ratingBreakdown: {
        cleanliness: 0, accuracy: 0, communication: 0,
        location: 0, checkIn: 0, value: 0,
      },
    });
  }
};

module.exports = mongoose.model('Listing', listingSchema);
