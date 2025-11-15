import { useState } from 'react'

const products = [
  {
    id: 1,
    name: 'Facial Serum',
    category: 'Skincare',
    price: '$45.00',
    image: '/blue-facial-serum-bottle.jpg',
  },
  {
    id: 2,
    name: 'Pearl Moisturizer',
    category: 'Skincare',
    price: '$59.00',
    image: '/white-moisturizer-cream-jar.jpg',
  },
  {
    id: 3,
    name: 'Indigo Eye Serum',
    category: 'Skincare',
    price: '$45.00',
    image: '/purple-eye-serum-bottle.jpg',
  },
  {
    id: 4,
    name: 'Bath Essentials',
    category: 'Wellness',
    price: '$35.00',
    image: '/bath-products-arrangement.jpg',
  },
]

export default function NewArrivals() {
  const [selectedProduct, setSelectedProduct] = useState(null)

  return (
    <section className="max-w-7xl mx-auto px-4 py-20">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h2 className="text-3xl font-light text-[#2E5F6D] mb-2">NEW ARRIVALS</h2>
          <p className="text-gray-500 text-sm">Discover our latest collection</p>
        </div>
        <button className="text-[#A8C9D8] hover:text-[#2E5F6D] transition text-sm font-medium">
          View All →
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="group cursor-pointer"
            onClick={() => setSelectedProduct(product)}
          >
            <div className="bg-[#F5F9FB] rounded-lg overflow-hidden mb-4 h-72 flex items-center justify-center">
              <img
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />
            </div>
            <h3 className="text-[#2E5F6D] font-medium mb-1">{product.name}</h3>
            <p className="text-[#A8C9D8] text-sm mb-2">{product.category}</p>
            <p className="text-[#2E5F6D] font-semibold">{product.price}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
