const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    name: {
      type: String,
      required: [true, 'Wishlist name is required'],
      trim: true,
      maxlength: [50, 'Wishlist name cannot exceed 50 characters'],
      default: 'My Wishlist',
    },
    description: {
      type: String,
      maxlength: [200, 'Description cannot exceed 200 characters'],
      default: '',
    },
    listings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Listing',
      },
    ],
    isPublic: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

wishlistSchema.index({ user: 1 });
wishlistSchema.virtual('listingCount').get(function () {
  return this.listings.length;
});

module.exports = mongoose.model('Wishlist', wishlistSchema);
