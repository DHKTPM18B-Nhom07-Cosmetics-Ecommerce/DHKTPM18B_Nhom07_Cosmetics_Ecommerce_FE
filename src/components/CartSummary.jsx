import { Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CartSummary({ cartData }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200 sticky top-8">
      <h2 className="text-lg font-bold text-gray-900 mb-6">Hóa đơn của bạn</h2>

      {/* Order Details */}
      <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
        <div className="flex justify-between text-gray-700">
          <span>Tổnh tiền:</span>
          <span className="font-semibold">${cartData.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-700">
          <span>Phí ship:</span>
          <span className="font-semibold">${cartData.shippingFee.toFixed(2)}</span>
        </div>
      </div>

      {/* Total */}
      <div className="flex justify-between items-center mb-6">
        <span className="text-gray-900 font-bold">Tổng cộng:</span>
        <span className="text-2xl font-bold text-teal-600">${cartData.total.toFixed(2)}</span>
      </div>

      {/* Checkout Button */}
      <button
        onClick={() => navigate('/checkout')}
        className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-4 rounded-lg transition mb-4"
      >
        Thanh toán
      </button>

      {/* Secure Checkout Badge */}
      <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
        <Lock size={16} />
        <span>Secure Checkout</span>
      </div>
    </div>
  );
}
