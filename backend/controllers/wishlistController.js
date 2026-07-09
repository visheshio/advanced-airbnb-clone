const Wishlist = require('../models/Wishlist');
const Listing = require('../models/Listing');
const AppError = require('../utils/appError');

// ─── POST /api/wishlists ─────────────────────────────────────────────────────
exports.createWishlist = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const wishlist = await Wishlist.create({
      user: req.user._id,
      name: name || 'My Wishlist',
      description: description || '',
    });

    res.status(201).json({
      success: true,
      message: 'Wishlist created successfully.',
      data: { wishlist },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/wishlists ──────────────────────────────────────────────────────
exports.getMyWishlists = async (req, res, next) => {
  try {
    const wishlists = await Wishlist.find({ user: req.user._id })
      .populate({
        path: 'listings',
        select: 'title location images pricePerNight avgRating',
        populate: { path: 'host', select: 'name avatar isSuperhost' },
      })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: { wishlists },
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/wishlists/:id/listings/:listingId ────────────────────────────
exports.addToWishlist = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findById(req.params.id);
    if (!wishlist) return next(new AppError('Wishlist not found.', 404));

    if (wishlist.user.toString() !== req.user._id.toString()) {
      return next(new AppError('Access denied.', 403));
    }

    const listing = await Listing.findById(req.params.listingId);
    if (!listing) return next(new AppError('Listing not found.', 404));

    if (wishlist.listings.includes(req.params.listingId)) {
      return next(new AppError('This listing is already in the wishlist.', 409));
    }

    wishlist.listings.push(req.params.listingId);
    await wishlist.save();

    res.status(200).json({
      success: true,
      message: 'Listing added to wishlist.',
      data: { wishlist },
    });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/wishlists/:id/listings/:listingId ──────────────────────────
exports.removeFromWishlist = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findById(req.params.id);
    if (!wishlist) return next(new AppError('Wishlist not found.', 404));

    if (wishlist.user.toString() !== req.user._id.toString()) {
      return next(new AppError('Access denied.', 403));
    }

    wishlist.listings = wishlist.listings.filter(
      (id) => id.toString() !== req.params.listingId
    );
    await wishlist.save();

    res.status(200).json({
      success: true,
      message: 'Listing removed from wishlist.',
      data: { wishlist },
    });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/wishlists/:id ───────────────────────────────────────────────
exports.deleteWishlist = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findById(req.params.id);
    if (!wishlist) return next(new AppError('Wishlist not found.', 404));

    if (wishlist.user.toString() !== req.user._id.toString()) {
      return next(new AppError('Access denied.', 403));
    }

    await wishlist.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Wishlist deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
