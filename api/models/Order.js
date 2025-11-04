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
        // Format số tiền để hiển thị cho người dùng
        const integerPart = Math.floor(this.totalAmount);
        const decimalPart = Math.round((this.totalAmount - integerPart) * 100);
        
        // cryptoValue hiển thị: 15.000001, 25.500002, etc.
        this.cryptoValue = `${integerPart}.${decimalPart.toString().padStart(2, '0')}${orderSequence}`;
        
        // API sẽ nhận được: 15000001, 25500002, etc.
        
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