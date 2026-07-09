const express = require('express');
const router = express.Router();
const {
  createWishlist, getMyWishlists, addToWishlist, removeFromWishlist, deleteWishlist,
} = require('../controllers/wishlistController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', createWishlist);
router.get('/', getMyWishlists);
router.post('/:id/listings/:listingId', addToWishlist);
router.delete('/:id/listings/:listingId', removeFromWishlist);
router.delete('/:id', deleteWishlist);

module.exports = router;
