import React, { useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import { updateVoucherStatus } from "../../services/voucherApi";
import "../../../styles/voucher.css";
import { notifySuccess, notifyError } from "../../utils/toast";

export default function VoucherStatusModal({
  isOpen,
  voucher,
  onClose,
  onUpdated,
}) {
  if (!isOpen || !voucher) return null;

  const [loading, setLoading] = useState(false);
  const nextStatus = voucher.status === "DISABLED" ? "ACTIVE" : "DISABLED";

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await updateVoucherStatus(voucher.id, nextStatus);
      onUpdated(voucher.id, nextStatus);
      onClose();
    } catch {
      // alert("Không thể cập nhật trạng thái.");
      notifySuccess("Đổi trạng thái voucher thành công!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999] flex justify-center items-center p-4">
      <div
        className="
          bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden
          animate-modalZoom border border-gray-200
        "
      >
        {/* HEADER */}
        <div className="px-8 py-5 bg-[#dfeaed] border-b-4 border-[#0e4f66] flex justify-between items-center">
          <p className="font-bold text-[#0e4f66] text-[1.35rem] tracking-wide">
            Thay đổi trạng thái voucher
          </p>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white hover:bg-gray-100 shadow transition active:scale-90"
          >
            <X className="w-6 h-6 text-gray-700" />
          </button>
        </div>

        {/* BODY */}
        <div className="px-8 py-8 bg-[#f8fafb]">
          <div
            className="
                flex gap-5 items-center p-6 
                bg-red-50 border border-red-200 
                rounded-2xl shadow-sm
            "
          >
            {/* ICON */}
            <div
              className="
                  bg-red-100 p-4 rounded-2xl flex items-center justify-center
                "
            >
              <AlertTriangle className="w-10 h-10 text-red-600" />
            </div>

            {/* TEXT */}
            <div className="flex-1 text-gray-800 text-[1rem] leading-relaxed font-medium">
              <span>Bạn có chắc chắn muốn đổi trạng thái voucher</span>
              <span className="font-semibold text-[#0e4f66]">
                {" "}
                {voucher.code}{" "}
              </span>
              <span>từ</span>
              <span className="font-semibold text-red-600">
                {" "}
                {voucher.status}{" "}
              </span>
              <span>sang</span>
              <span className="font-semibold text-[#0e4f66]">
                {" "}
                {nextStatus}{" "}
              </span>
              <span>?</span>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div
          className="
  px-8 py-6 bg-white border-t border-gray-200 
  flex justify-end gap-5
"
        >
          {/* CANCEL */}
          <button
            onClick={onClose}
            disabled={loading}
            className="
      h-[44px] px-8 
      bg-white border border-gray-300 text-gray-700
      rounded-xl text-sm font-medium
      hover:bg-gray-100 transition active:scale-95 shadow-sm
    "
          >
            Hủy
          </button>

          {/* CONFIRM */}
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="
      h-[44px] px-10 
      bg-[#0e4f66] text-white rounded-xl text-sm font-semibold
      shadow hover:bg-[#09394c] transition active:scale-95
    "
          >
            {loading ? "Đang cập nhật…" : "Xác nhận"}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes modalZoom {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
