const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product');

// @desc    Create new order
// @route   POST /api/orders
// @access  Public
const createOrder = async (req, res) => {

  try {
    const { 
      items, 
      customerName, 
      customerEmail, 
      customerPhone, 
      deliveryAddress, 
      specialInstructions,
      voucherCode,
      paymentMethod,
      telegramInfo
    } = req.body;
    console.log(telegramInfo)
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

      // Determine price based on variant or base product
      let itemPrice = product.price;
      let variantName = '';
      let variantSku = '';

      // If variant information is provided, find the variant and use its price
      if (item.variantName || item.variantSku) {
        const variant = product.variants.find(v => {
          if (item.variantSku) {
            return v.sku === item.variantSku;
          }
          return v.name === item.variantName;
        });

        if (variant) {
          if (!variant.isAvailable) {
            return res.status(400).json({
              success: false,
              message: `Variant "${variant.name}" is not available for product: ${product.name}`
            });
          }
          itemPrice = variant.price;
          variantName = variant.name;
          variantSku = variant.sku;
        } else {
          return res.status(404).json({
            success: false,
            message: `Variant not found for product: ${product.name}`
          });
        }
      }

      const itemSubtotal = itemPrice * item.quantity;

      const orderItem = await OrderItem.create({
        product: product._id,
        productName: product.name,
        productPrice: itemPrice,
        variantName: variantName,
        variantSku: variantSku,
        quantity: item.quantity,
        subtotal: itemSubtotal,
        deliveryAddress: item.deliveryAddress || '',
        customizations: item.customizations || [],
        specialRequest: item.specialRequest || '',
        voucherCode: voucherCode || ''
      });

      orderItemIds.push(orderItem._id);
      subtotal += itemSubtotal;
    }

    // Calculate totals
    const tax = subtotal * 0.08;
    const deliveryFee = 0;
    // const totalAmount = subtotal + tax + deliveryFee;
    const totalAmount = subtotal + deliveryFee;

    // Calculate estimated delivery time
    const estimatedDeliveryTime = new Date();
    estimatedDeliveryTime.setMinutes(estimatedDeliveryTime.getMinutes() + 45);

    // Order data - cryptoValue sẽ được tạo tự động trong pre-save hook
    const orderData = {
      orderItems: orderItemIds,
      customerName: customerName || 'Walk-in Customer',
      customerEmail: customerEmail || '',
      customerPhone: customerPhone || '',
      deliveryAddress: deliveryAddress || '',
      subtotal,
      tax,
      deliveryFee,
      totalAmount,
      specialInstructions: specialInstructions || '',
      voucherCode: voucherCode || '',
      estimatedDeliveryTime,
      paymentMethod: paymentMethod || 'stripe'
    };

    // Thêm Telegram info nếu có
    if (telegramInfo) {
      orderData.telegramInfo = {
        userId: telegramInfo.userId,
        chatId: telegramInfo.chatId,
        username: telegramInfo.username,
        firstName: telegramInfo.firstName,
        lastName: telegramInfo.lastName,
        languageCode: telegramInfo.languageCode,
        isPremium: telegramInfo.isPremium,
        photoUrl: telegramInfo.photoUrl,
        platform: telegramInfo.platform,
        queryId: telegramInfo.queryId,
        authDate: telegramInfo.authDate ? new Date(telegramInfo.authDate) : null
      };
    }

    // Thêm crypto payment info nếu cần
    if (paymentMethod === 'crypto') {
      orderData.cryptoPayment = {
        expectedAmount: totalAmount,
        walletAddress: 'TXXGsnvM3dtr5LZp13QKHnnfmqKsuYTVdk',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 phút
      };
    }

    // Create order
    const order = await Order.create(orderData);

    // Populate order items
    const populatedOrder = await Order.findById(order._id)
      .populate('orderItems')
      .exec();

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: populatedOrder
    });
  } catch (error) {
    console.error('Create order error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Order number already exists, please try again'
      });
    }
    
    res.status(400).json({
      success: false,
      message: 'Error creating order',
      error: error.message
    });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
const getOrders = async (req, res) => {
  try {
    const { status, paymentMethod, page = 1, limit = 10 } = req.query;
    let query = {};

    if (status) {
      query.status = status;
    }

    if (paymentMethod) {
      query.paymentMethod = paymentMethod;
    }

    // Convert page and limit to numbers
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    
    // Calculate skip value
    const skip = (pageNum - 1) * limitNum;

    // Get total count for pagination
    const totalOrders = await Order.countDocuments(query);

    // Fetch paginated orders
    const orders = await Order.find(query)
      .populate('orderItems')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalOrders / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalOrders,
        limit: limitNum,
        hasNextPage,
        hasPrevPage
      }
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
      });

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

// @desc    Check order payment status (for frontend polling)
// @route   GET /api/orders/:id/payment-status
// @access  Public
const checkPaymentStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        status: order.status,
        paymentMethod: order.paymentMethod,
        cryptoPayment: order.cryptoPayment
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking payment status',
      error: error.message
    });
  }
};

module.exports = {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  cancelOrder,
  checkPaymentStatus
};