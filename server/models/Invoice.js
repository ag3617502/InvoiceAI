const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
    },
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
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      index: true,
    },
    status: {
      type: String,
      enum: ['draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled'],
      default: 'draft',
      index: true,
    },
    issueDate: {
      type: Date,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    items: [
      {
        description: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        rate: {
          type: Number,
          required: true,
        },
        amount: Number,
        hsnCode: String,
        gstRate: {
          type: Number,
          default: 18,
        },
      },
    ],
    subtotal: Number,
    discountType: {
      type: String,
      enum: ['percent', 'flat'],
      default: 'percent',
    },
    discountValue: {
      type: Number,
      default: 0,
    },
    discountAmount: Number,
    cgst: Number,
    sgst: Number,
    igst: Number,
    isInterState: {
      type: Boolean,
      default: false,
    },
    total: Number,
    amountPaid: {
      type: Number,
      default: 0,
    },
    balanceDue: Number,
    isGstInvoice: {
      type: Boolean,
      default: true,
    },
    placeOfSupply: String,
    notes: String,
    termsConditions: String,
    signature: String,
    upiId: String,
    showUpiQr: {
      type: Boolean,
      default: true,
    },
    pdfUrl: String,
    pdfGeneratedAt: Date,
    sentAt: Date,
    viewedAt: Date,
    paidAt: Date,
    remindersSent: [
      {
        sentAt: Date,
        type: String,
        message: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
InvoiceSchema.index({ userId: 1, status: 1 });
InvoiceSchema.index({ userId: 1, clientId: 1 });
InvoiceSchema.index({ invoiceNumber: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Invoice', InvoiceSchema);
