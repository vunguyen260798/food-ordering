const express = require('express');
const router = express.Router();

// Import controllers
const productController = require('../controllers/productController');
const orderController = require('../controllers/orderController');
const paymentController = require('../controllers/paymentController');

// Product routes
router.get('/products', productController.getProducts);
router.get('/products/:id', productController.getProductById);
router.post('/products', productController.createProduct);
router.put('/products/:id', productController.updateProduct);
router.delete('/products/:id', productController.deleteProduct);

// Order routes
router.get('/orders', orderController.getOrders);
router.get('/orders/:id', orderController.getOrderById);
router.post('/orders', orderController.createOrder);
router.put('/orders/:id/status', orderController.updateOrderStatus);
router.put('/orders/:id/cancel', orderController.cancelOrder);

// Payment routes
router.get('/payments', paymentController.getPaymentTransactions);
router.get('/payments/:id', paymentController.getPaymentTransactionById);
router.post('/payments', paymentController.createPaymentTransaction);
router.put('/payments/:id/process', paymentController.processPayment);
router.put('/payments/:id/refund', paymentController.refundPayment);

module.exports = router;
