/**
 * Template Manager
 * Loads and processes HTML templates with variable replacement
 */
const fs = require('fs');
const path = require('path');
const orderStatusConfig = require('../config/orderStatusConfig');

class TemplateManager {
  constructor() {
    this.templatesPath = path.join(__dirname, '../templates');
    this.cache = {};
  }

  /**
   * Load template from HTML file
   */
  loadTemplate(templateName) {
    if (this.cache[templateName]) {
      return this.cache[templateName];
    }

    const templatePath = path.join(this.templatesPath, `${templateName}.html`);
    try {
      const template = fs.readFileSync(templatePath, 'utf-8');
      this.cache[templateName] = template;
      return template;
    } catch (error) {
      console.error(`Error loading template ${templateName}:`, error.message);
      throw error;
    }
  }

  /**
   * Replace variables in template
   */
  render(templateName, data) {
    let template = this.loadTemplate(templateName);
    
    // Replace all {{variable}} with actual values
    for (const [key, value] of Object.entries(data)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      template = template.replace(regex, value || '');
    }
    
    return template.trim();
  }

  /**
   * Build owner notification message
   */
  buildOwnerNotification(order, transaction, paymentTransaction) {
    const receivedAmount = paymentTransaction 
      ? paymentTransaction.amount 
      : (parseInt(transaction.value) / 1000000);
    
    const transactionHash = paymentTransaction 
      ? paymentTransaction.transactionId 
      : transaction.transaction_id;
    
    const fromAddress = paymentTransaction 
      ? paymentTransaction.fromAddress 
      : transaction.from;

    return this.render('ownerNotification', {
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerPhone: order.customerPhone || 'Not provided',
      customerEmail: order.customerEmail || 'Not provided',
      receivedAmount: receivedAmount,
      transactionHash: transactionHash,
      fromAddress: fromAddress,
      totalAmount: order.totalAmount,
      cryptoValue: order.cryptoValue,
      orderTime: new Date().toLocaleString('en-US'),
      deliveryAddress: order.deliveryAddress || 'Pickup',
      specialInstructions: order.specialInstructions || 'No special instructions'
    });
  }

  /**
   * Build customer notification message
   */
  buildCustomerNotification(order, transaction, paymentTransaction) {
    const receivedAmount = paymentTransaction 
      ? paymentTransaction.amount 
      : (parseInt(transaction.value) / 1000000);
    
    const customerName = order.telegramInfo?.firstName || order.customerName;
    
    const specialInstructionsSection = order.specialInstructions 
      ? `📝 <b>Your notes:</b> ${order.specialInstructions}\n` 
      : '';

    return this.render('customerNotification', {
      customerName: customerName,
      orderNumber: order.orderNumber,
      receivedAmount: receivedAmount,
      totalAmount: order.totalAmount,
      deliveryAddress: order.deliveryAddress || 'Pickup',
      specialInstructionsSection: specialInstructionsSection
    });
  }

  /**
   * Build order status change notification (unified for all statuses)
   */
  buildOrderStatusNotification(order, status, additionalData = {}) {
    const statusConfig = orderStatusConfig[status];
    
    if (!statusConfig) {
      throw new Error(`Unknown order status: ${status}`);
    }

    const customerName = order.telegramInfo?.firstName || order.customerName;
    
    // Prepare status-specific data
    let statusData = {
      statusIcon: statusConfig.icon,
      statusTitle: statusConfig.title,
      customerName: customerName,
      statusMessage: statusConfig.message,
      orderNumber: order.orderNumber,
      statusDetails: '',
      additionalInfo: '',
      actionMessage: statusConfig.actionMessage
    };

    // Build status details based on status type
    switch (status) {
      case 'preparing':
        const prepareEstimatedTime = order.estimatedDeliveryTime 
          ? Math.ceil((new Date(order.estimatedDeliveryTime) - new Date()) / 60000)
          : 30;
        statusData.statusDetails = statusConfig.getDetails(order).replace('{{estimatedTime}}', prepareEstimatedTime);
        statusData.additionalInfo = statusConfig.getAdditionalInfo(order);
        break;

      case 'shipping':
        const shippingEstimatedTime = order.estimatedDeliveryTime 
          ? Math.ceil((new Date(order.estimatedDeliveryTime) - new Date()) / 60000)
          : 20;
        statusData.statusDetails = statusConfig.getDetails(order)
          .replace('{{deliveryAddress}}', order.deliveryAddress || 'Your location')
          .replace('{{estimatedTime}}', shippingEstimatedTime);
        statusData.additionalInfo = statusConfig.getAdditionalInfo(order);
        break;

      case 'delivered':
        const deliveredTime = order.deliveredAt 
          ? new Date(order.deliveredAt).toLocaleString('en-US')
          : new Date().toLocaleString('en-US');
        statusData.statusDetails = statusConfig.getDetails(order)
          .replace('{{deliveryAddress}}', order.deliveryAddress || 'Your location')
          .replace('{{deliveredTime}}', deliveredTime);
        statusData.additionalInfo = statusConfig.getAdditionalInfo(order);
        break;

      case 'cancelled':
        const cancelledTime = new Date().toLocaleString('en-US');
        const cancellationReason = additionalData.reason 
          ? `• Reason: ${additionalData.reason}\n`
          : '';
        const refundInfo = order.paymentMethod === 'crypto' && order.cryptoPayment?.receivedAmount
          ? 'If payment was received, a refund will be processed within 24-48 hours.'
          : 'No payment was processed for this order.';
        
        statusData.statusDetails = statusConfig.getDetails(order)
          .replace('{{cancelledTime}}', cancelledTime)
          .replace('{{cancellationReason}}', cancellationReason);
        statusData.additionalInfo = statusConfig.getAdditionalInfo(order)
          .replace('{{refundInfo}}', refundInfo);
        break;

      case 'expired':
        const expiredTime = order.cryptoPayment?.expiresAt
          ? new Date(order.cryptoPayment.expiresAt).toLocaleString('en-US')
          : new Date().toLocaleString('en-US');
        const expectedAmount = order.cryptoPayment?.expectedAmount || order.totalAmount;
        
        statusData.statusDetails = statusConfig.getDetails(order)
          .replace('{{expectedAmount}}', expectedAmount)
          .replace('{{expiredTime}}', expiredTime);
        statusData.additionalInfo = statusConfig.getAdditionalInfo(order);
        break;

      case 'paid':
        const receivedAmount = order.cryptoPayment?.receivedAmount || order.totalAmount;
        statusData.statusDetails = statusConfig.getDetails(order)
          .replace('{{receivedAmount}}', receivedAmount);
        statusData.additionalInfo = statusConfig.getAdditionalInfo(order);
        break;
    }

    return this.render('orderStatusChange', statusData);
  }
}

module.exports = new TemplateManager();
