const Expense = require('../models/Expense');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const getExpenses = async (req, res) => {
  try {
    const { category, month, year, page = 1, limit = 10 } = req.query;

    const query = { userId: req.user.userId };

    if (category) query.category = category;

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      query.date = { $gte: startDate, $lte: endDate };
    } else if (year) {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const total = await Expense.countDocuments(query);
    const expenses = await Expense.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ date: -1 });

    const pagination = {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit),
    };

    return successResponse(res, expenses, 'Expenses fetched successfully', 200, pagination);
  } catch (error) {
    return errorResponse(res, 'SERVER_ERROR', error.message, 500);
  }
};

const createExpense = async (req, res) => {
  try {
    const expenseData = {
      ...req.body,
      userId: req.user.userId,
    };

    const expense = await Expense.create(expenseData);
    return successResponse(res, expense, 'Expense recorded successfully', 201);
  } catch (error) {
    return errorResponse(res, 'SERVER_ERROR', error.message, 500);
  }
};

const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!expense) {
      return errorResponse(res, 'NOT_FOUND', 'Expense not found', 404);
    }

    return successResponse(res, expense, 'Expense updated successfully');
  } catch (error) {
    return errorResponse(res, 'SERVER_ERROR', error.message, 500);
  }
};

const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });

    if (!expense) {
      return errorResponse(res, 'NOT_FOUND', 'Expense not found', 404);
    }

    return successResponse(res, null, 'Expense deleted successfully');
  } catch (error) {
    return errorResponse(res, 'SERVER_ERROR', error.message, 500);
  }
};

const getExpenseSummary = async (req, res) => {
  try {
    const expenses = await Expense.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.user.userId) } },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
        },
      },
    ]);

    return successResponse(res, expenses);
  } catch (error) {
    return errorResponse(res, 'SERVER_ERROR', error.message, 500);
  }
};

module.exports = {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseSummary,
};
