import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import ProductRating from "./ProductRating";

export default function ProductCard({ product }) {
  const navigate = useNavigate();

  const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  const image =
    product.images?.[0] ||
    product.variants?.[0]?.imageUrls?.[0] ||
    "/placeholder.png";

  const inStock = product.inStock;
  const lowStock = product.lowStock;

  const min = product.minPrice || 0;
  const max = product.maxPrice || 0;

  const priceLabel =
    min === max
      ? formatPrice(min)
      : `${formatPrice(min)} - ${formatPrice(max)}`;

  return (
    <div
      onClick={() => navigate(`/products/${product.id}`)}
      className="bg-white rounded-xl shadow-sm border border-transparent 
                 hover:border-teal-600 transition-all cursor-pointer flex flex-col"
    >
      {/* IMAGE */}
      <div className="relative w-full h-48 overflow-hidden">
        <img
          src={image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Badge */}
        <span
          className={`absolute top-2 right-2 text-xs px-2 py-1 rounded-md font-semibold ${
            inStock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {inStock ? "Còn hàng" : "Hết hàng"}
        </span>

        {/* Badge Low stock */}
        {lowStock && inStock && (
          <span className="absolute top-10 right-2 text-xs px-2 py-1 rounded-md font-semibold bg-yellow-100 text-yellow-700">
            Sắp hết hàng
          </span>
        )}

        {/* Heart */}
        <button
          onClick={(e) => e.stopPropagation()}
          className="absolute top-2 left-2 bg-white/80 backdrop-blur p-2 rounded-full hover:bg-white transition"
        >
          <Heart className="w-4 h-4 text-red-500" />
        </button>
      </div>

      {/* CONTENT */}
      <div className="flex flex-col flex-grow p-4">
        <p className="text-xs font-bold text-teal-700 uppercase mb-1">
          {product.brandName}
        </p>

        <h3 className="font-semibold text-sm text-gray-800 line-clamp-2 h-[40px]">
          {product.name}
        </h3>

        <ProductRating
          rating={product.averageRating}
          reviewCount={product.reviews?.length || 0}
        />

        <div className="mt-2 mb-3 text-lg font-bold text-red-700 whitespace-nowrap overflow-hidden text-ellipsis">
          {priceLabel}
        </div>

        <button
          disabled={!inStock}
          onClick={(e) => e.stopPropagation()}
          className={`w-full mt-auto py-2 rounded-md font-semibold text-sm transition
            ${
              inStock
                ? "bg-teal-700 hover:bg-teal-800 text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }
          `}
        >
          {inStock ? "Thêm vào giỏ" : "Hết hàng"}
        </button>
      </div>
    </div>
  );
}
