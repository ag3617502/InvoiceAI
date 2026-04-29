const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      lowercase: true,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerifyToken: String,
    emailVerifyExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,

    // Business Info (filled in onboarding)
    businessName: String,
    businessType: {
      type: String,
      enum: ['freelancer', 'agency', 'company'],
    },
    gstNumber: String,
    panNumber: String,
    phone: String,
    address: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      pincode: String,
    },
    logo: String, // Cloudinary URL

    // Plan
    plan: {
      type: String,
      enum: ['free', 'starter', 'pro', 'agency'],
      default: 'free',
    },
    planExpiresAt: Date,
    razorpayCustomerId: String,
    razorpaySubscriptionId: String,

    // Team
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'member'],
      default: 'owner',
    },

    // Preferences
    currency: {
      type: String,
      default: 'INR',
    },
    invoicePrefix: {
      type: String,
      default: 'INV',
    },
    invoiceCounter: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', UserSchema);
