import { useNavigate } from 'react-router-dom'
import { Heart } from 'lucide-react'
import ProductRating from './ProductRating'
import Button from './ui/Button'

export default function ProductCard({ product }) {
    const navigate = useNavigate()

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    }

    // Heuristic to get brand if not available in API
    const getBrand = () => {
        if (product.brand) return product.brand;
        if (product.category && product.category.name) return product.category.name;
        // Fallback: Try to guess from name (first word after common prefixes?) - risky, so just return a placeholder or empty
        return 'Thương hiệu';
    }

    return (
        <div
            onClick={() => navigate(`/products/${product.id}`)}
            className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md border-2 border-transparent hover:border-teal-600 transition cursor-pointer group"
        >
            <div className="relative">
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
                <h3 className="font-semibold text-sm text-gray-800 mb-2 line-clamp-2 h-10">
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

                <button className="w-full bg-teal-700 text-white py-2 rounded-md font-medium text-sm hover:bg-teal-800 transition">
                    Thêm vào giỏ
                </button>
            </div>
        </div>
    )
}