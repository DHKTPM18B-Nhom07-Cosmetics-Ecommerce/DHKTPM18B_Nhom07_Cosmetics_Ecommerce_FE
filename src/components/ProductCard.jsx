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

  // flag hết hàng dùng chung
  const isOutOfStock = totalQty <= 0;

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

  // ---- ADD TO CART ----
  const handleAddToCart = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    // nếu hết hàng thì dừng luôn, không gọi API
    if (isOutOfStock) {
      alert("Sản phẩm đã hết hàng");
      return;
    }

    // 1. Lấy thông tin User (để kiểm tra xem là Khách hay User)
    const userStored = localStorage.getItem("user");

    // 2. Xác định Account ID (Nếu khách vãng lai thì là null)
    let accountId = null;
    if (userStored) {
      const user = JSON.parse(userStored);
      accountId = user.id;
    }

    // 3. Kiểm tra biến thể
    if (!product.variants || product.variants.length === 0) {
      alert("Sản phẩm này tạm hết hàng hoặc chưa có phân loại!");
      return;
    }

    // chỉ lấy variant còn hàng
    const availableVariant = product.variants.find(
      (v) => (v.quantity || 0) > 0
    );

    if (!availableVariant) {
      alert("Sản phẩm đã hết hàng");
      return;
    }

    const defaultVariantId = availableVariant.id;

    // Chuẩn bị thông tin phụ trợ cho Khách Vãng Lai (để lưu vào SessionStorage)
    const productInfoForGuest = {
      productId: product.id,
      productName: product.name,
      sizeName: availableVariant.variantName,
      price: availableVariant.price,
      image: (product.images && product.images[0]) || "/placeholder.svg",
    };

    // 4. GỌI API
    try {
      setAdding(true);
      await addToCart(accountId, defaultVariantId, 1, productInfoForGuest);

      alert("Đã thêm vào giỏ hàng thành công!");
    } catch (error) {
      console.error(error);
      alert("Lỗi: Không thể thêm vào giỏ hàng.");
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
      <div className="relative w-full overflow-hidden bg-gray-100">
        <img
          src={
            product.images && product.images.length > 0
              ? product.images[0]
              : "/placeholder.svg"
          }
          alt={product.name}
          className={`w-full aspect-square object-contain transition-all duration-500 ${
            product.images && product.images.length > 1
              ? "group-hover:opacity-0"
              : "group-hover:scale-105"
          }`}
        />
        {product.images && product.images.length > 1 && (
          <img
            src={product.images[1]}
            alt={product.name}
            className="absolute inset-0 w-full aspect-square object-contain opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
          />
        )}
        {/* Like Button */}
        <button className="absolute top-2 left-2 bg-white/80 backdrop-blur-sm p-2 rounded-full hover:bg-white transition">
          <Heart className="w-4 h-4 text-red-500" />
        </button>
        {/* Stock Badge */}
        <div
          className={`absolute top-2 right-2 px-2 py-1 rounded-full text-[11px] font-semibold 
                shadow ${getStockColor()} animate-fadeBounce`}
        >
          {getStockStatus()}
        </div>
      </div>

      {/* INFO */}
      <div className="p-4 gap-8">
        <p className="text-xs font-bold text-teal-700 uppercase mb-1">
          {getBrand()}
        </p>
        <h3 className="font-semibold text-sm text-gray-800 mb-2 line-clamp-2 h-10">
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

        {/* NÚT THÊM VÀO GIỎ – KHÓA KHI HẾT HÀNG */}
        <button
          onClick={handleAddToCart}
          disabled={adding || isOutOfStock}
          className={`w-full py-2 rounded-md font-medium text-sm transition flex items-center justify-center gap-2
            ${
              adding || isOutOfStock
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-teal-700 text-white hover:bg-teal-800"
            }`}
        >
          {adding ? (
            "Đang thêm..."
          ) : isOutOfStock ? (
            "Hết hàng"
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
