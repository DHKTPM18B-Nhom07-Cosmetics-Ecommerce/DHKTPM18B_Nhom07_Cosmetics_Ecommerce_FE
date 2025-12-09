import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

export default function CategoryModal({ isOpen, onClose, onSave, category }) {
    const [formData, setFormData] = useState({
        name: '',
        isActive: true
    });

    const [isUploading, setIsUploading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen) {
            setErrors({});
            setIsUploading(false);

            if (category) {
                setFormData({
                    name: category.name || '',
                    isActive: category.isActive !== undefined ? category.isActive : true
                });
            } else {
                setFormData({
                    name: '',
                    isActive: true
                });
            }
        }
    }, [isOpen, category]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            setErrors({ name: "Vui lòng nhập tên danh mục" });
            return;
        }

        setIsUploading(true);

        try {
            const finalData = {
                id: category?.id,
                name: formData.name,
                isActive: formData.isActive
            };

            await onSave(finalData);
        } catch (error) {
            console.error("Submit failed:", error);
            toast.error("Lỗi khi lưu danh mục.");
        } finally {
            setIsUploading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden flex flex-col shadow-2xl">
                <div className="bg-[#2B6377] p-6 text-center relative shrink-0">
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 text-white/80 hover:text-white hover:bg-white/10 p-1 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                    <h2 className="text-xl font-bold text-white">
                        {category ? 'Cập nhật danh mục' : 'Thêm danh mục mới'}
                    </h2>
                </div>

                <div className="p-6 bg-gray-50 flex-1 overflow-y-auto">
                    <form onSubmit={handleSubmit} className="flex flex-col h-full">
                        <div className="space-y-6">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tên danh mục <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Nhập tên danh mục..."
                                    className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-[#2B6377] outline-none ${errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                                />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                            </div>

                            {/* Status */}
                            <div>
                                <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors w-fit">
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                        className="w-5 h-5 text-[#2B6377] rounded focus:ring-[#2B6377] cursor-pointer"
                                    />
                                    <span className="font-medium text-gray-700 whitespace-nowrap">Hoạt động</span>
                                </label>
                            </div>

                        </div>

                        <div className="pt-8 flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                type="submit"
                                disabled={isUploading}
                                className="flex-1 px-4 py-2.5 bg-[#2B6377] text-white rounded-lg hover:bg-[#204a59] transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Đang lưu...
                                    </>
                                ) : (
                                    category ? 'Cập nhật' : 'Thêm mới'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
