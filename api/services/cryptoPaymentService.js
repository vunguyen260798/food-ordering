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
      // console.log('🔍 Checking for crypto payments...');
      
      const pendingOrders = await Order.find({
        status: 'pending',
        paymentMethod: 'crypto',
        'cryptoPayment.expiresAt': { $gt: new Date() } // Chỉ lấy orders chưa hết hạn
      });

      if (pendingOrders.length === 0) {
        return;
      }

      console.log(` Found ${pendingOrders.length} pending crypto orders`);

      // Lấy transactions từ TronGrid
      const response = await axios.get(
        `${TRONGRID_API}/${MERCHANT_WALLET}/transactions/trc20`
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

      // Lấy giá trị từ API và chuyển đổi sang USDT
      const txValue = parseInt(tx.value);
      const receivedAmountUSDT = txValue / 1000000; // USDT có 6 decimals
      
      // console.log(`🔍 Processing transaction ${tx.transaction_id} with amount: ${receivedAmountUSDT} USDT`);

      // Tìm order khớp với transaction
      const matchingOrder = await this.findOrderByTransaction(receivedAmountUSDT, pendingOrders);

      if (matchingOrder) {
        await this.confirmPayment(matchingOrder, tx, receivedAmountUSDT);
      }

    } catch (error) {
      console.error('Error processing transaction:', error);
    }
  }

  async findOrderByTransaction(receivedAmountUSDT, pendingOrders) {
    for (const order of pendingOrders) {
      // Tính toán order code từ số tiền nhận được
      const extractedOrderCode = this.calculateOrderCode(receivedAmountUSDT, order.totalAmount);
      
      if (extractedOrderCode && extractedOrderCode === order.orderNumber) {
        // console.log(`✅ Found matching order: ${order._id}, Order code: ${order.orderNumber}`);
        return order;
      }
    }
    
    return null;
  }

  calculateOrderCode(receivedAmountUSDT, orderAmount) {
    try {
      // Công thức: (received_amount - order_amount) = 0.order_code
      const difference = receivedAmountUSDT - orderAmount;
      
      // console.log(`   📊 Amount diff: ${receivedAmountUSDT} - ${orderAmount} = ${difference}`);
      
      // Nếu difference là số dương rất nhỏ (0.000001 đến 0.999999)
      if (difference > 0 && difference < 1) {
        // Chuyển phần thập phân thành 6 chữ số
        const decimalPart = difference.toFixed(6).split('.')[1];
        const orderCode = decimalPart.padStart(6, '0');
        
        // console.log(`   🔍 Extracted order code: ${orderCode}`);
        return orderCode;
      }
      
      return null;
      
    } catch (error) {
      console.error('Error calculating order code:', error);
      return null;
    }
  }

  async confirmPayment(order, transaction, receivedAmountUSDT) {
    try {
      // console.log(`✅ Confirming payment for order ${order._id}`);
      
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
      
      // console.log(`✅ Order ${order._id} marked as paid, transaction saved: ${paymentTransaction._id}`);
      
    } catch (error) {
      console.error('Error confirming payment:', error);
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