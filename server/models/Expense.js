const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema(
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
    title: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      enum: [
        'software',
        'hardware',
        'marketing',
        'travel',
        'food',
        'office',
        'freelancer',
        'tax',
        'other',
      ],
      required: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    description: String,
    receiptUrl: String, // Cloudinary URL
    isGstExpense: {
      type: Boolean,
      default: false,
    },
    gstAmount: Number,
    vendor: String,
    paymentMethod: {
      type: String,
      enum: ['cash', 'upi', 'card', 'bank', 'other'],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Expense', ExpenseSchema);
