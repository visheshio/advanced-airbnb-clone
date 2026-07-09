const express = require('express');
const router = express.Router();
const {
  createBooking, getMyBookings, getHostBookings, getBooking,
  confirmBooking, cancelBooking, completeBooking, checkAvailability,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createBookingValidator } = require('../utils/validators/bookingValidator');

router.use(protect);

router.get('/check-availability', checkAvailability);
router.get('/my-bookings', getMyBookings);
router.get('/host-bookings', getHostBookings);
router.post('/', createBookingValidator, validate, createBooking);
router.get('/:id', getBooking);
router.put('/:id/confirm', confirmBooking);
router.put('/:id/cancel', cancelBooking);
router.put('/:id/complete', completeBooking);

module.exports = router;
