import * as XLSX from "xlsx";

/**
 * Hàm Xuất dữ liệu ra file Excel
 * @param {Array} data - Mảng dữ liệu JSON cần xuất
 * @param {string} fileName - Tên file (không cần .xlsx)
 * @param {string} sheetName - Tên sheet (mặc định "Sheet1")
 */
export const exportToExcel = (data, fileName = "data", sheetName = "Sheet1") => {
    if (!data || data.length === 0) {
        alert("Không có dữ liệu để xuất!");
        return;
    }

    // 1. Convert JSON -> Worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);

    // 2. Create Workbook & Append Worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // 3. Write File & Download
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

/**
 * Hàm Đọc dữ liệu từ file Excel
 * @param {File} file - File object từ input[type="file"]
 * @returns {Promise<Array>} - Trả về Promise chứa mảng JSON
 */
export const readExcelFile = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: "array" });

                // Lấy sheet đầu tiên
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];

                // Convert to JSON
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
                resolve(jsonData);
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
    });
};
