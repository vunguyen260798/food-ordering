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

      // Xử lý từng transaction để tìm order phù hợp
      for (const tx of transactions) {
        await this.processTransaction(tx, pendingOrders);
      }

    } catch (error) {
      console.error('Error in crypto payment cron job:', error.message);
    }
  }

  async processTransaction(tx, pendingOrders) {
    try {
      // Kiểm tra transaction cơ bản
      if (tx.to !== MERCHANT_WALLET || 
          tx.token_info?.symbol !== 'USDT' || 
          tx.type !== 'Transfer') {
        return;
      }

      // Kiểm tra xem transaction đã được xử lý chưa
      const existingTransaction = await PaymentTransaction.findOne({
        transactionId: tx.transaction_id
      });

      if (existingTransaction) {
        console.log(`⚠️ Transaction ${tx.transaction_id} already processed`);
        return;
      }

      // Lấy giá trị từ API (số nguyên)
      const apiValue = parseInt(tx.value);
      console.log(`🔍 Processing transaction ${tx.transaction_id} with API value: ${apiValue}`);

      // Tìm order khớp với giá trị từ API
      const matchingOrder = await this.findOrderByApiValue(apiValue, pendingOrders);

      if (matchingOrder) {
        await this.confirmPayment(matchingOrder, tx, apiValue);
      } else {
        console.log(`❌ No matching order found for API value: ${apiValue}`);
      }

    } catch (error) {
      console.error('Error processing transaction:', error);
    }
  }

  async findOrderByApiValue(apiValue, pendingOrders) {
    // Chuyển đổi API value thành order code
    const orderCode = this.extractOrderCodeFromApiValue(apiValue);
    console.log(`🔍 Extracted order code from API value ${apiValue}: ${orderCode}`);

    if (!orderCode) {
      return null;
    }

    // Tìm order với orderNumber khớp
    const matchingOrder = pendingOrders.find(order => 
      order.orderNumber === orderCode
    );

    return matchingOrder;
  }

  extractOrderCodeFromApiValue(apiValue) {
    try {
      // Chuyển số nguyên thành chuỗi
      const valueStr = apiValue.toString();
      
      // Logic: 6 chữ số cuối là order code
      if (valueStr.length <= 6) {
        // Nếu giá trị quá nhỏ, pad left với zeros
        return valueStr.padStart(6, '0');
      }
      
      // Lấy 6 chữ số cuối làm order code
      const orderCode = valueStr.slice(-6);
      return orderCode.padStart(6, '0');
      
    } catch (error) {
      console.error('Error extracting order code:', error);
      return null;
    }
  }

  async confirmPayment(order, transaction, apiValue) {
    try {
      const receivedAmountUSDT = apiValue / 1000000; // USDT có 6 decimals
      
      console.log(`✅ Found matching order ${order._id} for transaction ${transaction.transaction_id}`);
      
      // Tạo payment transaction record
      const paymentTransaction = await PaymentTransaction.create({
        transactionId: transaction.transaction_id,
        order: order._id,
        amount: receivedAmountUSDT,
        fromAddress: transaction.from,
        toAddress: transaction.to,
        tokenSymbol: transaction.token_info.symbol,
        rawValue: transaction.value,
        decimals: transaction.token_info.decimals,
        blockTimestamp: new Date(transaction.block_timestamp),
        status: 'confirmed'
      });

      // Cập nhật order
      order.status = 'paid';
      order.paymentTransaction = paymentTransaction._id;
      order.cryptoPayment.receivedAmount = receivedAmountUSDT;
      order.cryptoPayment.transactionHash = transaction.transaction_id;
      
      await order.save();

      // Gửi notification đến Telegram
      await telegramService.sendNotification(order, transaction, paymentTransaction);
      
      console.log(`✅ Order ${order._id} marked as paid, transaction saved: ${paymentTransaction._id}`);
      
    } catch (error) {
      console.error('Error confirming payment:', error);
    }
  }

  // Helper function để debug
  debugValueConversion() {
    const testCases = [
      { apiValue: 15000001, expectedOrderCode: '000001' },
      { apiValue: 25500002, expectedOrderCode: '000002' },
      { apiValue: 100000003, expectedOrderCode: '000003' },
      { apiValue: 75250123, expectedOrderCode: '000123' },
      { apiValue: 75361111, expectedOrderCode: '111111' }
    ];

    console.log('\n🧪 DEBUG Value Conversion:');
    testCases.forEach(test => {
      const extracted = this.extractOrderCodeFromApiValue(test.apiValue);
      const status = extracted === test.expectedOrderCode ? '✅' : '❌';
      console.log(`${status} API: ${test.apiValue} -> Order: ${extracted} (expected: ${test.expectedOrderCode})`);
    });
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