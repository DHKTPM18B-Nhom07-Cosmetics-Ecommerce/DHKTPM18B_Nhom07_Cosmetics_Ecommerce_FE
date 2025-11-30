import { useState, useEffect } from "react";
import { X, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";

export default function BulkUploadModal({ isOpen, onClose, onUploaded }) {
  const [fileName, setFileName] = useState("");
  const [previewData, setPreviewData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setShowContent(true), 30); // delay nhẹ để fade-in
    } else {
      setShowContent(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // READ FILE
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = new Uint8Array(ev.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];

        const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        setPreviewData(jsonData);
      } catch (err) {
        alert("Không thể đọc file Excel!");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // UPLOAD API
  const handleUpload = async () => {
    if (!fileName) return;

    setLoading(true);
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

      const text = await res.text();

      if (!res.ok) {
        alert("Import thất bại: " + text);
        setLoading(false);
        return;
      }

      alert("Import thành công!");
      onUploaded();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Lỗi kết nối server!");
    }

    setLoading(false);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center
      bg-black/30 backdrop-blur-[3px] transition-opacity duration-300
      ${showContent ? "opacity-100" : "opacity-0"}`}
    >
      <div
        className={`
          bg-white w-[760px] max-h-[88vh] p-8 shadow-2xl border border-gray-200 rounded-3xl
          overflow-y-auto transform transition-all duration-300 ease-[cubic-bezier(.25,.8,.25,1)]
          ${
            showContent
              ? "scale-100 opacity-100 translate-y-0"
              : "scale-95 opacity-0 translate-y-6"
          }
        `}
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

        {/* UPLOAD BOX */}
        <div
          className="border-2 border-dashed border-teal-200 rounded-2xl p-8 
                     flex flex-col items-center text-center cursor-pointer 
                     bg-white hover:bg-teal-50/70 transition-all duration-300
                     hover:shadow-md hover:scale-[1.02]"
          onClick={() => document.getElementById("excel-input").click()}
        >
          <FileSpreadsheet className="w-14 h-14 text-teal-600 mb-3 drop-shadow-sm transition-transform duration-300 group-hover:scale-110" />
          <p className="text-base text-teal-700 font-medium">
            Chọn file Excel (.xlsx)
          </p>

          <p className="text-xs text-gray-500 mt-1 leading-relaxed max-w-[420px]">
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
          <p className="mt-4 text-sm text-gray-700 bg-teal-50 py-2 px-4 rounded-xl inline-block border border-teal-100 animate-fadeIn">
            🟩 File đã chọn: <strong>{fileName}</strong>
          </p>
        )}

        {/* PREVIEW TABLE */}
        {previewData.length > 0 && (
          <div className="mt-6 border rounded-2xl overflow-hidden shadow-sm animate-fadeInSlow">
            <table className="w-full text-sm">
              <thead className="bg-teal-50/80 backdrop-blur-sm">
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

              <tbody className="bg-white">
                {previewData.slice(0, 5).map((row, i) => (
                  <tr
                    key={i}
                    className="border-b transition-all hover:bg-teal-50/60"
                  >
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
              Hiển thị 5 dòng đầu tiên (tổng {previewData.length} dòng)
            </p>
          </div>
        )}

        {/* ACTIONS */}
        <div className="mt-8 flex justify-end gap-4">
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
      </div>

      {/* ANIMATION CSS */}
      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.4s ease forwards;
        }

        .animate-fadeInSlow {
          animation: fadeIn 0.8s ease forwards;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
