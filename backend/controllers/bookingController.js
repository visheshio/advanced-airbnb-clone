const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Listing = require('../models/Listing');
const Notification = require('../models/Notification');
const User = require('../models/User');
const AppError = require('../utils/appError');
const { sendBookingConfirmationEmail, sendBookingRequestEmail } = require('../utils/sendEmail');

// ─── Helper: create notification ────────────────────────────────────────────
const createNotification = async (data) => {
  try {
    await Notification.create(data);
  } catch (err) {
    console.error('Notification create error:', err.message);
  }
};

// ─── POST /api/bookings ──────────────────────────────────────────────────────
exports.createBooking = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { listingId, checkIn, checkOut, adults, children = 0, infants = 0, pets = 0, specialRequests } = req.body;

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkInDate >= checkOutDate) {
      return next(new AppError('Check-out must be after check-in.', 400));
    }
    if (checkInDate < new Date()) {
      return next(new AppError('Check-in date cannot be in the past.', 400));
    }

    // Fetch listing
    const listing = await Listing.findById(listingId).session(session);
    if (!listing) return next(new AppError('Listing not found.', 404));
    if (listing.status !== 'active') return next(new AppError('This listing is not available for booking.', 400));
    if (listing.owner.toString() === req.user._id.toString()) {
      return next(new AppError('You cannot book your own listing.', 400));
    }

    const totalGuests = parseInt(adults) + parseInt(children);
    if (totalGuests > listing.maxGuests) {
      return next(new AppError(`This property accommodates a maximum of ${listing.maxGuests} guests.`, 400));
    }

    // Calculate nights
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

    if (nights < listing.minNights) {
      return next(new AppError(`Minimum stay is ${listing.minNights} night(s).`, 400));
    }
    if (nights > listing.maxNights) {
      return next(new AppError(`Maximum stay is ${listing.maxNights} night(s).`, 400));
    }

    // ─── Check for date conflicts (within transaction) ─────────────────
    const overlappingCount = await Booking.countDocuments({
      listing: listingId,
      status: { $in: ['confirmed', 'pending'] },
      $or: [
        { checkIn: { $lt: checkOutDate }, checkOut: { $gt: checkInDate } },
      ],
    }).session(session);

    if (overlappingCount >= listing.totalRooms) {
      await session.abortTransaction();
      return next(new AppError('These dates are not available. Please choose different dates.', 409));
    }

    // ─── Calculate pricing ─────────────────────────────────────────────
    const subtotal = listing.pricePerNight * nights;
    const cleaningFee = listing.cleaningFee || 0;
    const serviceFee = listing.serviceFee || 0;
    const taxes = Math.round(subtotal * 0.12); // 12% GST
    const totalPrice = subtotal + cleaningFee + serviceFee + taxes;
    const ownerPayout = totalPrice - serviceFee - taxes;

    // ─── Create booking ────────────────────────────────────────────────
    const [booking] = await Booking.create(
      [
        {
          listing: listingId,
          guest: req.user._id,
          owner: listing.owner,
          checkIn: checkInDate,
          checkOut: checkOutDate,
          nights,
          adults: parseInt(adults),
          children: parseInt(children),
          infants: parseInt(infants),
          pets: parseInt(pets),
          pricing: {
            pricePerNight: listing.pricePerNight,
            subtotal,
            cleaningFee,
            serviceFee,
            taxes,
            discount: 0,
            totalPrice,
            ownerPayout,
            currency: 'INR',
          },
          status: listing.instantBook ? 'confirmed' : 'pending',
          paymentStatus: 'unpaid',
          specialRequests,
        },
      ],
      { session }
    );

    await session.commitTransaction();

    // Populate for response
    await booking.populate([
      { path: 'listing', select: 'title location images pricePerNight' },
      { path: 'guest', select: 'name email avatar' },
      { path: 'owner', select: 'name email avatar' },
    ]);

    // ─── Notifications & Emails (after transaction) ────────────────────
    const owner = await User.findById(listing.owner);
    const guest = req.user;

    // Notify host
    await createNotification({
      recipient: listing.owner,
      type: 'booking_request',
      title: 'New Booking Request',
      message: `${guest.name} has requested to book "${listing.title}" for ${nights} night(s).`,
      relatedBooking: booking._id,
      relatedListing: listing._id,
      actionUrl: '/host/dashboard',
      actionLabel: 'View Request',
    });

    // Send emails (non-blocking)
    if (owner) {
      sendBookingRequestEmail(owner, guest, booking, listing).catch(console.error);
    }

    if (listing.instantBook) {
      await createNotification({
        recipient: req.user._id,
        type: 'booking_confirmed',
        title: 'Booking Confirmed!',
        message: `Your booking for "${listing.title}" has been confirmed. Confirmation code: ${booking.confirmationCode}`,
        relatedBooking: booking._id,
        relatedListing: listing._id,
        actionUrl: '/trips',
        actionLabel: 'View Booking',
      });
      sendBookingConfirmationEmail(guest, booking, listing).catch(console.error);
    }

    res.status(201).json({
      success: true,
      message: listing.instantBook
        ? 'Booking confirmed instantly! Check your email for details.'
        : 'Booking request sent! Awaiting host confirmation.',
      data: { booking },
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

// ─── GET /api/bookings/my-bookings ──────────────────────────────────────────
exports.getMyBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = { guest: req.user._id };
    if (status) filter.status = status;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate('listing', 'title location images pricePerNight avgRating')
        .populate('owner', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Booking.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: { bookings },
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

// ─── GET /api/bookings/host-bookings ────────────────────────────────────────
exports.getHostBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = { owner: req.user._id };
    if (status) filter.status = status;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate('listing', 'title location images pricePerNight')
        .populate('guest', 'name avatar email phone createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Booking.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: { bookings },
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

// ─── GET /api/bookings/:id ───────────────────────────────────────────────────
exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('listing', 'title location images pricePerNight houseRules owner')
      .populate('guest', 'name avatar email phone')
      .populate('owner', 'name avatar email phone');

    if (!booking) return next(new AppError('Booking not found.', 404));

    // Only booking participants or admin can view
    const isParticipant =
      booking.guest._id.toString() === req.user._id.toString() ||
      booking.owner._id.toString() === req.user._id.toString();

    if (!isParticipant && req.user.role !== 'admin') {
      return next(new AppError('Access denied.', 403));
    }

    res.status(200).json({
      success: true,
      data: { booking },
    });
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/bookings/:id/confirm ──────────────────────────────────────────
exports.confirmBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('listing', 'title')
      .populate('guest', 'name email avatar');

    if (!booking) return next(new AppError('Booking not found.', 404));
    if (booking.owner.toString() !== req.user._id.toString()) {
      return next(new AppError('Only the owner can confirm this booking.', 403));
    }
    if (booking.status !== 'pending') {
      return next(new AppError(`Cannot confirm a booking with status: ${booking.status}`, 400));
    }

    booking.status = 'confirmed';
    await booking.save();

    // Notify guest
    await createNotification({
      recipient: booking.guest._id,
      type: 'booking_confirmed',
      title: 'Booking Confirmed!',
      message: `Your booking for "${booking.listing.title}" has been confirmed by the host!`,
      relatedBooking: booking._id,
      actionUrl: '/trips',
      actionLabel: 'View Booking',
    });

    sendBookingConfirmationEmail(booking.guest, booking, booking.listing).catch(console.error);

    res.status(200).json({
      success: true,
      message: 'Booking confirmed successfully.',
      data: { booking },
    });
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/bookings/:id/cancel ───────────────────────────────────────────
exports.cancelBooking = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findById(req.params.id).populate('listing', 'title');

    if (!booking) return next(new AppError('Booking not found.', 404));

    const isGuest = booking.guest.toString() === req.user._id.toString();
    const isOwner = booking.owner.toString() === req.user._id.toString();

    if (!isGuest && !isOwner && req.user.role !== 'admin') {
      return next(new AppError('Access denied.', 403));
    }

    if (['cancelled', 'completed'].includes(booking.status)) {
      return next(new AppError(`Cannot cancel a booking with status: ${booking.status}`, 400));
    }

    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    booking.cancelledBy = req.user._id;
    booking.cancellationReason = reason || 'No reason provided';
    await booking.save();

    // Notify the other party
    const notifyUser = isGuest ? booking.owner : booking.guest;
    const cancelledByLabel = isGuest ? 'Guest' : 'Owner';

    await createNotification({
      recipient: notifyUser,
      type: 'booking_cancelled',
      title: 'Booking Cancelled',
      message: `${cancelledByLabel} cancelled the booking for "${booking.listing.title}". Reason: ${reason || 'Not specified'}`,
      relatedBooking: booking._id,
      actionUrl: isGuest ? '/host/dashboard' : '/trips',
    });

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully.',
      data: { booking },
    });
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/bookings/:id/complete ─────────────────────────────────────────
exports.completeBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('listing', 'title');
    if (!booking) return next(new AppError('Booking not found.', 404));

    if (booking.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new AppError('Only the owner or admin can mark a booking as complete.', 403));
    }

    if (booking.status !== 'confirmed') {
      return next(new AppError('Only confirmed bookings can be marked as complete.', 400));
    }

    if (new Date() < booking.checkOut) {
      return next(new AppError('Cannot complete a booking before the check-out date.', 400));
    }

    booking.status = 'completed';
    await booking.save();

    // Notify guest to leave a review
    await createNotification({
      recipient: booking.guest,
      type: 'booking_completed',
      title: 'How was your stay?',
      message: `Your stay at "${booking.listing.title}" is complete. Share your experience with a review!`,
      relatedBooking: booking._id,
      relatedListing: booking.listing._id,
      actionUrl: `/listings/${booking.listing._id}`,
      actionLabel: 'Write a Review',
    });

    res.status(200).json({
      success: true,
      message: 'Booking marked as completed.',
      data: { booking },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/bookings/check-availability ───────────────────────────────────
exports.checkAvailability = async (req, res, next) => {
  try {
    const { listingId, checkIn, checkOut } = req.query;

    if (!listingId || !checkIn || !checkOut) {
      return next(new AppError('listingId, checkIn, and checkOut are required.', 400));
    }

    const overlappingCount = await Booking.countDocuments({
      listing: listingId,
      status: { $in: ['confirmed', 'pending'] },
      $or: [
        { checkIn: { $lt: new Date(checkOut) }, checkOut: { $gt: new Date(checkIn) } },
      ],
    });

    const listing = await Listing.findById(listingId).select('totalRooms');
    const isAvailable = listing && overlappingCount < listing.totalRooms;

    res.status(200).json({
      success: true,
      data: {
        available: isAvailable,
        message: !isAvailable ? 'These dates are not available.' : 'Dates are available!',
      },
    });
  } catch (error) {
    next(error);
  }
};
