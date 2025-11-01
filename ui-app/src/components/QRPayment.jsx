import React from 'react';

const QRPayment = ({ finalTotal, onClose, onPaymentSuccess }) => {
  return (
    <div className="qr-payment-overlay">
      <div className="qr-payment-modal">
        <div className="qr-payment-header">
          <h2>CRYPTO PAYMENT</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        <div className="qr-payment-content">
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
              <div className="amount-value">${finalTotal.toFixed(2)}</div>
            </div>
            
            <div className="crypto-address">
              <div className="address-label">Wallet Address</div>
              <div className="address-value">
                0x742d35Cc6634C0532925a3b8D
                <button className="copy-button">Copy</button>
              </div>
            </div>

            <div className="payment-instructions">
              <h4>Payment Instructions:</h4>
              <ol>
                <li>Scan QR code with your crypto wallet</li>
                <li>Send exact amount: ${finalTotal.toFixed(2)}</li>
                <li>Wait for transaction confirmation</li>
                <li>Order will be processed automatically</li>
              </ol>
            </div>
          </div>

          <div className="supported-cryptos">
            <div className="section-title">Supported Cryptocurrencies</div>
            <div className="crypto-list">
              <div className="crypto-item">BTC</div>
              <div className="crypto-item">ETH</div>
              <div className="crypto-item">USDT</div>
              <div className="crypto-item">BNB</div>
              <div className="crypto-item">SOL</div>
            </div>
          </div>
        </div>

        <div className="qr-payment-footer">
          <button 
            className="back-button"
            onClick={onClose}
          >
            Back to Payment
          </button>
          <button 
            className="confirm-button"
            onClick={onPaymentSuccess}
          >
            I've Paid
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRPayment;