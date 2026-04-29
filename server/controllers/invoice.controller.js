const Invoice = require('../models/Invoice');
const Client = require('../models/Client');
const { calculateGST } = require('../utils/gstCalculator');
const { generateInvoiceNumber } = require('../utils/invoiceNumber');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { generateInvoicePDF } = require('../services/pdf.service');
const User = require('../models/User');

const getInvoices = async (req, res) => {
  try {
    const { status, clientId, projectId, page = 1, limit = 10 } = req.query;

    const query = { userId: req.user.userId };

    const today = new Date();
    await Invoice.updateMany(
      { userId: req.user.userId, dueDate: { $lt: today }, status: { $nin: ['paid', 'overdue'] } },
      { $set: { status: 'overdue' } }
    );

    if (status) query.status = status;
    if (clientId) query.clientId = clientId;
    if (projectId) query.projectId = projectId;

    const total = await Invoice.countDocuments(query);
    const invoices = await Invoice.find(query)
      .populate('clientId', 'name email company')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const pagination = {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit),
    };

    return successResponse(res, invoices, 'Invoices fetched successfully', 200, pagination);
  } catch (error) {
    return errorResponse(res, 'SERVER_ERROR', error.message, 500);
  }
};

const createInvoice = async (req, res) => {
  try {
    const { clientId, projectId, items, discountType, discountValue, isInterState, issueDate, dueDate } = req.body;

    if (!projectId) {
      return errorResponse(res, 'BAD_REQUEST', 'Project selection is mandatory for invoices', 400);
    }

    // Generate unique invoice number
    const invoiceNumber = await generateInvoiceNumber(req.user.userId);

    // Calculate totals and GST
    const totals = calculateGST(items, discountType, discountValue, isInterState);

    const invoiceData = {
      invoiceNumber,
      userId: req.user.userId,
      clientId,
      projectId,
      items,
      discountType,
      discountValue,
      isInterState,
      issueDate: issueDate || new Date(),
      dueDate: dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days default
      ...totals,
      status: 'draft',
    };

    const invoice = await Invoice.create(invoiceData);

    // Update client totalInvoiced (denormalized)
    await Client.findByIdAndUpdate(clientId, {
      $inc: { totalInvoiced: totals.total, totalPending: totals.balanceDue },
      $set: { lastInvoiceDate: invoice.issueDate }
    });

    return successResponse(res, invoice, 'Invoice created successfully as draft', 201);
  } catch (error) {
    return errorResponse(res, 'SERVER_ERROR', error.message, 500);
  }
};

const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, userId: req.user.userId }).populate('clientId projectId');
    if (!invoice) {
      return errorResponse(res, 'NOT_FOUND', 'Invoice not found', 404);
    }
    return successResponse(res, invoice);
  } catch (error) {
    return errorResponse(res, 'SERVER_ERROR', error.message, 500);
  }
};

const updateInvoice = async (req, res) => {
  try {
    const { projectId, items, discountType, discountValue, isInterState } = req.body;

    const existingInvoice = await Invoice.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!existingInvoice) {
      return errorResponse(res, 'NOT_FOUND', 'Invoice not found', 404);
    }

    if (existingInvoice.status === 'paid') {
      return errorResponse(res, 'BAD_REQUEST', 'Cannot update a paid invoice', 400);
    }

    // Recalculate totals
    const totals = calculateGST(items || existingInvoice.items, discountType || existingInvoice.discountType, discountValue !== undefined ? discountValue : existingInvoice.discountValue, isInterState !== undefined ? isInterState : existingInvoice.isInterState);

    // Adjust client denormalized stats
    const diffTotal = totals.total - existingInvoice.total;
    const diffPending = totals.balanceDue - existingInvoice.balanceDue;

    await Client.findByIdAndUpdate(existingInvoice.clientId, {
      $inc: { totalInvoiced: diffTotal, totalPending: diffPending }
    });

    const updatedInvoice = await Invoice.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { ...req.body, ...totals },
      { new: true, runValidators: true }
    );

    return successResponse(res, updatedInvoice, 'Invoice updated successfully');
  } catch (error) {
    return errorResponse(res, 'SERVER_ERROR', error.message, 500);
  }
};

const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!invoice) {
      return errorResponse(res, 'NOT_FOUND', 'Invoice not found', 404);
    }

    if (invoice.status === 'paid') {
      return errorResponse(res, 'BAD_REQUEST', 'Cannot delete a paid invoice', 400);
    }

    // Revert client denormalized stats
    await Client.findByIdAndUpdate(invoice.clientId, {
      $inc: { totalInvoiced: -invoice.total, totalPending: -invoice.balanceDue }
    });

    await Invoice.deleteOne({ _id: req.params.id, userId: req.user.userId });

    return successResponse(res, null, 'Invoice deleted successfully');
  } catch (error) {
    return errorResponse(res, 'SERVER_ERROR', error.message, 500);
  }
};

const markPaid = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!invoice) {
      return errorResponse(res, 'NOT_FOUND', 'Invoice not found', 404);
    }

    if (invoice.status === 'paid') {
      return successResponse(res, invoice, 'Invoice is already paid');
    }

    invoice.status = 'paid';
    invoice.amountPaid = invoice.total;
    invoice.balanceDue = 0;
    invoice.paidAt = new Date();
    await invoice.save();

    // Update client denormalized stats
    await Client.findByIdAndUpdate(invoice.clientId, {
      $inc: { totalPaid: invoice.total, totalPending: -invoice.total }
    });

    return successResponse(res, invoice, 'Invoice marked as paid');
  } catch (error) {
    return errorResponse(res, 'SERVER_ERROR', error.message, 500);
  }
};

const downloadInvoicePDF = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, userId: req.user.userId }).populate('clientId');
    if (!invoice) {
      return errorResponse(res, 'NOT_FOUND', 'Invoice not found', 404);
    }

    const user = await User.findById(req.user.userId);

    const pdfBuffer = await generateInvoicePDF(invoice, user);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=Invoice-${invoice.invoiceNumber}.pdf`,
      'Content-Length': pdfBuffer.length,
    });

    return res.send(pdfBuffer);
  } catch (error) {
    return errorResponse(res, 'SERVER_ERROR', error.message, 500);
  }
};

const markSent = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!invoice) {
      return errorResponse(res, 'NOT_FOUND', 'Invoice not found', 404);
    }

    if (invoice.status === 'paid' || invoice.status === 'sent') {
      return successResponse(res, invoice, `Invoice is already ${invoice.status}`);
    }

    invoice.status = 'sent';
    await invoice.save();

    return successResponse(res, invoice, 'Invoice marked as sent');
  } catch (error) {
    return errorResponse(res, 'SERVER_ERROR', error.message, 500);
  }
};

module.exports = {
  getInvoices,
  createInvoice,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
  markPaid,
  markSent,
  downloadInvoicePDF,
};
