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
            className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md hover:border-teal-600 hover:border-2 transition cursor-pointer group"
        >
            <div className="relative">
                <img
                    src={(product.images && product.images.length > 0) ? product.images[0] : "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition duration-300"
                />
                {/* Discount logic would go here if available in API */}
                <button className="absolute top-2 left-2 bg-blue-100 p-2 rounded-full hover:bg-blue-200 transition">
                    <Heart className="w-4 h-4 text-red-500" />
                </button>
            </div>

            <div className="p-4">
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
                    <span className="text-lg font-bold text-red-700">
                        {product.price ? formatPrice(product.price) : 'Liên hệ'}
                    </span>
                </div>

                <button className="w-full bg-teal-700 text-white py-2 rounded-md font-medium text-sm hover:bg-teal-800 transition">
                    Thêm vào giỏ
                </button>
            </div>
        </div>
    )
}
