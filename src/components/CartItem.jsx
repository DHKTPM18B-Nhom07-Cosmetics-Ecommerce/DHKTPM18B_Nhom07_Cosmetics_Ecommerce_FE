import { Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatVND } from '../utils/priceUtils';

export default function CartItem({ item, onQuantityChange, onRemove, isUpdating }) {
  const navigate = useNavigate();
  const itemTotal = (item.salePrice || item.originalPrice) * item.quantity;

  const handleNavigateToProduct = () => {
    if (item.productId) {
      navigate(`/products/${item.productId}`);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 flex gap-6">
      
      {/* Ảnh sản phẩm */}
      <div 
        className="w-28 h-28 rounded-lg bg-gray-100 overflow-hidden border cursor-pointer hover:opacity-80 transition"
        onClick={handleNavigateToProduct}
      >
        <img 
          src={item.productImage || "/placeholder.svg"} 
          alt={item.productName}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Thông tin */}
      <div className="flex-1 flex flex-col justify-between">

        <div>
          <h3 
            className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-teal-600 transition"
            onClick={handleNavigateToProduct}
          >
            {item.productName}
          </h3>
          <p className="text-gray-600 text-sm mt-1">
            <span className="font-medium">Phân loại:</span> {item.size}
          </p>
        </div>

        {/* Quantity */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Quantity:</span>

            <div className="flex items-center border rounded-lg">
              <button
                onClick={() => onQuantityChange(item.id, item.quantity - 1)}
                disabled={isUpdating}
                className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                −
              </button>
              <span className="px-4 py-1 font-medium min-w-[40px] text-center">{item.quantity}</span>
              <button
                onClick={() => onQuantityChange(item.id, item.quantity + 1)}
                disabled={isUpdating}
                className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                +
              </button>
            </div>
          </div>

          {/* Giá bên phải */}
          <div className="flex flex-col items-end">
            {/* Đơn giá - nhỏ, gạch ngang và giá sale */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-teal-600 font-medium">{formatVND(item.originalPrice)}</span>
            </div>
            {/* Tổng tiền - to */}
            <div className="text-2xl font-bold text-teal-600 mt-1">
              {formatVND(itemTotal)}
            </div>
          </div>
        </div>
      </div>

      {/* Nút xóa */}
      <button
        onClick={() => onRemove(item.id)}
        disabled={isUpdating}
        className="text-gray-400 hover:text-red-500 self-start disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Trash2 size={22} />
      </button>
    </div>
  );
}
