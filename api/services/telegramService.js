require('dotenv').config();
const axios = require('axios');
const templateManager = require('./templateManager');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

class TelegramService {
  async sendNotification(order, transaction, paymentTransaction) {
    try {
      // Send notification to owner
      const ownerMessage = templateManager.buildOwnerNotification(order, transaction, paymentTransaction);
      
      const ownerResponse = await axios.post(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          chat_id: TELEGRAM_CHAT_ID,
          text: ownerMessage,
          parse_mode: 'HTML'
        },
        {
          timeout: 5000
        }
      );

      console.log('📱 Owner notification sent successfully');

      // Send notification to customer if telegram info is available
      if (order.telegramInfo && order.telegramInfo.chatId) {
        await this.sendCustomerNotification(order, transaction, paymentTransaction);
      }

      return ownerResponse.data;
    } catch (error) {
      console.error('Error sending Telegram notification:', error.message);
    }
  }

  async sendCustomerNotification(order, transaction, paymentTransaction) {
    try {
      const customerMessage = templateManager.buildCustomerNotification(order, transaction, paymentTransaction);
      
      const response = await axios.post(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          chat_id: order.telegramInfo.chatId,
          text: customerMessage,
          parse_mode: 'HTML'
        },
        {
          timeout: 5000
        }
      );

      console.log(`📱 Customer notification sent to ${order.telegramInfo.username || order.telegramInfo.firstName}`);
      return response.data;
    } catch (error) {
      console.error('Error sending customer notification:', error.message);
    }
  }

  /**
   * Send order status change notification to customer
   */
  async sendStatusChangeNotification(order, status, additionalData = {}) {
    try {
      // Check if customer has telegram info
      if (!order.telegramInfo || !order.telegramInfo.chatId) {
        console.log('⚠️ No telegram info available for customer');
        return;
      }

      // Build unified status notification message
      const message = templateManager.buildOrderStatusNotification(order, status, additionalData);

      const response = await axios.post(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          chat_id: order.telegramInfo.chatId,
          text: message,
          parse_mode: 'HTML'
        },
        {
          timeout: 5000
        }
      );

      console.log(`📱 Status change notification sent to customer: ${status}`);
      return response.data;
    } catch (error) {
      console.error('Error sending status change notification:', error.message);
    }
  }
}

// Export instance của class
module.exports = new TelegramService();