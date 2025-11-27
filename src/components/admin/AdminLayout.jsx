// src/components/admin/AdminLayout.jsx
import { Outlet } from 'react-router-dom'
import { Bell, ChevronDown } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'

const navItems = [
  { name: 'Dashboard', path: '/admin' },
  { name: 'User Management', path: '/admin/users' },
  { name: 'Settings', path: '/admin/settings' },
  { name: 'Reports', path: '/admin/reports' },
]

export default function AdminLayout() {
  const location = useLocation()
  const pathnames = location.pathname.split('/').filter(x => x)

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar ngang - màu xanh đậm */}
      <header className="bg-[#0e4f66] text-white fixed top-0 left-0 right-0 z-50 shadow-lg">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                <span className="text-[#0e4f66] font-bold text-lg">A</span>
              </div>
              <h1 className="text-xl font-bold">AdminPanel</h1>
            </div>
            <nav className="flex gap-6">
              {navItems.map(item => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `hover:opacity-80 transition ${isActive ? 'opacity-100 font-bold' : 'opacity-70'}`
                  }
                >
                  {item.name}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-white/10 rounded-lg">
              <Bell className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold">
                A
              </div>
              <span>Admin User</span>
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-white border-b px-6 py-4 mt-16">
        <div className="text-sm text-gray-600">
          {pathnames.map((name, index) => (
            <span key={index}>
              {index > 0 && ' > '}
              <span className={index === pathnames.length - 1 ? 'text-gray-900 font-medium' : ''}>
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Nội dung */}
      <main className="pt-6 pb-12 px-6 mt-16">
        <Outlet />
      </main>
    </div>
  )
}