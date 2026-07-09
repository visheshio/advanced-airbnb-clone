const express = require('express');
const router = express.Router();
const {
  getConversations, getMessages, sendMessage, markAsRead, getUnreadCount,
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/conversations', getConversations);
router.get('/conversations/:conversationId', getMessages);
router.post('/', sendMessage);
router.put('/:id/read', markAsRead);
router.get('/unread-count', getUnreadCount);

module.exports = router;
