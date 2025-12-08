import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Danh sách ảnh slider
const heroImages = [
    "/woman-with-cosmetics-and-green-leaf.jpg",
    "/woman-with-cosmetics-and-natural-leaf.jpg",
    "/bannerhome.png"
];

export default function Hero() {
    const navigate = useNavigate();

    // --- 1. LOGIC TYPEWRITER ---
    const fullText = "COSMETIC WEBSITE";
    const [displayedText, setDisplayedText] = useState("");

    useEffect(() => {
        let currentIndex = 0;
        setDisplayedText("");
        const typingInterval = setInterval(() => {
            setDisplayedText(fullText.slice(0, currentIndex + 1));
            currentIndex++;
            if (currentIndex === fullText.length) {
                clearInterval(typingInterval);
            }
        }, 150);
        return () => clearInterval(typingInterval);
    }, []);

    // --- 2. LOGIC SLIDESHOW ẢNH (Mới thêm) ---
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        const slideInterval = setInterval(() => {
            // Tự động chuyển sang ảnh tiếp theo, nếu hết thì quay về 0
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
        }, 3000); // 3000ms = 3 giây đổi 1 lần

        return () => clearInterval(slideInterval);
    }, []);

    return (
        <section className="max-w-7xl mx-auto px-4 py-10">
            <style>{`
                @keyframes shine {
                    from { transform: translateX(-150%) skewX(-12deg); }
                    to { transform: translateX(150%) skewX(-12deg); }
                }
                .animate-shine {
                    animation: shine 1s ease-in-out;
                }
                @keyframes orbit {
                    from { transform: translate(-50%, -50%) rotate(0deg); }
                    to { transform: translate(-50%, -50%) rotate(360deg); }
                }
                .animate-orbit {
                    animation: orbit 8s linear infinite;
                }
            `}</style>

            <div className="bg-gradient-to-br from-[#E8F0F4] to-[#D4E5ED] rounded-3xl p-8 md:p-12 overflow-hidden shadow-sm relative group">

                {/* Hiệu ứng nền mờ */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
                    {/* --- CỘT TRÁI: TEXT --- */}
                    <div className="text-center lg:text-left">
                        <div className="mb-4 inline-block">
                            <span className="text-sm text-[#2B6377] font-semibold tracking-wider uppercase border-b border-[#2B6377]">
                                THE Cosmetic
                            </span>
                        </div>

                        <h1 className="text-4xl lg:text-6xl font-light text-[#2E5F6D] mb-6 leading-tight h-20 lg:h-auto min-h-[4rem]">
                            {displayedText}
                            <span className="animate-pulse font-thin text-[#2B6377] ml-1">|</span>
                        </h1>

                        <p className="text-gray-600 mb-8 max-w-lg mx-auto lg:mx-0">
                            Khám phá vẻ đẹp tự nhiên với bộ sưu tập mỹ phẩm cao cấp. Nâng niu làn da của bạn mỗi ngày.
                        </p>

                        <button
                            onClick={() => navigate('/products')}
                            className="relative group overflow-hidden bg-[#2E5F6D] text-white px-10 py-4 rounded-full font-medium shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl"
                        >
                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] group-hover:animate-shine" />
                            <span className="relative flex items-center gap-2">
                                Shop Now
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                </svg>
                            </span>
                        </button>
                    </div>

                    {/* --- CỘT PHẢI: ẢNH SLIDER + QUỸ ĐẠO --- */}
                    <div className="relative h-96 flex items-center justify-center group/image">

                        {/* Vòng quỹ đạo (Orbit) - Giữ nguyên */}
                        <div className="absolute top-1/2 left-1/2 w-[115%] h-[115%] rounded-full border-[1px] border-transparent border-t-white/60 border-r-white/30 animate-orbit pointer-events-none z-0"></div>
                        <div className="absolute top-1/2 left-1/2 w-[130%] h-[130%] rounded-full border-[1px] border-transparent border-b-white/40 animate-orbit pointer-events-none z-0" style={{ animationDirection: 'reverse', animationDuration: '12s' }}></div>

                        {/* SLIDER ẢNH */}
                        {/* Render tất cả ảnh đè lên nhau, chỉ hiện ảnh có index trùng khớp */}
                        <div className="relative z-10 w-full h-full rounded-2xl overflow-hidden shadow-xl">
                            {heroImages.map((src, index) => (
                                <img
                                    key={index}
                                    src={src}
                                    alt={`Slide ${index}`}
                                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
                                        index === currentImageIndex ? "opacity-100 scale-100" : "opacity-0 scale-105"
                                    }`}
                                />
                            ))}
                        </div>

                        {/* (Tùy chọn) Nút chấm tròn bên dưới để biết đang ở ảnh nào */}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
                            {heroImages.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentImageIndex(index)}
                                    className={`w-2 h-2 rounded-full transition-all ${
                                        index === currentImageIndex ? "bg-white w-4" : "bg-white/50"
                                    }`}
                                />
                            ))}
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
}