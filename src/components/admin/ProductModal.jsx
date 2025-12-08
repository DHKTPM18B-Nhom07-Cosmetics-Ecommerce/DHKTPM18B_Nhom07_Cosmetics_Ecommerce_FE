import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, Loader2, AlertCircle, Archive } from 'lucide-react';
import { toast } from 'react-toastify';
import { getAllCategories } from '../../services/categoryService';
import { getAllBrands } from '../../services/brandService';
import { uploadImage } from '../../services/cloudinaryService';
import ImageUploader from './ImageUploader';
import ConfirmationModal from '../ui/ConfirmationModal';

const PLACEHOLDER_IMAGE = "https://placehold.co/600x400/e2e8f0/94a3b8?text=No+Image";

const formatCurrency = (value) => {
    if (!value) return '';
    return new Intl.NumberFormat('vi-VN').format(value);
};

const parseCurrency = (string) => {
    if (!string) return 0;
    return parseInt(string.replace(/\./g, ''), 10);
};

export default function ProductModal({ isOpen, onClose, onSave, product }) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        categoryId: '',
        brandId: '',
        isActive: true,
        images: [],
        variants: []
    });

    const [errors, setErrors] = useState({});
    const [step, setStep] = useState(1);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);

    // Main Product Image State
    const [mainPendingFiles, setMainPendingFiles] = useState([]); // { file, previewUrl }

    // Variant Image State (Map: variantIndex -> pendingFiles[])
    const [variantPendingFiles, setVariantPendingFiles] = useState({});

    const [isUploading, setIsUploading] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: "",
        message: "",
        onConfirm: null,
        variant: "info",
        confirmLabel: "Xác nhận"
    });

    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setErrors({});
            setMainPendingFiles([]);
            setVariantPendingFiles({});
            setIsUploading(false);
            loadDependencies();

            if (product) {
                setFormData({
                    name: product.name || '',
                    description: product.description || '',
                    categoryId: product.categoryId || (product.category ? product.category.id : ''),
                    brandId: product.brandId || (product.brand ? product.brand.id : ''),
                    isActive: product.isActive !== undefined ? product.isActive : (product.active !== undefined ? product.active : true),
                    images: product.images || [],
                    variants: product.variants ? product.variants.map(v => ({
                        variantName: v.variantName,
                        price: v.price,
                        quantity: v.quantity,
                        imageUrls: v.imageUrls || []
                    })) : []
                });

                // Lock if product exists and is inactive
                const initialActive = product.isActive !== undefined ? product.isActive : (product.active !== undefined ? product.active : true);
                setIsLocked(!initialActive);
            } else {
                setFormData({
                    name: '',
                    description: '',
                    categoryId: '',
                    brandId: '',
                    isActive: true,
                    images: [],
                    variants: []
                });
                setIsLocked(false);
            }
        }
    }, [isOpen, product]);

    const loadDependencies = async () => {
        try {
            const [cats, brds] = await Promise.all([getAllCategories(), getAllBrands()]);
            setCategories(cats);
            setBrands(brds);
        } catch (error) {
            console.error("Failed to load dependencies", error);
            toast.error("Không thể tải danh mục/thương hiệu");
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // --- Main Image Handling ---
    const handleMainFileSelect = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        const newFiles = files.map(file => ({ file, previewUrl: URL.createObjectURL(file) }));
        setMainPendingFiles(prev => [...prev, ...newFiles]);
        e.target.value = '';
    };

    const handleRemoveMainPending = (index) => {
        setMainPendingFiles(prev => {
            const updated = [...prev];
            URL.revokeObjectURL(updated[index].previewUrl);
            updated.splice(index, 1);
            return updated;
        });
    };

    const handleRemoveMainExisting = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    // --- Variant Handling ---
    const handleAddVariant = () => {
        const newIndex = formData.variants.length;
        setFormData(prev => ({
            ...prev,
            variants: [...prev.variants, { variantName: '', price: 0, quantity: '', imageUrls: [] }]
        }));

        // Clear errors for the new index to prevent ghost errors
        setErrors(prev => {
            const newErrors = { ...prev };
            Object.keys(newErrors).forEach(key => {
                if (key.startsWith(`variant_${newIndex}_`)) {
                    delete newErrors[key];
                }
            });
            return newErrors;
        });
    };

    const handleVariantChange = (index, field, value) => {
        const updatedVariants = [...formData.variants];
        updatedVariants[index] = { ...updatedVariants[index], [field]: value };
        setFormData(prev => ({ ...prev, variants: updatedVariants }));

        // Clear errors if any
        if (errors[`variant_${index}_${field}`]) {
            setErrors(prev => {
                const newErrs = { ...prev };
                delete newErrs[`variant_${index}_${field}`];
                return newErrs;
            });
        }
    };

    const handleRemoveVariant = (index) => {
        setFormData(prev => ({
            ...prev,
            variants: prev.variants.filter((_, i) => i !== index)
        }));

        // Clear all variant errors to avoid shifting issues
        setErrors(prev => {
            const newErrors = { ...prev };
            Object.keys(newErrors).forEach(key => {
                if (key.startsWith('variant_')) {
                    delete newErrors[key];
                }
            });
            return newErrors;
        });

        // Clean up pending files for this variant
        setVariantPendingFiles(prev => {
            const newPending = { ...prev };
            delete newPending[index];
            // Re-index pending files?
            // To ensure consistency, strict re-indexing would be needed but complex.
            // For now, simple removal is acceptable as pending state is transient.
            return newPending;
        });
    };

    // --- Variant Image Handling ---
    const handleVariantFileSelect = (index, e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        const newFiles = files.map(file => ({ file, previewUrl: URL.createObjectURL(file) }));

        setVariantPendingFiles(prev => ({
            ...prev,
            [index]: [...(prev[index] || []), ...newFiles]
        }));
        e.target.value = '';
    };

    const handleRemoveVariantPending = (variantIndex, fileIndex) => {
        setVariantPendingFiles(prev => {
            const currentFiles = prev[variantIndex] || [];
            const updated = [...currentFiles];
            URL.revokeObjectURL(updated[fileIndex].previewUrl);
            updated.splice(fileIndex, 1);
            return { ...prev, [variantIndex]: updated };
        });
    };

    const handleRemoveVariantExisting = (variantIndex, imgIndex) => {
        const updatedVariants = [...formData.variants];
        const currentUrls = updatedVariants[variantIndex].imageUrls || [];
        updatedVariants[variantIndex].imageUrls = currentUrls.filter((_, i) => i !== imgIndex);
        setFormData(prev => ({ ...prev, variants: updatedVariants }));
    };

    // --- Validation & Submit ---
    const validate = () => {
        const newErrors = {};

        // Step 1 Validation
        if (!formData.name.trim()) newErrors.name = "Vui lòng nhập tên sản phẩm";
        if (!formData.categoryId) newErrors.categoryId = "Vui lòng chọn danh mục";
        if (!formData.brandId) newErrors.brandId = "Vui lòng chọn thương hiệu";

        // Step 2 (Variant) Validation
        // If we are on step 2, or submitting entire form
        formData.variants.forEach((v, idx) => {
            if (!v.variantName.trim()) newErrors[`variant_${idx}_variantName`] = "Tên không được để trống";
            if (v.price <= 0) newErrors[`variant_${idx}_price`] = "Giá phải lớn hơn 0";
            if (v.quantity <= 0) newErrors[`variant_${idx}_quantity`] = "Số lượng phải lớn hơn 0";
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return false;
        }
        return true;
    };

    const handleNext = () => {
        // Validate Step 1 only
        const step1Errors = {};
        if (!formData.name.trim()) step1Errors.name = "Vui lòng nhập tên sản phẩm";
        if (!formData.categoryId) step1Errors.categoryId = "Vui lòng chọn danh mục";
        if (!formData.brandId) step1Errors.brandId = "Vui lòng chọn thương hiệu";

        if (Object.keys(step1Errors).length > 0) {
            setErrors(step1Errors);
            return;
        }
        setStep(2);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.variants.length === 0) {
            toast.error("Sản phẩm phải có ít nhất 1 biến thể");
            return;
        }

        if (!validate()) {
            toast.error("Vui lòng kiểm tra lại các trường thông tin!");
            return;
        }

        setIsUploading(true);

        try {
            // Helper to generate public ID
            const generatePublicId = (baseName, suffix = "") => {
                const cleanName = baseName.toLowerCase()
                    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents
                    .replace(/[^a-z0-9]/g, "_"); // replace special chars with _

                const randomId = Math.random().toString(36).substring(2, 8);
                return suffix ? `${cleanName}_${suffix}_${randomId}` : `${cleanName}_${randomId}`;
            };

            // 1. Tải lên ảnh sản phẩm chính
            let finalImages = [...formData.images];
            if (mainPendingFiles.length > 0) {
                // Use full path 'product'
                const uploadPromises = mainPendingFiles.map(pf => {
                    const publicId = generatePublicId(formData.name);
                    return uploadImage(pf.file, 'product', publicId);
                });
                const uploadedUrls = await Promise.all(uploadPromises);
                const validUrls = uploadedUrls.filter(url => url !== null);
                finalImages = [...finalImages, ...validUrls];
            }
            if (finalImages.length === 0) finalImages.push(PLACEHOLDER_IMAGE);

            // 2. Tải lên ảnh biến thể & Xây dựng dữ liệu biến thể cuối cùng
            const finalVariants = await Promise.all(formData.variants.map(async (v, idx) => {
                let vImages = [...(v.imageUrls || [])];
                const vPending = variantPendingFiles[idx] || [];

                if (vPending.length > 0) {
                    // Use full path 'product_variant'
                    const vUploadPromises = vPending.map(pf => {
                        // sanitize variant name, productName is base
                        const cleanVariantName = v.variantName.toLowerCase()
                            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                            .replace(/[^a-z0-9]/g, "_");
                        const publicId = generatePublicId(formData.name, cleanVariantName);
                        return uploadImage(pf.file, 'product_variant', publicId);
                    });
                    const vUploadedUrls = await Promise.all(vUploadPromises);
                    const vValidUrls = vUploadedUrls.filter(url => url !== null);
                    vImages = [...vImages, ...vValidUrls];
                }
                if (vImages.length === 0) vImages.push(PLACEHOLDER_IMAGE);

                return {
                    ...v,
                    imageUrls: vImages
                };
            }));

            // 3. Construct Final Data matching Backend Entity
            // Backend expects 'category' and 'brand' as objects with 'id'
            // Ensure IDs are numbers
            if (!formData.categoryId || !formData.brandId) {
                toast.error("Vui lòng chọn danh mục và thương hiệu");
                setIsUploading(false);
                return;
            }

            const finalData = {
                name: formData.name,
                description: formData.description,
                category: { id: Number(formData.categoryId) },
                brand: { id: Number(formData.brandId) },
                isActive: formData.isActive,
                images: finalImages,
                variants: finalVariants
            };

            console.log("Submitting Product Data:", JSON.stringify(finalData, null, 2));

            await onSave(finalData);
        } catch (error) {
            console.error("Submit failed:", error);
            toast.error("Lỗi khi lưu sản phẩm. Vui lòng thử lại.");
        } finally {
            setIsUploading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                {/* Header */}
                <div className="bg-[#2B6377] p-6 pb-8 text-center relative shrink-0">
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 text-white/80 hover:text-white hover:bg-white/10 p-1 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <h2 className="text-2xl font-bold text-white mb-6">
                        {product ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}
                    </h2>

                    <div className="flex justify-center gap-4">
                        {!isLocked ? (
                            <>
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-all ${step === 1
                                        ? 'bg-white text-[#2B6377] shadow-lg transform scale-105'
                                        : 'bg-white/20 text-white hover:bg-white/30'
                                        }`}
                                >
                                    <span>📝</span> Thông tin sản phẩm
                                </button>
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-all ${step === 2
                                        ? 'bg-white text-[#2B6377] shadow-lg transform scale-105'
                                        : 'bg-white/20 text-white hover:bg-white/30'
                                        }`}
                                >
                                    <span>🏷️</span> Biến thể ({formData.variants.length})
                                </button>
                            </>
                        ) : (
                            <div className="text-white/80 italic flex items-center gap-2">
                                <AlertCircle size={18} />
                                <span>Sản phẩm đang ngưng hoạt động</span>
                            </div>
                        )}
                    </div>
                </div>
                {/* Body */}
                <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
                    <form id="product-form" onSubmit={handleSubmit} className="h-full">
                        {(() => {
                            // Simplified UI for Inactive Products (Only if initially locked)
                            if (isLocked) {
                                return (
                                    <div className="flex flex-col items-center justify-center h-full py-12">
                                        <div className="bg-gray-100 p-8 rounded-2xl flex flex-col items-center max-w-md text-center">
                                            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4 text-gray-400">
                                                <Archive size={32} />
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-800 mb-2">Sản phẩm đã bị xóa</h3>
                                            <p className="text-gray-500 mb-6">
                                                Sản phẩm này hiện đang ngưng hoạt động. Vui lòng kích hoạt lại để chỉnh sửa thông tin.
                                            </p>

                                            <label className="flex items-center gap-3 p-4 bg-white rounded-xl border-2 border-[#2B6377]/20 hover:border-[#2B6377] cursor-pointer transition-all shadow-sm group w-full justify-center">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.isActive}
                                                    onChange={(e) => {
                                                        const checked = e.target.checked;
                                                        if (checked) {
                                                            setConfirmModal({
                                                                isOpen: true,
                                                                title: "Kích hoạt lại sản phẩm",
                                                                message: "Bạn có chắc chắn muốn kích hoạt lại sản phẩm này? Sau khi kích hoạt, bạn có thể chỉnh sửa thông tin sản phẩm.",
                                                                variant: "info",
                                                                confirmLabel: "Kích hoạt",
                                                                onConfirm: () => {
                                                                    setIsLocked(false);
                                                                    setFormData(prev => ({ ...prev, isActive: true }));
                                                                }
                                                            });
                                                        }
                                                    }}
                                                    className="w-6 h-6 text-[#2B6377] rounded focus:ring-[#2B6377] cursor-pointer"
                                                />
                                                <span className="text-base font-semibold text-[#2B6377]">Kích hoạt lại sản phẩm</span>
                                            </label>
                                        </div>
                                    </div>
                                );
                            }

                            // Active Product - Show Full Form
                            const formDisabled = false;
                            return step === 1 ? (
                                /* Step 1: Basic Info */
                                <div className="space-y-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Thông tin cơ bản</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tên sản phẩm <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                disabled={formDisabled}
                                                placeholder="Nhập tên sản phẩm..."
                                                className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-[#2B6377] focus:border-transparent transition-all outline-none ${errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'} ${formDisabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                                            />
                                            {errors.name && <p className="text-red-500 text-xs mt-1 font-medium">{errors.name}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Danh mục <span className="text-red-500">*</span></label>
                                            <select
                                                name="categoryId"
                                                value={formData.categoryId}
                                                onChange={handleChange}
                                                required
                                                disabled={formDisabled}
                                                className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-[#2B6377] focus:border-transparent transition-all outline-none bg-white ${errors.categoryId ? 'border-red-500 bg-red-50' : 'border-gray-300'} ${formDisabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                                            >
                                                <option value="">Chọn danh mục</option>
                                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                            {errors.categoryId && <p className="text-red-500 text-xs mt-1 font-medium">{errors.categoryId}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Thương hiệu <span className="text-red-500">*</span></label>
                                            <select
                                                name="brandId"
                                                value={formData.brandId}
                                                onChange={handleChange}
                                                required
                                                disabled={formDisabled}
                                                className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-[#2B6377] focus:border-transparent transition-all outline-none bg-white ${errors.brandId ? 'border-red-500 bg-red-50' : 'border-gray-300'} ${formDisabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                                            >
                                                <option value="">Chọn thương hiệu</option>
                                                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                            </select>
                                            {errors.brandId && <p className="text-red-500 text-xs mt-1 font-medium">{errors.brandId}</p>}
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mô tả</label>
                                            <textarea
                                                name="description"
                                                value={formData.description}
                                                onChange={handleChange}
                                                rows={4}
                                                disabled={formDisabled}
                                                placeholder="Mô tả chi tiết sản phẩm..."
                                                className={`w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#2B6377] focus:border-transparent transition-all outline-none resize-none ${formDisabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Trạng thái</label>
                                            <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg border border-gray-200 w-fit pr-4">
                                                <input
                                                    type="checkbox"
                                                    name="isActive"
                                                    checked={formData.isActive}
                                                    onChange={handleChange}
                                                    className="w-5 h-5 text-[#2B6377] rounded focus:ring-[#2B6377] cursor-pointer"
                                                />
                                                <span className="text-sm font-medium text-gray-700">Đang hoạt động</span>
                                            </div>
                                        </div>
                                    </div>

                                    <ImageUploader
                                        existingImages={formData.images}
                                        pendingFiles={mainPendingFiles}
                                        onFileSelect={handleMainFileSelect}
                                        onRemovePending={handleRemoveMainPending}
                                        onRemoveExisting={handleRemoveMainExisting}
                                        idPrefix="main-product-img"
                                        disabled={formDisabled}
                                    />
                                </div>
                            ) : (
                                /* Step 2: Variants */
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-full">
                                    <div className="flex justify-between items-center mb-6">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-800">Danh sách biến thể</h3>
                                            <p className="text-sm text-gray-500 mt-1">Quản lý các biến thể màu sắc, kích thước và giá.</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleAddVariant}
                                            disabled={formDisabled}
                                            className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg shadow-sm transition-colors font-medium ${formDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#10b981] hover:bg-[#059669]'}`}
                                        >
                                            <Plus size={18} /> Thêm biến thể
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {formData.variants.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                    <span className="text-2xl">📦</span>
                                                </div>
                                                <p className="text-gray-500 font-medium text-center">Chưa có biến thể nào.</p>
                                                <p className="text-gray-400 text-sm text-center mt-1">Hãy nhấn nút "Thêm biến thể" để bắt đầu.</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 gap-6">
                                                {formData.variants.map((variant, idx) => (
                                                    <div key={idx} className="p-5 border border-gray-200 rounded-xl bg-white hover:shadow-md transition-shadow relative group">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveVariant(idx)}
                                                            disabled={formDisabled}
                                                            className={`absolute top-4 right-4 transition-colors p-1 ${formDisabled ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-red-500'}`}
                                                        >
                                                            <X size={18} />
                                                        </button>

                                                        {/* Variant Fields */}
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                                                            <div className="md:col-span-2">
                                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                                                    Tên biến thể <span className="text-red-500">*</span>
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={variant.variantName}
                                                                    onChange={(e) => handleVariantChange(idx, 'variantName', e.target.value)}
                                                                    disabled={formDisabled}
                                                                    placeholder="VD: Đỏ - Size M"
                                                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-[#10b981] outline-none text-sm font-medium ${errors[`variant_${idx}_variantName`] ? 'border-red-500' : 'border-gray-300'} ${formDisabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                                                                    required
                                                                />
                                                                {errors[`variant_${idx}_variantName`] && (
                                                                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                                                        <AlertCircle size={12} /> {errors[`variant_${idx}_variantName`]}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                                                    Giá bán (VNĐ) <span className="text-red-500">*</span>
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={formatCurrency(variant.price)}
                                                                    onChange={(e) => handleVariantChange(idx, 'price', parseCurrency(e.target.value))}
                                                                    disabled={formDisabled}
                                                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-[#10b981] outline-none text-sm font-medium ${errors[`variant_${idx}_price`] ? 'border-red-500' : 'border-gray-300'} ${formDisabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                                                                    required
                                                                />
                                                                {errors[`variant_${idx}_price`] && (
                                                                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                                                        <AlertCircle size={12} /> {errors[`variant_${idx}_price`]}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                                                    Số lượng <span className="text-red-500">*</span>
                                                                </label>
                                                                <input
                                                                    type="number"
                                                                    value={variant.quantity}
                                                                    onChange={(e) => handleVariantChange(idx, 'quantity', e.target.value === '' ? '' : parseInt(e.target.value))}
                                                                    onKeyDown={(e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
                                                                    disabled={formDisabled}
                                                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-[#10b981] outline-none text-sm font-medium ${errors[`variant_${idx}_quantity`] ? 'border-red-500' : 'border-gray-300'} ${formDisabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                                                                    min="0"
                                                                    required
                                                                />
                                                                {errors[`variant_${idx}_quantity`] && (
                                                                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                                                        <AlertCircle size={12} /> {errors[`variant_${idx}_quantity`]}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Variant Image Uploader */}
                                                        <div className="border-t pt-4">
                                                            <ImageUploader
                                                                existingImages={variant.imageUrls || []}
                                                                pendingFiles={variantPendingFiles[idx] || []}
                                                                onFileSelect={(e) => handleVariantFileSelect(idx, e)}
                                                                onRemovePending={(fileIdx) => handleRemoveVariantPending(idx, fileIdx)}
                                                                onRemoveExisting={(imgIdx) => handleRemoveVariantExisting(idx, imgIdx)}
                                                                idPrefix={`variant-img-${idx}`}
                                                                maxImages={5}
                                                                disabled={formDisabled}
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })()}
                    </form>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 bg-white shrink-0 flex justify-end gap-3 rounded-b-2xl">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isUploading}
                        className="px-6 py-2.5 bg-[#64748b] text-white rounded-lg hover:bg-[#475569] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Hủy
                    </button>
                    {step === 1 ? (
                        <button
                            type="button"
                            onClick={handleNext}
                            className="px-6 py-2.5 bg-[#2B6377] text-white rounded-lg hover:bg-[#234d5e] font-medium shadow-sm transition-colors"
                        >
                            Tiếp theo
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={isUploading}
                            className="flex items-center gap-2 px-6 py-2.5 bg-[#2B6377] text-white rounded-lg hover:bg-[#234d5e] font-medium shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    <span>Đang xử lý...</span>
                                </>
                            ) : (
                                <span>{product ? 'Cập nhật sản phẩm' : 'Tạo sản phẩm'}</span>
                            )}
                        </button>
                    )}
                </div>
            </div>

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                variant={confirmModal.variant}
                confirmLabel={confirmModal.confirmLabel}
            />
        </div >
    );
}

