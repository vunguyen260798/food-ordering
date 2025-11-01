// controllers/paymentController.js
const PaymentTransaction = require('../models/PaymentTransaction');
const Order = require('../models/Order');

// @desc    Get all payment transactions
// @route   GET /api/payments/transactions
// @access  Private
const getPaymentTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const transactions = await PaymentTransaction.find()
      .populate('order')
      .sort({ blockTimestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await PaymentTransaction.countDocuments();

    res.status(200).json({
      success: true,
      data: transactions,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching payment transactions',
      error: error.message
    });
  }
};

// @desc    Get payment transaction by ID
// @route   GET /api/payments/transactions/:id
// @access  Private
const getPaymentTransactionById = async (req, res) => {
  try {
    const transaction = await PaymentTransaction.findById(req.params.id)
      .populate('order');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Payment transaction not found'
      });
    }

    res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching payment transaction',
      error: error.message
    });
  }
};

module.exports = {
  getPaymentTransactions,
  getPaymentTransactionById
};