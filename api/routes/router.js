const express = require('express');
const router = express.Router();

// Import controllers
const productController = require('../controllers/productController');
const orderController = require('../controllers/orderController');
const paymentController = require('../controllers/paymentController');

// Product routes
router.get('/products', productController.getProducts);
router.get('/products/:id', productController.getProductById);

router.post('/orders', orderController.createOrder);


module.exports = router;
