const mongoose = require('mongoose');

const paymentTransactionSchema = new mongoose.Schema({
  // Transaction ID từ blockchain
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  
  // Tham chiếu đến order
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  
  // Số tiền nhận được (USDT)
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Địa chỉ ví người gửi
  fromAddress: {
    type: String,
    required: true
  },
  
  // Địa chỉ ví người nhận (ví merchant)
  toAddress: {
    type: String,
    required: true,
    default: 'TXXGsnvM3dtr5LZp13QKHnnfmqKsuYTVdk'
  },
  
  // Loại token (USDT, TRX, ...)
  tokenSymbol: {
    type: String,
    required: true,
    default: 'USDT'
  },
  
  // Trạng thái giao dịch
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'failed'],
    default: 'confirmed'
  },
  
  // Thời gian giao dịch trên blockchain
  blockTimestamp: {
    type: Date,
    required: true
  },
  
  // Số block
  blockNumber: {
    type: Number
  },
  
  // Giá trị gốc từ blockchain (chưa chia decimals)
  rawValue: {
    type: String
  },
  
  // Số decimals của token
  decimals: {
    type: Number,
    default: 6
  }

}, {
  timestamps: true // Tự động tạo createdAt, updatedAt
});

// Index để tìm kiếm nhanh
paymentTransactionSchema.index({ order: 1 });
paymentTransactionSchema.index({ transactionId: 1 });
paymentTransactionSchema.index({ fromAddress: 1 });
paymentTransactionSchema.index({ blockTimestamp: -1 });

module.exports = mongoose.model('PaymentTransaction', paymentTransactionSchema);