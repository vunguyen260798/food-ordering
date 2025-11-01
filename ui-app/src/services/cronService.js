const axios = require('axios');
const Order = require('../models/Order');
const { sendTelegramNotification } = require('./telegramService');

const MERCHANT_WALLET = 'TXXGsnvM3dtr5LZp13QKHnnfmqKsuYTVdk';
const TRONGRID_API = 'https://api.trongrid.io/v1/accounts';

class CronService {
  async checkCryptoPayments() {
    try {
      console.log('Checking for crypto payments...');
      
      // Lấy các order đang chờ thanh toán crypto
      const pendingOrders = await Order.find({
        status: 'pending',
        'cryptoPayment.expiresAt': { $gt: new Date() },
        paymentMethod: 'crypto'
      });

      if (pendingOrders.length === 0) {
        console.log('No pending crypto orders found');
        return;
      }

      // Lấy transactions từ TronGrid
      const response = await axios.get(
        `${TRONGRID_API}/${MERCHANT_WALLET}/transactions/trc20`,
        {
          params: {
            limit: 50,
            order_by: 'block_timestamp,desc'
          }
        }
      );

      if (!response.data.success) {
        throw new Error('Failed to fetch transactions from TronGrid');
      }

      const transactions = response.data.data;
      console.log(`Found ${transactions.length} recent transactions`);

      // Xử lý từng order pending
      for (const order of pendingOrders) {
        await this.processOrderPayment(order, transactions);
      }

    } catch (error) {
      console.error('Error in crypto payment cron job:', error);
    }
  }

  async processOrderPayment(order, transactions) {
    const expectedAmount = order.cryptoPayment.expectedAmount;
    
    // Tìm transaction khớp
    const matchingTransaction = transactions.find(tx => {
      const receivedAmount = parseInt(tx.value) / 1000000; // Chuyển từ decimals
      return (
        tx.to === MERCHANT_WALLET &&
        tx.token_info.symbol === 'USDT' &&
        receivedAmount === expectedAmount &&
        new Date(tx.block_timestamp) > order.createdAt
      );
    });

    if (matchingTransaction) {
      console.log(`Found matching transaction for order ${order._id}`);
      
      // Cập nhật order
      order.status = 'paid';
      order.cryptoPayment.receivedAmount = parseInt(matchingTransaction.value) / 1000000;
      order.cryptoPayment.transactionHash = matchingTransaction.transaction_id;
      
      await order.save();

      // Gửi notification đến Telegram
      await sendTelegramNotification(order, matchingTransaction);
      
      console.log(`Order ${order._id} marked as paid`);
    }
  }

  // Hàm để đánh dấu các order hết hạn
  async expireOldOrders() {
    try {
      const result = await Order.updateMany(
        {
          status: 'pending',
          'cryptoPayment.expiresAt': { $lt: new Date() }
        },
        {
          status: 'expired'
        }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`⌛ Expired ${result.modifiedCount} orders`);
      }
    } catch (error) {
      console.error('Error expiring old orders:', error);
    }
  }
}

module.exports = new CronService();