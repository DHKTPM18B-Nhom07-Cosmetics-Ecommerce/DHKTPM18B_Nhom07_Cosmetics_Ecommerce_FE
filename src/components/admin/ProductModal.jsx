import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, Loader2, AlertCircle, Archive } from 'lucide-react';
import { toast } from 'react-toastify';
import { getAllCategories } from '../../services/categoryService';
import { getAllBrands } from '../../services/brandService';
import { uploadImage } from '../../services/cloudinaryService';
import ImageUploader from './ImageUploader';
import ConfirmationModal from '../ui/ConfirmationModal';

export default function ProductModal({ isOpen, onClose, onSave, product }) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        categoryId: '',
        brandId: '',
        active: true,
        images: [],
        variants: []
    });

    const [errors, setErrors] = useState({});
    const [step, setStep] = useState(1);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);

    // Cascading Category Path State
    const [selectedCategoryPath, setSelectedCategoryPath] = useState([]);
    const [isLeafCategory, setIsLeafCategory] = useState(false);

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
                    active: product.active !== undefined ? product.active : (product.isActive !== undefined ? product.isActive : true),
                    images: product.images || [],
                    variants: product.variants ? product.variants.map(v => ({
                        variantName: v.variantName,
                        price: v.price,
                        quantity: v.quantity,
                        sold: v.sold || 0,
                        imageUrls: v.imageUrls || []
                    })) : []
                });

                // Lock if product exists and is inactive
                const initialActive = product.active !== undefined ? product.active : (product.isActive !== undefined ? product.isActive : true);
                setIsLocked(!initialActive);

                // Reconstruct Category Path
                if (product.category && categories.length > 0) {
                    const path = [];
                    let currId = product.category.id;
                    let safety = 0;
                    while (currId && safety < 10) {
                        path.unshift(currId);
                        const found = categories.find(c => c.id === currId);
                        if (found && found.parent) {
                            currId = found.parent.id;
                        } else {
                            currId = null;
                        }
                        safety++;
                    }
                    setSelectedCategoryPath(path);
                    setIsLeafCategory(true); // Existing product usually has valid category
                } else {
                    setSelectedCategoryPath([]);
                    setIsLeafCategory(false);
                }

            } else {
                setFormData({
                    name: '',
                    description: '',
                    categoryId: '',
                    brandId: '',
                    active: true,
                    images: [],
                    variants: []
                });
                setIsLocked(false);
                setSelectedCategoryPath([]);
                setIsLeafCategory(false);
            }
        }
    }, [isOpen, product]); // Removed categories to prevent reset loop

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

    // --- Cascading Logic ---
    const getCategoryOptionsForLevel = (levelIndex) => {
        if (levelIndex === 0) return categories.filter(c => !c.parent);
        const parentId = selectedCategoryPath[levelIndex - 1];
        if (!parentId) return [];
        return categories.filter(c => c.parent && c.parent.id === parentId);
    };

    const handleCategoryPathChange = (levelIndex, value) => {
        const newPath = [...selectedCategoryPath];
        if (value) {
            newPath[levelIndex] = Number(value);
            newPath.length = levelIndex + 1; // Trim deeper
        } else {
            newPath.length = levelIndex; // Trim current
        }

        setSelectedCategoryPath(newPath);

        const lastId = newPath.length > 0 ? newPath[newPath.length - 1] : '';
        const hasChildren = categories.some(c => c.parent && c.parent.id === lastId);

        const isLeaf = lastId && !hasChildren;
        setIsLeafCategory(isLeaf);

        setFormData(prev => ({
            ...prev,
            categoryId: isLeaf ? lastId : ''
        }));

        if (errors.categoryId) {
            setErrors(prev => ({ ...prev, categoryId: '' }));
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
            variants: [...prev.variants, { variantName: '', price: 0, quantity: '', sold: 0, imageUrls: [] }]
        }));

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

        setErrors(prev => {
            const newErrors = { ...prev };
            Object.keys(newErrors).forEach(key => {
                if (key.startsWith('variant_')) {
                    delete newErrors[key];
                }
            });
            return newErrors;
        });

        setVariantPendingFiles(prev => {
            const newPending = { ...prev };
            delete newPending[index];
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

        if (!formData.name.trim()) newErrors.name = "Vui lòng nhập tên sản phẩm";
        if (!formData.categoryId) newErrors.categoryId = "Vui lòng chọn danh mục";
        if (!formData.brandId) newErrors.brandId = "Vui lòng chọn thương hiệu";

        formData.variants.forEach((v, idx) => {
            if (!v.variantName.trim()) newErrors[`variant_${idx}_variantName`] = "Tên không được để trống";
            if (v.price <= 0) newErrors[`variant_${idx}_price`] = "Giá phải lớn hơn 0";
            if (v.quantity <= 0) newErrors[`variant_${idx}_quantity`] = "Số lượng phải lớn hơn 0";
            if (v.sold === '' || v.sold === null || v.sold < 0) newErrors[`variant_${idx}_sold`] = "Đã bán phải >= 0";
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return false;
        }
        return true;
    };

    const handleNext = () => {
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
            const generatePublicId = (baseName, suffix = "") => {
                const cleanName = baseName.toLowerCase()
                    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                    .replace(/[^a-z0-9]/g, "_");

                const randomId = Math.random().toString(36).substring(2, 8);
                return suffix ? `${cleanName}_${suffix}_${randomId}` : `${cleanName}_${randomId}`;
            };

            const mainImagePromises = mainPendingFiles.map((fileObj, index) =>
                uploadImage(fileObj.file, 'product', generatePublicId(formData.name, `main_${index}`))
            );
            const uploadedMainImages = await Promise.all(mainImagePromises);

            const finalImages = [...formData.images, ...uploadedMainImages.filter(url => url !== null)];

            const variantPromises = formData.variants.map(async (variant, index) => {
                const pendingFiles = variantPendingFiles[index] || [];
                const variantImagePromises = pendingFiles.map((fileObj, fIdx) =>
                    uploadImage(fileObj.file, 'product_variant', generatePublicId(formData.name, `var_${index}_${fIdx}`))
                );
                const uploadedVariantImages = await Promise.all(variantImagePromises);

                return {
                    ...variant,
                    variantName: variant.variantName, // Ensure consistent naming
                    imageUrls: [...(variant.imageUrls || []), ...uploadedVariantImages.filter(url => url !== null)]
                };
            });

            const finalVariants = await Promise.all(variantPromises);

            if (finalImages.length === 0 && finalVariants.every(v => v.imageUrls.length === 0)) {
                setIsUploading(false);
                toast.error("Vui lòng tải lên ít nhất 1 hình ảnh sản phẩm hoặc biến thể");
                return;
            }

            const finalData = {
                id: product?.id, // Includes ID for update
                name: formData.name,
                description: formData.description,
                category: { id: Number(formData.categoryId) },
                brand: { id: Number(formData.brandId) },
                active: formData.active,
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
                            if (isLocked) {
                                return (
                                    <div className="flex flex-col items-center justify-center h-full py-12">
                                        <div className="bg-gray-100 p-8 rounded-2xl flex flex-col items-center max-w-md text-center">
                                            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4 text-gray-400">
                                                <Archive size={32} />
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-800 mb-2">Sản phẩm đã bị xóa</h3>


                                            <label className="flex items-center gap-3 p-4 bg-white rounded-xl border-2 border-[#2B6377]/20 hover:border-[#2B6377] cursor-pointer transition-all shadow-sm group w-full justify-center">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.active}
                                                    onChange={(e) => {
                                                        const checked = e.target.checked;
                                                        if (checked) {
                                                            setConfirmModal({
                                                                isOpen: true,
                                                                title: "Kích hoạt lại sản phẩm",
                                                                message: "Bạn có chắc chắn muốn kích hoạt lại sản phẩm này? Sau khi kích hoạt, bạn có thể chỉnh sửa thông tin sản phẩm.",
                                                                confirmLabel: "Kích hoạt",
                                                                variant: "success",
                                                                onConfirm: () => {
                                                                    setFormData(prev => ({ ...prev, active: true }));
                                                                    setIsLocked(false);
                                                                    setConfirmModal({ isOpen: false });
                                                                }
                                                            });
                                                        }
                                                    }}
                                                    className="w-5 h-5 text-[#2B6377] rounded focus:ring-[#2B6377] cursor-pointer"
                                                />
                                                <span className="font-medium text-gray-700 group-hover:text-[#2B6377] transition-colors">Kích hoạt lại sản phẩm</span>
                                            </label>
                                        </div>
                                    </div>
                                );
                            }

                            return step === 1 ? (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tên sản phẩm <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                disabled={isLocked}
                                                placeholder="Nhập tên sản phẩm..."
                                                className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-[#2B6377] outline-none ${errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
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
                                                disabled={isLocked}
                                                className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-[#2B6377] outline-none bg-white ${errors.categoryId ? 'border-red-500 bg-red-50' : 'border-gray-300'} ${isLocked ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                                            >
                                                <option value="">Chọn danh mục</option>
                                                {categories.filter(cat => {
                                                    // Only show leaf categories (categories that are NOT parents)
                                                    const isParent = categories.some(c => c.parent && c.parent.id === cat.id);
                                                    return !isParent;
                                                }).map(c => (
                                                    <option key={c.id} value={c.id}>
                                                        {c.name}
                                                    </option>
                                                ))}
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
                                                disabled={isLocked}
                                                className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-[#2B6377] focus:border-transparent transition-all outline-none bg-white ${errors.brandId ? 'border-red-500 bg-red-50' : 'border-gray-300'} ${isLocked ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
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
                                                disabled={isLocked}
                                                placeholder="Mô tả chi tiết sản phẩm..."
                                                className={`w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#2B6377] focus:border-transparent transition-all outline-none resize-none ${isLocked ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                                            />
                                        </div>

                                        {product && (
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Trạng thái</label>
                                                <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg border border-gray-200 w-fit pr-4">
                                                    <input
                                                        type="checkbox"
                                                        name="active"
                                                        checked={formData.active}
                                                        onChange={handleChange}
                                                        disabled={isLocked}
                                                        className="w-5 h-5 text-[#2B6377] rounded focus:ring-[#2B6377] cursor-pointer"
                                                    />
                                                    <span className="text-sm font-medium text-gray-700">Đang hoạt động</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <ImageUploader
                                        existingImages={formData.images}
                                        pendingFiles={mainPendingFiles}
                                        onFileSelect={handleMainFileSelect}
                                        onRemovePending={handleRemoveMainPending}
                                        onRemoveExisting={handleRemoveMainExisting}
                                        idPrefix="main-product-img"
                                        disabled={isLocked}
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
                                            disabled={isLocked}
                                            className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg shadow-sm transition-colors font-medium ${isLocked ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#10b981] hover:bg-[#059669]'}`}
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
                                                {formData.variants.map((variant, index) => (
                                                    <div key={index} className="relative bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow group">
                                                        <button
                                                            type="button"
                                                            onClick={() => setConfirmModal({
                                                                isOpen: true,
                                                                title: "Xóa biến thể",
                                                                message: "Bạn có chắc chắn muốn xóa biến thể này không?",
                                                                onConfirm: () => {
                                                                    handleRemoveVariant(index);
                                                                    setConfirmModal({ isOpen: false });
                                                                },
                                                                variant: "danger",
                                                                confirmLabel: "Xóa"
                                                            })}
                                                            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                            disabled={isLocked}
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>

                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-600 mb-1">Tên biến thể <span className="text-red-500">*</span></label>
                                                                <input
                                                                    type="text"
                                                                    value={variant.variantName}
                                                                    onChange={(e) => handleVariantChange(index, 'variantName', e.target.value)}
                                                                    placeholder="VD: Đỏ, 20ml, 1 chai..."
                                                                    disabled={isLocked}
                                                                    className={`w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-[#2B6377] ${errors[`variant_${index}_variantName`] ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                                                                />
                                                                {errors[`variant_${index}_variantName`] && <p className="text-red-500 text-xs mt-1">{errors[`variant_${index}_variantName`]}</p>}
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-600 mb-1">Giá (VNĐ) <span className="text-red-500">*</span></label>
                                                                <input
                                                                    type="number"
                                                                    min={0}
                                                                    value={variant.price}
                                                                    onChange={(e) => handleVariantChange(index, 'price', Number(e.target.value))}
                                                                    disabled={isLocked}
                                                                    className={`w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-[#2B6377] ${errors[`variant_${index}_price`] ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                                                                />
                                                                {errors[`variant_${index}_price`] && <p className="text-red-500 text-xs mt-1">{errors[`variant_${index}_price`]}</p>}
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                                                    Số lượng <span className="text-red-500">*</span>
                                                                    {Number(variant.quantity) === 0 && <span className="text-red-500 font-bold text-xs ml-2">(Tạm hết hàng)</span>}
                                                                    {Number(variant.quantity) > 0 && Number(variant.quantity) <= 10 && <span className="text-orange-500 font-bold text-xs ml-2">(Sắp hết hàng)</span>}
                                                                </label>
                                                                <input
                                                                    type="number"
                                                                    min={0}
                                                                    value={variant.quantity}
                                                                    onChange={(e) => handleVariantChange(index, 'quantity', e.target.value)}
                                                                    disabled={isLocked}
                                                                    className={`w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-[#2B6377] ${errors[`variant_${index}_quantity`] ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                                                                />
                                                                {errors[`variant_${index}_quantity`] && <p className="text-red-500 text-xs mt-1">{errors[`variant_${index}_quantity`]}</p>}
                                                            </div>
                                                        </div>

                                                        {/* Variant Images */}
                                                        <div>
                                                            <ImageUploader
                                                                existingImages={variant.imageUrls}
                                                                pendingFiles={variantPendingFiles[index]}
                                                                onFileSelect={(e) => handleVariantFileSelect(index, e)}
                                                                onRemovePending={(fileIndex) => handleRemoveVariantPending(index, fileIndex)}
                                                                onRemoveExisting={(imgIndex) => handleRemoveVariantExisting(index, imgIndex)}
                                                                idPrefix={`variant-${index}`}
                                                                maxImages={5}
                                                                disabled={isLocked}
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

                        {/* Footer Actions */}
                        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 shrink-0">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                            >
                                Hủy bỏ
                            </button>

                            {step === 1 && !isLocked && (
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    className="px-6 py-2.5 rounded-lg bg-[#2B6377] text-white font-medium hover:bg-[#204a59] transition-colors shadow-lg hover:shadow-xl"
                                >
                                    Tiếp tục (Biến thể)
                                </button>
                            )}

                            {step === 2 && !isLocked && (
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                                    >
                                        Quay lại
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isUploading}
                                        className="px-6 py-2.5 rounded-lg bg-[#2B6377] text-white font-medium hover:bg-[#204a59] transition-colors shadow-lg hover:shadow-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isUploading && <Loader2 className="w-4 h-4 animate-spin" />}
                                        {product ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm'}
                                    </button>
                                </div>
                            )}

                            {isLocked && (
                                <div className="flex gap-3 items-center">
                                    <span className="text-gray-500 italic text-sm mr-2">Cần kích hoạt để chỉnh sửa</span>
                                    <button
                                        type="button"
                                        disabled
                                        className="px-6 py-2.5 rounded-lg bg-gray-300 text-white font-medium cursor-not-allowed"
                                    >
                                        Đã khóa
                                    </button>
                                </div>
                            )}
                        </div>
                    </form>
                </div>

                {/* Confirmation Modal */}
                <ConfirmationModal
                    isOpen={confirmModal.isOpen}
                    onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                    onConfirm={confirmModal.onConfirm}
                    title={confirmModal.title}
                    message={confirmModal.message}
                    variant={confirmModal.variant}
                    confirmLabel={confirmModal.confirmLabel}
                />
            </div>
        </div>
    );
}
