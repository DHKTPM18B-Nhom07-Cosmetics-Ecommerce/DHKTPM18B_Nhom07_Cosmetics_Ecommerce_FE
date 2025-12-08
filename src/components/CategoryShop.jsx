import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Sparkles, Sun, Eraser } from 'lucide-react';
import { MdWaterDrop, MdOutlineCleanHands, MdFaceRetouchingNatural } from 'react-icons/md';
import { GiMedicinePills } from 'react-icons/gi';

import { getAllCategories } from '../services/categoryService';


const categoryIcons = {
    "Sữa Rửa Mặt": MdOutlineCleanHands,
    "Tẩy Trang": Eraser,
    "Toner": MdWaterDrop,
    "Mặt nạ": MdFaceRetouchingNatural,
    "Serum": GiMedicinePills,
    "Kem chống nắng": Sun,

    "Trang điểm": Sparkles,
    "Son môi": Sparkles,
};

export default function CategoryShop() {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await getAllCategories();
                const categoriesWithIcons = data.map((cat) => ({
                    id: cat.id,
                    name: cat.name,
                    icon: categoryIcons[cat.name] || Sparkles,
                }));
                setCategories(categoriesWithIcons);
                setLoading(false);
            } catch (err) {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    const handleCategoryClick = (categoryName) => {
        navigate(`/products?search=${encodeURIComponent(categoryName)}`);
    };

    if (loading) return null;

    return (
        <section className="max-w-7xl mx-auto px-4">
            <div className="bg-gradient-to-br from-[#E8F0F4] to-[#D4E5ED] rounded-2xl py-4 mb-8 text-center shadow-sm">
                <h2 className="text-xl md:text-2xl font-medium text-[#2E5F6D] uppercase tracking-wide">
                    Danh mục sản phẩm
                </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {categories.map((category) => {
                    const Icon = category.icon;
                    return (
                        <div
                            key={category.id}
                            onClick={() => handleCategoryClick(category.name)}
                            className="flex flex-col items-center gap-4 p-6 rounded-xl hover:shadow-lg transition cursor-pointer group bg-gray-50 hover:bg-white border border-transparent hover:border-gray-100"
                        >
                            <div className="bg-[#D4E5ED] h-16 w-16 rounded-full group-hover:bg-[#A8C9D8] transition flex items-center justify-center">
                                <Icon size={28} className="text-[#2B6377] group-hover:scale-110 transition duration-300" />
                            </div>
                            <span className="text-sm font-medium text-[#2B6377] text-center group-hover:text-[#234852]">
                                {category.name}
                            </span>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}