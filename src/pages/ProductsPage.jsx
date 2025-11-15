import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { Heart } from 'lucide-react'

const mockProducts = [
  {
    id: 1,
    name: 'Sữa rửa mặt Refresh',
    category: 'Cleanser',
    image: '/blue-facial-cleanser.jpg',
    price: 29.99,
    originalPrice: 39.99,
    rating: 4.3,
    reviews: 127,
    discount: true
  },
  {
    id: 2,
    name: 'Serum Glow',
    category: 'Serum',
    image: '/gold-serum-bottle.jpg',
    price: 49.00,
    originalPrice: null,
    rating: 4.5,
    reviews: 89,
    discount: false
  },
  {
    id: 3,
    name: 'Kem dưỡng ban ngày',
    category: 'Moisturizer',
    image: '/pink-moisturizer-cream.jpg',
    price: 39.50,
    originalPrice: null,
    rating: 4.7,
    reviews: 156,
    discount: false
  },
  {
    id: 4,
    name: 'Toner Balance',
    category: 'Toner',
    image: '/white-toner-bottle.jpg',
    price: 19.99,
    originalPrice: null,
    rating: 4.2,
    reviews: 203,
    discount: false
  },
  {
    id: 5,
    name: 'Sữa rửa mặt Refresh',
    category: 'Cleanser',
    image: '/blue-cleanser.jpg',
    price: 29.99,
    originalPrice: 39.99,
    rating: 4.3,
    reviews: 127,
    discount: true
  },
  {
    id: 6,
    name: 'Serum Glow',
    category: 'Serum',
    image: '/gold-serum.jpg',
    price: 49.00,
    originalPrice: null,
    rating: 4.5,
    reviews: 89,
    discount: false
  },
  {
    id: 7,
    name: 'Kem dưỡng ban ngày',
    category: 'Moisturizer',
    image: '/pink-moisturizer.jpg',
    price: 39.50,
    originalPrice: null,
    rating: 4.7,
    reviews: 156,
    discount: false
  },
  {
    id: 8,
    name: 'Toner Balance',
    category: 'Toner',
    image: '/white-toner.jpg',
    price: 19.99,
    originalPrice: null,
    rating: 4.2,
    reviews: 203,
    discount: false
  }
]

export default function ProductsPage() {
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [priceRange, setPriceRange] = useState([0, 100])

  const categories = ['Skincare', 'Cleanser', 'Serum', 'Moisturizer', 'Toner']

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <div className="flex flex-1 max-w-7xl mx-auto w-full gap-6 px-4 py-8">
        {/* Sidebar Filters */}
        <aside className="w-64 flex-shrink-0">
          <div className="bg-white p-6 rounded-lg mb-6 shadow-sm">
            <h3 className="text-lg font-semibold text-teal-700 mb-4">Bộ lọc</h3>
            
            <div className="mb-6">
              <h4 className="font-medium text-gray-700 mb-3">Danh mục</h4>
              {categories.map(cat => (
                <label key={cat} className="flex items-center gap-2 mb-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCategory === cat}
                    onChange={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-600">{cat}</span>
                </label>
              ))}
            </div>

            <div className="mb-6">
              <h4 className="font-medium text-gray-700 mb-3">Giá</h4>
              <input
                type="range"
                min="0"
                max="100"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([0, Number(e.target.value)])}
                className="w-full"
              />
              <div className="text-sm text-gray-600 mt-2">
                $0 - ${priceRange[1]}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {mockProducts.map(product => (
              <div
                key={product.id}
                onClick={() => navigate(`/products/${product.id}`)}
                className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer"
              >
                <div className="relative">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  {product.discount && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                      Giảm giá
                    </div>
                  )}
                  <button className="absolute top-2 left-2 bg-blue-100 p-2 rounded-full hover:bg-blue-200 transition">
                    <Heart className="w-4 h-4 text-red-500" />
                  </button>
                </div>

                <div className="p-4">
                  <p className="text-xs text-gray-500 uppercase mb-1">{product.category}</p>
                  <h3 className="font-semibold text-sm text-gray-800 mb-2 line-clamp-2">
                    {product.name}
                  </h3>

                  <div className="flex items-center gap-1 mb-3">
                    <div className="flex items-center gap-0.5">
                      {Array(Math.round(product.rating)).fill('⭐').join('')}
                    </div>
                    <span className="text-xs text-gray-500">({product.reviews})</span>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg font-bold text-teal-700">${product.price}</span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-400 line-through">
                        ${product.originalPrice}
                      </span>
                    )}
                  </div>

                  <button className="w-full bg-teal-700 text-white py-2 rounded font-medium text-sm hover:bg-teal-800 transition">
                    Thêm
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-2">
            <button className="px-3 py-2 border rounded hover:bg-gray-100 transition">←</button>
            {[1, 2, 3, 4, '...', 7].map((page, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 rounded transition ${
                  page === 1
                    ? 'bg-teal-700 text-white'
                    : 'border border-gray-300 hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            ))}
            <button className="px-3 py-2 border rounded hover:bg-gray-100 transition">→</button>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  )
}
