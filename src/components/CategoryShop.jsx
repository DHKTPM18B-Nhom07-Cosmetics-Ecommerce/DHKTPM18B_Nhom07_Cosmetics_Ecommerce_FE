import { Droplet, Brush, Leaf, Heart, Sparkles, Wind } from 'lucide-react'

const categories = [
  { name: 'Skincare', icon: Droplet },
  { name: 'Makeup', icon: Brush },
  { name: 'Top Care', icon: Leaf },
  { name: 'Body Care', icon: Heart },
  { name: 'Hair Care', icon: Sparkles },
  { name: 'Wellness', icon: Wind },
]

export default function CategoryShop() {
  return (
    <section className="bg-gradient-to-b from-white to-[#F5F9FB] py-20">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-light text-[#2E5F6D] text-center mb-2">
          SHOP BY CATEGORY
        </h2>
        <p className="text-gray-500 text-center mb-12 text-sm">
          Find exactly what you're looking for
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((category, index) => {
            const Icon = category.icon
            return (
              <div
                key={index}
                className="flex flex-col items-center gap-4 p-6 bg-white rounded-lg hover:shadow-lg transition cursor-pointer group"
              >
                <div className="bg-[#D4E5ED] p-4 rounded-full group-hover:bg-[#A8C9D8] transition">
                  <Icon size={24} className="text-[#2E5F6D]" />
                </div>
                <span className="text-sm font-medium text-[#2E5F6D] text-center">
                  {category.name}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
