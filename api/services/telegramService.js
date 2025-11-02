require('dotenv').config();
const axios = require('axios');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

class TelegramService {
  async sendNotification(order, transaction, paymentTransaction) {
    try {

      const message = this.buildOrderMessage(order, transaction, paymentTransaction);
      
      const response = await axios.post(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'HTML'
        },
        {
          timeout: 5000
        }
      );

      console.log('📱 Telegram notification sent successfully');
      return response.data;
    } catch (error) {
      console.error('Error sending Telegram notification:', error.message);
    }
  }

  buildOrderMessage(order, transaction, paymentTransaction) {
    const receivedAmount = paymentTransaction ? paymentTransaction.amount : (parseInt(transaction.value) / 1000000);
    const transactionHash = paymentTransaction ? paymentTransaction.transactionId : transaction.transaction_id;
    const fromAddress = paymentTransaction ? paymentTransaction.fromAddress : transaction.from;
    
    return `
  🍕 <b>ORDER PLACED SUCCESSFULLY</b>

  <b>Order Information:</b>
  • Order Number: ${order.orderNumber}
  • Customer: ${order.customerName}
  • Phone: ${order.customerPhone || 'Not provided'}

  <b>Payment Information:</b>
  • Method: <b>Crypto (USDT)</b>
  • Amount received: <b>${receivedAmount} USDT</b>
  • Transaction ID: <b>${transactionHash}</b>
  • Sender wallet: <b>${fromAddress}</b>

  <b>Order Details:</b>
  • Total (fiat): <b>$${order.totalAmount}</b>
  • Reference code: <b>${order.cryptoValue}</b>
  • Order time: <b>${new Date().toLocaleString('en-US')}</b>

  <b>Special Instructions:</b>
  ${order.specialInstructions || 'No special instructions'}

  <b>Status:</b> Your order has been confirmed and is being prepared.
  Estimated delivery time: <b>45 minutes</b>.

  Thank you for your order!
    `.trim();
  }
}

// Export instance của class
module.exports = new TelegramService();