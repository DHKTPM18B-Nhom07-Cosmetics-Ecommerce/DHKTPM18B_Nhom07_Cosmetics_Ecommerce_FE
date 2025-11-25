import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Heart, ShoppingCart } from 'lucide-react'

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState('50ml')
  const [activeTab, setActiveTab] = useState('details')

  const product = {
    id: id,
    name: 'Ocean Hydra Serum',
    subtitle: 'Advanced Marine Collagen Complex',
    rating: 4.8,
    reviews: 1247,
    price: 89.00,
    originalPrice: 120.00,
    discount: 26,
    description: 'Experience the transformative power of the ocean with our signature hydrating serum. Infused with marine collagen, blue algae extract, and deep sea minerals, this lightweight formula penetrates deeply to restore moisture balance and promote a youthful, radiant complexion.',
    images: [
      '/blue-ocean-serum-bottle.jpg',
      '/serum-product-shot.jpg',
      '/serum-ingredients.jpg',
      '/ocean-skincare.jpg'
    ],
    sizes: [
      { size: '30ml', price: 49.00 },
      { size: '50ml', price: 89.00 },
      { size: '100ml', price: 249.00 }
    ],
    benefits: [
      'Deeply hydrates and plumps skin for up to 24 hours',
      'Reduces fine lines and improves skin elasticity',
      'Brightens and evens skin tone with marine botanicals',
      'Strengthens skin barrier with deep sea minerals',
      'Lightweight, fast-absorbing gel texture'
    ]
  }

  const [mainImage, setMainImage] = useState(product.images[0])

  const reviews = [
    {
      id: 1,
      author: 'Sarah Mitchell',
      rating: 5,
      date: '2 weeks ago',
      verified: true,
      title: 'Absolutely transformative!',
      content: 'This serum has completely changed my skincare routine. After just one week, my skin feels incredibly hydrated and looks visibly brighter.'
    },
    {
      id: 2,
      author: 'Emily Chen',
      rating: 5,
      date: '1 month ago',
      verified: true,
      title: 'Perfect for sensitive skin',
      content: 'As someone with very sensitive skin, I\'m always hesitant to try new products. This serum has been amazing for me though.'
    }
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

      <div className="max-w-7xl mx-auto w-full px-4 py-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div>
            <div className="bg-blue-50 rounded-lg overflow-hidden mb-4 aspect-square flex items-center justify-center">
              <img
                src={mainImage || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex gap-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setMainImage(img)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                    mainImage === img
                      ? 'border-teal-700'
                      : 'border-gray-300 hover:border-teal-400'
                  }`}
                >
                  <img src={img || "/placeholder.svg"} alt={`Product ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
            <p className="text-gray-600 mb-4">{product.subtitle}</p>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-1">
                {Array(Math.round(product.rating)).fill('⭐').join('')}
              </div>
              <span className="font-semibold text-teal-700">{product.rating}</span>
              <span className="text-gray-600">({product.reviews} reviews)</span>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl font-bold text-teal-700">${product.price.toFixed(2)}</span>
              <span className="text-xl text-gray-400 line-through">${product.originalPrice.toFixed(2)}</span>
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                Save {product.discount}%
              </span>
            </div>

            <p className="text-gray-700 mb-6 leading-relaxed">{product.description}</p>

            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-3">Phân loại</h3>
              <div className="flex gap-3">
                {product.sizes.map(size => (
                  <button
                    key={size.size}
                    onClick={() => setSelectedSize(size.size)}
                    className={`px-6 py-3 rounded-lg border-2 font-medium transition text-sm ${
                      selectedSize === size.size
                        ? 'bg-teal-700 text-white border-teal-700'
                        : 'border-gray-300 text-gray-700 hover:border-teal-400'
                    }`}
                  >
                    {size.size} - ${size.price}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-3">Quantity</h3>
              <div className="flex items-center gap-3 w-fit">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-100"
                >
                  −
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-12 h-10 border border-gray-300 rounded text-center"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex gap-3 mb-8">
              <button className="flex-1 bg-teal-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-800 transition flex items-center justify-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
              <button className="flex-1 border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:border-red-500 hover:text-red-500 transition flex items-center justify-center gap-2">
                <Heart className="w-5 h-5" />
                Add to Wishlist
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="flex border-b">
            {['Mô tả', 'Thành phần', 'Cách sử dụng'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase().replace(/\s/g, ''))}
                className={`flex-1 py-4 font-medium transition ${
                  activeTab === tab.toLowerCase().replace(/\s/g, '')
                    ? 'border-b-2 border-teal-700 text-teal-700'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'mô tả' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Product Benefits</h3>
                <ul className="space-y-3">
                  {product.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-gray-700">
                      <span className="text-teal-700 font-bold mt-1">✓</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {activeTab === 'thànhphần' && (
              <p className="text-gray-700">Marine Collagen, Blue Algae Extract, Deep Sea Minerals, Hyaluronic Acid, Panthenol</p>
            )}
            {activeTab === 'cáchsửdụng' && (
              <p className="text-gray-700">Apply 2-3 drops to clean, damp skin. Gently pat until fully absorbed. Use morning and night for best results.</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Đánh giá</h2>

          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-teal-700">{product.rating}</div>
                <div className="flex justify-center gap-0.5 mt-2">
                  {Array(5).fill('⭐').join('')}
                </div>
                <p className="text-gray-600 text-sm mt-2">Based on {product.reviews} reviews</p>
              </div>

              <div className="flex-1 space-y-3">
                {[5, 4, 3, 2, 1].map(stars => (
                  <div key={stars} className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 w-12">{stars} stars</span>
                    <div className="flex-1 h-2 bg-gray-300 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-300 rounded-full"
                        style={{ width: `${stars === 5 ? 78 : stars === 4 ? 15 : 5}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12">{stars === 5 ? 78 : stars === 4 ? 15 : 5}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6 mb-8">
            {reviews.map(review => (
              <div key={review.id} className="border-b pb-6 last:border-b-0">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-800">{review.author}</h4>
                      {review.verified && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          Verified Purchase
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
                      <div className="flex gap-0.5">{Array(review.rating).fill('⭐').join('')}</div>
                      <span>· {review.date}</span>
                    </div>
                    <h5 className="font-semibold text-gray-800 mb-2">{review.title}</h5>
                    <p className="text-gray-700 mb-3">{review.content}</p>
                    <button className="text-sm text-gray-600 hover:text-teal-700">
                      Helpful (42)
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center items-center gap-2">
            <button className="px-3 py-2 border rounded hover:bg-gray-100 transition">←</button>
            {[1, 2, 3, 4, '...', 7].map((page, idx) => (
              <button
                key={idx}
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
        </div>
      </div>

    </div>
  )
}