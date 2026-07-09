const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');
const AppError = require('../utils/appError');

// ─── POST /api/reviews ───────────────────────────────────────────────────────
exports.createReview = async (req, res, next) => {
  try {
    const { bookingId, overallRating, ratings, comment } = req.body;

    // Verify booking exists and is completed
    const booking = await Booking.findById(bookingId).populate('listing', 'title host');
    if (!booking) return next(new AppError('Booking not found.', 404));

    if (booking.guest.toString() !== req.user._id.toString()) {
      return next(new AppError('Only the guest of this booking can write a review.', 403));
    }

    if (booking.status !== 'completed') {
      return next(new AppError('You can only review completed stays.', 400));
    }

    if (booking.guestReviewed) {
      return next(new AppError('You have already reviewed this stay.', 409));
    }

    // Create review
    const review = await Review.create({
      listing: booking.listing._id,
      booking: bookingId,
      reviewer: req.user._id,
      host: booking.listing.host,
      overallRating,
      ratings,
      comment,
    });

    // Mark booking as reviewed
    booking.guestReviewed = true;
    await booking.save();

    await review.populate('reviewer', 'name avatar createdAt');

    // Notify host
    await Notification.create({
      recipient: booking.listing.host,
      type: 'new_review',
      title: 'New Review Received',
      message: `${req.user.name} left a ${overallRating}★ review for "${booking.listing.title}".`,
      relatedReview: review._id,
      relatedListing: booking.listing._id,
      actionUrl: '/host/dashboard',
      actionLabel: 'View Review',
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully. Thank you!',
      data: { review },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/reviews/listing/:listingId ────────────────────────────────────
exports.getListingReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const filter = { listing: req.params.listingId, isPublic: true };

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate('reviewer', 'name avatar createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Review.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: { reviews },
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalResults: total,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/reviews/user/:userId ──────────────────────────────────────────
exports.getUserReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ reviewer: req.params.userId, isPublic: true })
      .populate('listing', 'title location images')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: { reviews },
    });
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/reviews/:id ────────────────────────────────────────────────────
exports.updateReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return next(new AppError('Review not found.', 404));

    if (review.reviewer.toString() !== req.user._id.toString()) {
      return next(new AppError('You can only edit your own reviews.', 403));
    }

    // Can only edit within 48 hours of posting
    const hoursSinceCreated = (Date.now() - review.createdAt) / (1000 * 60 * 60);
    if (hoursSinceCreated > 48) {
      return next(new AppError('Reviews can only be edited within 48 hours of posting.', 400));
    }

    const { overallRating, ratings, comment } = req.body;
    if (overallRating) review.overallRating = overallRating;
    if (ratings) review.ratings = { ...review.ratings, ...ratings };
    if (comment) review.comment = comment;

    await review.save();

    res.status(200).json({
      success: true,
      message: 'Review updated successfully.',
      data: { review },
    });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/reviews/:id ─────────────────────────────────────────────────
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return next(new AppError('Review not found.', 404));

    const isOwner = review.reviewer.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return next(new AppError('You can only delete your own reviews.', 403));
    }

    await review.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/reviews/:id/respond ──────────────────────────────────────────
exports.respondToReview = async (req, res, next) => {
  try {
    const { comment } = req.body;
    const review = await Review.findById(req.params.id);
    if (!review) return next(new AppError('Review not found.', 404));

    if (review.host.toString() !== req.user._id.toString()) {
      return next(new AppError('Only the host of this listing can respond to this review.', 403));
    }

    if (review.hostResponse?.comment) {
      return next(new AppError('You have already responded to this review.', 400));
    }

    review.hostResponse = { comment, respondedAt: new Date() };
    await review.save();

    // Notify reviewer
    await Notification.create({
      recipient: review.reviewer,
      type: 'review_response',
      title: 'Host Responded to Your Review',
      message: `The host responded to your review.`,
      relatedReview: review._id,
    });

    res.status(200).json({
      success: true,
      message: 'Response added successfully.',
      data: { review },
    });
  } catch (error) {
    next(error);
  }
};
