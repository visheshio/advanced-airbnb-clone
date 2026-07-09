const express = require('express');
const router = express.Router();
const {
  getProfile, updateProfile, updateAvatar, becomeHost, getUserById, deleteAccount,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { handleSingleUpload } = require('../middleware/upload');
const { uploadLimiter } = require('../middleware/rateLimit');

router.use(protect); // All user routes require auth

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/avatar', uploadLimiter, handleSingleUpload, updateAvatar);
router.put('/become-host', becomeHost);
router.delete('/account', deleteAccount);

// Public: get any user by ID (for host profiles)
router.get('/:id', getUserById);

module.exports = router;
