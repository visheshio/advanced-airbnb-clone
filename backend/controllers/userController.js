const User = require('../models/User');
const Listing = require('../models/Listing');
const Booking = require('../models/Booking');
const AppError = require('../utils/appError');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryUpload');

// ─── GET /api/users/profile ─────────────────────────────────────────────────
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({
      success: true,
      message: 'Profile fetched successfully.',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/users/profile ─────────────────────────────────────────────────
exports.updateProfile = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'phone', 'bio', 'languages', 'currency', 'language'];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    if (Object.keys(updates).length === 0) {
      return next(new AppError('No valid fields provided to update.', 400));
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/users/avatar ──────────────────────────────────────────────────
exports.updateAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('Please upload an image file.', 400));
    }

    const user = await User.findById(req.user._id);

    // Delete old avatar from Cloudinary
    if (user.avatar?.publicId) {
      await deleteFromCloudinary(user.avatar.publicId);
    }

    // Upload new avatar
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'home-rental/avatars',
      transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
    });

    user.avatar = { url: result.secure_url, publicId: result.public_id };
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'Avatar updated successfully.',
      data: { avatar: user.avatar },
    });
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/users/become-host ─────────────────────────────────────────────
exports.becomeHost = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user.isHost) {
      return next(new AppError('You are already a registered host.', 400));
    }

    user.isHost = true;
    user.role = 'host';
    user.hostSince = new Date();
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'Congratulations! You are now a host. Start listing your properties.',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/users/:id ─────────────────────────────────────────────────────
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select(
      'name avatar bio isHost isSuperhost hostSince responseRate responseTime languages createdAt'
    );

    if (!user) {
      return next(new AppError('User not found.', 404));
    }

    // Get their active listings count
    const listingsCount = await Listing.countDocuments({ host: user._id, status: 'active' });

    // Get their review count (as host)
    const reviewStats = await Listing.aggregate([
      { $match: { host: user._id } },
      { $group: { _id: null, totalReviews: { $sum: '$totalReviews' }, avgRating: { $avg: '$avgRating' } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        user,
        stats: {
          listingsCount,
          totalReviews: reviewStats[0]?.totalReviews || 0,
          avgRating: reviewStats[0]?.avgRating ? Math.round(reviewStats[0].avgRating * 10) / 10 : 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/users/account ──────────────────────────────────────────────
exports.deleteAccount = async (req, res, next) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    // Verify password before deletion
    if (user.provider === 'local') {
      if (!password) {
        return next(new AppError('Please provide your password to confirm account deletion.', 400));
      }
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return next(new AppError('Incorrect password. Account deletion cancelled.', 401));
      }
    }

    // Check for upcoming confirmed bookings (as guest)
    const upcomingBookings = await Booking.countDocuments({
      guest: user._id,
      status: 'confirmed',
      checkIn: { $gte: new Date() },
    });

    if (upcomingBookings > 0) {
      return next(
        new AppError(
          `You have ${upcomingBookings} upcoming booking(s). Please cancel them before deleting your account.`,
          400
        )
      );
    }

    // Soft delete — deactivate instead of hard delete
    user.isActive = false;
    user.email = `deleted_${Date.now()}_${user.email}`;
    user.refreshTokens = [];
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'Your account has been deactivated successfully.',
    });
  } catch (error) {
    next(error);
  }
};
