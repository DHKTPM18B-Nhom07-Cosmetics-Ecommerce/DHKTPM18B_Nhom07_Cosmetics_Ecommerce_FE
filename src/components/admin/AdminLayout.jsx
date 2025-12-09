import { Outlet } from "react-router-dom";
import { useLocation } from "react-router-dom";
import HeaderNavbar from "./HeaderNavbar";

// 1. Tạo danh sách từ khóa cần dịch
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
    const pathnames = location.pathname.split("/").filter((x) => x);

    return (
        <div className="admin-layout min-h-screen bg-gray-100">
            <HeaderNavbar />

            <div className="bg-white border-b px-6 py-4">
                <div className="text-sm text-gray-600">
                    {pathnames.map((name, index) => {
                        // 2. Logic hiển thị: Nếu có trong bảng dịch thì lấy tiếng Việt,
                        // không thì giữ nguyên (cho trường hợp là số ID hoặc tên riêng)
                        const displayName = pathTranslations[name] || name;

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
                  {/* Nếu không tìm thấy trong từ điển (ví dụ ID: 1, 123) thì vẫn viết hoa chữ đầu cho đẹp */}
                                    {pathTranslations[name]
                                        ? displayName
                                        : displayName.charAt(0).toUpperCase() + displayName.slice(1)}
                </span>
              </span>
                        );
                    })}
                </div>
            </div>

            {/* PAGE CONTENT */}
            <main className="pt-6 pb-12 px-6">
                <Outlet />
            </main>
        </div>
    );
}