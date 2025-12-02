import { useState } from 'react'; // Thêm useState
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react'; // Thêm icon ShoppingCart cho đẹp
import ProductRating from './ProductRating';
import { addToCart } from '../services/cartService'; // Import service

export default function ProductCard({ product }) {
    const navigate = useNavigate();
    const [adding, setAdding] = useState(false); // State để disable nút khi đang gọi API

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    }

    const getBrand = () => {
        if (product.brand) return product.brand.name || product.brand; // Sửa lại phòng trường hợp brand là object
        if (product.category && product.category.name) return product.category.name;
        return 'Thương hiệu';
    }

    // Hàm xử lý thêm vào giỏ
const handleAddToCart = async (e) => {
        e.stopPropagation(); 
        e.preventDefault();

        // 1. KIỂM TRA ĐĂNG NHẬP (QUAN TRỌNG)
        // Lấy thông tin user đã lưu trong localStorage khi đăng nhập thành công
        const userStored = localStorage.getItem('user');

        if (!userStored) {
            // Nếu chưa đăng nhập -> Hỏi người dùng có muốn đăng nhập không
            if (window.confirm("Bạn cần đăng nhập để mua hàng. Chuyển đến trang đăng nhập ngay?")) {
                navigate('/login');
            }
            return; // Dừng lại, không chạy tiếp
        }

        // 2. LẤY ACCOUNT ID THẬT
        const user = JSON.parse(userStored);
        const accountId = user.id; // Lấy ID của người đang đăng nhập

        // 3. Kiểm tra biến thể sản phẩm
        if (!product.variants || product.variants.length === 0) {
            alert("Sản phẩm này tạm hết hàng hoặc chưa có phân loại!");
            return;
        }

        // 4. Lấy Variant ID đầu tiên (Mặc định)
        const defaultVariantId = product.variants[0].id;

        // 5. GỌI API THÊM VÀO GIỎ
        try {
            setAdding(true);
            await addToCart(accountId, defaultVariantId, 1);
            alert("Đã thêm vào giỏ hàng thành công!");
            
            // (Tùy chọn) Bắn sự kiện để Header cập nhật số lượng badge
            // window.dispatchEvent(new Event('cart-updated'));
        } catch (error) {
            console.error(error);
            alert("Lỗi: Không thể thêm vào giỏ hàng. Vui lòng thử lại.");
        } finally {
            setAdding(false);
        }
    };

    // Xác định giá hiển thị
    const displayPrice = product.price || (product.variants && product.variants.length > 0 ? product.variants[0].price : 0);

    return (
        <div
            onClick={() => navigate(`/products/${product.id}`)}
            className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md hover:border-teal-600 hover:border-2 transition cursor-pointer group flex flex-col h-full"
        >
            <div className="relative aspect-square overflow-hidden bg-gray-100">
                <img
                    src={(product.images && product.images.length > 0) ? product.images[0] : "/placeholder.svg"}
                    alt={product.name}
                    className={`w-full h-48 object-cover transition-all duration-500 ${product.images && product.images.length > 1
                        ? "group-hover:opacity-0"
                        : "group-hover:scale-105"
                        }`}
                />
                {product.images && product.images.length > 1 && (
                    <img
                        src={product.images[1]}
                        alt={product.name}
                        className="absolute inset-0 w-full h-48 object-cover opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                    />
                )}
                {/* Discount logic would go here if available in API */}
                <button className="absolute top-2 left-2 bg-blue-100 p-2 rounded-full hover:bg-blue-200 transition">
                    <Heart className="w-4 h-4 text-red-500" />
                </button>
            </div>

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
                        reviewCount={product.reviews ? product.reviews.length : 0}
                    />
                </div>

                <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm font-bold text-red-700">
                        {(() => {
                            if (product.variants && product.variants.length > 0) {
                                const prices = product.variants.map(v => v.price);
                                const minPrice = Math.min(...prices);
                                const maxPrice = Math.max(...prices);
                                if (minPrice !== maxPrice) {
                                    return `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
                                }
                                return formatPrice(minPrice);
                            }
                            return product.price ? formatPrice(product.price) : 'Liên hệ';
                        })()}
                    </span>
                </div>

                    <button
                        onClick={handleAddToCart}
                        disabled={adding}
                        className={`w-full py-2 rounded-md font-medium text-sm transition flex items-center justify-center gap-2
                            ${adding 
                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                                : 'bg-teal-700 text-white hover:bg-teal-800'
                            }`}
                    >
                        {adding ? (
                            <span>Đang thêm...</span>
                        ) : (
                            <>
                                <ShoppingCart size={16} />
                                Thêm vào giỏ
                            </>
                        )}
                    </button>
                </div>
            </div>
    )
}