import React, { useState, useEffect } from 'react';
import { X, Package, Layers, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { filterProducts } from '../../services/productFilterApi';

const CategoryDetailModal = ({ isOpen, onClose, category, allCategories }) => {
    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [children, setChildren] = useState([]);

    useEffect(() => {
        if (isOpen && category) {
            // 1. Find Children
            const childCats = allCategories.filter(c => c.parent && c.parent.id === category.id);
            setChildren(childCats);

            // 2. Fetch Products
            fetchCategoryProducts();
        }
    }, [isOpen, category, allCategories]);

    const fetchCategoryProducts = async () => {
        setLoadingProducts(true);
        try {
            // Assuming filterProducts accepts 'categories' as ID
            const res = await filterProducts({ categories: category.id, size: 100 });
            setProducts(res.content || []);
        } catch (error) {
            console.error("Error fetching products for category", error);
        } finally {
            setLoadingProducts(false);
        }
    };

    if (!isOpen || !category) return null;

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
                                src={category.imageUrl || "https://placehold.co/100"}
                                alt={category.name}
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">{category.name}</h2>
                            {/* ID Removed as per request */}
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

                        {/* Status & Parent */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                <Layers size={16} /> Thông tin chung
                            </h3>
                            <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-100">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 font-medium">Trạng thái:</span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${category.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {category.isActive !== false ? 'Hoạt động' : 'Vô hiệu hóa'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 font-medium">Danh mục cha:</span>
                                    {category.parent ? (
                                        <div className="flex items-center gap-2 text-[#2B6377] font-medium bg-blue-50 px-2 py-1 rounded-md">
                                            <ArrowUpRight size={14} />
                                            {category.parent.name}
                                        </div>
                                    ) : (
                                        <span className="text-gray-400 italic">Đây là danh mục gốc</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Sub-categories */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                <ArrowDownRight size={16} /> Danh mục con ({children.length})
                            </h3>
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 min-h-[100px]">
                                {children.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {children.map(child => (
                                            <span key={child.id} className="inline-flex items-center px-3 py-1 rounded-full bg-white border border-gray-200 text-sm font-medium text-gray-700 shadow-sm">
                                                {child.name}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm italic">
                                        Không có danh mục con
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Products List */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Package size={16} /> Sản phẩm thuộc danh mục này ({products.length})
                        </h3>

                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                            {loadingProducts ? (
                                <div className="p-8 text-center text-gray-500">Đang tải sản phẩm...</div>
                            ) : products.length === 0 ? (
                                <div className="p-8 text-center text-gray-500 italic">Chưa có sản phẩm nào trong danh mục này.</div>
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
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-[#2B6377] hover:bg-[#224e5d] text-white rounded-lg font-medium transition-colors shadow-sm"
                    >
                        Đóng
                    </button>
                </div>

            </div>
        </div>
    );
};

export default CategoryDetailModal;
