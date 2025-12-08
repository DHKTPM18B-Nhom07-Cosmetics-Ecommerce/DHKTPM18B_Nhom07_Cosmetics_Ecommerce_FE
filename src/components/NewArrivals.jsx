import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { filterProducts } from '../services/productFilterApi';
import ProductCard from './ProductCard';

export default function NewArrivals() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNewArrivals = async () => {
            try {
                setLoading(true);
                const res = await filterProducts({ sort: 'newest', page: 0, size: 4 });
                setProducts(res.content || []);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchNewArrivals();
    }, []);

    return (
        <section className="max-w-7xl mx-auto px-4">
            {/* --- THANH TIÊU ĐỀ XANH (HEADER BAR) --- */}
            <div className="bg-gradient-to-br from-[#E8F0F4] to-[#D4E5ED] rounded-2xl px-8 py-4 mb-8 flex justify-between items-center shadow-sm">
                <h2 className="text-xl md:text-2xl font-medium text-[#2E5F6D] uppercase tracking-wide">
                    Sản phẩm mới
                </h2>

                <button
                    onClick={() => navigate('/products')}
                    className="text-[#2B6377] text-sm font-semibold hover:text-[#1a3b47] flex items-center gap-1 bg-white/60 hover:bg-white px-4 py-2 rounded-full transition-all"
                >
                    Xem tất cả →
                </button>
            </div>

            {/* --- NỘI DUNG (Vẫn nền trắng) --- */}
            {loading ? (
                <div className="text-center py-10 text-gray-400">Đang tải...</div>
            ) : products.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="text-center text-gray-400">Chưa có sản phẩm.</div>
            )}
        </section>
    );
}