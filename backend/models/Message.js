const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: [true, 'Conversation is required'],
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender is required'],
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'system'],
      default: 'text',
    },
    // Track which users have read this message
    readBy: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        readAt: { type: Date, default: Date.now },
      },
    ],
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ─────────────────────────────────────────────────────────────
messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });

// ─── Post-save: Update conversation's lastMessage + unread counts ─────────
messageSchema.post('save', async function () {
  try {
    const Conversation = require('./Conversation');

    // Use atomic operation to prevent race conditions
    // Update last message and increment unread counts atomically
    const senderId = this.sender.toString();
    
    const updateObj = {
      lastMessage: this._id,
      lastMessageAt: this.createdAt,
      lastMessagePreview: this.content.substring(0, 100),
    };

    // Use $inc for atomic increments to prevent race conditions
    const conversation = await Conversation.findById(this.conversation);
    if (!conversation) return;

    for (const participantId of conversation.participants) {
      const pid = participantId.toString();
      if (pid !== senderId) {
        // Use findByIdAndUpdate with atomic $inc to prevent race condition
        await Conversation.findByIdAndUpdate(
          this.conversation,
          {
            ...updateObj,
            [`unreadCount.${pid}`]: { $inc: 1 }, // Atomic increment
          },
          { new: false }
        );
      }
    }

    // Final update to set last message fields
    await Conversation.findByIdAndUpdate(
      this.conversation,
      updateObj,
      { new: false }
    );
  } catch (error) {
    console.error('Error updating conversation after message save:', error);
  }
});

module.exports = mongoose.model('Message', messageSchema);
