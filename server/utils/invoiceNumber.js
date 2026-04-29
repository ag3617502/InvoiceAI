const User = require('../models/User');

const generateInvoiceNumber = async (userId) => {
  const user = await User.findOneAndUpdate(
    { _id: userId },
    { $inc: { invoiceCounter: 1 } },
    { new: true }
  );

  if (!user) {
    throw new Error('User not found');
  }

  const year = new Date().getFullYear();
  const counter = String(user.invoiceCounter).padStart(4, '0');
  const prefix = user.invoicePrefix || 'INV';

  return `${prefix}-${year}-${counter}`;
};

module.exports = { generateInvoiceNumber };
