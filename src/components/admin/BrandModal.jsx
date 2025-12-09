import React, { useState, useEffect } from 'react';
import { X, Check, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import ImageUploader from './ImageUploader';
import { uploadImage } from '../../services/cloudinaryService';

export default function BrandModal({ isOpen, onClose, onSave, brand }) {
    const [formData, setFormData] = useState({
        name: '',
        logo: '',
        description: ''
    });

    const [pendingFile, setPendingFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen) {
            setErrors({});
            setPendingFile(null);
            setIsUploading(false);

            if (brand) {
                setFormData({
                    id: brand.id,
                    name: brand.name || '',
                    logo: brand.logo || '',
                    description: brand.description || '',
                    isActive: brand.isActive
                });
            } else {
                setFormData({
                    name: '',
                    logo: '',
                    description: '',
                    isActive: true
                });
            }
        }
    }, [isOpen, brand]);

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = "Tên thương hiệu không được để trống";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setPendingFile({
            file,
            previewUrl: URL.createObjectURL(file)
        });
        e.target.value = '';
    };

    const handleRemovePending = () => {
        if (pendingFile) {
            URL.revokeObjectURL(pendingFile.previewUrl);
            setPendingFile(null);
        }
    };

    const handleRemoveExisting = () => {
        setFormData(prev => ({ ...prev, logo: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsUploading(true);
        try {
            let finalLogoUrl = formData.logo;

            if (pendingFile) {
                const cleanName = formData.name.toLowerCase()
                    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                    .replace(/[^a-z0-9]/g, "_");
                const randomId = Math.random().toString(36).substring(2, 8);
                const publicId = `${cleanName}_brand_${randomId}`;

                const uploadedUrl = await uploadImage(pendingFile.file, 'brand', publicId);
                if (uploadedUrl) {
                    finalLogoUrl = uploadedUrl;
                }
            }

            const finalData = {
                ...formData,
                logo: finalLogoUrl
            };

            await onSave(finalData);
        } catch (error) {
            console.error(error);
            toast.error("Lỗi khi lưu thương hiệu");
        } finally {
            setIsUploading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl transform transition-all scale-100 animate-in zoom-in-95 duration-200 overflow-hidden">

                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-[#2B6377]/5">
                    <div>
                        <h2 className="text-xl font-bold text-[#2B6377]">
                            {brand ? "Chỉnh sửa thương hiệu" : "Thêm thương hiệu mới"}
                        </h2>
                        <p className="text-xs text-gray-500 mt-1">
                            {brand ? "Cập nhật thông tin thương hiệu" : "Điền thông tin để tạo thương hiệu mới"}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Tên thương hiệu <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => {
                                    setFormData({ ...formData, name: e.target.value });
                                    if (errors.name) setErrors({ ...errors, name: null });
                                }}
                                className={`w-full px-4 py-2.5 rounded-xl border ${errors.name ? 'border-red-300 focus:ring-red-200' : 'border-gray-300 focus:ring-[#2B6377]/20 focus:border-[#2B6377]'} focus:outline-none focus:ring-4 transition-all`}
                                placeholder="Nhập tên thương hiệu..."
                            />
                            {errors.name && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 animate-pulse">
                                    <AlertCircle size={18} />
                                </div>
                            )}
                        </div>
                        {errors.name && (
                            <p className="mt-1.5 text-xs text-red-500 font-medium flex items-center gap-1.5 animate-in slide-in-from-top-1">
                                <AlertCircle size={12} /> {errors.name}
                            </p>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Mô tả (Tùy chọn)
                        </label>
                        <textarea
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-[#2B6377]/20 focus:border-[#2B6377] focus:outline-none focus:ring-4 transition-all resize-none"
                            placeholder="Nhập mô tả về thương hiệu..."
                        />
                    </div>

                    {/* Image Upload */}
                    <div>
                        <ImageUploader
                            existingImages={formData.logo ? [formData.logo] : []}
                            pendingFiles={pendingFile ? [{ file: pendingFile.file, previewUrl: pendingFile.previewUrl }] : []}
                            onFileSelect={handleFileSelect}
                            onRemovePending={handleRemovePending}
                            onRemoveExisting={handleRemoveExisting}
                            folder="brand"
                            label="Logo thương hiệu"
                            maxImages={1}
                        />
                    </div>

                </form>

                {/* Footer */}
                <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                    >
                        Hủy bỏ
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isUploading}
                        className="px-6 py-2.5 rounded-xl font-bold text-white bg-[#2B6377] hover:bg-[#235161] active:translate-y-0.5 transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isUploading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Đang lưu...
                            </>
                        ) : (
                            <>
                                <Check size={18} strokeWidth={2.5} />
                                {brand ? 'Cập nhật' : 'Tạo mới'}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
