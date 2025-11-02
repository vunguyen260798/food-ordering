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
      default: 'TXXGsnvM3dtr5LZp13QKHnnfmqKsuYTVdk'
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

// Tạo orderNumber và cryptoValue tự động trước khi save
orderSchema.pre('save', async function(next) {
  if (this.isNew) {
    // Tạo orderNumber
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    this.orderNumber = `ORD-${timestamp}-${random}`.toUpperCase();
    
    // Tạo cryptoValue nếu là thanh toán crypto
    if (this.paymentMethod === 'crypto') {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'orderSequence' },
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true }
      );
      
      const orderSequence = counter.sequence_value.toString().padStart(6, '0');
      this.cryptoValue = `${this.totalAmount}.${orderSequence}`;
    }
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);