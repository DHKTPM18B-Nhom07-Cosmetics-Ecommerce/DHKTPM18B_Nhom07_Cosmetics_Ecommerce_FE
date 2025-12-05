import { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react'; // Cài lucide-react nếu chưa có

export default function DisableAccountModal({ isOpen, onClose, onConfirm, user, riskData }) {
    const [reasonCode, setReasonCode] = useState(""); 
    const [detailNote, setDetailNote] = useState("");

    // TỰ ĐỘNG ĐIỀN KHI CÓ CẢNH BÁO
    useEffect(() => {
        if (isOpen && riskData) {
            if (riskData.level === "HIGH") {
                // Nếu rủi ro cao -> Tự chọn "Vi phạm"
                setReasonCode("POLICY_VIOLATION");
                setDetailNote(riskData.note || riskData.suggestedReason);
            } else {
                setReasonCode("");
                setDetailNote("");
            }
        }
    }, [isOpen, riskData]);

    const handleSubmit = () => {
        // Gửi dữ liệu ra ngoài cho UserDetail xử lý
        onConfirm(reasonCode, detailNote);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                
                {/* Header */}
                <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                    <h3 className="text-lg font-bold text-gray-800">Vô hiệu hóa tài khoản</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <p className="text-gray-600 text-sm">
                        Bạn đang thao tác khoá tài khoản: <span className="font-bold text-gray-800">{user?.fullName}</span>
                    </p>

                    {/* --- KHUNG CẢNH BÁO TỪ BACKEND --- */}
                    {riskData && riskData.level === "HIGH" && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-3 items-start">
                            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-bold text-red-700">Phát hiện bất thường</h4>
                                <p className="text-xs text-red-600 mt-1">{riskData.note || riskData.suggestedReason}</p>
                                <p className="text-[10px] text-gray-500 mt-1 italic">*Hệ thống đã tự động điền lý do bên dưới.</p>
                            </div>
                        </div>
                    )}

                    {/* Dropdown */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Lý do chính</label>
                        <select
                            value={reasonCode}
                            onChange={(e) => setReasonCode(e.target.value)}
                            className="w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                        >
                            <option value="">-- Chọn lý do --</option>
                            <option value="POLICY_VIOLATION">Vi phạm chính sách (Spam, Gian lận)</option>
                            <option value="SECURITY_RISK">Rủi ro bảo mật (Hack, Brute force)</option>
                            <option value="USER_REQUEST">Khách hàng yêu cầu</option>
                            <option value="OTHER">Lý do khác</option>
                        </select>
                    </div>

                    {/* Textarea */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Chi tiết / Ghi chú</label>
                        <textarea
                            rows="3"
                            value={detailNote}
                            onChange={(e) => setDetailNote(e.target.value)}
                            placeholder="Nhập chi tiết..."
                            className="w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"
                        ></textarea>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 p-2 rounded">
                        <span>ℹ️</span>
                        <span>Email thông báo sẽ được gửi tự động cho người dùng.</span>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t">
                    <button onClick={onClose} className="px-4 py-2 text-gray-600 text-sm font-medium hover:bg-gray-200 rounded-lg transition">
                        Huỷ bỏ
                    </button>
                    <button 
                        onClick={handleSubmit}
                        disabled={!reasonCode}
                        className={`px-4 py-2 text-white text-sm font-medium rounded-lg transition shadow-sm ${
                            !reasonCode ? 'bg-gray-300 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
                        }`}
                    >
                        Xác nhận khoá
                    </button>
                </div>
            </div>
        </div>
    );
}