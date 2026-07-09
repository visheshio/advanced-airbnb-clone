const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const User = require('../models/User');
const AppError = require('../utils/appError');

// ─── GET /api/messages/conversations ────────────────────────────────────────
exports.getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate('participants', 'name avatar isHost')
      .populate('listing', 'title images location')
      .populate('lastMessage')
      .sort({ lastMessageAt: -1 })
      .lean();

    // Add unread count per conversation
    const convsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await Message.countDocuments({
          conversation: conv._id,
          sender: { $ne: req.user._id },
          readBy: { $ne: req.user._id },
        });
        return { ...conv, unreadCount };
      })
    );

    res.status(200).json({
      success: true,
      data: { conversations: convsWithUnread },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/messages/conversations/:conversationId ────────────────────────
exports.getMessages = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    const conversation = await Conversation.findById(req.params.conversationId)
      .populate('participants', 'name avatar')
      .populate('listing', 'title images location pricePerNight');

    if (!conversation) return next(new AppError('Conversation not found.', 404));

    const isParticipant = conversation.participants.some(
      (p) => p._id.toString() === req.user._id.toString()
    );
    if (!isParticipant) return next(new AppError('Access denied.', 403));

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const messages = await Message.find({ conversation: req.params.conversationId })
      .populate('sender', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Mark all unread messages as read
    await Message.updateMany(
      {
        conversation: req.params.conversationId,
        sender: { $ne: req.user._id },
        readBy: { $ne: req.user._id },
      },
      { $addToSet: { readBy: req.user._id } }
    );

    res.status(200).json({
      success: true,
      data: {
        conversation,
        messages: messages.reverse(), // Oldest first for display
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/messages ──────────────────────────────────────────────────────
exports.sendMessage = async (req, res, next) => {
  try {
    const { recipientId, listingId, content, conversationId } = req.body;

    if (!content?.trim()) {
      return next(new AppError('Message content cannot be empty.', 400));
    }

    let conversation;

    if (conversationId) {
      // Existing conversation
      conversation = await Conversation.findById(conversationId);
      if (!conversation) return next(new AppError('Conversation not found.', 404));

      const isParticipant = conversation.participants.some(
        (p) => p.toString() === req.user._id.toString()
      );
      if (!isParticipant) return next(new AppError('Access denied.', 403));
    } else {
      // Start new conversation
      if (!recipientId) return next(new AppError('recipientId is required for a new conversation.', 400));
      if (recipientId === req.user._id.toString()) {
        return next(new AppError('You cannot message yourself.', 400));
      }

      const recipient = await User.findById(recipientId);
      if (!recipient) return next(new AppError('Recipient not found.', 404));

      // Check if conversation already exists between these users for this listing
      const existingQuery = {
        participants: { $all: [req.user._id, recipientId] },
      };
      if (listingId) existingQuery.listing = listingId;

      conversation = await Conversation.findOne(existingQuery);

      if (!conversation) {
        conversation = await Conversation.create({
          participants: [req.user._id, recipientId],
          listing: listingId || null,
        });
      }
    }

    // Create message
    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user._id,
      content: content.trim(),
      readBy: [req.user._id],
    });

    // Update conversation last message
    conversation.lastMessage = message._id;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    await message.populate('sender', 'name avatar');

    // Get recipient (other participant)
    const recipientUserId = conversation.participants.find(
      (p) => p.toString() !== req.user._id.toString()
    );

    // Notify recipient
    if (recipientUserId) {
      await Notification.create({
        recipient: recipientUserId,
        type: 'new_message',
        title: `New message from ${req.user.name}`,
        message: content.trim().substring(0, 100),
        relatedConversation: conversation._id,
        relatedUser: req.user._id,
        actionUrl: '/messages',
        actionLabel: 'Reply',
      });

      // Emit via Socket.io (if available)
      const io = req.app.get('io');
      if (io) {
        io.to(recipientUserId.toString()).emit('new_message', {
          message,
          conversationId: conversation._id,
        });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Message sent.',
      data: { message, conversationId: conversation._id },
    });
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/messages/:id/read ──────────────────────────────────────────────
exports.markAsRead = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return next(new AppError('Message not found.', 404));

    if (!message.readBy.includes(req.user._id)) {
      message.readBy.push(req.user._id);
      await message.save();
    }

    res.status(200).json({
      success: true,
      message: 'Message marked as read.',
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/messages/unread-count ─────────────────────────────────────────
exports.getUnreadCount = async (req, res, next) => {
  try {
    const count = await Message.countDocuments({
      sender: { $ne: req.user._id },
      readBy: { $ne: req.user._id },
      conversation: {
        $in: await Conversation.find({ participants: req.user._id }).distinct('_id'),
      },
    });

    res.status(200).json({
      success: true,
      data: { unreadCount: count },
    });
  } catch (error) {
    next(error);
  }
};
