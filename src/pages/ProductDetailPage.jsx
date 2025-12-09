import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Heart, ShoppingCart } from "lucide-react";
import { getProductById, getProductVariants } from "../services/productService";
import { addToCart } from "../services/cartService"; // Import service Cart
import { filterProducts } from "../services/productFilterApi";
import { getAllReviews } from "../services/reviewService";
import { getCustomerById } from "../services/customerService";
import Breadcrumb from "../components/Breadcrumb";
import ProductImageCarousel from "../components/ProductImageCarousel";
import { addToWishlist, removeFromWishlist, checkInWishlist } from "../services/wishlistService"; // Import wishlist service
import ConfirmModal from "../components/ConfirmModal";
import { toast } from "react-toastify";
// Format price to Vietnamese currency
const formatPrice = (price) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

// Format sold count (e.g., 1600 -> 1,6k)
const formatSold = (count) => {
  if (!count) return "0";
  if (count < 1000) return count;
  return (count / 1000).toLocaleString('vi-VN', { maximumFractionDigits: 1 }) + "k";
};

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null); // Đây chính là selectedVariant
  const [isExpanded, setIsExpanded] = useState(false);
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productCategory, setProductCategory] = useState(null);
  const [adding, setAdding] = useState(false); // Thêm state loading cho nút Add
