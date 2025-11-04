import React, { useEffect, useState } from 'react';

const QRPayment = ({ order, finalTotal, onClose, isPolling }) => {
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [isExpired, setIsExpired] = useState(false);
  const [showConfirmClose, setShowConfirmClose] = useState(false);

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
    alert('Copied to clipboard!');
  };

  const handleCloseClick = () => {
    setShowConfirmClose(true);
  };

  const handleConfirmClose = () => {
    setShowConfirmClose(false);
    onClose();
  };

  const handleCancelClose = () => {
    setShowConfirmClose(false);
  };

  if (!order) return null;

  return (
    <div className="qr-payment-overlay">
      <div className="qr-payment-modal">
        <div className="qr-payment-header">
          <h2>CRYPTO PAYMENT</h2>
          <button className="close-btn" onClick={handleCloseClick}>✕</button>
        </div>
        
        <div className="qr-payment-content">
          {/* Timer and Status */}
          <div className="payment-status">
            <div className={`timer ${isExpired ? 'expired' : 'active'}`}>
              Time remaining: {formatTime(timeLeft)}
            </div>
            {isPolling && (
              <div className="polling-status">
                🔍 Automatically checking payment status...
              </div>
            )}
            {isExpired && (
              <div className="expired-message">
                Payment session expired. Please create a new order.
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
              <div className="amount-value">{order.cryptoValue} USDT</div>
              <div className="amount-note">
                * Send <strong>exactly</strong> this amount for automatic confirmation
              </div>
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
              <h4>Payment Instructions:</h4>
              <ol>
                <li>Send <strong>exactly {order.cryptoValue} USDT</strong> to the address above</li>
                <li>Make sure to use <strong>TRC20 network</strong></li>
                <li>Wait for transaction confirmation (usually 2-3 minutes)</li>
                <li>Order will be confirmed automatically once payment is detected</li>
                <li><strong>Important:</strong> The decimal part ({order.cryptoValue.split('.')[1]}) is your order identifier</li>
              </ol>
            </div>
          </div>

          <div className="order-summary">
            <h4>Order Summary:</h4>
            <div className="order-number">Order #: {order.orderNumber}</div>
            {order.orderItems && order.orderItems.map((item, index) => (
              <div key={index} className="order-item-summary">
                {item.productName} × {item.quantity} - ${item.productPrice}
              </div>
            ))}
            <div className="order-total">Total: ${finalTotal}</div>
          </div>

          <div className="auto-check-notice">
            <p><strong>Automatic Confirmation:</strong> The system will automatically detect your payment and confirm the order using the unique amount {order.cryptoValue}.</p>
          </div>
        </div>

        <div className="qr-payment-footer">
          <button 
            className="close-button"
            onClick={handleCloseClick}
          >
            Close Payment
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmClose && (
        <div className="modal-overlay">
          <div className="confirmation-modal">
            <div className="confirmation-header">
              <h3>Cancel Payment?</h3>
            </div>
            <div className="confirmation-body">
              <p>Are you sure you want to cancel this payment?</p>
              <p className="warning-text">
                <strong>Warning:</strong> If you cancel, this order will not be processed and you'll need to create a new order to complete your purchase.
              </p>
            </div>
            <div className="confirmation-footer">
              <button 
                className="btn-secondary"
                onClick={handleCancelClose}
              >
                Continue Payment
              </button>
              <button 
                className="btn-primary"
                onClick={handleConfirmClose}
              >
                Yes, Cancel Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRPayment;