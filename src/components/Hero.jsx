export default function Hero() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="text-center lg:text-left">
          <div className="mb-4 inline-block">
            <span className="text-sm text-[#A8C9D8] font-medium">THE Cosmetic</span>
          </div>
          <h1 className="text-5xl lg:text-6xl font-light text-[#7DAAB5] mb-6 leading-tight">
            COSMATIC WEBSITE
          </h1>
          <p className="text-gray-600 text-lg mb-8">
            Discover premium beauty products crafted with the finest natural ingredients. Transform your skincare routine with our exclusive collection.
          </p>
          <button className="bg-[#2E5F6D] text-white px-8 py-3 rounded-full hover:bg-[#244659] transition font-medium">
            Shop Now
          </button>
        </div>
        <div className="bg-gradient-to-br from-[#E8F0F4] to-[#D4E5ED] rounded-2xl p-8 flex items-center justify-center h-96 overflow-hidden">
          <img
            src="/woman-with-cosmetics-and-natural-leaf.jpg"
            alt="Cosmetic Hero"
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
      </div>
    </section>
  )
}
