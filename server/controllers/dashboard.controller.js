const Invoice = require('../models/Invoice');
const Expense = require('../models/Expense');
const Client = require('../models/Client');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const mongoose = require('mongoose');

const getDashboardStats = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId);

    const sweepDate = new Date();
    await Invoice.updateMany(
      { userId, dueDate: { $lt: sweepDate }, status: { $nin: ['paid', 'overdue'] } },
      { $set: { status: 'overdue' } }
    );

    // 1. Revenue (Paid Invoices)
    const revenueAgg = await Invoice.aggregate([
      { $match: { userId, status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    const revenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

    // 2. Pending (Unpaid Invoices)
    const pendingAgg = await Invoice.aggregate([
      { $match: { userId, status: { $ne: 'paid' } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    const pending = pendingAgg.length > 0 ? pendingAgg[0].total : 0;

    // 3. Overdue (Unpaid & Due Date passed)
    const now = new Date();
    const overdueAgg = await Invoice.aggregate([
      { $match: { userId, status: { $ne: 'paid' }, dueDate: { $lt: now } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    const overdue = overdueAgg.length > 0 ? overdueAgg[0].total : 0;

    // 3.5 Upcoming Payments (Due Date between now and 2 days from now)
    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(now.getDate() + 2);
    const upcomingPayments = await Invoice.find({
      userId,
      status: { $ne: 'paid' },
      dueDate: { $gte: now, $lte: twoDaysFromNow }
    }).populate('clientId', 'name company');

    // 4. Expenses
    const expenseAgg = await Expense.aggregate([
      { $match: { userId } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalExpenses = expenseAgg.length > 0 ? expenseAgg[0].total : 0;

    // 5. Profit (Revenue - Expenses)
    const profit = revenue - totalExpenses;

    // 6. Recent Activity (Last 5 activities - Mocked or derived from invoices/expenses)
    const recentInvoices = await Invoice.find({ userId })
      .populate('clientId', 'name')
      .sort({ createdAt: -1 })
      .limit(3);

    const recentExpenses = await Expense.find({ userId })
      .sort({ createdAt: -1 })
      .limit(2);

    const recentActivity = [
      ...recentInvoices.map(inv => ({
        id: inv._id,
        type: 'invoice',
        title: `Invoice ${inv.invoiceNumber}`,
        description: `Created for ${inv.clientId?.name || 'Client'}`,
        amount: inv.total,
        date: inv.createdAt,
        status: inv.status
      })),
      ...recentExpenses.map(exp => ({
        id: exp._id,
        type: 'expense',
        title: `Expense: ${exp.category}`,
        description: exp.description,
        amount: exp.amount,
        date: exp.createdAt,
        status: 'paid'
      }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

    // 7. Monthly Revenue Trend (Last 6 months continuous)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trend = [];
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const year = d.getFullYear();
      const monthIndex = d.getMonth();
      const monthName = months[monthIndex];
      
      trend.push({
        name: `${monthName} ${year}`,
        monthNum: monthIndex + 1,
        yearNum: year,
        revenue: 0
      });
    }

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const trendAgg = await Invoice.aggregate([
      { $match: { userId, status: 'paid', paidAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$paidAt' },
            month: { $month: '$paidAt' }
          },
          total: { $sum: '$total' }
        }
      }
    ]);

    // Merge real aggregation into continuous month array
    trendAgg.forEach(item => {
      const match = trend.find(t => t.monthNum === item._id.month && t.yearNum === item._id.year);
      if (match) {
        match.revenue = item.total;
      }
    });

    // Clean up temporary tracking fields before returning
    trend.forEach(t => {
      delete t.monthNum;
      delete t.yearNum;
    });

    return successResponse(res, {
      stats: {
        revenue,
        pending,
        overdue,
        profit
      },
      recentActivity,
      upcomingPayments,
      trend
    });
  } catch (error) {
    return errorResponse(res, 'SERVER_ERROR', error.message, 500);
  }
};

module.exports = { getDashboardStats };
