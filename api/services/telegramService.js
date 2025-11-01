// services/telegramService.js
const axios = require('axios');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

class TelegramService {
  async sendNotification(order, transaction, paymentTransaction) {
    try {
      const message = this.buildOrderMessage(order, transaction, paymentTransaction);
      
      await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      });
      
      console.log('📱 Telegram notification sent');
    } catch (error) {
      console.error('Error sending Telegram notification:', error);
    }
  }

  buildOrderMessage(order, transaction, paymentTransaction) {
    return `
💰 <b>CRYPTO PAYMENT CONFIRMED!</b>

🆔 <b>Order ID:</b> ${order._id}
📊 <b>Order Number:</b> ${order.orderNumber}
💵 <b>Amount:</b> ${paymentTransaction.amount} USDT
🔢 <b>Crypto Value:</b> ${order.cryptoValue}

👤 <b>From:</b> <code>${paymentTransaction.fromAddress}</code>
📦 <b>To:</b> <code>${paymentTransaction.toAddress}</code>

🔗 <b>Transaction Hash:</b>
<code>${paymentTransaction.transactionId}</code>

🕒 <b>Paid At:</b> ${paymentTransaction.blockTimestamp.toLocaleString()}

👤 <b>Customer:</b> ${order.customerName}
📞 <b>Phone:</b> ${order.customerPhone || 'N/A'}

🎉 <b>Order is now confirmed and ready for preparation!</b>
    `.trim();
  }
}

module.exports = new TelegramService();