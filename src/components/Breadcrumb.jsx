import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Breadcrumb({ category, productName, breadcrumbs: customBreadcrumbs }) {
  const navigate = useNavigate();

  const breadcrumbs = customBreadcrumbs || [
    { label: "Trang chủ", href: "/" },
    { label: "Chăm Sóc Da Mặt", href: "/products" },
    { label: category || "Danh mục", href: null },
    ...(productName
      ? [{ label: productName, href: null, active: true }]
      : [{ label: "Sản phẩm", href: null, active: true }]),
  ];

  return (
    <div className="bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-baseline gap-2 text-sm text-gray-600">
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {breadcrumbs.slice(0, -1).map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <button
                  onClick={() => item.href && navigate(item.href)}
                  className="hover:text-[#2B6377] transition cursor-pointer whitespace-nowrap"
                >
                  {item.label}
                </button>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            ))}
          </div>
          <span className="text-gray-400 font-medium">
            {breadcrumbs[breadcrumbs.length - 1].label}
          </span>
        </div>
      </div>
    </div>
  );
}
