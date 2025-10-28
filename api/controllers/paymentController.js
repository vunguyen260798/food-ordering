const PaymentTransaction = require('../models/PaymentTransaction');
const Order = require('../models/Order');

// @desc    Get all payment transactions
// @route   GET /api/payments
// @access  Private
const getPaymentTransactions = async (req, res) => {
  try {
    const { status, paymentMethod } = req.query;
    let query = {};

    if (status) {
      query.status = status;
    }

    if (paymentMethod) {
      query.paymentMethod = paymentMethod;
    }

    const transactions = await PaymentTransaction.find(query)
      .populate('order')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching payment transactions',
      error: error.message
    });
  }
};

// @desc    Get single payment transaction
// @route   GET /api/payments/:id
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

// @desc    Create payment transaction
// @route   POST /api/payments
// @access  Public
const createPaymentTransaction = async (req, res) => {
  try {
    const { orderId, paymentMethod, paymentGateway, customerDetails, billingAddress } = req.body;

    // Find the order
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.paymentStatus === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Order has already been paid'
      });
    }

    // Create payment transaction
    const transaction = await PaymentTransaction.create({
      order: orderId,
      amount: order.totalAmount,
      paymentMethod,
      paymentGateway: paymentGateway || 'stripe',
      customerDetails,
      billingAddress,
      status: 'processing'
    });

    // In a real application, you would integrate with payment gateway here
    // For demo purposes, we'll simulate a successful payment
    setTimeout(async () => {
      transaction.status = 'completed';
      transaction.completedAt = new Date();
      transaction.gatewayTransactionId = `GATEWAY-${Date.now()}`;
      await transaction.save();

      // Update order payment status
      order.paymentStatus = 'completed';
      order.paymentTransaction = transaction._id;
      await order.save();
    }, 1000);

    res.status(201).json({
      success: true,
      message: 'Payment transaction initiated',
      data: transaction
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating payment transaction',
      error: error.message
    });
  }
};

// @desc    Process payment
// @route   PUT /api/payments/:id/process
// @access  Private
const processPayment = async (req, res) => {
  try {
    const { gatewayTransactionId, gatewayResponse } = req.body;

    const transaction = await PaymentTransaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Payment transaction not found'
      });
    }

    // Update transaction status
    transaction.status = 'completed';
    transaction.completedAt = new Date();
    transaction.gatewayTransactionId = gatewayTransactionId;
    transaction.gatewayResponse = gatewayResponse || {};
    await transaction.save();

    // Update order payment status
    const order = await Order.findById(transaction.order);
    if (order) {
      order.paymentStatus = 'completed';
      order.paymentTransaction = transaction._id;
      await order.save();
    }

    res.status(200).json({
      success: true,
      message: 'Payment processed successfully',
      data: transaction
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error processing payment',
      error: error.message
    });
  }
};

// @desc    Refund payment
// @route   PUT /api/payments/:id/refund
// @access  Private
const refundPayment = async (req, res) => {
  try {
    const { refundAmount, refundReason } = req.body;

    const transaction = await PaymentTransaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Payment transaction not found'
      });
    }

    if (transaction.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only refund completed transactions'
      });
    }

    // Update transaction
    transaction.status = 'refunded';
    transaction.refundAmount = refundAmount || transaction.amount;
    transaction.refundReason = refundReason;
    transaction.refundedAt = new Date();
    await transaction.save();

    // Update order payment status
    const order = await Order.findById(transaction.order);
    if (order) {
      order.paymentStatus = 'refunded';
      await order.save();
    }

    res.status(200).json({
      success: true,
      message: 'Payment refunded successfully',
      data: transaction
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error refunding payment',
      error: error.message
    });
  }
};

module.exports = {
  getPaymentTransactions,
  getPaymentTransactionById,
  createPaymentTransaction,
  processPayment,
  refundPayment
};
