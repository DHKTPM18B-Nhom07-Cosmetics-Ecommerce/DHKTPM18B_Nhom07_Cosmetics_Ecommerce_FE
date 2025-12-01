// src/components/admin/HeaderNavbar.jsx
import { Bell, Search, ChevronDown } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

const navItems = [
  { name: 'Dashboard', path: '/admin' },
  { name: 'Danh mục', path: '/admin/categories' },
  { name: 'Sản phẩm', path: '/admin/products' },
  { name: 'Đơn hàng', path: '/admin/orders' },
  { name: 'Mã giảm giá', path: '/admin/vouchers' }, // Thêm mới, bạn cần tạo page nếu chưa
  { name: 'Tài khoản', path: '/admin/users' },
]

export default function HeaderNavbar() {
  const location = useLocation()

  return (
    <header className=" text-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50" style={{ background: '#2B6377'}}>
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo + Nav */}
        <div className="flex items-center gap-8">
          <h1 className="text-2xl font-bold text-white">EMBROSIA</h1>
          
          <nav className="flex gap-6">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  location.pathname === item.path
                    ? 'bg-teal-50 text-teal-600'
                    : 'text-white hover:text-gray-900 hover:bg-gray-300'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
         
          <button className="p-2 hover:bg-gray-300 rounded-lg relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <div className="flex items-center gap-3 pl-4 border-l">
            <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold">
              A
            </div>
            <div>
              <p className="text-sm font-medium">Admin User</p>
              <p className="text-xs text-white">admin@cosmetics.vn</p>
            </div>
            <ChevronDown className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>
    </header>
  )
}