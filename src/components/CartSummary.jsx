import { Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CartSummary({ cartData }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 sticky top-8">
      <h2 className="text-lg font-bold text-gray-900 mb-5">Hóa đơn</h2>

      <div className="space-y-4 border-b pb-5">
        <div className="flex justify-between">
          <span className="text-gray-600">Tổng tiền hàng:</span>
          <span className="font-semibold">${cartData.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Phí giao hàng:</span>
          <span className="font-semibold">${cartData.shippingFee.toFixed(2)}</span>
        </div>
      </div>

      <div className="flex justify-between items-center my-6">
        <span className="text-lg font-bold text-gray-900">Tổng cộng:</span>
        <span className="text-2xl font-bold text-teal-600">${cartData.total.toFixed(2)}</span>
      </div>

      <button
        onClick={() => navigate('/checkout')}
        className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-lg transition"
      >
        Thanh toán
      </button>

      <div className="flex justify-center items-center gap-2 mt-3 text-sm text-gray-500">
        <Lock size={16} />
        <span>Thanh toán an toàn</span>
      </div>
    </div>
  );
}
