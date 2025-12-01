import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Heart, ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";
import { getProductById, getProductVariants } from "../services/productService";
import { addToCart } from "../services/cartService"; // Import service Cart
import Breadcrumb from "../components/Breadcrumb";

// Format price to Vietnamese currency
const formatPrice = (price) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null); // Đây chính là selectedVariant
  const [activeTab, setActiveTab] = useState("mô tả"); // Sửa mặc định cho khớp key bên dưới
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState(null);
  const [productCategory, setProductCategory] = useState(null);
  const [thumbnailStartIndex, setThumbnailStartIndex] = useState(0);
  const [adding, setAdding] = useState(false); // Thêm state loading cho nút Add

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productData, variantsData] = await Promise.all([
          getProductById(id),
          getProductVariants(id),
        ]);

        setProduct(productData);
        setVariants(variantsData);

        if (productData.category) {
          setProductCategory(productData.category.name || productData.category);
        }

        if (productData.images && productData.images.length > 0) {
          setMainImage(productData.images[0]);
        }
        if (variantsData.length > 0) {
          setSelectedSize(variantsData[0]);
        }
      } catch (error) {
        console.error("Error fetching product details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  // Compute thumbnails... (Giữ nguyên logic của bạn)
  const displayImages = (() => {
    const productImgs = product?.images || [];

    // Collect all images from every variant (if present), preserving variant order
    const variantImgs = (variants || []).flatMap((v) => v.imageUrls || []);

    // Combine product images first, then variant images
    const combined = [...productImgs, ...variantImgs];

    // De-duplicate while preserving orde
    const seen = new Set();
    const unique = combined.filter((url) => {
      if (!url) return false;
      if (seen.has(url)) return false;
      seen.add(url);
      return true;
    });
    return unique;
  })();

  const imagesCount = displayImages.length;

  useEffect(() => {
    const maxStart = Math.max(0, imagesCount - 4);
    if (thumbnailStartIndex > maxStart) {
      setThumbnailStartIndex(maxStart);
    }
  }, [imagesCount, thumbnailStartIndex]);

  const visibleThumbnails = displayImages.slice(
    thumbnailStartIndex,
    thumbnailStartIndex + 4
  );

  const handleThumbnailPrev = () => {
    const currentIndex = displayImages.indexOf(mainImage);
    const newIndex = currentIndex > 0 ? currentIndex - 1 : imagesCount - 1;
    setMainImage(displayImages[newIndex]);
    const newStart = Math.max(0, Math.min(newIndex, imagesCount - 4));
    setThumbnailStartIndex(newStart);
  };

  const handleThumbnailNext = () => {
    const currentIndex = displayImages.indexOf(mainImage);
    const newIndex = currentIndex < imagesCount - 1 ? currentIndex + 1 : 0;
    setMainImage(displayImages[newIndex]);
    const newStart = Math.max(0, Math.min(newIndex, imagesCount - 4));
    setThumbnailStartIndex(newStart);
  };

  //  HÀM XỬ LÝ THÊM VÀO GIỎ  ---
  const handleAddToCart = async () => {
    // 1. Kiểm tra đăng nhập
    const userStored = localStorage.getItem('user');
    if (!userStored) {
      if (window.confirm("Bạn cần đăng nhập để mua hàng. Chuyển đến trang đăng nhập?")) {
        navigate('/login');
      }
      return;
    }

    // 2. Kiểm tra đã chọn size/phân loại chưa
    if (!selectedSize) {
      alert("Vui lòng chọn phân loại sản phẩm!");
      return;
    }

    // 3. Lấy dữ liệu cần thiết
    const user = JSON.parse(userStored);
    const accountId = user.id;
    const variantId = selectedSize.id; // ID của biến thể đang chọn

    try {
      setAdding(true);
      // 4. Gọi API
      await addToCart(accountId, variantId, quantity);
      
      // 5. Thông báo & Chuyển hướng
      // alert("Đã thêm vào giỏ hàng thành công!"); // Có thể bỏ alert nếu muốn chuyển trang luôn
      
      // CHUYỂN HƯỚNG SANG TRANG GIỎ HÀNG LUÔN
      navigate('/cart');
      
    } catch (error) {
      console.error(error);
      alert("Lỗi: Không thể thêm vào giỏ hàng.");
    } finally {
      setAdding(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-700"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <p className="text-xl text-gray-600">Product not found</p>
      </div>
    );
  }

  // Calculate price and stock
  const currentPrice = selectedSize
    ? selectedSize.price
    : variants.length > 0
    ? variants[0].price
    : 0;
  const currentStock = selectedSize ? selectedSize.quantity : 0;

  const handleSelectVariant = (variant) => {
    setSelectedSize(variant);
    const variantImage =
      variant.imageUrls && variant.imageUrls.length > 0
        ? variant.imageUrls[0]
        : null;

    if (variantImage) {
      setMainImage(variantImage);
    } else if (product?.images && product.images.length > 0) {
      setMainImage(product.images[0]);
    }
    setThumbnailStartIndex(0);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Breadcrumb category={productCategory} productName={product?.name} />

      <div className="max-w-7xl mx-auto w-full px-4 py-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Cột Trái: Ảnh */}
          <div>
            <div className="bg-blue-50 rounded-lg overflow-hidden mb-4 aspect-square flex items-center justify-center">
              <img
                src={mainImage || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleThumbnailPrev}
                className="flex-shrink-0 p-1 bg-white border border-gray-300 rounded hover:bg-[#2B6377] hover:text-white hover:border-[#2B6377] transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex gap-2 overflow-hidden flex-1">
                {visibleThumbnails.map((img, idx) => (
                  <button
                    key={thumbnailStartIndex + idx}
                    onClick={() => setMainImage(img)}
                    className={`w-20 h-20 rounded overflow-hidden border-2 transition flex-shrink-0 ${
                      mainImage === img
                        ? "border-[#2B6377]"
                        : "border-gray-300 hover:border-[#2B6377]"
                    }`}
                  >
                    <img
                      src={img || "/placeholder.svg"}
                      alt={`Thumbnail ${idx}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>

              <button
                onClick={handleThumbnailNext}
                className="flex-shrink-0 p-1 bg-white border border-gray-300 rounded hover:bg-[#2B6377] hover:text-white hover:border-[#2B6377] transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Cột Phải: Thông tin */}
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {product.name}
            </h1>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-1">
                {Array(Math.round(product.averageRating || 0))
                  .fill("⭐")
                  .join("")}
              </div>
              <span className="font-semibold text-[#2B6377]">
                {product.averageRating}
              </span>
              <span className="text-gray-600">(0 đánh giá)</span>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl font-bold text-[#2B6377]">
                {formatPrice(currentPrice)}
              </span>
            </div>

            <p className="text-gray-700 mb-6 leading-relaxed line-clamp-4">
              {product.description || ""}
            </p>

            {variants.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3">Phân loại:</h3>
                <div className="flex gap-3 flex-nowrap overflow-x-auto pb-2">
                  {variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => handleSelectVariant(variant)}
                      className={`flex flex-col items-start px-4 py-2 rounded-lg border-2 font-medium transition text-sm flex-shrink-0 ${
                        selectedSize && selectedSize.id === variant.id
                          ? "bg-[#2B6377] text-white border-[#2B6377]"
                          : "border-gray-300 text-gray-700 hover:border-[#2B6377] bg-white"
                      }`}
                    >
                      <span>{variant.variantName}</span>
                      <span className={`text-xs mt-1 ${
                        selectedSize && selectedSize.id === variant.id ? "text-gray-200" : "text-gray-500"
                      }`}>
                        {formatPrice(variant.price)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-3">Số lượng:</h3>
              <div className="flex items-center gap-3 w-fit">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-100 transition"
                >
                  −
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                     const val = Number(e.target.value);
                     if (val > 0) setQuantity(val);
                  }}
                  className="w-12 h-10 border border-gray-300 rounded text-center"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-100 transition"
                >
                  +
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">Kho: {currentStock}</p>
            </div>

            <div className="flex gap-3 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={adding}
                className={`flex-1 px-6 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2
                  ${adding 
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                    : "bg-[#2B6377] text-white hover:bg-[#1f4654]"
                  }`}
              >
                {adding ? (
                  <span>Đang xử lý...</span>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    Thêm vào giỏ
                  </>
                )}
              </button>
              
              <button className="flex-1 border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:border-[#2B6377] hover:text-[#2B6377] transition flex items-center justify-center gap-2">
                <Heart className="w-5 h-5" />
                Yêu thích
              </button>
            </div>
          </div>
        </div>

        {/* Tabs: Mô tả, Thành phần... */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="flex border-b">
            {["Mô tả", "Thành phần", "Cách sử dụng"].map((tab) => {
              const tabKey = tab.toLowerCase().replace(/\s/g, "");
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tabKey)}
                  className={`flex-1 py-4 font-medium transition ${
                    activeTab === tabKey
                      ? "border-b-2 border-teal-700 text-teal-700"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          <div className="p-6">
            {activeTab === "mô tả" && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Mô tả sản phẩm
                </h3>
                <p className="text-gray-700 whitespace-pre-line">{product.description}</p>
              </div>
            )}
            {activeTab === "thànhphần" && (
              <p className="text-gray-700">Thông tin thành phần đang cập nhật.</p>
            )}
            {activeTab === "cáchsửdụng" && (
              <p className="text-gray-700">Thông tin hướng dẫn sử dụng đang cập nhật.</p>
            )}
          </div>
        </div>

        {/* Reviews */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Đánh giá</h2>
          <p className="text-gray-600">Chưa có đánh giá nào.</p>
        </div>
      </div>
    </div>
  );
}