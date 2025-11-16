/**
 * Order Status Configuration
 * Defines content for each order status notification
 */
module.exports = {
  preparing: {
    icon: '👨‍🍳',
    title: 'ORDER IS BEING PREPARED',
    message: 'Great news! Your order is now being prepared by our kitchen.',
    getDetails: (order) => `<b>Order Details:</b>
• Total: <b>$${order.totalAmount}</b>
• Estimated time: <b>{{estimatedTime}} minutes</b>`,
    getAdditionalInfo: (order) => `<b>What's next?</b>
🍳 Our chefs are preparing your delicious meal
⏱️ We'll notify you when it's ready for delivery`,
    actionMessage: 'Sit tight, your food will be ready soon! 🎉'
  },

  shipping: {
    icon: '🚚',
    title: 'ORDER IS ON THE WAY',
    message: 'Your order is out for delivery!',
    getDetails: (order) => `<b>Delivery Information:</b>
• Delivery to: <b>{{deliveryAddress}}</b>
• Order total: <b>$${order.totalAmount}</b>
• Estimated arrival: <b>{{estimatedTime}} minutes</b>`,
    getAdditionalInfo: (order) => `<b>What to do?</b>
📱 Keep your phone nearby
🏠 Make sure someone is available at the delivery address
💵 Prepare payment if needed (already paid via crypto)`,
    actionMessage: 'Your food is almost there! 🎊'
  },

  delivered: {
    icon: '✅',
    title: 'ORDER DELIVERED',
    message: 'Your order has been successfully delivered!',
    getDetails: (order) => `<b>Delivery Confirmation:</b>
• Delivered to: <b>{{deliveryAddress}}</b>
• Order total: <b>$${order.totalAmount}</b>
• Delivered at: <b>{{deliveredTime}}</b>`,
    getAdditionalInfo: (order) => `<b>Enjoy your meal!</b>
We hope you enjoy your food. Your satisfaction is our priority.

📝 Rate your experience (coming soon)
🍽️ Bon appétit!`,
    actionMessage: 'Thank you for ordering with us! We hope to serve you again soon! ❤️'
  },

  cancelled: {
    icon: '❌',
    title: 'ORDER CANCELLED',
    message: 'We\'re sorry to inform you that your order has been cancelled.',
    getDetails: (order) => `<b>Cancellation Details:</b>
• Order total: <b>$${order.totalAmount}</b>
• Cancelled at: <b>{{cancelledTime}}</b>
{{cancellationReason}}`,
    getAdditionalInfo: (order) => `<b>What's next?</b>
{{refundInfo}}

If you have any questions or concerns, please contact our support team.`,
    actionMessage: 'We apologize for any inconvenience and hope to serve you better next time. 🙏'
  },

  expired: {
    icon: '⏰',
    title: 'ORDER EXPIRED',
    message: 'Your order has expired due to payment timeout.',
    getDetails: (order) => `<b>Order Information:</b>
• Expected amount: <b>{{expectedAmount}} USDT</b>
• Order total: <b>$${order.totalAmount}</b>
• Expired at: <b>{{expiredTime}}</b>`,
    getAdditionalInfo: (order) => `<b>What happened?</b>
⏱️ Payment was not received within 10 minutes
💳 No charges were made to your account

<b>Want to try again?</b>
You can create a new order anytime. We'll be here when you're ready!`,
    actionMessage: 'Feel free to order again when you\'re ready! 🍕'
  },

  paid: {
    icon: '💰',
    title: 'PAYMENT RECEIVED',
    message: 'Your payment has been confirmed!',
    getDetails: (order) => `<b>Payment Details:</b>
• Amount paid: <b>{{receivedAmount}} USDT</b>
• Order total: <b>$${order.totalAmount}</b>
• Payment method: <b>Crypto (USDT)</b>`,
    getAdditionalInfo: (order) => `<b>What's next?</b>
✅ Your order is confirmed
👨‍🍳 Our kitchen will start preparing soon
📲 We'll keep you updated on your order status`,
    actionMessage: 'Thank you for your payment! 🎉'
  }
};
