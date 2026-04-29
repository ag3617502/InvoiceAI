const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
    },
    name: {
      type: String,
      required: true,
    },
    email: String,
    phone: String,
    company: String,
    gstNumber: String,
    address: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      pincode: String,
      country: {
        type: String,
        default: 'India',
      },
    },
    totalInvoiced: {
      type: Number,
      default: 0,
    },
    totalPaid: {
      type: Number,
      default: 0,
    },
    totalPending: {
      type: Number,
      default: 0,
    },
    lastInvoiceDate: Date,
    notes: String,
    tags: [String],
    status: {
      type: String,
      enum: ['active', 'inactive', 'prospect'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
ClientSchema.index({ userId: 1, isActive: 1 });
ClientSchema.index({ userId: 1, name: 1 });

module.exports = mongoose.model('Client', ClientSchema);
