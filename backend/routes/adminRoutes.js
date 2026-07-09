const express = require('express');
const router = express.Router();
const {
  getDashboard, getUsers, banUser, getListings, deleteListing, getBookings,
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/role');

router.use(protect, restrictTo('admin'));

router.get('/dashboard', getDashboard);
router.get('/users', getUsers);
router.patch('/users/:id/ban', banUser);
router.get('/listings', getListings);
router.delete('/listings/:id', deleteListing);
router.get('/bookings', getBookings);

module.exports = router;
