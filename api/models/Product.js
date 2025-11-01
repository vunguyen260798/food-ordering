const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  description: {
    type: String,
  },
  price: {
    type: Number,
    required: [true, 'Product base price is required'],
    min: 0
  },
  variants: [{
    name: {
      type: String,
      required: [true, 'Variant name is required'],
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'Variant price is required'],
      min: 0
    },
    description: {
      type: String,
      default: ''
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    sku: {
      type: String,
      default: ''
    }
  }],
  image: {
    type: String,
    default: ''
  },
  inStock: {
    type: Boolean,
    default: true
  }

}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
