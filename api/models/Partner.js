// filepath: /Users/mac/Documents/src2/food-ordering/api/models/Partner.js
const mongoose = require('mongoose');

const partnerSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Partner code is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  userName: {
    type: String,
    required: [true, 'Partner username is required'],
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Partner', partnerSchema);
