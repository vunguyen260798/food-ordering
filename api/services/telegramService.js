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
      <div style="font-family: Arial, Helvetica, sans-serif; color: #222; line-height: 1.4; max-width: 600px;">
        <h2 style="margin: 0 0 10px 0;">🍕 <span style="color:#2D9CDB">ORDER PLACED SUCCESSFULLY</span></h2>

        <section style="margin-bottom: 12px;">
          <p style="margin:4px 0;"><strong>Order Number:</strong> ${order.orderNumber}</p>
          <p style="margin:4px 0;"><strong>Customer:</strong> ${order.customerName}</p>
          <p style="margin:4px 0;"><strong>Phone:</strong> ${order.customerPhone || 'Not provided'}</p>
        </section>

        <section style="background:#f7f9fc; padding:10px; border-radius:6px; margin-bottom:12px;">
          <h4 style="margin:0 0 8px 0;">Payment Information</h4>
          <p style="margin:4px 0;">• Method: <strong>Crypto (USDT)</strong></p>
          <p style="margin:4px 0;">• Amount received: <strong>${receivedAmount} USDT</strong></p>
          <p style="margin:4px 0;">• Transaction ID: <strong>${transactionHash}</strong></p>
          <p style="margin:4px 0;">• Sender wallet: <strong>${fromAddress}</strong></p>
        </section>

        <section style="margin-bottom:12px;">
          <h4 style="margin:0 0 8px 0;">Order Details</h4>
          <p style="margin:4px 0;">• Total (fiat): <strong>$${order.totalAmount}</strong></p>
          <p style="margin:4px 0;">• Reference code: <strong>${order.cryptoValue}</strong></p>
          <p style="margin:4px 0;">• Order time: <strong>${new Date().toLocaleString('en-US')}</strong></p>
        </section>

        <section style="margin-bottom:16px;">
          <h4 style="margin:0 0 8px 0;">Special Instructions</h4>
          <p style="margin:4px 0;">${order.specialInstructions || 'No special instructions'}</p>
        </section>

        <p style="margin:8px 0;"><strong>Status:</strong> Your order has been confirmed and is being prepared.</p>
        <p style="margin:8px 0;">Estimated delivery time: <strong>45 minutes</strong>.</p>

        <p style="margin-top:18px;">Thank you for your order!</p>
      </div>
  `.trim();
  }
}

// Export instance của class
module.exports = new TelegramService();