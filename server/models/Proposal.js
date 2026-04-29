const mongoose = require('mongoose');

const ProposalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
    },
    title: {
      type: String,
      required: true,
    },
    projectType: String,
    content: String, // AI-generated or edited HTML/Markdown
    status: {
      type: String,
      enum: ['draft', 'sent', 'accepted', 'rejected'],
      default: 'draft',
    },
    validUntil: Date,
    totalAmount: Number,
    currency: {
      type: String,
      default: 'INR',
    },
    sentAt: Date,
    viewedAt: Date,
    respondedAt: Date,
    aiGenerated: {
      type: Boolean,
      default: false,
    },
    aiPrompt: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Proposal', ProposalSchema);
