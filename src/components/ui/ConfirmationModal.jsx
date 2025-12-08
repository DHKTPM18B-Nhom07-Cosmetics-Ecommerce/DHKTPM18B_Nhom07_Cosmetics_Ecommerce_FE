import React from 'react';
import { X, AlertTriangle, CheckCircle, Info } from 'lucide-react';

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = "Xác nhận",
    cancelLabel = "Hủy",
    variant = "danger", // danger, success, info, warning
    icon: Icon
}) => {
    if (!isOpen) return null;

    const getVariantStyles = () => {
        switch (variant) {
            case 'danger':
                return {
                    iconBg: 'bg-red-100',
                    iconColor: 'text-red-600',
                    confirmBtn: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
                    defaultIcon: AlertTriangle
                };
            case 'success':
                return {
                    iconBg: 'bg-green-100',
                    iconColor: 'text-green-600',
                    confirmBtn: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
                    defaultIcon: CheckCircle
                };
            case 'warning':
                return {
                    iconBg: 'bg-yellow-100',
                    iconColor: 'text-yellow-600',
                    confirmBtn: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
                    defaultIcon: AlertTriangle
                };
            default:
                return {
                    iconBg: 'bg-blue-100',
                    iconColor: 'text-blue-600',
                    confirmBtn: 'bg-[#2B6377] hover:bg-[#234d5e] focus:ring-[#2B6377]',
                    defaultIcon: Info
                };
        }
    };

    const styles = getVariantStyles();
    const DisplayIcon = Icon || styles.defaultIcon;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md transform transition-all scale-100 opacity-100 animate-in fade-in zoom-in duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="p-6">
                    <div className="flex flex-col items-center text-center">
                        <div className={`w-12 h-12 rounded-full ${styles.iconBg} flex items-center justify-center mb-4`}>
                            <DisplayIcon className={`w-6 h-6 ${styles.iconColor}`} />
                        </div>

                        <h3 className="text-xl font-bold text-gray-800 mb-2">
                            {title}
                        </h3>

                        <p className="text-gray-500 mb-6 leading-relaxed">
                            {message}
                        </p>

                        <div className="flex gap-3 w-full">
                            <button
                                onClick={onClose}
                                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                            >
                                {cancelLabel}
                            </button>
                            <button
                                onClick={() => {
                                    onConfirm();
                                    onClose();
                                }}
                                className={`flex-1 px-4 py-2.5 text-white rounded-lg font-medium shadow-sm transition-colors focus:ring-2 focus:ring-offset-2 ${styles.confirmBtn}`}
                            >
                                {confirmLabel}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
