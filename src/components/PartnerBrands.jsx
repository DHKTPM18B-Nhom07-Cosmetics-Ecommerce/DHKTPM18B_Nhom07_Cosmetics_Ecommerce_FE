import { useState, useEffect } from 'react';
import { getAllBrands } from '../services/brandService';
import { useNavigate } from 'react-router-dom';

export default function PartnerBrands() {
    const [brands, setBrands] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBrands = async () => {
            const data = await getAllBrands();
            setBrands(data.slice(0, 5));
        };
        fetchBrands();
    }, []);

    const handleBrandClick = (brand) => {
        navigate(`/products?search=${encodeURIComponent(brand.name)}`);
    };

    return (
        <section className="max-w-7xl mx-auto px-4">

            <div className="bg-gradient-to-br from-[#E8F0F4] to-[#D4E5ED] rounded-2xl py-6 mb-10 text-center shadow-sm">
                <h2 className="text-2xl md:text-2xl font-medium text-[#2E5F6D] uppercase tracking-wider">
                    Đối tác thương hiệu
                </h2>
            </div>

            {brands.length > 0 ? (
                // Tăng gap lên gap-8 cho thoáng
                <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
                    {brands.map((brand) => (
                        <div
                            key={brand.id}
                            onClick={() => handleBrandClick(brand)}
                            // SỬA: Tăng chiều cao lên h-40 (160px), padding p-8
                            className="bg-white border border-[#D4E5ED] rounded-2xl p-8 flex items-center justify-center h-40 hover:shadow-lg transition-all duration-300 cursor-pointer group hover:-translate-y-2"
                        >
                            {brand.logo ? (
                                // Logo to hơn
                                <img
                                    src={brand.logo}
                                    alt={brand.name}
                                    className="max-h-full max-w-full object-contain filter grayscale group-hover:grayscale-0 transition duration-300 scale-110 group-hover:scale-125"
                                />
                            ) : (
                                // Tên to hơn (text-xl) và đậm hơn
                                <span className="text-[#A8C9D8] font-bold text-xl text-center group-hover:text-[#2E5F6D] transition uppercase tracking-wide">
                                    {brand.name}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-400 py-10">Đang cập nhật đối tác...</p>
            )}
        </section>
    )
}