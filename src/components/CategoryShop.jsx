import { useEffect, useState } from 'react';
import { Leaf, Heart } from 'lucide-react';
import { MdWaterDrop, MdSunny } from 'react-icons/md';
import { GiLipstick } from 'react-icons/gi';
import { FaGift } from 'react-icons/fa6';
import { getAllCategories } from '../services/categoryService';

// Mapping tên category với icon
const categoryIcons = {
    Skincare: MdWaterDrop,
    Makeup: GiLipstick,
    Haircare: Leaf,
    'Body Care': Heart,
    'Sun Care': MdSunny,
    'Gift Sets': FaGift,
};

export default function CategoryShop() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await getAllCategories();
                // Map data từ API với icon
                const categoriesWithIcons = data.map((cat) => ({
                    id: cat.id,
                    name: cat.name,
                    icon: categoryIcons[cat.name] || MdWaterDrop, // Icon mặc định nếu không tìm thấy
                }));
                setCategories(categoriesWithIcons);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    if (loading) {
        return (
            <section className="bg-light py-20">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-primary">Loading categories...</p>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="bg-light py-20">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-red-500">Error: {error}</p>
                </div>
            </section>
        );
    }

    return (
        <section className="bg-light py-20">
            <div className="max-w-7xl mx-auto px-4">
                <h2 className="text-3xl font-light text-primary text-center mb-10">
                    CATEGORY
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 p-5">
                    {categories.map((category) => {
                        const Icon = category.icon;
                        return (
                            <div
                                key={category.id}
                                className="flex flex-col items-center gap-4 p-6 rounded-lg hover:shadow-lg transition cursor-pointer group">
                                <div className="bg-[#D4E5ED] h-16 w-16 rounded-full group-hover:bg-[#A8C9D8] transition flex items-center justify-center">
                                    <Icon
                                        size={24}
                                        className="text-primary h-10 w-10"
                                    />
                                </div>
                                <span className="text-sm font-medium text-primary text-center">
                                    {category.name}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
