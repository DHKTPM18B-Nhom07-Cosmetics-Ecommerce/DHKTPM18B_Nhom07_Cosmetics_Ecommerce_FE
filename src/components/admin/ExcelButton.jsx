import React, { useRef } from "react";
import { Download, Upload } from "lucide-react";
import { exportToExcel, readExcelFile } from "../../utils/excelHandler";
import { toast } from "react-toastify";

/**
 * Component Nút Xuất Excel
 */
export const ExportButton = ({ data, fileName, className, children }) => {
    const handleExport = () => {
        try {
            exportToExcel(data, fileName);
            toast.success("Xuất file thành công!");
        } catch (error) {
            console.error("Export Error:", error);
            toast.error("Xuất file thất bại.");
        }
    };

    return (
        <button
            onClick={handleExport}
            className={className || "flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 transition"}
        >
            <Download className="w-4 h-4" />
            {children || "Xuất Excel"}
        </button>
    );
};

/**
 * Component Nút Nhập Excel
 * @param {Function} onImport - Callback nhận dữ liệu JSON sau khi parse (data) => void
 */
export const ImportButton = ({ onImport, className, children }) => {
    const fileInputRef = useRef(null);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const jsonData = await readExcelFile(file);
            if (onImport) {
                await onImport(jsonData);
            }
            // Reset input để chọn lại file cũ nếu muốn
            e.target.value = "";
        } catch (error) {
            console.error("Import Error:", error);
            toast.error("Đọc file thất bại. Vui lòng kiểm tra định dạng.");
        }
    };

    return (
        <>
            <input
                type="file"
                accept=".xlsx, .xls, .csv"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
            />
            <button
                onClick={() => fileInputRef.current?.click()}
                className={className || "flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 transition"}
            >
                <Upload className="w-4 h-4" />
                {children || "Nhập file"}
            </button>
        </>
    );
};
