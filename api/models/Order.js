const mongoose = require('mongoose');
const Counter = require('./Counter');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true
  },
  
  orderItems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OrderItem',
    required: true
  }],
  
  // Thông tin khách hàng
  customerName: {
    type: String,
    default: 'Walk-in Customer'
  },
  customerEmail: String,
  customerPhone: String,
  deliveryAddress: String,
  specialInstructions: String,
  voucherCode: String,
  
  // Thông tin Telegram
  telegramInfo: {
    userId: String,          // Telegram user ID
    chatId: String,          // Chat ID (if available)
    username: String,        // @username
    firstName: String,       // User's first name
    lastName: String,        // User's last name
    languageCode: String,    // User's language preference (en, vi, etc.)
    isPremium: Boolean,      // Telegram Premium status
    photoUrl: String,        // Profile photo URL
    platform: String,        // ios, android, web, etc.
    queryId: String,         // Query ID for callbacks
    authDate: Date          // When user authenticated
  },
  
  // Tính toán tiền
  subtotal: {
    type: Number,
    required: true
  },
  tax: {
    type: Number,
    required: true
  },
  deliveryFee: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true
  },
  
  // Mã value duy nhất để kiểm tra giao dịch
  cryptoValue: {
    type: String,
    unique: true
  },
  
  // Trạng thái đơn hàng
  status: {
    type: String,
    enum: ['pending', 'paid', 'preparing', 'out-for-delivery', 'delivered', 'cancelled', 'expired'],
    default: 'pending'
  },
  
  // Thông tin thanh toán
  paymentMethod: {
    type: String,
    enum: ['stripe', 'crypto'],
    default: 'stripe'
  },
  
  // Thông tin thanh toán crypto
  cryptoPayment: {
    expectedAmount: Number,
    receivedAmount: Number,
    transactionHash: String,
    walletAddress: {
      type: String,
      default: 'TQP479nwFZaoteJ7Hg6hTz4pCJbi6kVRiR'
    },
    expiresAt: Date
  },

  // Tham chiếu đến payment transaction
  paymentTransaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PaymentTransaction'
  },
  
  // Thời gian
  estimatedDeliveryTime: Date,
  deliveredAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Trong orderSchema.pre('save')
orderSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      // Tạo orderNumber 6 chữ số tăng dần
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'orderSequence' },
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true }
      );
      
      const orderSequence = counter.sequence_value.toString().padStart(6, '0');
      this.orderNumber = orderSequence;
      
      // Tạo cryptoValue nếu là thanh toán crypto
      if (this.paymentMethod === 'crypto') {
        // Đảm bảo totalAmount có 2 chữ số thập phân
        const formattedAmount = this.totalAmount.toFixed(2);
        
        // cryptoValue = order_amount + 0.order_code
        this.cryptoValue = (parseFloat(formattedAmount) + parseInt(orderSequence) / 1000000).toFixed(6);
        
        // Thiết lập thời gian hết hạn (10 phút)
        this.cryptoPayment = this.cryptoPayment || {};
        this.cryptoPayment.expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        this.cryptoPayment.expectedAmount = parseFloat(this.cryptoValue);
      }
    } catch (error) {
      return next(error);
    }
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);