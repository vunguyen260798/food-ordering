const axios = require('axios');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

class TelegramService {
  async sendNotification(order, transaction) {
    try {
      const message = this.buildOrderMessage(order, transaction);
      
      await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      });
      
      console.log('Telegram notification sent');
    } catch (error) {
      console.error('Error sending Telegram notification:', error);
    }
  }

  buildOrderMessage(order, transaction) {
    const receivedAmount = order.cryptoPayment.receivedAmount;
    const transactionHash = order.cryptoPayment.transactionHash;
    
    return `
        <b>NEW ORDER PAID WITH CRYPTO!</b>

        <b>Order ID:</b> ${order._id}
        <b>Amount:</b> ${receivedAmount} USDT
        <b>Total Items:</b> ${order.items.length}
        <b>Paid At:</b> ${new Date().toLocaleString()}

        <b>Transaction:</b>
        <code>${transactionHash}</code>

        <b>Order Details:</b>
        ${order.items.map(item => `• ${item.name} x${item.quantity} - $${item.price}`).join('\n')}

        <b>Special Instructions:</b>
        ${order.specialInstructions || 'None'}
    `.trim();
  }
}

module.exports = new TelegramService();