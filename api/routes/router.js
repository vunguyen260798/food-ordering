const express = require('express');
const router = express.Router();

// Import controllers
const productController = require('../controllers/productController');
const orderController = require('../controllers/orderController');
const paymentController = require('../controllers/paymentController');
const partnerController = require('../controllers/partnerController');

// Product routes
router.get('/products', productController.getProducts);
router.get('/products/:id', productController.getProductById);
router.post('/products', productController.createProduct);
router.put('/products/:id', productController.updateProduct);
router.delete('/products/:id', productController.deleteProduct);

// routes/orders.js
router.get('/orders/', orderController.getOrders);
router.get('/orders/:id', orderController.getOrderById);
router.get('/orders/:id/payment-status', orderController.checkPaymentStatus);
router.post('/orders/', orderController.createOrder);
router.put('/orders/:id/status', orderController.updateOrderStatus);
router.put('/orders/:id/cancel', orderController.cancelOrder);

// Payment routes
router.get('/transactions', paymentController.getPaymentTransactions);
router.get('/transactions/:id', paymentController.getPaymentTransactionById);

// Partner routes
router.get('/partners', partnerController.getPartners);
router.get('/partners/:id', partnerController.getPartnerById);
router.post('/partners', partnerController.createPartner);
router.put('/partners/:id', partnerController.updatePartner);
router.delete('/partners/:id', partnerController.deletePartner);

module.exports = router;
