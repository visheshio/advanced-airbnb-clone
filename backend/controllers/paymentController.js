const stripe = require('../config/stripe');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');
const AppError = require('../utils/appError');

// ─── POST /api/payments/create-checkout-session ──────────────────────────────
exports.createCheckoutSession = async (req, res, next) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId)
      .populate('listing', 'title images location')
      .populate('guest', 'name email');

    if (!booking) return next(new AppError('Booking not found.', 404));

    if (booking.guest._id.toString() !== req.user._id.toString()) {
      return next(new AppError('Access denied.', 403));
    }

    if (booking.paymentStatus === 'paid') {
      return next(new AppError('This booking has already been paid.', 400));
    }

    const coverImage = booking.listing.images?.[0]?.url;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: booking.guest.email,
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: booking.listing.title,
              description: `${booking.nights} night(s) in ${booking.listing.location.city}, ${booking.listing.location.country}`,
              images: coverImage ? [coverImage] : [],
            },
            unit_amount: Math.round(booking.pricing.totalPrice * 100), // paise
          },
          quantity: 1,
        },
      ],
      metadata: {
        bookingId: booking._id.toString(),
        guestId: req.user._id.toString(),
      },
      success_url: `${process.env.CLIENT_URL}/trips?payment=success&bookingId=${booking._id}`,
      cancel_url: `${process.env.CLIENT_URL}/trips?payment=cancelled`,
    });

    // Save session ID to booking
    booking.stripeSessionId = session.id;
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Checkout session created.',
      data: { sessionId: session.id, url: session.url },
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/payments/webhook ──────────────────────────────────────────────
exports.stripeWebhook = async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Stripe webhook error:', err.message);
    return res.status(400).json({ success: false, message: `Webhook Error: ${err.message}` });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const booking = await Booking.findById(session.metadata.bookingId)
          .populate('listing', 'title');

        if (booking) {
          booking.paymentStatus = 'paid';
          booking.stripePaymentIntentId = session.payment_intent;
          if (booking.status === 'pending') booking.status = 'confirmed';
          await booking.save();

          await Notification.create({
            recipient: booking.guest,
            type: 'booking_confirmed',
            title: 'Payment Successful!',
            message: `Payment of ₹${booking.pricing.totalPrice.toLocaleString('en-IN')} received for "${booking.listing.title}".`,
            relatedBooking: booking._id,
            actionUrl: '/trips',
            actionLabel: 'View Booking',
          });

          await Notification.create({
            recipient: booking.host,
            type: 'payment_received',
            title: 'Payment Received',
            message: `Payment received for booking at "${booking.listing.title}". Payout: ₹${booking.pricing.hostPayout.toLocaleString('en-IN')}`,
            relatedBooking: booking._id,
            actionUrl: '/host/dashboard',
          });
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        const booking = await Booking.findOne({ stripePaymentIntentId: paymentIntent.id });

        if (booking) {
          booking.paymentStatus = 'failed';
          await booking.save();

          await Notification.create({
            recipient: booking.guest,
            type: 'payment_failed',
            title: 'Payment Failed',
            message: 'Your payment could not be processed. Please try again.',
            relatedBooking: booking._id,
            actionUrl: '/trips',
          });
        }
        break;
      }

      default:
        console.log(`Unhandled Stripe event: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error.message);
    res.status(500).json({ success: false, message: 'Webhook handler failed.' });
  }
};

// ─── GET /api/payments/booking/:bookingId ────────────────────────────────────
exports.getPaymentStatus = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.bookingId)
      .select('paymentStatus stripeSessionId stripePaymentIntentId pricing status');

    if (!booking) return next(new AppError('Booking not found.', 404));

    if (
      booking.guest?.toString() !== req.user._id.toString() &&
      booking.host?.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return next(new AppError('Access denied.', 403));
    }

    res.status(200).json({
      success: true,
      data: {
        paymentStatus: booking.paymentStatus,
        bookingStatus: booking.status,
        totalPrice: booking.pricing.totalPrice,
        currency: booking.pricing.currency,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/payments/refund/:bookingId ────────────────────────────────────
exports.processRefund = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.bookingId)
      .populate('listing', 'title');

    if (!booking) return next(new AppError('Booking not found.', 404));

    if (req.user.role !== 'admin' && booking.host.toString() !== req.user._id.toString()) {
      return next(new AppError('Only admin or the host can process refunds.', 403));
    }

    if (booking.paymentStatus !== 'paid') {
      return next(new AppError('Only paid bookings can be refunded.', 400));
    }

    if (!booking.stripePaymentIntentId) {
      return next(new AppError('No payment intent found for this booking.', 400));
    }

    const { amount } = req.body; // Optional partial refund amount in paise
    const refundParams = { payment_intent: booking.stripePaymentIntentId };
    if (amount) refundParams.amount = Math.round(amount * 100);

    const refund = await stripe.refunds.create(refundParams);

    booking.stripeRefundId = refund.id;
    booking.paymentStatus = amount ? 'partially_refunded' : 'refunded';
    booking.refundAmount = amount || booking.pricing.totalPrice;
    await booking.save();

    await Notification.create({
      recipient: booking.guest,
      type: 'booking_cancelled',
      title: 'Refund Processed',
      message: `A refund of ₹${(booking.refundAmount).toLocaleString('en-IN')} for "${booking.listing.title}" has been processed. Allow 5-7 business days.`,
      relatedBooking: booking._id,
      actionUrl: '/trips',
    });

    res.status(200).json({
      success: true,
      message: `Refund of ₹${booking.refundAmount.toLocaleString('en-IN')} processed successfully.`,
      data: { refundId: refund.id, status: refund.status },
    });
  } catch (error) {
    next(error);
  }
};
