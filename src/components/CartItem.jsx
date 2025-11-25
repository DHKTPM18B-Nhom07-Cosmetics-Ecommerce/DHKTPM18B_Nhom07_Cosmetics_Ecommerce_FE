import { Trash2 } from 'lucide-react';

export default function CartItem({ item, onQuantityChange, onRemove }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 flex gap-6">
      
      {/* Ảnh sản phẩm */}
      <div className="w-28 h-28 rounded-lg bg-gray-100 overflow-hidden border">
        <img 
          src={item.productImage || "/placeholder.svg"} 
          alt={item.productName}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Thông tin */}
      <div className="flex-1 flex flex-col justify-between">

        <div>
          <h3 className="text-lg font-semibold text-gray-900">{item.productName}</h3>
          <p className="text-gray-600 text-sm mt-1">
            <span className="font-medium">Loại:</span> {item.size}
          </p>

          {/* Giá */}
          <div className="mt-3 flex items-center gap-3">
            <span className="line-through text-gray-400 text-sm">${item.originalPrice.toFixed(2)}</span>
            <span className="text-teal-600 font-bold text-xl">${item.salePrice.toFixed(2)}</span>
          </div>
        </div>

        {/* Quantity */}
        <div className="flex items-center gap-3 mt-5">
          <span className="text-sm text-gray-600">Số lượng:</span>

          <div className="flex items-center border rounded-lg">
            <button
              onClick={() => onQuantityChange(item.id, item.quantity - 1)}
              className="px-3 py-1 hover:bg-gray-100"
            >
              −
            </button>
            <span className="px-4 py-1 font-medium">{item.quantity}</span>
            <button
              onClick={() => onQuantityChange(item.id, item.quantity + 1)}
              className="px-3 py-1 hover:bg-gray-100"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Nút xóa */}
      <button
        onClick={() => onRemove(item.id)}
        className="text-gray-400 hover:text-red-500 self-start"
      >
        <Trash2 size={22} />
      </button>
    </div>
  );
}
