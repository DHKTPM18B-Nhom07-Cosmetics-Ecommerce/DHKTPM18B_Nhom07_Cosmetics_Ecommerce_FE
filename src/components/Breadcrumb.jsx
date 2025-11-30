import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Breadcrumb({ category, productName }) {
  const navigate = useNavigate();

  const breadcrumbs = [
    { label: "Trang chủ", href: "/" },
    { label: "Chăm Sóc Da Mặt", href: "/products" },
    { label: category || "Danh mục", href: null },
    ...(productName
      ? [{ label: productName, href: null, active: true }]
      : [{ label: "Sản phẩm", href: null, active: true }]),
  ];

  return (
    <div className="bg-gray-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          {breadcrumbs.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              {item.active ? (
                <span className="text-gray-400">{item.label}</span>
              ) : (
                <button
                  onClick={() => item.href && navigate(item.href)}
                  className="hover:text-[#2B6377] transition cursor-pointer"
                >
                  {item.label}
                </button>
              )}
              {index < breadcrumbs.length - 1 && (
                <ChevronRight className="w-4 h-4" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
