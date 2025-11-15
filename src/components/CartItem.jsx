import { Trash2 } from 'lucide-react';

export default function CartItem({ item, onQuantityChange, onRemove }) {
  return (
    <div className="bg-white rounded-lg p-6 flex gap-6 shadow-sm border border-gray-200">
      {/* Product Image */}
      <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
        <img 
          src={item.productImage || "/placeholder.svg"} 
          alt={item.productName}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Product Details */}
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900 text-lg">{item.productName}</h3>
        <p className="text-sm text-gray-600 mt-1">
          <span className="font-medium">Phân loại:</span> {item.size}
        </p>

        {/* Price */}
        <div className="mt-3 flex items-center gap-3">
          <span className="text-gray-500 line-through text-sm">${item.originalPrice.toFixed(2)}</span>
          <span className="text-teal-600 font-bold text-lg">${item.salePrice.toFixed(2)}</span>
        </div>

        {/* Quantity Control */}
        <div className="mt-4 flex items-center gap-3">
          <span className="text-sm text-gray-600">Quantity:</span>
          <div className="flex items-center border border-gray-300 rounded">
            <button
              onClick={() => onQuantityChange(item.id, item.quantity - 1)}
              className="px-3 py-1 text-gray-600 hover:bg-gray-100"
            >
              −
            </button>
            <span className="px-4 py-1 font-medium">{item.quantity}</span>
            <button
              onClick={() => onQuantityChange(item.id, item.quantity + 1)}
              className="px-3 py-1 text-gray-600 hover:bg-gray-100"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Delete Button */}
      <button
        onClick={() => onRemove(item.id)}
        className="self-start text-gray-400 hover:text-red-500 transition"
        title="Remove from cart"
      >
        <Trash2 size={20} />
      </button>
    </div>
  );
}
