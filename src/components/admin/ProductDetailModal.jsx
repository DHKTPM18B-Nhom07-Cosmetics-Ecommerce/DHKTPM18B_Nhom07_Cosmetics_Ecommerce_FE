import React, { useState, useEffect } from "react";
import { X, Heart, Star } from "lucide-react";
import ProductImageCarousel from "../ProductImageCarousel";

// Format price to Vietnamese currency
const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(price);
};

const ProductDetailModal = ({ isOpen, onClose, product, variants = [] }) => {
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [activeTab, setActiveTab] = useState("mo-ta");

    // Reset state when product changes
    useEffect(() => {
        if (isOpen) {
            setSelectedVariant(null);
            setActiveTab("mo-ta");
        }
    }, [isOpen, product]);

    if (!isOpen || !product) return null;

    // Compute display images
    const displayImages = (() => {
        const productImgs = product.images || [];
        const variantImgs = variants.flatMap((v) => v.imageUrls || []);
        const combined = [...productImgs, ...variantImgs]; // Combined
        const unique = [...new Set(combined)].filter(Boolean); // Unique
        return unique.length > 0 ? unique : ["https://placehold.co/400"];
    })();

    // Calculate Total Stock from variants if exists
    const totalStock = variants.length > 0
        ? variants.reduce((sum, v) => sum + (v.quantity || 0), 0)
        : (product.quantity || 0);

    // Current Price & Stock logic
    const currentPrice = selectedVariant
        ? selectedVariant.price
        : variants.length > 0
            ? variants[0].price
            : product.minPrice || 0;

    const currentStock = selectedVariant ? selectedVariant.quantity : totalStock;

    // Current Sold Logic
    const currentSold = selectedVariant
        ? (selectedVariant.sold || 0)
        : (product.totalSold || 0);

    // Status Logic (Handle both 'isActive' and 'active' just in case)
    const isProductActive = product.isActive !== undefined ? product.isActive : product.active;

    // Helper to render stars (simplified)
    const renderStars = (rating = 0) => {
        return (
            <div className="flex items-center text-yellow-500">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`w-4 h-4 ${star <= rating ? "fill-current" : "text-gray-300"}`}
                    />
                ))}
            </div>
        );
    };

    const handleViewProductPage = () => {
        window.open(`/products/${product.id}`, '_blank');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl h-[90vh] overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white shadow-sm z-10 shrink-0">
                    <h2 className="text-xl font-bold text-[#2B6377]">Chi tiết sản phẩm</h2>
                    <button
                        onClick={onClose}
                        className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                    >
                        <X size={20} className="text-gray-600" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                        {/* Left: Images */}
                        <div>
                            <ProductImageCarousel
                                images={displayImages}
                                selectedVariant={selectedVariant}
                            />
                        </div>

                        {/* Right: Info */}
                        <div className="flex flex-col gap-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">{product.name}</h2>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-medium text-xs">
                                        {product.category?.name || "Chưa phân loại"}
                                    </span>
                                    <span className="bg-[#2B6377]/10 text-[#2B6377] px-2 py-1 rounded-md font-medium text-xs">
                                        {product.brand?.name || product.brandName || "Chưa có thương hiệu"}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        {renderStars(product.averageRating || 5)}
                                        <span>({product.averageRating || 0})</span>
                                    </span>
                                </div>
                            </div>

                            {/* Price Box */}
                            <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                                <div className="text-3xl font-bold text-red-700 mb-4">
                                    {formatPrice(currentPrice)}
                                </div>

                                {/* Variants */}
                                {variants.length > 0 && (
                                    <div className="mb-6">
                                        <h3 className="font-semibold text-gray-700 mb-3">Phân loại:</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {variants.map((v) => {
                                                const vImg = v.imageUrls?.[0];
                                                const isSelected = selectedVariant?.id === v.id;
                                                return (
                                                    <button
                                                        key={v.id}
                                                        onClick={() => setSelectedVariant(v)}
                                                        className={`flex items-center gap-2 p-1 pr-3 rounded-lg border transition-all ${isSelected
                                                            ? "border-[#2B6377] bg-[#2B6377] text-white ring-2 ring-[#2B6377] ring-offset-1"
                                                            : "border-gray-200 hover:border-[#2B6377] bg-white text-gray-700"
                                                            }`}
                                                    >
                                                        {vImg && (
                                                            <img src={vImg} alt="" className="w-8 h-8 rounded-md object-cover bg-gray-100" />
                                                        )}
                                                        <div className="text-left">
                                                            <div className="text-xs font-bold">{v.variantName}</div>
                                                            <div className={`text-[10px] ${isSelected ? "text-blue-100" : "text-gray-500"}`}>
                                                                {formatPrice(v.price)}
                                                            </div>
                                                        </div>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Stock Info */}
                                <div className="flex items-center justify-between text-sm py-3 border-t border-gray-200 mt-2">
                                    <span className="text-gray-600">Trạng thái:</span>
                                    <span className={`font-bold ${isProductActive ? "text-green-600" : "text-gray-500"}`}>
                                        {isProductActive ? "Hoạt động" : "Vô hiệu hóa"}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Tồn kho hiện tại:</span>
                                    <span className="font-bold text-gray-900">{currentStock}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm mt-2">
                                    <span className="text-gray-600">Đã bán:</span>
                                    <span className="font-bold text-gray-900">{currentSold}</span>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Description Tabs */}
                    <div className="mt-8 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                        <div className="flex border-b border-gray-200 bg-gray-50">
                            {[{ id: "mo-ta", label: "Mô tả sản phẩm" }, { id: "thanh-phan", label: "Thành phần" }].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === tab.id
                                        ? "bg-white text-[#2B6377] border-t-2 border-t-[#2B6377]"
                                        : "text-gray-500 hover:text-gray-700"
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                        <div className="p-6 text-gray-700 text-sm leading-relaxed whitespace-pre-line min-h-[150px]">
                            {activeTab === "mo-ta" ? (
                                product.description || "Chưa có mô tả."
                            ) : (
                                "Thông tin thành phần đang cập nhật."
                            )}
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 shrink-0">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-white hover:border-gray-400 transition-all"
                    >
                        Quay lại
                    </button>
                    <button
                        onClick={handleViewProductPage}
                        className="px-5 py-2.5 rounded-lg bg-[#2B6377] text-white font-medium hover:bg-[#235161] shadow-sm transition-all flex items-center gap-2"
                    >
                        Xem ngay <i className="fa-solid fa-arrow-up-right-from-square text-xs"></i>
                    </button>
                </div>
            </div>
        </div >
    );
};

export default ProductDetailModal;