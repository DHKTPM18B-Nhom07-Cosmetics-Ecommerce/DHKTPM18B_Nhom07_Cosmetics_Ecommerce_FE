import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ShoppingCart } from "lucide-react";
import ProductRating from "./ProductRating";
import { addToCart } from "../services/cartService";

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);

  // ---- FORMAT PRICE ----
  const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  // ---- GET BRAND ----
  const getBrand = () => {
    if (product.brandName) return product.brandName;
    if (product.categoryName) return product.categoryName;
    return "Thương hiệu";
  };

  // ---- TÍNH TỒN KHO: tổng quantity của tất cả variant ----
  const totalQty = product.variants?.reduce(
    (sum, v) => sum + (v.quantity || 0),
    0
  );

  // ---- BADGE TEXT ----
  const getStockStatus = () => {
    if (totalQty <= 0) return "Tạm hết hàng";
    if (totalQty <= 10) return "Sắp hết hàng";
    return "Còn hàng";
  };

  // ---- BADGE COLOR ----
  const getStockColor = () => {
    if (totalQty <= 0) return "bg-red-500 text-white"; // đỏ
    if (totalQty <= 10) return "bg-amber-400 text-white"; // vàng
    return "bg-[oklch(96.2%_0.044_156.743)] text-[oklch(39.8%_0.07_227.392)]"; // xanh lá
  };

  // ---- HANDLE ADD TO CART ----
  const handleAddToCart = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    const userStored = localStorage.getItem("user");
    if (!userStored) {
      if (
        window.confirm(
          "Bạn cần đăng nhập để mua hàng. Chuyển đến trang đăng nhập?"
        )
      ) {
        navigate("/login");
      }
      return;
    }

    const user = JSON.parse(userStored);
    const accountId = user.id;

    if (!product.variants?.length) {
      alert("Sản phẩm chưa có phân loại hoặc hết hàng.");
      return;
    }

    const variantId = product.variants[0].id;

    try {
      setAdding(true);
      await addToCart(accountId, variantId, 1);
      alert("Đã thêm vào giỏ!");
    } catch (err) {
      alert("Không thể thêm vào giỏ. Thử lại.");
    } finally {
      setAdding(false);
    }
  };

  // ---- HIỂN THỊ GIÁ ----
  const renderPrice = () => {
    if (!product.variants?.length) return "Liên hệ";

    const prices = product.variants.map((v) => v.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);

    if (min !== max) return `${formatPrice(min)} - ${formatPrice(max)}`;
    return formatPrice(min);
  };

  return (
    <div
      onClick={() => navigate(`/products/${product.id}`)}
      className="bg-white rounded-lg overflow-hidden shadow-sm 
      hover:shadow-md hover:border-teal-600 hover:border-2 transition cursor-pointer group flex flex-col h-full"
    >
      {/* IMAGE */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={product.images?.[0] || "/placeholder.png"}
          alt={product.name}
          className="w-full h-48 object-cover transition-all duration-500 
          group-hover:scale-105"
        />

        {/* like buttot  */}
        <button className="absolute top-2 left-2 bg-blue-100 p-2 rounded-full hover:bg-blue-200 transition">
          <Heart className="w-4 h-4 text-red-500" />
        </button>

        {/* STOCK BADGE góc phải – fade-in + bounce */}
        <div
          className={`
            absolute top-2 right-2 px-2 py-1 rounded-full text-[11px] font-semibold 
            shadow ${getStockColor()} animate-fadeBounce
          `}
        >
          {getStockStatus()}
        </div>
      </div>

      {/* INFO */}
      <div className="p-4 gap-8">
        <p className="text-xs font-bold text-teal-700 uppercase mb-1">
          {getBrand()}
        </p>

        <h3 className="font-semibold text-sm text-gray-800 mb-2 line-clamp-2 min-h-[40px]">
          {product.name}
        </h3>

        <div className="mb-3">
          <ProductRating
            rating={product.averageRating}
            reviewCount={product.reviews?.length || 0}
          />
        </div>

        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm font-bold text-red-700">
            {renderPrice()}
          </span>
        </div>

        {/* BUTTON ADD TO CART */}
        <button
          onClick={handleAddToCart}
          disabled={adding}
          className={`w-full py-2 rounded-md font-medium text-sm transition flex items-center justify-center gap-2
            ${
              adding
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-teal-700 text-white hover:bg-teal-800"
            }`}
        >
          {adding ? (
            "Đang thêm..."
          ) : (
            <>
              <ShoppingCart size={16} /> Thêm vào giỏ
            </>
          )}
        </button>
      </div>
    </div>
  );
}
