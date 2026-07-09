const User = require('../models/User');
const Listing = require('../models/Listing');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const AppError = require('../utils/appError');

// ─── GET /api/admin/dashboard ────────────────────────────────────────────────
exports.getDashboard = async (req, res, next) => {
  try {
    const [
      totalUsers, totalHosts, totalListings, totalBookings,
      revenueData, newUsersThisMonth, newListingsThisMonth,
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      User.countDocuments({ isHost: true, isActive: true }),
      Listing.countDocuments({ status: 'active' }),
      Booking.countDocuments(),
      Booking.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, totalRevenue: { $sum: '$pricing.totalPrice' }, platformFees: { $sum: '$pricing.serviceFee' } } },
      ]),
      User.countDocuments({
        createdAt: { $gte: new Date(new Date().setDate(1)) },
      }),
      Listing.countDocuments({
        createdAt: { $gte: new Date(new Date().setDate(1)) },
        status: 'active',
      }),
    ]);

    // Booking status breakdown
    const bookingStatusBreakdown = await Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Revenue by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const revenueByMonth = await Booking.aggregate([
      { $match: { paymentStatus: 'paid', createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          revenue: { $sum: '$pricing.totalPrice' },
          bookings: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalHosts,
          totalListings,
          totalBookings,
          totalRevenue: revenueData[0]?.totalRevenue || 0,
          platformFees: revenueData[0]?.platformFees || 0,
          newUsersThisMonth,
          newListingsThisMonth,
        },
        bookingStatusBreakdown,
        revenueByMonth,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/admin/users ────────────────────────────────────────────────────
exports.getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, isBanned, search } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (isBanned !== undefined) filter.isBanned = isBanned === 'true';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: { users },
      pagination: { currentPage: pageNum, totalPages: Math.ceil(total / limitNum), totalResults: total },
    });
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/admin/users/:id/ban ────────────────────────────────────────────
exports.banUser = async (req, res, next) => {
  try {
    const { reason, unban } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return next(new AppError('User not found.', 404));

    if (user.role === 'admin') {
      return next(new AppError('Cannot ban an admin user.', 403));
    }

    user.isBanned = !unban;
    user.banReason = unban ? '' : (reason || 'Policy violation');
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: unban ? 'User unbanned successfully.' : `User banned. Reason: ${user.banReason}`,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/admin/listings ─────────────────────────────────────────────────
exports.getListings = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (search) filter.$text = { $search: search };

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [listings, total] = await Promise.all([
      Listing.find(filter)
        .populate('host', 'name email avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Listing.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: { listings },
      pagination: { currentPage: pageNum, totalPages: Math.ceil(total / limitNum), totalResults: total },
    });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/admin/listings/:id ─────────────────────────────────────────
exports.deleteListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return next(new AppError('Listing not found.', 404));

    listing.status = 'paused';
    await listing.save();

    res.status(200).json({
      success: true,
      message: 'Listing suspended successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/admin/bookings ─────────────────────────────────────────────────
exports.getBookings = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate('listing', 'title location')
        .populate('guest', 'name email')
        .populate('host', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Booking.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: { bookings },
      pagination: { currentPage: pageNum, totalPages: Math.ceil(total / limitNum), totalResults: total },
    });
  } catch (error) {
    next(error);
  }
};
