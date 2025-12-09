import React, { useState, useEffect } from 'react';
import { X, Package, Layers, ExternalLink } from 'lucide-react';
import { filterProducts } from '../../services/productFilterApi';
import { Link } from 'react-router-dom';

const BrandDetailModal = ({ isOpen, onClose, brand }) => {
    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(false);

    useEffect(() => {
        if (isOpen && brand) {
            fetchBrandProducts();
        }
    }, [isOpen, brand]);

    const fetchBrandProducts = async () => {
        setLoadingProducts(true);
        try {
            // Filter products by this brand ID
            const res = await filterProducts({ brands: brand.id, size: 100 });
            setProducts(res.content || []);
        } catch (error) {
            console.error("Error fetching products for brand", error);
        } finally {
            setLoadingProducts(false);
        }
    };

    if (!isOpen || !brand) return null;

    // Helper to format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount || 0);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 anim-fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">

                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-lg border border-gray-200 bg-white p-1 overflow-hidden">
                            <img
                                src={brand.logo || brand.imageUrl || "https://placehold.co/100"}
                                alt={brand.name}
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">{brand.name}</h2>
                            <p className="text-sm text-gray-500 line-clamp-1">{brand.description || "Chưa có mô tả"}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto space-y-8 custom-scrollbar flex-1">

                    {/* Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Status */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                <Layers size={16} /> Thông tin chung
                            </h3>
                            <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-100">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 font-medium">Trạng thái:</span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${brand.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {brand.isActive !== false ? 'Hoạt động' : 'Vô hiệu hóa'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 font-medium">Số lượng sản phẩm:</span>
                                    <span className="font-bold text-[#2B6377]">{products.length}</span>
                                </div>
                            </div>
                        </div>

                        {/* Description (Full) */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                <Layers size={16} /> Mô tả đầy đủ
                            </h3>
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-sm text-gray-600 min-h-[80px]">
                                {brand.description || "Không có mô tả chi tiết."}
                            </div>
                        </div>
                    </div>

                    {/* Products List */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Package size={16} /> Danh sách sản phẩm ({products.length})
                        </h3>

                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                            {loadingProducts ? (
                                <div className="p-8 text-center text-gray-500">Đang tải sản phẩm...</div>
                            ) : products.length === 0 ? (
                                <div className="p-8 text-center text-gray-500 italic">Chưa có sản phẩm nào thuộc thương hiệu này.</div>
                            ) : (
                                <div className="overflow-x-auto max-h-[300px]">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-gray-50 sticky top-0 z-10">
                                            <tr>
                                                <th className="p-3 font-semibold text-gray-700">Tên sản phẩm</th>
                                                <th className="p-3 font-semibold text-gray-700 text-right">Giá</th>
                                                <th className="p-3 font-semibold text-gray-700 text-right">Tồn kho</th>
                                                <th className="p-3 font-semibold text-gray-700 text-center">Trạng thái</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {products.map(p => (
                                                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="p-3 font-medium text-gray-900 flex items-center gap-2">
                                                        <img src={(p.images && p.images[0]) || "https://placehold.co/20"} className="w-8 h-8 rounded object-cover border" alt="" />
                                                        <span className="line-clamp-1">{p.name}</span>
                                                    </td>
                                                    <td className="p-3 text-right font-medium text-[#2B6377]">
                                                        {formatCurrency(p.minPrice)}
                                                    </td>
                                                    <td className="p-3 text-right">
                                                        {p.variants?.reduce((s, v) => s + (v.quantity || 0), 0) || 0}
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${p.active !== false ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                                                            {p.active !== false ? 'Active' : 'Disabled'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors shadow-sm"
                    >
                        Đóng
                    </button>
                    <Link
                        to={`/products?brands=${brand.id}`}
                        target="_blank"
                        className="px-6 py-2 bg-[#2B6377] hover:bg-[#224e5d] text-white rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2"
                    >
                        Xem sản phẩm <ExternalLink size={16} />
                    </Link>
                </div>

            </div>
        </div>
    );
};

export default BrandDetailModal;
