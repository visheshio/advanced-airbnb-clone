const express = require('express');
const router = express.Router();
const {
  createCheckoutSession, stripeWebhook, getPaymentStatus, processRefund,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

// Webhook — must use raw body (handled in server.js before express.json)
router.post('/webhook', stripeWebhook);

// Protected routes
router.use(protect);
router.post('/create-checkout-session', createCheckoutSession);
router.get('/booking/:bookingId', getPaymentStatus);
router.post('/refund/:bookingId', processRefund);

module.exports = router;
