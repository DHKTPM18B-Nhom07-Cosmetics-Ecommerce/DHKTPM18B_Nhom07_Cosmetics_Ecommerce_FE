import React, { useState, useEffect, useRef } from "react";
import { X, FileSpreadsheet } from "lucide-react";
import { readExcelFile } from "../../utils/excelHandler";
import { toast } from "react-toastify";

export default function ExcelImportModal({ isOpen, onClose, onImport, title = "Nhập dữ liệu từ Excel", sampleColumns = [] }) {
    const [fileName, setFileName] = useState("");
    const [previewData, setPreviewData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showContent, setShowContent] = useState(false);
    const fileInputRef = useRef(null);

    /* ANIMATION OPEN/CLOSE */
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => setShowContent(true), 30);
        } else {
            setShowContent(false);
            // Clean up when closed
            if (!isOpen) {
                setFileName("");
                setPreviewData([]);
            }
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleFileChange = async (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        setLoading(true);
        setFileName(selectedFile.name);
        setPreviewData([]);

        try {
            const data = await readExcelFile(selectedFile);
            setPreviewData(data);
            if (data.length === 0) {
                toast.warn("File không có dữ liệu!");
            }
        } catch (error) {
            console.error(error);
            toast.error("Lỗi đọc file!");
            setFileName("");
        } finally {
            setLoading(false);
            e.target.value = ""; // Reset input
        }
    };

    const handleConfirm = async () => {
        if (!previewData || previewData.length === 0) {
            toast.warn("Chưa có dữ liệu để nhập.");
            return;
        }

        // VALIDATE STRUCTURE BEFORE UPLOAD
        if (sampleColumns.length > 0) {
            const fileHeaders = Object.keys(previewData[0]).map(h => h.toLowerCase().trim());
            const requiredHeaders = sampleColumns.map(c => c.toLowerCase().trim());
            const missingColumns = requiredHeaders.filter(req => !fileHeaders.includes(req));

            if (missingColumns.length > 0) {
                toast.error(`File thiếu cột bắt buộc: ${missingColumns.join(", ")}`);
                return;
            }
        }

        await onImport(previewData);
        handleClose();
    };

    const clearFile = () => {
        setFileName("");
        setPreviewData([]);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleClose = () => {
        setShowContent(false);
        setTimeout(() => {
            onClose();
            clearFile();
        }, 300);
    };

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[3px] transition-opacity duration-300 ${showContent ? "opacity-100" : "opacity-0"}`}>
            <div className={`bg-white w-[760px] max-h-[88vh] p-8 shadow-2xl border border-gray-200 rounded-3xl overflow-y-auto transform transition-all duration-300 ease-[cubic-bezier(.25,.8,.25,1)] ${showContent ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-6"}`}>

                {/* HEADER (Exact Match: No Icon, Text Only) */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-[#2B6377] tracking-wide">
                        {title}
                    </h2>
                    <button
                        onClick={handleClose}
                        className="p-2 rounded-full hover:bg-gray-100 active:scale-90 transition"
                    >
                        <X className="w-6 h-6 text-gray-600 hover:text-gray-900" />
                    </button>
                </div>

                {/* UPLOAD AREA (Exact Match Styles) */}
                <div
                    className="border-2 border-dashed border-[#2B6377]/30 rounded-2xl p-8 flex flex-col items-center text-center cursor-pointer bg-white hover:bg-[#2B6377]/5 transition-all duration-300 hover:shadow-md hover:scale-[1.02]"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <FileSpreadsheet className="w-14 h-14 text-[#2B6377] mb-3" />
                    <p className="text-base text-[#2B6377] font-medium">Chọn file Excel (.xlsx)</p>

                    <p className="text-xs text-gray-500 mt-1 max-w-[420px]">
                        Template gồm các cột:
                        <br />
                        <span className="text-[11px] text-gray-600 font-semibold">
                            {sampleColumns.length > 0 ? sampleColumns.join(" | ") : "Tên sản phẩm | Giá | ..."}
                        </span>
                    </p>

                    <input
                        type="file"
                        accept=".xlsx, .xls, .csv"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                    />
                </div>

                {/* FILE NAME TAG (Exact match style) */}
                {fileName && (
                    <p className="mt-4 text-sm text-gray-700 bg-blue-50 py-2 px-4 rounded-xl inline-block border border-blue-100">
                        File đã chọn: <strong>{fileName}</strong>
                    </p>
                )}

                {/* PREVIEW TABLE (Exact match style) */}
                {previewData.length > 0 && (
                    <div className="mt-6 border rounded-2xl overflow-hidden shadow-sm">
                        <table className="w-full text-sm">
                            <thead className="bg-blue-50">
                                <tr>
                                    {Object.keys(previewData[0]).map((h) => (
                                        <th key={h} className="px-4 py-3 text-left font-semibold text-[#2B6377] border-b">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {previewData.slice(0, 5).map((row, i) => (
                                    <tr key={i} className="border-b hover:bg-blue-50/60">
                                        {Object.values(row).map((val, j) => (
                                            <td key={j} className="px-4 py-3 text-gray-700">
                                                {val}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <p className="text-xs text-gray-500 px-4 py-2 bg-gray-50">
                            Hiển thị 5 dòng đầu (tổng {previewData.length} dòng)
                        </p>
                    </div>
                )}

                {/* ACTION BUTTONS (Exact match styles) */}
                <div className="mt-8 flex justify-end gap-4">
                    {fileName && (
                        <button
                            onClick={clearFile}
                            className="px-5 py-2.5 rounded-xl bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-medium transition active:scale-95 shadow-sm"
                        >
                            Clear file
                        </button>
                    )}

                    <button
                        onClick={handleClose}
                        className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition active:scale-95 shadow-sm"
                    >
                        Hủy
                    </button>

                    <button
                        disabled={!fileName || loading}
                        onClick={handleConfirm}
                        className="px-6 py-2.5 rounded-xl bg-[#2B6377] hover:bg-[#2B6377]/90 text-white font-semibold shadow-md disabled:opacity-50 transition active:scale-95"
                    >
                        {loading ? "Đang xử lý..." : "Tải lên"}
                    </button>
                </div>
            </div>
        </div>
    );
}
