import React from "react";
import { X } from "lucide-react";

export default function VoucherRuleModal({ voucher, onClose }) {
  if (!voucher) return null;

  const scopeMap = {
    GLOBAL: "Toàn shop",
    CATEGORY: "Theo danh mục",
    BRAND: "Theo thương hiệu",
    PRODUCT: "Theo sản phẩm",
  };

  const typeMap = {
    PERCENT: "Giảm theo %",
    AMOUNT: "Giảm tiền trực tiếp",
    SHIPPING_FREE: "Miễn phí vận chuyển",
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[420px] rounded-xl p-6 shadow-xl relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          <X size={18} />
        </button>

        <h3 className="text-lg font-semibold text-[#2B5F68] mb-4">
          Điều kiện áp dụng – {voucher.code}
        </h3>

        <ul className="text-sm text-[#4b5b5b] space-y-2 list-disc pl-5">
          <li>
            <span className="font-semibold">Loại voucher:</span>{" "}
            {typeMap[voucher.type] || voucher.type}
          </li>

          <li>
            <span className="font-semibold">Phạm vi áp dụng:</span>{" "}
            {scopeMap[voucher.scope] || voucher.scope}
          </li>

          {voucher.minOrderAmount > 0 && (
            <li>
              <span className="font-semibold">Đơn tối thiểu:</span>{" "}
              {voucher.minOrderAmount.toLocaleString()}₫
            </li>
          )}

          {voucher.minItemCount && (
            <li>
              <span className="font-semibold">Số lượng tối thiểu:</span>{" "}
              {voucher.minItemCount} sản phẩm
            </li>
          )}

          {voucher.type === "PERCENT" && voucher.value && (
            <li>
              <span className="font-semibold">Mức giảm:</span> {voucher.value}%
            </li>
          )}

          {voucher.type === "AMOUNT" && voucher.value && (
            <li>
              <span className="font-semibold">Mức giảm:</span>{" "}
              {voucher.value.toLocaleString()}₫
            </li>
          )}

          {voucher.maxDiscount && (
            <li>
              <span className="font-semibold">Giảm tối đa:</span>{" "}
              {voucher.maxDiscount.toLocaleString()}₫
            </li>
          )}

          {voucher.type === "SHIPPING_FREE" && (
            <li>Miễn phí vận chuyển (tối đa 50.000₫)</li>
          )}

          {!voucher.stackable && (
            <li className="text-red-500 font-semibold">
              Không áp dụng cùng voucher khác
            </li>
          )}
        </ul>

        <button
          onClick={onClose}
          className="mt-6 w-full py-2 bg-[#2B5F68] text-white rounded-lg hover:bg-[#224b4b] transition"
        >
          Đã hiểu
        </button>
      </div>
    </div>
  );
}
