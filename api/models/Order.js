const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  customerName: {
    type: String,
   
  },
  customerEmail: {
    type: String,
   
  },
  customerPhone: {
    type: String,
   
  },
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  orderItems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OrderItem'
  }],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed',  'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentTransaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PaymentTransaction'
  },
}, {
  timestamps: true
});

// Generate unique order number before saving
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    this.orderNumber = `ORD-${timestamp}-${random}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
