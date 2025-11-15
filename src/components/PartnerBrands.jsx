const brands = ['LUX.ELEGANCE', 'LUXURY REST', 'SERUM', 'UNITY', 'PARRIKA']

export default function PartnerBrands() {
  return (
    <section className="bg-[#F5F9FB] py-20">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-light text-[#2E5F6D] text-center mb-12">
          OUR PARTNER BRANDS
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {brands.map((brand, index) => (
            <div
              key={index}
              className="bg-white border border-[#D4E5ED] rounded-lg p-6 flex items-center justify-center h-24 hover:shadow-md transition cursor-pointer group"
            >
              <span className="text-[#A8C9D8] font-semibold text-sm text-center group-hover:text-[#2E5F6D] transition">
                {brand}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
