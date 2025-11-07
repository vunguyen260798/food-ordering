const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const router = require('./routes/router');

const cron = require('node-cron');
const cryptoPaymentService = require('./services/cryptoPaymentService');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api', router);

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to Food Ordering API',
    version: '1.0.0'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});


// Chạy mỗi 1 phút để kiểm tra payment
cron.schedule('*/1 * * * *', () => {
  cryptoPaymentService.checkCryptoPayments();
});

// Chạy mỗi 5 phút để đánh dấu order hết hạn
cron.schedule('*/2 * * * *', () => {
  cryptoPaymentService.expireOldOrders();
});

module.exports = app;
