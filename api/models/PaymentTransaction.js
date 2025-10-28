const mongoose = require('mongoose');

const paymentTransactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD',
    uppercase: true
  },
  paymentMethod: {
    type: String,
    enum: ['credit-card', 'debit-card', 'paypal', 'cash', 'wallet', 'upi'],
    required: true
  },
  paymentGateway: {
    type: String,
    enum: ['stripe', 'paypal', 'square', 'cash', 'razorpay'],
    default: 'stripe'
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending'
  },
  gatewayTransactionId: {
    type: String,
    default: ''
  },
  gatewayResponse: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  refundAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  refundReason: {
    type: String,
    default: ''
  },
  refundedAt: {
    type: Date
  },
  failureReason: {
    type: String,
    default: ''
  },
  customerDetails: {
    name: String,
    email: String,
    phone: String
  },
  billingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Generate unique transaction ID before saving
paymentTransactionSchema.pre('save', async function(next) {
  if (!this.transactionId) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    this.transactionId = `TXN-${timestamp}-${random}`;
  }
  next();
});

module.exports = mongoose.model('PaymentTransaction', paymentTransactionSchema);
