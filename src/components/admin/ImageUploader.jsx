import React, { useRef } from 'react';
import { Upload, Trash2, Plus, X } from 'lucide-react';

export default function ImageUploader({
    existingImages = [],
    pendingFiles = [],
    onFileSelect,
    onRemovePending,
    onRemoveExisting,
    maxImages = 10,
    idPrefix = "img-upload",
    disabled = false
}) {
    const fileInputRef = useRef(null);

    return (
        <div className="mt-4">
            <h4 className="block text-sm font-semibold text-gray-700 mb-3">Hình ảnh</h4>

            {/* Hidden File Input */}
            <input
                id={idPrefix}
                type="file"
                ref={fileInputRef}
                onChange={onFileSelect}
                multiple
                accept="image/*"
                className="hidden"
                disabled={disabled}
            />

            {/* Empty State */}
            {existingImages.length === 0 && pendingFiles.length === 0 ? (
                <button
                    type="button"
                    onClick={() => !disabled && fileInputRef.current?.click()}
                    disabled={disabled}
                    className={`w-full py-8 border-2 border-dashed rounded-xl transition-all flex flex-col items-center justify-center gap-2 
                    ${disabled
                            ? 'bg-gray-100 border-gray-200 cursor-not-allowed text-gray-400'
                            : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-[#2B6377] text-gray-400 hover:text-[#2B6377] cursor-pointer'}`}
                >
                    <Upload size={32} />
                    <span className="text-sm font-medium">Chưa có hình ảnh nào</span>
                    <span className="text-xs">{disabled ? "Không thể chỉnh sửa" : "Nhấn để chọn ảnh"}</span>
                </button>
            ) : (
                /* Image Grid */
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                    {/* Existing Images */}
                    {existingImages.map((img, idx) => (
                        <div key={`existing-${idx}`} className="relative aspect-square border-2 border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow group">
                            <img
                                src={img}
                                alt={`Ảnh ${idx + 1}`}
                                className={`w-full h-full object-cover ${disabled ? 'opacity-70' : ''}`}
                            />
                            <div className="absolute top-1.5 left-1.5 bg-[#2B6377] text-white text-[10px] px-1.5 py-0.5 rounded font-medium shadow">Đã lưu</div>
                            {!disabled && (
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); onRemoveExisting(idx); }}
                                    className="absolute top-1.5 right-1.5 bg-gray-800/60 hover:bg-red-500 text-white p-1.5 rounded-full transition-colors shadow opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                                >
                                    <Trash2 size={14} />
                                </button>
                            )}
                        </div>
                    ))}

                    {/* Pending (New) Files */}
                    {pendingFiles.map((pf, idx) => (
                        <div key={`pending-${idx}`} className="relative aspect-square border-2 border-dashed border-orange-400 rounded-xl overflow-hidden bg-orange-50/50 hover:shadow-md transition-shadow group">
                            <img
                                src={pf.previewUrl}
                                alt={`Ảnh mới ${idx + 1}`}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute top-1.5 left-1.5 bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded font-medium shadow">Mới</div>
                            {!disabled && (
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); onRemovePending(idx); }}
                                    className="absolute top-1.5 right-1.5 bg-gray-800/60 hover:bg-red-500 text-white p-1.5 rounded-full transition-colors shadow opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                                >
                                    <Trash2 size={14} />
                                </button>
                            )}
                        </div>
                    ))}

                    {/* Add More Button */}
                    {(existingImages.length + pendingFiles.length) < maxImages && !disabled && (
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="aspect-square border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 hover:border-[#2B6377] transition-all flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-[#2B6377] cursor-pointer"
                        >
                            <Plus size={24} />
                            <span className="text-[10px] font-medium">Thêm ảnh</span>
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
