import { Outlet, useLocation } from "react-router-dom";
import HeaderNavbar from "./HeaderNavbar";

const pathTranslations = {
    "admin": "Quản trị",
    "dashboard": "Tổng quan",
    "users": "Người dùng",
    "products": "Sản phẩm",
    "categories": "Danh mục",
    "brands": "Thương hiệu",
    "orders": "Đơn hàng",
    "vouchers": "Mã giảm giá",
    "create": "Thêm mới",
    "edit": "Chỉnh sửa",
    "profile": "Hồ sơ cá nhân",
    "settings": "Cài đặt",
    "inventory": "Kho hàng",
    "stats": "Thống kê",
    // Bạn có thể thêm các đường dẫn khác vào đây
};

export default function AdminLayout() {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* HEADER */}
      <HeaderNavbar />

      <div className="pt-[72px]">
        {/* BREADCRUMB */}
        <div className="bg-white border-b px-6 py-2">
          <div className="text-sm text-gray-600">
            {pathnames.map((name, index) => {
              const label = pathTranslations[name] || name;

              return (
                <span key={index}>
                  {index > 0 && " > "}
                  <span
                    className={
                      index === pathnames.length - 1
                        ? "text-gray-900 font-medium"
                        : ""
                    }
                  >
                    {label.charAt(0).toUpperCase() + label.slice(1)}
                  </span>
                </span>
              );
            })}
          </div>
        </div>

        {/* CONTENT*/}
        <main className="px-6 pt-4 pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
