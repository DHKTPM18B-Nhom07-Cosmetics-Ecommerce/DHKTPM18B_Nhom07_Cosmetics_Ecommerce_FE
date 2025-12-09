import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, BadgeCheck, Globe, Sparkles, Handshake } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { getAllBrands } from "../services/brandService";
import Breadcrumb from "../components/Breadcrumb.jsx"

export default function BrandsPage() {
    const navigate = useNavigate();
    const [brands, setBrands] = useState([]);
    const [filteredBrands, setFilteredBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Load dữ liệu Brand từ API
    useEffect(() => {
        const fetchBrands = async () => {
            try {
                const data = await getAllBrands();
                setBrands(data);
                setFilteredBrands(data); // Ban đầu hiển thị hết
            } catch (error) {
                console.error("Lỗi tải thương hiệu:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBrands();
    }, []);

    // Xử lý tìm kiếm (Filter local)
    useEffect(() => {
        const results = brands.filter(brand =>
            brand.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredBrands(results);
    }, [searchTerm, brands]);

    // Chuyển hướng sang trang sản phẩm khi click
    const handleBrandClick = (brand) => {
        // Logic tìm kiếm theo tên giống Home
        navigate(`/products?search=${encodeURIComponent(brand.name)}`);
    };

    return (
        <div className="min-h-screen bg-white">
            <Breadcrumb
                breadcrumbs={[
                    { label: "Trang chủ", href: "/" },
                    { label: "Thương hiệu", active: true }
                ]}
            />
            <main className="flex flex-col gap-16 pb-20 pt-8">

                {/* === 1. HERO BANNER === */}
                <section className="max-w-7xl mx-auto px-4 w-full">
                    <div className="bg-gradient-to-br from-[#E8F0F4] to-[#D4E5ED] rounded-3xl p-10 md:p-20 text-center shadow-sm relative overflow-hidden">
                        {/* Trang trí nền */}
                        <div className="absolute top-0 left-0 w-64 h-64 bg-white/40 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                        <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#2E5F6D]/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

                        <div className="relative z-10 max-w-3xl mx-auto">
                    <span className="text-[#2B6377] font-semibold tracking-wider uppercase border-b border-[#2B6377] inline-block mb-4 pb-1">
                        Đối tác chính thức
                    </span>
                            <h1 className="text-4xl md:text-6xl font-light text-[#2E5F6D] mb-6 leading-tight">
                                Thương Hiệu <span className="font-semibold">Đẳng Cấp</span>
                            </h1>
                            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                                Chúng tôi tự hào là đối tác phân phối chính hãng của hơn 50+ thương hiệu mỹ phẩm hàng đầu thế giới. Cam kết chất lượng chuẩn quốc tế trong từng sản phẩm.
                            </p>

                            {/* Ô TÌM KIẾM BRAND */}
                            <div className="relative max-w-lg mx-auto">
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm thương hiệu bạn yêu thích..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-white rounded-full border border-gray-200 shadow-lg focus:ring-2 focus:ring-[#2E5F6D] focus:border-[#2E5F6D] outline-none transition text-gray-700"
                                />
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* === 2. GIÁ TRỊ CAM KẾT (Icons) === */}
                <section className="max-w-7xl mx-auto px-4 w-full">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-y border-gray-100 py-10">
                        <div className="flex items-center gap-4 justify-center md:justify-start">
                            <div className="p-3 bg-[#E8F0F4] rounded-full text-[#2E5F6D]"><BadgeCheck size={32}/></div>
                            <div>
                                <h3 className="font-bold text-[#2E5F6D]">100% Chính Hãng</h3>
                                <p className="text-sm text-gray-500">Đầy đủ giấy tờ, tem phụ</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 justify-center md:justify-start">
                            <div className="p-3 bg-[#E8F0F4] rounded-full text-[#2E5F6D]"><Globe size={32}/></div>
                            <div>
                                <h3 className="font-bold text-[#2E5F6D]">Thương Hiệu Toàn Cầu</h3>
                                <p className="text-sm text-gray-500">Từ Âu Mỹ đến Hàn Nhật</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 justify-center md:justify-start">
                            <div className="p-3 bg-[#E8F0F4] rounded-full text-[#2E5F6D]"><Sparkles size={32}/></div>
                            <div>
                                <h3 className="font-bold text-[#2E5F6D]">Luôn Cập Nhật Mới</h3>
                                <p className="text-sm text-gray-500">Bộ sưu tập mới nhất</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* === 3. DANH SÁCH THƯƠNG HIỆU === */}
                <section className="max-w-7xl mx-auto px-4 w-full min-h-[400px]">
                    <div className="flex justify-between items-end mb-8">
                        <h2 className="text-2xl font-medium text-[#2E5F6D] uppercase tracking-wide">
                            Tất cả thương hiệu ({filteredBrands.length})
                        </h2>

                        <div className="hidden md:block text-sm text-gray-500">
                            Sắp xếp: <span className="font-semibold text-[#2B6377] cursor-pointer">A - Z</span>
                        </div>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                            {[...Array(10)].map((_, i) => (
                                <div key={i} className="h-40 bg-gray-100 rounded-2xl animate-pulse"></div>
                            ))}
                        </div>
                    ) : filteredBrands.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                            {filteredBrands.map((brand) => (
                                <div
                                    key={brand.id}
                                    onClick={() => handleBrandClick(brand)}
                                    className="group relative bg-white border border-gray-100 rounded-2xl p-6 h-48 flex flex-col items-center justify-center cursor-pointer hover:shadow-xl hover:border-[#D4E5ED] transition-all duration-300 hover:-translate-y-2"
                                >
                                    {/* Logo */}
                                    <div className="w-full h-24 flex items-center justify-center mb-4">
                                        {brand.logo ? (
                                            <img
                                                src={brand.logo}
                                                alt={brand.name}
                                                className="max-h-full max-w-full object-contain filter grayscale group-hover:grayscale-0 transition duration-500 scale-90 group-hover:scale-110"
                                            />
                                        ) : (
                                            <span className="text-2xl font-bold text-gray-300 group-hover:text-[#2E5F6D] transition">
                                        {brand.name.charAt(0)}
                                    </span>
                                        )}
                                    </div>

                                    {/* Tên Brand */}
                                    <span className="text-sm font-semibold text-gray-500 group-hover:text-[#2E5F6D] uppercase tracking-wide text-center transition">
                                {brand.name}
                            </span>

                                    {/* Nút xem thêm (ẩn, hiện khi hover) */}
                                    <div className="absolute bottom-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-xs text-[#2B6377] font-medium bg-[#E8F0F4] px-3 py-1 rounded-full">
                                        Xem sản phẩm
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                            <p className="text-gray-500 text-lg">Không tìm thấy thương hiệu nào phù hợp với "{searchTerm}"</p>
                            <button
                                onClick={() => setSearchTerm("")}
                                className="mt-4 text-[#2E5F6D] font-semibold hover:underline"
                            >
                                Xem tất cả thương hiệu
                            </button>
                        </div>
                    )}
                </section>

                {/* === 4. BRAND SPOTLIGHT (Banner phụ) === */}
                {/* Phần này làm tĩnh (hardcode) một chút để trang đẹp hơn, giống banner quảng cáo */}
                <section className="max-w-7xl mx-auto px-4 w-full">
                    <div className="bg-[#2E5F6D] rounded-3xl overflow-hidden relative text-white">
                        <div className="grid grid-cols-1 md:grid-cols-2 items-center">
                            <div className="p-10 md:p-16 relative z-10">
                                <div className="inline-block bg-[#D4E5ED] text-[#2E5F6D] text-xs font-bold px-3 py-1 rounded-full mb-4">
                                    SPOTLIGHT
                                </div>
                                <h2 className="text-3xl md:text-5xl font-light mb-6">
                                    La Roche-Posay
                                </h2>
                                <p className="text-gray-200 mb-8 text-lg max-w-md">
                                    Chuyên gia chăm sóc da liễu số 1 được các bác sĩ khuyên dùng. Giải pháp an toàn cho làn da nhạy cảm nhất.
                                </p>
                                <button
                                    onClick={() => navigate('/products?search=La Roche-Posay')}
                                    className="bg-white text-[#2E5F6D] px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition shadow-lg"
                                >
                                    Khám phá ngay
                                </button>
                            </div>
                            {/* Ảnh Brand Spotlight */}
                            <div className="h-64 md:h-full bg-white/10 relative">

                                <img
                                    src="/La.png"
                                    alt="Brand Spotlight"
                                    className="w-full h-full object-cover opacity-80 mix-blend-overlay md:mix-blend-normal md:opacity-100"
                                    onError={(e) => e.target.style.display = 'none'} // Ẩn nếu lỗi ảnh
                                />
                                {/* Nếu không có ảnh thì hiển thị pattern */}
                                <div className="absolute inset-0 bg-gradient-to-l from-[#2E5F6D] to-transparent"></div>
                            </div>
                        </div>
                    </div>
                </section>


                <section className="max-w-7xl mx-auto px-4 w-full mb-10">
                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-4">
                            <div className="bg-white p-4 rounded-full shadow-sm text-[#2E5F6D]">
                                <Handshake size={32} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">Bạn là chủ thương hiệu?</h3>
                                <p className="text-gray-600 text-sm">Hợp tác cùng chúng tôi để đưa sản phẩm chất lượng đến tay người tiêu dùng.</p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/about')} // Chuyển qua trang About/Liên hệ
                            className="border border-[#2E5F6D] text-[#2E5F6D] px-6 py-2.5 rounded-xl font-medium hover:bg-[#2E5F6D] hover:text-white transition"
                        >
                            Liên hệ hợp tác
                        </button>
                    </div>
                </section>

            </main>

        </div>
    );
}