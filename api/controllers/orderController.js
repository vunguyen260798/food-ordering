const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product');

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
const getOrders = async (req, res) => {
  try {
    const { status, paymentStatus } = req.query;
    let query = {};

    if (status) {
      query.status = status;
    }

    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    const orders = await Order.find(query)
      .populate('orderItems')
      .populate('paymentTransaction')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate({
        path: 'orderItems',
        populate: { path: 'product' }
      })
      .populate('paymentTransaction');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: error.message
    });
  }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Public
const createOrder = async (req, res) => {
  try {
    const { items, customerName, customerEmail, customerPhone, deliveryAddress, specialInstructions } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item'
      });
    }

    // Create order items
    let orderItemIds = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.productId}`
        });
      }

      if (!product.inStock) {
        return res.status(400).json({
          success: false,
          message: `Product out of stock: ${product.name}`
        });
      }

      const orderItem = await OrderItem.create({
        product: product._id,
        productName: product.name,
        productPrice: product.price,
        quantity: item.quantity,
        customizations: item.customizations || [],
        specialRequest: item.specialRequest || ''
      });

      orderItemIds.push(orderItem._id);
      subtotal += orderItem.subtotal;
    }

    // Calculate totals
    const tax = subtotal * 0.1; // 10% tax
    const deliveryFee = 5; // Fixed delivery fee
    const totalAmount = subtotal + tax + deliveryFee;

    // Calculate estimated delivery time (current time + 45 minutes)
    const estimatedDeliveryTime = new Date();
    estimatedDeliveryTime.setMinutes(estimatedDeliveryTime.getMinutes() + 45);

    // Create order
    const order = await Order.create({
      orderItems: orderItemIds,
      customerName,
      customerEmail,
      customerPhone,
      deliveryAddress,
      subtotal,
      tax,
      deliveryFee,
      totalAmount,
      specialInstructions,
      estimatedDeliveryTime
    });

    // Populate order items
    await order.populate('orderItems');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating order',
      error: error.message
    });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.status = status;

    if (status === 'delivered') {
      order.deliveredAt = new Date();
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating order status',
      error: error.message
    });
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.status === 'delivered' || order.status === 'out-for-delivery') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel order that is already delivered or out for delivery'
      });
    }

    order.status = 'cancelled';
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error cancelling order',
      error: error.message
    });
  }
};

module.exports = {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  cancelOrder
};
