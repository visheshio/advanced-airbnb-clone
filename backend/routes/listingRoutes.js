const express = require('express');
const router = express.Router();
const {
  createListing, getListings, getFeaturedListings, getListingsByCategory,
  getMyListings, getListing, updateListing, deleteListing,
  addListingImages, deleteListingImage,
} = require('../controllers/listingController');
const { protect, optionalAuth } = require('../middleware/auth');
const { requireHost } = require('../middleware/role');
const { handleMultipleUpload } = require('../middleware/upload');
const { uploadLimiter } = require('../middleware/rateLimit');

// ─── Public routes ────────────────────────────────────────────────────────
router.get('/', optionalAuth, getListings);
router.get('/featured', getFeaturedListings);
router.get('/category/:category', getListingsByCategory);
router.get('/:id', optionalAuth, getListing);

// ─── Protected routes ─────────────────────────────────────────────────────
router.use(protect);

router.get('/host/my-listings', requireHost, getMyListings);
router.post('/', requireHost, handleMultipleUpload, createListing);
router.put('/:id', requireHost, updateListing);
router.delete('/:id', requireHost, deleteListing);
router.post('/:id/images', requireHost, uploadLimiter, handleMultipleUpload, addListingImages);
router.delete('/:id/images/:imageId', requireHost, deleteListingImage);

module.exports = router;
