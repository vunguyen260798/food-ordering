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
    required: true
  },
  variantName: {
    type: String,
    default: ''
  },
  variantSku: {
    type: String,
    default: ''
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  subtotal: {
    type: Number,
    required: true
  },
  customizations: [String],
  specialRequest: String
}, {
  timestamps: true
});

module.exports = mongoose.model('OrderItem', orderItemSchema);