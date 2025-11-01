import React, { useEffect, useState } from 'react';

const QRPayment = ({ order, finalTotal, onClose, onPaymentSuccess }) => {
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!order?.cryptoPayment?.expiresAt) return;

    const expiryTime = new Date(order.cryptoPayment.expiresAt).getTime();
    
    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((expiryTime - now) / 1000));
      
      setTimeLeft(remaining);
      setIsExpired(remaining === 0);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [order]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // Có thể thêm toast notification ở đây
    alert('Wallet address copied to clipboard!');
  };

  if (!order) return null;

  return (
    <div className="qr-payment-overlay">
      <div className="qr-payment-modal">
        <div className="qr-payment-header">
          <h2>CRYPTO PAYMENT</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        <div className="qr-payment-content">
          {/* Timer */}
          <div className="payment-timer">
            <div className={`timer ${isExpired ? 'expired' : 'active'}`}>
              ⏰ Time remaining: {formatTime(timeLeft)}
            </div>
            {isExpired && (
              <div className="expired-message">
                ❌ Payment session expired. Please create a new order.
              </div>
            )}
          </div>

          <div className="qr-code-container">
            <div className="qr-code-placeholder">
              <div className="qr-code">
                <div className="qr-pattern">
                  <div className="qr-corner top-left"></div>
                  <div className="qr-corner top-right"></div>
                  <div className="qr-corner bottom-left"></div>
                  <div className="qr-dots">
                    {[...Array(25)].map((_, i) => (
                      <div key={i} className="qr-dot" style={{
                        animationDelay: `${i * 0.1}s`
                      }}></div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="scan-text">Scan QR Code to Pay</div>
            </div>
          </div>

          <div className="payment-details">
            <div className="payment-amount">
              <div className="amount-label">Amount to Pay</div>
              <div className="amount-value">{finalTotal} USDT</div>
            </div>
            
            <div className="crypto-address">
              <div className="address-label">Merchant Wallet Address (TRC20)</div>
              <div className="address-value">
                {order.cryptoPayment.walletAddress}
                <button 
                  className="copy-button"
                  onClick={() => copyToClipboard(order.cryptoPayment.walletAddress)}
                >
                  Copy
                </button>
              </div>
            </div>

            <div className="payment-instructions">
              <h4>📋 Payment Instructions:</h4>
              <ol>
                <li>Send <strong>exactly {finalTotal} USDT</strong> to the address above</li>
                <li>Make sure to use <strong>TRC20 network</strong></li>
                <li>Wait for transaction confirmation (usually 2-3 minutes)</li>
                <li>Click "I've Paid" after sending the transaction</li>
                <li>Order will be confirmed automatically once payment is detected</li>
              </ol>
            </div>
          </div>

          <div className="order-summary">
            <h4>Order Summary:</h4>
            {order.orderItems && order.orderItems.map((item, index) => (
              <div key={index} className="order-item-summary">
                {item.productName} × {item.quantity} - ${item.productPrice}
              </div>
            ))}
            <div className="order-total">Total: ${finalTotal}</div>
          </div>

          <div className="supported-cryptos">
            <div className="section-title">Supported Cryptocurrencies</div>
            <div className="crypto-list">
              <div className="crypto-item">USDT (TRC20)</div>
              <div className="crypto-item">TRX</div>
            </div>
          </div>
        </div>

        <div className="qr-payment-footer">
          <button 
            className="back-button"
            onClick={onClose}
          >
            Cancel Order
          </button>
          <button 
            className="confirm-button"
            onClick={onPaymentSuccess}
            disabled={isExpired}
          >
            {isExpired ? 'Session Expired' : 'I\'ve Paid'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRPayment;