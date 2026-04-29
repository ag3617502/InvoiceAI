const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema(
  {
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    action: {
      type: String,
      required: true,
    },
    entity: {
      type: String,
      enum: ['invoice', 'client', 'expense', 'payment', 'proposal', 'team'],
    },
    entityId: mongoose.Schema.Types.ObjectId,
    metadata: Object,
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);
