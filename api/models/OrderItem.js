const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  productPrice: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  customizations: [{
    name: String,
    value: String
  }],
  specialRequest: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Calculate subtotal before saving
orderItemSchema.pre('save', function(next) {
  this.subtotal = this.productPrice * this.quantity;
  next();
});

module.exports = mongoose.model('OrderItem', orderItemSchema);
