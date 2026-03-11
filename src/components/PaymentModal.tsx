import { useState } from 'react';
import { X, CreditCard } from 'lucide-react';
import { api, Product, CardDetails } from '../services/api';

interface PaymentModalProps {
  product: Product;
  onClose: () => void;
  onPaymentComplete: () => void;
}

export function PaymentModal({ product, onClose, onPaymentComplete }: PaymentModalProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!cardNumber || !expiry || !cvv) {
      alert('Please fill all card details');
      return;
    }

    setLoading(true);
    try {
      const cardDetails: CardDetails = {
        cardNumber,
        expiry,
        cvv,
      };

      await api.processPayment(product.id, cardDetails);
      alert('Payment processing started. Please complete OTP verification in the browser.');
      onPaymentComplete();
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Error processing payment');
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = product.price_breakdown?.total?.replace(/[^\d]/g, '') || '0';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-light text-gray-900">Complete Payment</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Product Details</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-base font-medium text-gray-900">{product.product_name}</p>
                  <p className="text-sm text-gray-500 mt-1">Account: {product.accounts?.name}</p>
                </div>
              </div>

              {product.price_breakdown && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Price Breakdown</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">MRP</span>
                      <span className="font-medium text-gray-900">
                        {product.price_breakdown.mrp}
                      </span>
                    </div>

                    {product.price_breakdown.fees && product.price_breakdown.fees.length > 0 && (
                      <>
                        {product.price_breakdown.fees.map((fee, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-gray-600">{fee.name}</span>
                            <span className="font-medium text-gray-900">₹{fee.amount}</span>
                          </div>
                        ))}
                      </>
                    )}

                    {product.price_breakdown.discounts &&
                      product.price_breakdown.discounts.length > 0 && (
                        <>
                          {product.price_breakdown.discounts.map((discount, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span className="text-green-600">{discount.name}</span>
                              <span className="font-medium text-green-600">
                                -₹{discount.amount}
                              </span>
                            </div>
                          ))}
                        </>
                      )}

                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex justify-between">
                        <span className="text-base font-semibold text-gray-900">Total Amount</span>
                        <span className="text-xl font-bold text-gray-900">
                          {product.price_breakdown.total}
                        </span>
                      </div>
                    </div>

                    {product.price_breakdown.discountOffer && (
                      <div className="pt-2 border-t border-gray-200">
                        <p className="text-xs text-green-600">
                          {product.price_breakdown.discountOffer}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Card Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Card Number</label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    maxLength={19}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Expiry Date</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      maxLength={5}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-2">CVV</label>
                    <input
                      type="text"
                      placeholder="123"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      maxLength={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={handlePayment}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gray-900 text-white text-base font-medium rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50"
                  >
                    <CreditCard size={20} />
                    Pay ₹{totalAmount}
                  </button>
                </div>

                <p className="text-xs text-gray-500 text-center">
                  Card details are not stored and are only used for this transaction
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
