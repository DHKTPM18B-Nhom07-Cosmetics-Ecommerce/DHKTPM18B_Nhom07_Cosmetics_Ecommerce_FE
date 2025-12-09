import React, { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';
import { getAllCategories } from '../../services/categoryService';
import { uploadImage } from '../../services/cloudinaryService';
import ImageUploader from './ImageUploader';

export default function CategoryModal({ isOpen, onClose, onSave, category }) {
    const [formData, setFormData] = useState({
        name: '',
        parentId: '',
        imageUrl: '',
        isActive: true
    });

    const [pendingFile, setPendingFile] = useState(null);
    const [categories, setCategories] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [errors, setErrors] = useState({});

    // Cascading Dropdown State: Array of selected IDs [level1Id, level2Id, ...]
    const [selectedPath, setSelectedPath] = useState([]);

    useEffect(() => {
        if (isOpen) {
            loadCategories();
            setErrors({});
            setPendingFile(null);
            setIsUploading(false);

            if (category) {
                setFormData({
                    name: category.name || '',
                    parentId: category.parentId || '',
                    imageUrl: category.imageUrl || '',
                    isActive: category.isActive !== undefined ? category.isActive : true
                });
            } else {
                setFormData({
                    name: '',
                    parentId: '',
                    imageUrl: '',
                    isActive: true
                });
                setSelectedPath([]); // Reset path for new
            }
        }
    }, [isOpen, category]);

    // Initialize path when categories are loaded (or when editing)
    useEffect(() => {
        if (isOpen && categories.length > 0) {
            if (category && category.parent) {
                // Reconstruct path: walk up from category.parent
                const path = [];
                let curr = category.parent;
                // Safety depth limit 10
                let safety = 0;
                while (curr && safety < 10) {
                    path.unshift(curr.id); // Add to front
                    // Find parent obj in full list to get its parent
                    const fullObj = categories.find(c => c.id === curr.id);
                    curr = fullObj ? fullObj.parent : null;
                    safety++;
                }
                setSelectedPath(path);
            } else {
                setSelectedPath([]);
            }
        }
    }, [isOpen, categories, category]);

    const loadCategories = async () => {
        try {
            const data = await getAllCategories();
            setCategories(data);
        } catch (error) {
            console.error("Failed to load categories", error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
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
        setFormData(prev => ({ ...prev, imageUrl: '' }));
    };

    // Cascading Selection Handler
    // index: 0 for Root, 1 for Level 2...
    // value: selected ID
    const handlePathChange = (index, value) => {
        // Create new path up to index
        const newPath = [...selectedPath];

        if (value) {
            newPath[index] = Number(value);
            // Trim any deeper selections because branch changed
            // e.g. [A, B] -> select C at index 0 -> [C]
            newPath.length = index + 1;
        } else {
            // If cleared, trim up to this point
            // e.g. [A, B] -> clear index 0 -> []
            newPath.length = index;
        }

        setSelectedPath(newPath);

        // Update formData.parentId
        const newParentId = newPath.length > 0 ? newPath[newPath.length - 1] : '';
        setFormData(prev => ({ ...prev, parentId: newParentId }));
    };

    // Helper: Get available options for a dropdown at 'levelIndex'
    const getOptionsForLevel = (levelIndex) => {
        // For Level 0: Roots (parent is null)
        if (levelIndex === 0) {
            // Filter: No parent AND not self (orphans issue handled by standard filter)
            return parentOptions.filter(c => !c.parent);
        }

        // For Level N: Children of selectedPath[levelIndex-1]
        const parentId = selectedPath[levelIndex - 1];
        if (!parentId) return [];

        return parentOptions.filter(c => c.parent && c.parent.id === parentId);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            setErrors({ name: "Vui lòng nhập tên danh mục" });
            return;
        }

        setIsUploading(true);

        try {
            let finalImageUrl = formData.imageUrl;

            if (pendingFile) {
                const cleanName = formData.name.toLowerCase()
                    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                    .replace(/[^a-z0-9]/g, "_");
                const randomId = Math.random().toString(36).substring(2, 8);
                const publicId = `${cleanName}_cat_${randomId}`;

                const uploadedUrl = await uploadImage(pendingFile.file, 'category', publicId);
                if (uploadedUrl) {
                    finalImageUrl = uploadedUrl;
                }
            }

            const finalData = {
                id: category?.id,
                name: formData.name,
                imageUrl: finalImageUrl || (formData.imageUrl === '' ? null : formData.imageUrl),
                parent: formData.parentId ? { id: Number(formData.parentId) } : null,
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

    // Filter valid potential parents (not self)
    const parentOptions = categories.filter(c =>
        (!category || c.id !== category.id)
    );

    // Determine how many dropdowns to show
    // Always show at least Root (Level 0)
    // If Level 0 selected, show Level 1. If Level 1 selected, show Level 2...
    // So distinct levels = selectedPath.length + 1
    // BUT only if the last selected item actually HAS children options.
    const dropdownCount = (() => {
        if (selectedPath.length === 0) return 1;

        // Check if last selected has content
        const lastSelectedId = selectedPath[selectedPath.length - 1];
        const hasChildren = parentOptions.some(c => c.parent && c.parent.id === lastSelectedId);

        return hasChildren ? selectedPath.length + 1 : selectedPath.length;
    })();

    // Array of levels to render: [0, 1, 2...]
    // However, user might want to *change* a previous level.
    // So we render existing path + potential next step.
    // Actually simplicity: Just render path dropdowns + 1 empty one (if leaf check allows).
    // The loop:
    const renderLevels = [];
    for (let i = 0; i < selectedPath.length + 1; i++) {
        // If it's a future level but no parent selected for it, break (safety)
        if (i > 0 && !selectedPath[i - 1]) break;

        const opts = getOptionsForLevel(i);
        if (opts.length === 0 && i >= selectedPath.length) break; // No options for next level

        renderLevels.push(i);
    }


    return (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl w-full max-w-4xl overflow-hidden flex flex-col shadow-2xl">
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
                            {/* Row 1: Name & Status */}
                            <div className="flex gap-4 items-start">
                                <div className="flex-1">
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
                                {category && (
                                    <div className="pt-8">
                                        <label className="flex items-center gap-2 cursor-pointer bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
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
                                )}
                            </div>

                            {/* Row 2: Parents */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Danh mục cha</label>
                                <div className="p-4 bg-white border border-gray-200 rounded-lg">
                                    <div className="grid grid-cols-3 gap-4">
                                        {renderLevels.map((levelIndex) => {
                                            const opts = getOptionsForLevel(levelIndex).filter(c => c.productCount === 0);
                                            if (opts.length === 0) return null;

                                            return (
                                                <div key={levelIndex} className="animate-in fade-in slide-in-from-top-1 duration-200">
                                                    <p className="text-xs font-medium text-gray-500 mb-1 ml-1 flex items-center gap-1">
                                                        {levelIndex === 0 ? "Danh mục gốc" : `Danh mục cấp ${levelIndex + 1}`}
                                                        {levelIndex > 0 && <ChevronRight size={10} />}
                                                    </p>
                                                    <select
                                                        value={selectedPath[levelIndex] || ''}
                                                        onChange={(e) => handlePathChange(levelIndex, e.target.value)}
                                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#2B6377] outline-none bg-gray-50 text-sm"
                                                    >
                                                        <option value="">
                                                            {levelIndex === 0 ? "Root" : "-- Chọn --"}
                                                        </option>
                                                        {opts.map(c => (
                                                            <option key={c.id} value={c.id}>
                                                                {c.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="text-xs text-gray-400 italic pt-3 text-center border-t border-gray-100 mt-3">
                                        {(selectedPath.length === 0)
                                            ? "Đang chọn danh mục gốc"
                                            : `Đang chọn làm con của: Cấp ${selectedPath.length}`}
                                    </div>
                                </div>
                            </div>

                            {/* Row 3: Image (No Label as requested) */}
                            <div>
                                <ImageUploader
                                    existingImages={formData.imageUrl ? [formData.imageUrl] : []}
                                    pendingFiles={pendingFile ? [{ file: pendingFile.file, previewUrl: pendingFile.previewUrl }] : []}
                                    onFileSelect={(e) => handleFileSelect(e)}
                                    onRemovePending={handleRemovePending}
                                    onRemoveExisting={handleRemoveExisting}
                                    idPrefix="category-img"
                                    maxImages={1}
                                />
                            </div>
                        </div>

                        <div className="pt-4 flex gap-3">
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
