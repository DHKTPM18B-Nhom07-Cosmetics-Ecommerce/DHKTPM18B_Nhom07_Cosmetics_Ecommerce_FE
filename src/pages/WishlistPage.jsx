import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ShoppingCart } from "lucide-react";
import { getWishlist, removeFromWishlist } from "../services/wishlistService";
import { toast } from "react-toastify";
import ProductRating from "../components/ProductRating";
import ConfirmModal from "../components/ConfirmModal";

export default function WishlistPage() {
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [productToRemove, setProductToRemove] = useState(null);

  const getAccountId = () => {
    const userStored = localStorage.getItem("user");
    if (!userStored) return null;
    try {
      const user = JSON.parse(userStored);
      return user.id;
    } catch (e) {
      return null;
    }
  };

  const accountId = getAccountId();

  useEffect(() => {
    if (!accountId) {
      toast.error("Vui lòng đăng nhập để xem danh sách yêu thích");
      navigate("/login");
      return;
    }
    loadWishlist();
  }, [accountId]);

  const loadWishlist = async () => {
    try {
      setLoading(true);
      const data = await getWishlist(accountId);
      setWishlistItems(data);
    } catch (error) {
      console.error("Lỗi khi tải wishlist:", error);
      toast.error("Không thể tải danh sách yêu thích");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = (productVariantId) => {
    setProductToRemove(productVariantId);
    setShowConfirmModal(true);
  };

  const confirmRemove = async () => {
    if (!productToRemove) return;

    try {
      await removeFromWishlist(accountId, productToRemove);
      toast.success("Đã xóa sản phẩm khỏi danh sách yêu thích");
      loadWishlist();
    } catch (error) {
      console.error("Lỗi khi xóa:", error);
      toast.error("Không thể xóa sản phẩm");
    } finally {
      setProductToRemove(null);
    }
  };

  const handleViewProduct = (productId, variantId) => {
    navigate(`/products/${productId}`, {
      state: { selectedVariantId: variantId }
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải danh sách yêu thích...</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <Heart className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Danh sách yêu thích trống
            </h2>
            <p className="text-gray-600 mb-8">
              Bạn chưa có sản phẩm yêu thích nào. Hãy khám phá và thêm sản phẩm
              bạn thích nhé!
            </p>
            <button
              onClick={() => navigate("/products")}
              className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition"
            >
              Khám phá sản phẩm
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Heart className="w-8 h-8 text-red-500" />
            Sản phẩm yêu thích
          </h1>
          <p className="text-gray-600 mt-2">
            Bạn có {wishlistItems.length} sản phẩm trong danh sách yêu thích
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((item) => {
            const getProductImage = () => {
              if (item.imageUrls?.length > 0) return item.imageUrls[0];
              if (item.product?.images?.length > 0) return item.product.images[0];
              if (item.product?.imageUrl) return item.product.imageUrl;
              return "/placeholder-product.jpg";
            };

            return (
              <div
                key={item.id}
                onClick={() => handleViewProduct(item.product.id, item.id)}
                className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md hover:border-teal-600 hover:border-2 transition cursor-pointer group flex flex-col h-full"
              >
                <div className="relative w-full overflow-hidden bg-gray-100">
                  <img
                    src={getProductImage()}
                    alt={item.product.name}
                    className="w-full aspect-square object-contain transition-all duration-500 group-hover:scale-105"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(item.id);
                    }}
                    className="absolute top-2 left-2 bg-white p-2 rounded-full hover:bg-red-50 transition shadow-md"
                    title="Xóa khỏi yêu thích"
                  >
                    <Heart className="w-4 h-4 text-red-500" fill="currentColor" />
                  </button>
                </div>

                <div className="p-4 gap-8">
                  <p className="text-xs font-bold text-teal-700 uppercase mb-1">
                    {item.product.brandName || item.product.categoryName || "Thương hiệu"}
                  </p>

                  <h3 className="font-semibold text-sm text-gray-800 mb-2 line-clamp-2 h-10">
                    {item.product.name}
                  </h3>

                  {item.variantName && (
                    <div className="mb-2">
                      <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full border border-gray-300">
                        {item.variantName}
                      </span>
                    </div>
                  )}

                  <div className="mb-3">
                    <ProductRating
                      rating={item.product.averageRating || 0}
                      soldCount={item.product.totalSold || 0}
                    />
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm font-bold text-red-700">
                      {item.price?.toLocaleString("vi-VN")}₫
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewProduct(item.product.id, item.id);
                    }}
                    className="w-full py-2 rounded-md font-medium text-sm transition flex items-center justify-center gap-2 bg-teal-700 text-white hover:bg-teal-800"
                  >
                    <ShoppingCart size={16} /> Xem chi tiết
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmRemove}
        title="Xác nhận xóa"
        message="Bạn có muốn xóa sản phẩm này khỏi danh sách yêu thích?"
      />
    </div>
  );
}
