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

  // Lấy ảnh ưu tiên: product.images → variant.imageUrls → fallback
  const image =
    product.images?.[0] ||
    product.variants?.[0]?.imageUrls?.[0] ||
    "/placeholder.png";

  const brand =
    product?.brand?.name || product?.category?.name || "Thương hiệu";

  return (
    <div
      onClick={() => navigate(`/products/${product.id}`)}
      className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md hover:border-teal-600 hover:border-2 transition cursor-pointer group"
    >
      <div className="relative">
        <img
          src={image}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition duration-300"
        />

        <button className="absolute top-2 left-2 bg-blue-100 p-2 rounded-full hover:bg-blue-200 transition">
          <Heart className="w-4 h-4 text-red-500" />
        </button>
      </div>

      <div className="p-4">
        <p className="text-xs font-bold text-teal-700 uppercase mb-1">
          {brand}
        </p>

        <h3 className="font-semibold text-sm text-gray-800 mb-2 line-clamp-2 h-10">
          {product.name}
        </h3>

        <ProductRating
          rating={product.averageRating}
          reviewCount={product.reviews ? product.reviews.length : 0}
        />

        <div className="mt-3 text-lg font-bold text-red-700">
          {product.price ? formatPrice(product.price) : "Liên hệ"}
        </div>

        <button className="w-full bg-teal-700 text-white py-2 rounded-md font-medium text-sm hover:bg-teal-800 transition mt-3">
          Thêm vào giỏ
        </button>
      </div>
    </div>
  );
}
