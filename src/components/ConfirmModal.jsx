import { X } from "lucide-react";

/**
 * Component Modal xác nhận hành động
 * @param {boolean} isOpen - Trạng thái hiển thị modal
 * @param {function} onClose - Hàm đóng modal
 * @param {function} onConfirm - Hàm xác nhận thực hiện hành động
 * @param {string} title - Tiêu đề modal
 * @param {string} message - Nội dung thông báo
 */
export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message }) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
      <div className="relative bg-white rounded-lg shadow-2xl max-w-md w-full p-6 transform transition-all pointer-events-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          {title || "Xác nhận"}
        </h3>

        <p className="text-gray-600 mb-6">
          {message}
        </p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
          >
            Hủy
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition"
          >
            Đồng ý
          </button>
        </div>
      </div>
    </div>
  );
}