const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  // Reviews State
  const [reviews, setReviews] = useState([]);
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' | 'oldest'
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', '5', '4', '3', '2', '1', 'recent'
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
  const [reviewStats, setReviewStats] = useState({
    average: 0,
    total: 0,
    counts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  });

  const descriptionRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productData, variantsData] = await Promise.all([
          getProductById(id),
          getProductVariants(id),
        ]);

        let reviewsData = [];
        try {
          const allReviews = await getAllReviews();
          reviewsData = allReviews.filter(r => r.product && r.product.id === Number(id));
        } catch (error) {
          console.error("Error fetching reviews:", error);
          // reviewsData remains []
        }

        setProduct(productData);

        setVariants(variantsData);

        // Process Reviews
        const reviewsRaw = Array.isArray(reviewsData) ? reviewsData : (reviewsData.content || []);

        // Filter by current product ID (frontend workaround)
        const filteredReviews = reviewsRaw.filter(r => r.product && r.product.id === Number(id));

        // Fetch user names
        const reviewsWithNames = await Promise.all(filteredReviews.map(async (review) => {
          let userName = review.userName || "Người dùng ẩn danh";
          // If review has customer object or ID, try to fetch name
          if (review.customer && review.customer.id) {
            try {
              const customerData = await getCustomerById(review.customer.id);
              // Try to get fullName from Account if possible, otherwise rely on naming convention
              // Based on Customer model, it has Account. Account has fullName.
              if (customerData && customerData.account && customerData.account.fullName) {
                userName = customerData.account.fullName;
              }
            } catch (e) {
              console.error("Failed to fetch customer name for review", review.id);
            }
          }
          return { ...review, displayName: userName };
        }));

        setReviews(reviewsWithNames);

        if (reviewsWithNames.length > 0) {
          const total = reviewsWithNames.length;
          const sum = reviewsWithNames.reduce((acc, r) => acc + (r.rating || 0), 0);
          const average = (sum / total).toFixed(1);

          const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
          reviewsWithNames.forEach(r => {
            const rating = Math.round(r.rating || 0);
            if (counts[rating] !== undefined) counts[rating]++;
          });

          setReviewStats({ average, total, counts });
        } else {
          setReviewStats({
            average: 0,
            total: 0,
            counts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
          });
        }

        if (productData.category) {
          setProductCategory(productData.category.name || productData.category);
        }

        // Fetch related products by brand
        if (productData.brand) {
          const brandId = productData.brand.id || productData.brand;
          try {
            // Filter by brand, exclude current product (handled in UI or acceptable to show)
            const res = await filterProducts({
              brands: brandId,
              size: 6, // Fetch a few to show
              page: 0
            });
            // Filter out current product if present in result
            const related = (res.content || []).filter(p => p.id !== Number(id));
            setRelatedProducts(related.slice(0, 5));
          } catch (err) {
            console.error("Error fetching related products", err);
          }
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

  // Compute thumbnails
  const displayImages = (() => {
    const productImgs = product?.images || [];

    // Collect all images from every variant (if present), preserving variant order
    const variantImgs = (variants || []).flatMap((v) => v.imageUrls || []);

    // Combine product images first, then variant images
    const combined = [...productImgs, ...variantImgs];

    // De-duplicate while preserving order
    const seen = new Set();
    const unique = combined.filter((url) => {
      if (!url) return false;
      if (seen.has(url)) return false;
      seen.add(url);
      return true;
    });
    return unique;
  })();

  // Helper to render stars with partial fill
  const renderStars = (rating) => {
    return (
      <div className="flex items-center">
        {[0, 1, 2, 3, 4].map((index) => {
          let fillPercentage = 0;
          if (rating >= index + 1) {
            fillPercentage = 100;
          } else if (rating > index) {
            fillPercentage = (rating - index) * 100;
          }

          return (
            <div key={index} className="relative inline-block text-lg">
              {/* Background Star (Gray) */}
              <span className="text-gray-300">★</span>

              {/* Foreground Star (Colored) - Clipped */}
              <div
                className="absolute top-0 left-0 overflow-hidden text-[#2B6377] whitespace-nowrap"
                style={{ width: `${fillPercentage}%` }}
              >
                <span>★</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  //  HÀM XỬ LÝ THÊM VÀO GIỎ  ---
  const handleAddToCart = async () => {
    // 2. Kiểm tra đã chọn size/phân loại chưa
    if (!selectedSize) {
      alert("Vui lòng chọn phân loại sản phẩm!");
      return;
    }

    // 3. Lấy dữ liệu cần thiết
    const userStored = localStorage.getItem('user');
    let accountId = null;
    if (userStored) {
      const user = JSON.parse(userStored);
      accountId = user.id;
    }

    const variantId = selectedSize.id; // ID của biến thể đang chọn

    // Chuẩn bị thông tin cho khách vãng lai
    const productInfoForGuest = {
      productId: product.id,
      productName: product.name,
      sizeName: selectedSize.variantName,
      price: selectedSize.price,
      image: displayImages[0] || product.images?.[0] || "/placeholder.svg"
    };

    try {
      setAdding(true);
      // 4. Gọi API
      await addToCart(accountId, variantId, quantity, productInfoForGuest);

      // 5. Thông báo & Chuyển hướng
      // CHUYỂN HƯỚNG SANG TRANG GIỎ HÀNG LUÔN
      navigate("/cart");
    } catch (error) {
      console.error(error);
      alert("Lỗi: Không thể thêm vào giỏ hàng.");
    } finally {
      setAdding(false);
    }
  };
// Kiểm tra variant có trong wishlist không
  const checkWishlistStatus = async (variantId) => {
    if (!accountId || !variantId) return;
    try {
      const inWishlist = await checkInWishlist(accountId, variantId);
      setIsInWishlist(inWishlist);
    } catch (error) {
      console.error("Lỗi kiểm tra wishlist:", error);
    }
  };
  // Chọn variant và kiểm tra wishlist
  const handleSelectVariant = (variant) => {
    setSelectedSize(variant);
    if (accountId) {
      checkWishlistStatus(variant.id);
    }
  };

  // Thêm/xóa sản phẩm khỏi wishlist
  const handleToggleWishlist = async () => {
    if (!accountId) {
      toast.error("Vui lòng đăng nhập để sử dụng tính năng này");
      navigate("/login");
      return;
    }

    if (!selectedSize) {
      toast.warning("Vui lòng chọn phân loại sản phẩm trước");
      return;
    }

    try {
      setWishlistLoading(true);
      
      if (isInWishlist) {
        setShowConfirmModal(true);
        setWishlistLoading(false);
        return;
      } else {
        await addToWishlist(accountId, selectedSize.id);
        setIsInWishlist(true);
        toast.success("Đã thêm vào danh sách yêu thích");
      }
    } catch (error) {
      console.error("Lỗi wishlist:", error);
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setWishlistLoading(false);
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
  const totalStock = variants.length > 0
    ? variants.reduce((sum, v) => sum + (v.quantity || 0), 0)
    : (product.quantity || 0);

  const currentStock = selectedSize ? selectedSize.quantity : totalStock;
  const currentSold = selectedSize ? (selectedSize.sold || 0) : (product?.totalSold || 0);



  return (
    <div className="min-h-screen flex flex-col bg-gray-100 gap-4">
      <Breadcrumb category={productCategory} productName={product?.name} />

      <div className="max-w-7xl mx-auto w-full px-2 py-2 flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 flex flex-col gap-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className=" grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <ProductImageCarousel
                  images={displayImages}
                  selectedVariant={selectedSize}
                />
              </div>

              <div>
                <h1 className="text-lg font-bold text-gray-800 mb-2">
                  {product.name}
                </h1>

                {/* Stock Status Badge */}
                {(() => {
                  const overallStock = variants.length > 0
                    ? variants.reduce((sum, v) => sum + (v.quantity || 0), 0)
                    : (product.quantity || 0);

                  if (overallStock === 0) {
                    return <div className="text-red-600 font-bold mb-2 uppercase text-sm">(Tạm hết hàng)</div>;
                  } else if (overallStock <= 10) {
                    return <div className="text-orange-500 font-bold mb-2 uppercase text-sm">(Sắp hết hàng)</div>;
                  }
                  return null;
                })()}

                {(product.brandName || (product.brand && product.brand.name)) && (
                  <div
                    onClick={() => navigate(`/products?search=${encodeURIComponent(product.brandName || product.brand.name || '')}`)}
                    className="text-sm text-[#2B6377] font-bold mb-4 cursor-pointer hover:underline uppercase w-fit"
                  >
                    {product.brandName || (product.brand && product.brand.name)}
                  </div>
                )}

                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2 text-sm text-[#2B6377]">
                    {renderStars(product.averageRating || 0)}
                    <span className="border-r border-gray-300 pr-2 mr-2 text-gray-600">
                      ({reviewStats.total} đánh giá)
                    </span>
                    <span className="border-r border-gray-300 pr-2 mr-2 text-gray-600">
                      Chưa có hỏi đáp
                    </span>
                    <span className="text-gray-600">
                      {formatSold(currentSold)} Đã bán
                    </span>
                  </div>
                  <button 
                  onClick={handleToggleWishlist}
                  disabled={wishlistLoading}
                  className={`transition ${
                    isInWishlist 
                      ? "text-red-500" 
                      : "text-gray-400 hover:text-red-500"
                  } ${wishlistLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                  title={isInWishlist ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
                >
                  <Heart 
                    className="w-6 h-6" 
                    fill={isInWishlist ? "currentColor" : "none"}
                  />
                </button>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-3xl font-bold text-red-700">
                      {formatPrice(currentPrice)}
                    </span>
                  </div>

                  {variants.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-800 mb-3">
                        Phân loại:
                      </h3>
                      <div className="flex gap-2 flex-wrap">
                        {variants.map((variant) => {
                          const variantImage =
                            variant.imageUrls && variant.imageUrls.length > 0
                              ? variant.imageUrls[0]
                              : null;

                          return (
                            <button
                              key={variant.id}
                              onClick={() => handleSelectVariant(variant)}
                              className={`flex items-center gap-2 p-1 rounded-lg border-2 font-medium transition text-xs ${selectedSize && selectedSize.id === variant.id
                                ? "bg-[#2B6377] text-white border-[#2B6377]"
                                : "border-gray-300 text-gray-700 hover:border-[#2B6377] bg-white"
                                }`}
                            >
                              {variantImage && (
                                <img
                                  src={variantImage}
                                  alt={variant.variantName}
                                  className="w-8 h-8 object-contain rounded-sm"
                                />
                              )}
                              <div className="text-left pr-1">
                                <div className="font-semibold text-xs">
                                  {variant.variantName}
                                </div>
                                <div
                                  className={`text-[10px] ${selectedSize && selectedSize.id === variant.id
                                    ? "text-white"
                                    : "text-gray-600"
                                    }`}
                                >
                                  {formatPrice(variant.price)}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-800 mb-3">
                      Số lượng:
                    </h3>
                    <div className="flex items-center gap-3 w-fit">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={currentStock === 0}
                        className={`w-8 h-8 border border-gray-300 rounded flex items-center justify-center transition bg-white ${currentStock === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(Math.max(1, Number(e.target.value) || 1))
                        }
                        min="1"
                        disabled={currentStock === 0}
                        className={`w-10 h-8 border border-gray-300 rounded text-center bg-white no-spinner text-sm ${currentStock === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                      />
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        disabled={currentStock === 0}
                        className={`w-8 h-8 border border-gray-300 rounded flex items-center justify-center transition bg-white ${currentStock === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
                      >
                        +
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Kho: {currentStock}
                      {currentStock === 0 ? (
                        <span className="text-red-500 ml-1 font-medium">(Tạm hết hàng)</span>
                      ) : currentStock <= 10 ? (
                        <span className="text-orange-500 ml-1 font-medium">(Số lượng hàng trong kho thấp)</span>
                      ) : null}
                    </p>
                  </div>

                  <div className="flex gap-2 mt-6">
                    {currentStock === 0 ? (
                      <button
                        disabled
                        className="flex-1 px-4 py-2.5 rounded-lg font-bold bg-gray-300 text-gray-500 cursor-not-allowed border border-gray-300 h-12 text-sm uppercase"
                      >
                        Tạm hết hàng
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={handleAddToCart}
                          disabled={adding}
                          className={`flex-1 px-2 py-2.5 rounded-lg font-bold transition flex items-center justify-center gap-2 h-12 whitespace-nowrap
                          ${adding
                              ? "bg-gray-300 text-gray-500 cursor-not-allowed border border-gray-300"
                              : "text-[#2B6377] font-semibold border border-[#2B6377] rounded-lg hover:bg-[#2B6377] hover:text-white transition"
                            }`}
                        >
                          {adding ? (
                            <span>Processing...</span>
                          ) : (
                            <>
                              <ShoppingCart className="w-5 h-5" />
                              <span className="text-sm">Thêm vào giỏ</span>
                            </>
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm overflow-hidden" ref={descriptionRef}>
            <div className="flex border-b px-6">
              <button
                onClick={() => {
                  if (descriptionRef.current) {
                    descriptionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className="py-4 font-medium text-[#2B6377] border-b-2 border-[#2B6377]"
              >
                Thông tin sản phẩm
              </button>
            </div>

            <div className="p-6">
              <div className="relative">
                <div
                  className={`text-gray-700 whitespace-pre-line transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-[150px] opacity-100'
                    }`}
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />

                {!isExpanded && (
                  <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-white to-transparent" />
                )}
              </div>

              <div className="text-center mt-4">
                <button
                  onClick={() => {
                    setIsExpanded(!isExpanded);
                  }}
                  className="mx-auto border border-[#2B6377] text-[#2B6377] px-8 py-2 rounded-[4px] font-semibold hover:bg-[#2B6377] hover:text-white transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  {isExpanded ? (
                    <>Thu gọn </>
                  ) : (
                    <>Xem thêm </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Đánh giá sản phẩm</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">Sắp xếp:</span>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="border border-gray-300 rounded-md text-sm px-2 py-1 focus:outline-none focus:border-[#2B6377]"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="oldest">Cũ nhất</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
              {/* Rating Summary Box */}
              <div className="flex flex-col items-center justify-center p-6 bg-yellow-50/50 rounded-xl border border-yellow-100 min-w-[200px]">
                <div className="text-5xl font-bold text-yellow-500 mb-2">
                  {reviewStats.average}
                </div>
                <div className="flex gap-1 mb-2 text-yellow-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className="text-2xl">
                      {star <= Math.round(reviewStats.average) ? "★" : "☆"}
                    </span>
                  ))}
                </div>
                <p className="text-gray-500 font-medium">{reviewStats.total} đánh giá</p>
              </div>

              {/* Rating Bars */}
              <div className="flex-1 w-full max-w-md">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = reviewStats.counts[star];
                  const percent = reviewStats.total > 0 ? (count / reviewStats.total) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-3 mb-2 last:mb-0">
                      <span className="text-sm font-bold text-gray-600 w-3">{star}</span>
                      <span className="text-yellow-400 text-sm">★</span>
                      <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400 rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-8 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              {[
                { label: 'Tất cả', value: 'all', count: reviewStats.total },
                { label: '5 Sao', value: '5', count: reviewStats.counts[5] },
                { label: '4 Sao', value: '4', count: reviewStats.counts[4] },
                { label: '3 Sao', value: '3', count: reviewStats.counts[3] },
                { label: '2 Sao', value: '2', count: reviewStats.counts[2] },
                { label: '1 Sao', value: '1', count: reviewStats.counts[1] },
                {
                  label: 'Gần đây', value: 'recent', count: reviews.filter(r => {
                    const date = new Date(r.reviewDate || r.createdAt || 0);
                    const sevenDaysAgo = new Date();
                    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                    return date >= sevenDaysAgo;
                  }).length
                }
              ].map(filter => (
                <button
                  key={filter.value}
                  onClick={() => setActiveFilter(filter.value)}
                  className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${activeFilter === filter.value
                    ? 'bg-[#2B6377] text-white border-[#2B6377]'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-[#2B6377] hover:text-[#2B6377]'
                    }`}
                >
                  {filter.label} ({filter.count})
                </button>
              ))}
            </div>

            {/* Review List */}
            <div className="space-y-6">
              {reviews
                .filter(review => {
                  if (activeFilter === 'all') return true;
                  if (activeFilter === 'recent') {
                    const date = new Date(review.reviewDate || review.createdAt || 0);
                    const sevenDaysAgo = new Date();
                    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                    return date >= sevenDaysAgo;
                  }
                  return Math.round(review.rating) === parseInt(activeFilter);
                }).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center bg-gray-50 rounded-lg">
                  <img
                    src="/empty_review_star.png"
                    alt="No reviews"
                    className="w-32 h-32 object-contain mb-4 opacity-80"
                  />
                  <p className="text-gray-500 text-lg font-medium">
                    {activeFilter === 'all'
                      ? "Chưa có đánh giá nào cho sản phẩm này."
                      : `Sản phẩm này chưa có đánh giá ${{
                        '5': 'Tuyệt vời',
                        '4': 'Hài lòng',
                        '3': 'Bình thường',
                        '2': 'Không hài lòng',
                        '1': 'Rất tệ',
                        'recent': 'Gần đây'
                      }[activeFilter] || ''
                      }`}
                  </p>
                </div>
              ) : (
                reviews
                  .filter(review => {
                    if (activeFilter === 'all') return true;
                    if (activeFilter === 'recent') {
                      const date = new Date(review.reviewDate || review.createdAt || 0);
                      const sevenDaysAgo = new Date();
                      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                      return date >= sevenDaysAgo;
                    }
                    return Math.round(review.rating) === parseInt(activeFilter);
                  })
                  .sort((a, b) => {
                    const dateA = new Date(a.reviewDate || a.createdAt || 0);
                    const dateB = new Date(b.reviewDate || b.createdAt || 0);
                    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
                  })
                  .map((review) => (
                    <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-lg shrink-0">
                          {review.displayName ? review.displayName.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-bold text-gray-900">
                              {review.displayName}
                            </h4>
                            <span className="text-xs text-gray-400">
                              {review.reviewDate ? new Date(review.reviewDate).toLocaleDateString("vi-VN") : (review.createdAt ? new Date(review.createdAt).toLocaleDateString("vi-VN") : "")}
                            </span>
                          </div>
                          <div className="flex text-yellow-400 text-sm mb-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span key={star}>
                                {star <= review.rating ? "★" : "☆"}
                              </span>
                            ))}
                          </div>
                          <p className="text-gray-700 leading-relaxed">
                            {review.comment}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-4 sticky top-4">
            <h3 className="text-lg text-center font-bold text-[#2B6377] mb-4 border-b border-gray-100 pb-2">
              Sản phẩm cùng thương hiệu
            </h3>
            <div className="flex flex-col gap-4">
              {relatedProducts.length === 0 ? (
                <p className="text-gray-500 text-sm">Chưa có sản phẩm liên quan.</p>
              ) : (
                <>
                  {relatedProducts.map((rel) => {
                    const productImg = rel.imageUrls && rel.imageUrls.length > 0 ? rel.imageUrls[0] : null;
                    const variantImg = rel.variants && rel.variants.length > 0 && rel.variants[0].imageUrls && rel.variants[0].imageUrls.length > 0
                      ? rel.variants[0].imageUrls[0]
                      : null;
                    const displayImg = productImg || variantImg || "https://placehold.co/64";

                    // Try to get category name from object or direct property
                    const categoryName = rel.categoryName || (rel.category ? (rel.category.name || rel.category) : "");

                    // Try to get brand name from object or direct property
                    const brandName = rel.brandName || (rel.brand ? (rel.brand.name || rel.brand) : "");

                    const minPrice = rel.minPrice || rel.price || 0;

                    return (
                      <div
                        key={rel.id}
                        onClick={() => navigate(`/products/${rel.id}`)}
                        className="flex gap-3 cursor-pointer group hover:bg-teal-50 hover:border-[#2B6377] border-2 border-white p-2 rounded-lg transition"
                      >
                        <div className="w-16 h-16 shrink-0 border border-gray-200 rounded-md overflow-hidden bg-white">
                          <img src={displayImg} alt={rel.name} className="w-full h-full object-contain group-hover:scale-105 transition duration-300" />
                        </div>
                        <div className="flex flex-col justify-center">
                          <h4 className="text-sm font-medium text-gray-800 line-clamp-2 group-hover:text-[#2B6377] transition leading-snug">
                            {rel.name}
                          </h4>
                          {brandName && (
                            <span className="text-xs text-[#2B6377] font-medium mt-1">{brandName}</span>
                          )}
                          {!brandName && categoryName && (
                            <span className="text-xs text-gray-500 mt-1">{categoryName}</span>
                          )}
                          <span className="text-red-700 font-bold text-sm mt-1">
                            {formatPrice(minPrice)}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {product && product.brand && (
                    <button
                      onClick={() => navigate(`/products?search=${encodeURIComponent(product.brand.name || '')}`)}
                      className="w-full mt-2 py-2 text-sm text-[#2B6377] font-semibold border border-[#2B6377] rounded-lg hover:bg-[#2B6377] hover:text-white transition"
                    >
                      Xem thêm
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={async () => {
          try {
            await removeFromWishlist(accountId, selectedSize.id);
            setIsInWishlist(false);
            toast.success("Đã xóa khỏi danh sách yêu thích");
          } catch (error) {
            console.error("Lỗi wishlist:", error);
            toast.error(error.response?.data?.message || "Có lỗi xảy ra");
          } finally {
            setWishlistLoading(false);
          }
        }}
        title="Xác nhận xóa"
        message="Bạn có muốn xóa sản phẩm này khỏi danh sách yêu thích?"
      />
    </div>
  );
}
