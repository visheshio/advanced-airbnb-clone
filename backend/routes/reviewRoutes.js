const express = require('express');
const router = express.Router();
const {
  createReview, getListingReviews, getUserReviews,
  updateReview, deleteReview, respondToReview,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createReviewValidator } = require('../utils/validators/reviewValidator');

// Public
router.get('/listing/:listingId', getListingReviews);
router.get('/user/:userId', getUserReviews);

// Protected
router.use(protect);
router.post('/', createReviewValidator, validate, createReview);
router.put('/:id', updateReview);
router.delete('/:id', deleteReview);
router.post('/:id/respond', respondToReview);

module.exports = router;
