const aiService = require('../services/ai.service');
const Invoice = require('../models/Invoice');
const Client = require('../models/Client');
const Expense = require('../models/Expense');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const generatePaymentReminder = async (req, res) => {
  try {
    const { invoiceId, tone = 'polite' } = req.body;

    const invoice = await Invoice.findOne({ _id: invoiceId, userId: req.user.userId });
    if (!invoice) {
      return errorResponse(res, 'NOT_FOUND', 'Invoice not found', 404);
    }

    const client = await Client.findById(invoice.clientId);
    if (!client) {
      return errorResponse(res, 'NOT_FOUND', 'Client not found', 404);
    }

    const result = await aiService.generatePaymentReminder(invoice, client, tone);
    return successResponse(res, result);
  } catch (error) {
    return errorResponse(res, 'SERVER_ERROR', error.message, 500);
  }
};

const generateProposal = async (req, res) => {
  try {
    const { projectType, projectDescription, clientName, budget, timeline } = req.body;

    const result = await aiService.generateProposal({
      projectType,
      projectDescription,
      clientName,
      budget,
      timeline,
    });

    return successResponse(res, result);
  } catch (error) {
    return errorResponse(res, 'SERVER_ERROR', error.message, 500);
  }
};

const generateTaxEstimator = async (req, res) => {
  try {
    // Fetch data for the current user
    const invoices = await Invoice.find({
      userId: req.user.userId,
      status: 'paid',
    });

    const expenses = await Expense.find({
      userId: req.user.userId,
    });

    const totalIncome = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

    const quarterlyIncome = totalIncome; // Simplified
    const taxableIncome = Math.max(0, quarterlyIncome - totalExpenses);

    // Basic Indian Tax Calculation (Simplified for demo)
    // Advance tax liability usually kicks in if tax > 10,000
    const estimatedTax = taxableIncome * 0.2; // 20% flat for demo

    const tips = await aiService.generateTaxTips({
      quarterlyIncome,
      expenses: totalExpenses,
    });

    return successResponse(res, {
      quarterlyIncome,
      taxableIncome,
      advanceTax: estimatedTax,
      breakdown: {
        income: quarterlyIncome,
        expenses: totalExpenses,
      },
      tips,
    });
  } catch (error) {
    return errorResponse(res, 'SERVER_ERROR', error.message, 500);
  }
};

const generateBusinessInsights = async (req, res) => {
  try {
    // Aggregate last 3 months data
    const invoices = await Invoice.find({
      userId: req.user.userId,
      status: 'paid',
    });

    const expenses = await Expense.find({
      userId: req.user.userId,
    });

    const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    const pendingRevenue = await Invoice.find({
      userId: req.user.userId,
      status: 'sent',
    }).then((invs) => invs.reduce((sum, inv) => sum + (inv.balanceDue || 0), 0));

    // Get top clients
    const clients = await Invoice.aggregate([
      { $match: { userId: req.user.userId, status: 'paid' } },
      { $group: { _id: '$clientId', total: { $sum: '$total' } } },
      { $sort: { total: -1 } },
      { $limit: 3 },
    ]);

    // Populate client names
    const topClients = await Promise.all(
      clients.map(async (c) => {
        const client = await Client.findById(c._id);
        return { name: client ? client.name : 'Unknown', revenue: c.total };
      })
    );

    // Get expense categories
    const expenseBreakdown = await Expense.aggregate([
      { $match: { userId: req.user.userId } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
    ]);

    const insights = await aiService.generateBusinessInsights({
      revenue: totalRevenue,
      topClients,
      expenses: expenseBreakdown,
      pending: pendingRevenue,
    });

    return successResponse(res, { insights });
  } catch (error) {
    return errorResponse(res, 'SERVER_ERROR', error.message, 500);
  }
};

const generateInvoiceWriter = async (req, res) => {
  try {
    const { projectDescription } = req.body;

    const items = await aiService.generateInvoiceItems(projectDescription);
    return successResponse(res, { items });
  } catch (error) {
    return errorResponse(res, 'SERVER_ERROR', error.message, 500);
  }
};

module.exports = {
  generatePaymentReminder,
  generateProposal,
  generateTaxEstimator,
  generateBusinessInsights,
  generateInvoiceWriter,
};
