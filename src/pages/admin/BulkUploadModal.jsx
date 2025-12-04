import { useState, useEffect } from "react";
import { X, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";
import { notifySuccess, notifyError } from "../../utils/toast";

export default function BulkUploadModal({ isOpen, onClose, onUploaded }) {
  const [fileName, setFileName] = useState("");
  const [previewData, setPreviewData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [serverErrors, setServerErrors] = useState([]);
  const [showContent, setShowContent] = useState(false);

  /* OPEN → ANIMATION + RESET */
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setShowContent(true), 30);
    } else {
      setShowContent(false);

      // RESET khi đóng modal
      setFileName("");
      setPreviewData([]);
      setServerErrors([]);
      const input = document.getElementById("excel-input");
      if (input) input.value = "";
    }
  }, [isOpen]);

  if (!isOpen) return null;

  /* ================================
             READ FILE
     ================================ */
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setServerErrors([]);

    const reader = new FileReader();

    reader.onload = (ev) => {
      try {
        const data = new Uint8Array(ev.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];

        const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" });
        setPreviewData(jsonData);
      } catch (err) {
        notifyError("Không thể đọc file Excel!");
      }
    };

    reader.readAsArrayBuffer(file);
  };

  /* ================================
            UPLOAD → BE
     ================================ */
  const handleUpload = async () => {
    if (!fileName) return;

    setLoading(true);
    setServerErrors([]);

    const input = document.getElementById("excel-input");
    const file = input.files[0];

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(
        "http://localhost:8080/api/vouchers/bulk-upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      // Reject file
      if (!res.ok) {
        setServerErrors(data.errors || []);
        notifyError("Import thất bại! Vui lòng kiểm tra lỗi.");
        setLoading(false);
        return;
      }

      // Success
      notifySuccess(`Import thành công: ${data.success} dòng!`);
      onUploaded();
      onClose();
    } catch (err) {
      notifyError("Lỗi kết nối server!");
    }

    setLoading(false);
  };

  /* CLEAR FILE */
  const clearFile = () => {
    setFileName("");
    setPreviewData([]);
    setServerErrors([]);

    const input = document.getElementById("excel-input");
    if (input) input.value = "";
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center
      bg-black/30 backdrop-blur-[3px] transition-opacity duration-300
      ${showContent ? "opacity-100" : "opacity-0"}`}
    >
      <div
        className={`bg-white w-[760px] max-h-[88vh] p-8 shadow-2xl border border-gray-200 rounded-3xl
          overflow-y-auto transform transition-all duration-300 ease-[cubic-bezier(.25,.8,.25,1)]
          ${
            showContent
              ? "scale-100 opacity-100 translate-y-0"
              : "scale-95 opacity-0 translate-y-6"
          }`}
      >
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-teal-700 tracking-wide">
            Thêm voucher hàng loạt
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 active:scale-90 transition"
          >
            <X className="w-6 h-6 text-gray-600 hover:text-gray-900" />
          </button>
        </div>

        {/* UPLOAD AREA */}
        <div
          className="border-2 border-dashed border-teal-200 rounded-2xl p-8 
                 flex flex-col items-center text-center cursor-pointer 
                 bg-white hover:bg-teal-50/70 transition-all duration-300
                 hover:shadow-md hover:scale-[1.02]"
          onClick={() => document.getElementById("excel-input").click()}
        >
          <FileSpreadsheet className="w-14 h-14 text-teal-600 mb-3" />
          <p className="text-base text-teal-700 font-medium">
            Chọn file Excel (.xlsx)
          </p>

          <p className="text-xs text-gray-500 mt-1 max-w-[420px]">
            Template gồm 14 cột:
            <br />
            <span className="text-[11px] text-gray-600 font-semibold">
              code | type | value | maxDiscount | minOrderAmount | maxUses |
              perUserLimit | stackable | scope | startAt | endAt | categoryIds |
              brandIds | productIds
            </span>
          </p>

          <input
            id="excel-input"
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleFile}
          />
        </div>

        {/* FILE NAME */}
        {fileName && (
          <p className="mt-4 text-sm text-gray-700 bg-teal-50 py-2 px-4 rounded-xl inline-block border border-teal-100">
            File đã chọn: <strong>{fileName}</strong>
          </p>
        )}

        {/* PREVIEW */}
        {previewData.length > 0 && (
          <div className="mt-6 border rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-teal-50">
                <tr>
                  {Object.keys(previewData[0]).map((key) => (
                    <th
                      key={key}
                      className="px-4 py-3 text-left font-semibold text-teal-700 border-b"
                    >
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {previewData.slice(0, 5).map((row, i) => (
                  <tr key={i} className="border-b hover:bg-teal-50/60">
                    {Object.values(row).map((val, j) => (
                      <td key={j} className="px-4 py-3 text-gray-700">
                        {val?.toString()}
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

        {/* SERVER ERROR CARD */}
        {serverErrors.length > 0 && (
          <div className="mt-6 p-5 rounded-2xl border border-red-300 bg-red-50/70 shadow-inner animate-fadeIn">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 bg-red-600 rounded-full animate-ping"></span>
              <h3 className="text-red-700 font-semibold text-lg">
                Dữ liệu không hợp lệ
              </h3>
            </div>

            <div className="space-y-3 max-h-[180px] overflow-y-auto pr-2">
              {serverErrors.map((err, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-red-200 rounded-xl px-4 py-3 shadow-sm"
                >
                  <p className="text-sm text-gray-700">
                    <span className="font-bold text-red-600">
                      Dòng {err.row}
                    </span>
                    : {err.error}
                  </p>
                </div>
              ))}
            </div>

            <p className="text-xs text-red-500 mt-3">
              Vui lòng chỉnh file và import lại.
            </p>
          </div>
        )}

        {/* ACTION BUTTONS */}
        <div className="mt-8 flex justify-end gap-4">
          {/* ONLY SHOW WHEN FILE SELECTED */}
          {fileName && (
            <button
              onClick={clearFile}
              className="px-5 py-2.5 rounded-xl bg-yellow-100 hover:bg-yellow-200 
                         text-yellow-800 font-medium transition active:scale-95 shadow-sm"
            >
              Clear file
            </button>
          )}

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 
                       text-gray-700 font-medium transition active:scale-95 shadow-sm"
          >
            Hủy
          </button>

          <button
            disabled={!fileName || loading}
            onClick={handleUpload}
            className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 
                       text-white font-semibold shadow-md disabled:opacity-50
                       transition active:scale-95"
          >
            {loading ? "Đang tải lên..." : "Tải lên"}
          </button>
        </div>

        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(6px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn .35s ease;
          }
        `}</style>
      </div>
    </div>
  );
}
