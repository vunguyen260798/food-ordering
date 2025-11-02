require('dotenv').config();
const axios = require('axios');
const Order = require('../models/Order');
const PaymentTransaction = require('../models/PaymentTransaction');
const telegramService = require('./telegramService');

const MERCHANT_WALLET = process.env.MERCHANT_WALLET;
const TRONGRID_API = process.env.TRONGRID_API;

class CryptoPaymentService {
  async checkCryptoPayments() {
    try {
      console.log('🔍 Checking for crypto payments...');
      
      const pendingOrders = await Order.find({
        status: 'pending',
        paymentMethod: 'crypto'
      });

      if (pendingOrders.length === 0) {
        console.log('No pending crypto orders found');
        return;
      }

      console.log(` Found ${pendingOrders.length} pending crypto orders`);

      // Lấy transactions từ TronGrid
      const response = await axios.get(
        `${TRONGRID_API}/${MERCHANT_WALLET}/transactions/trc20`,
        {
          params: {
            limit: 20,
            order_by: 'block_timestamp,desc'
          },
          timeout: 10000
        }
      );

      if (!response.data.success) {
        throw new Error('Failed to fetch transactions from TronGrid');
      }

      const transactions = response.data.data;
      console.log(` Found ${transactions.length} recent transactions`);

      // Xử lý từng order pending
      for (const order of pendingOrders) {
        await this.processOrderPayment(order, transactions);
      }

    } catch (error) {
      console.error('Error in crypto payment cron job:', error.message);
    }
  }

  async processOrderPayment(order, transactions) {
    if (!order.cryptoValue) {
      console.log(`❌ Order ${order._id} missing cryptoValue`);
      return;
    }

    console.log(`🔍 Processing order ${order._id} with cryptoValue: ${order.cryptoValue}`);

    // Tìm transaction khớp với cryptoValue
    const matchingTransaction = transactions.find(tx => {
      const receivedAmountUSDT = parseInt(tx.value) / 100000000;
      
      return (
        tx.to === MERCHANT_WALLET &&
        tx.token_info.symbol === 'USDT' &&
        tx.type === 'Transfer' &&
        this.isValueMatch(receivedAmountUSDT, order.cryptoValue)
      );
    });

    if (matchingTransaction) {
      const receivedAmountUSDT = parseInt(matchingTransaction.value) / 100000000;
      
      // Kiểm tra xem transaction đã được lưu chưa
      const existingTransaction = await PaymentTransaction.findOne({
        transactionId: matchingTransaction.transaction_id
      });

      if (existingTransaction) {
        console.log(`⚠️ Transaction ${matchingTransaction.transaction_id} already processed`);
        return;
      }

      console.log(`✅ Found matching transaction for order ${order._id}`);
      
      // Tạo payment transaction record
      const paymentTransaction = await PaymentTransaction.create({
        transactionId: matchingTransaction.transaction_id,
        order: order._id,
        amount: receivedAmountUSDT,
        fromAddress: matchingTransaction.from,
        toAddress: matchingTransaction.to,
        tokenSymbol: matchingTransaction.token_info.symbol,
        rawValue: matchingTransaction.value,
        decimals: matchingTransaction.token_info.decimals,
        blockTimestamp: new Date(matchingTransaction.block_timestamp),
        status: 'confirmed'
      });

      // Cập nhật order
      order.status = 'paid';
      order.paymentTransaction = paymentTransaction._id;
      order.cryptoPayment.receivedAmount = receivedAmountUSDT;
      order.cryptoPayment.transactionHash = matchingTransaction.transaction_id;
      
      await order.save();

      // Gửi notification đến Telegram
      await telegramService.sendNotification(order, matchingTransaction, paymentTransaction);
      
      console.log(`✅ Order ${order._id} marked as paid, transaction saved: ${paymentTransaction._id}`);
    } else {
      console.log(`❌ No matching transaction found for order ${order._id}`);
    }
  }

  isValueMatch(receivedAmount, expectedCryptoValue) {
    try {
      const expectedParts = expectedCryptoValue.split('.');
      const expectedInteger = parseFloat(expectedParts[0]);
      return receivedAmount === expectedInteger;
    } catch (error) {
      console.error('Error comparing values:', error);
      return false;
    }
  }

  async expireOldOrders() {
    try {
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      
      const result = await Order.updateMany(
        {
          status: 'pending',
          paymentMethod: 'crypto',
          createdAt: { $lt: tenMinutesAgo }
        },
        {
          status: 'expired'
        }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`⌛ Expired ${result.modifiedCount} crypto orders`);
      }
    } catch (error) {
      console.error('Error expiring old orders:', error);
    }
  }
}

module.exports = new CryptoPaymentService();