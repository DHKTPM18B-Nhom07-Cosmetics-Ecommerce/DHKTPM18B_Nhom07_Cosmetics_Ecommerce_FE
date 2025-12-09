// src/components/admin/HeaderNavbar.jsx
import { Bell, Search, ChevronDown, User, LogOut, Settings, AlertTriangle } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { getSystemAlerts } from '../../services/api';
import { useAuth } from "../../context/AuthContext";

export default function HeaderNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // State quản lý Dropdown & Thông báo
  const [alerts, setAlerts] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // [SỬA]: Khởi tạo null, không hardcode "Admin User"
  const [currentUser, setCurrentUser] = useState(null);

  const notifRef = useRef(null);
  const userRef = useRef(null);

  // Danh sách nav items đầy đủ
  const allNavItems = [
    { name: 'Dashboard', path: '/admin' },
    { name: 'Danh mục', path: '/admin/categories' },
    { name: 'Thương hiệu', path: '/admin/brands' },
    { name: 'Sản phẩm', path: '/admin/products' },
    { name: 'Đơn hàng', path: '/admin/orders' },
    { name: 'Mã giảm giá', path: '/admin/vouchers' },
    { name: 'Tài khoản', path: '/admin/users' },
    { name: 'Thống kê', path: '/admin/stats' },
  ];

  // Lọc nav items dựa trên role
  const navItems = currentUser?.role === 'EMPLOYEE'
    ? allNavItems.filter(item =>
      item.name !== 'Mã giảm giá' && item.name !== 'Tài khoản'
    )
    : allNavItems;

  // --- 1. LẤY THÔNG TIN USER TỪ LOCAL STORAGE (Dữ liệu thật) ---
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        // Map dữ liệu từ localStorage vào state
        setCurrentUser({

          fullName: parsed.fullName || parsed.username || "User",

          email: parsed.email || parsed.username || "",
          role: parsed.role || ""
        });
      }
    } catch (error) {
      console.warn("Không đọc được thông tin user từ localStorage");
    }
  }, []);

  // --- 2. LẤY THÔNG BÁO TỪ SERVER (Polling mỗi 10s) ---
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await getSystemAlerts();
        setAlerts(res.data || []);
      } catch (err) { }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000);
    return () => clearInterval(interval);
  }, []);

  // --- 3. CLICK OUTSIDE ĐỂ ĐÓNG MENU ---
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotification(false);
      }
      if (userRef.current && !userRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- 4. HÀM ĐĂNG XUẤT ---
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="text-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50 shadow-md" style={{ background: '#2B6377' }}>
      <div className="flex items-center justify-between px-6 py-3">

        {/* === LOGO + NAVIGATION === */}
        <div className="flex items-center gap-8">
          <Link to="/admin" className="text-2xl font-bold text-white tracking-wide hover:opacity-90 transition">
            EMBROSIA <span className="text-xs font-normal opacity-70">ADMIN</span>
          </Link>

          <nav className="hidden lg:flex gap-4">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition duration-200 ${(location.pathname.startsWith(item.path) && item.path !== '/admin') || location.pathname === item.path
                  ? 'bg-white/15 text-white shadow-inner'
                  : 'text-gray-200 hover:bg-white/10 hover:text-white'
                  }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* === RIGHT SIDE (Search, Bell, User) === */}
        <div className="flex items-center gap-5">

          {/* 2. CHUÔNG THÔNG BÁO */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => {
                setShowNotification(!showNotification);
                setShowUserMenu(false);
              }}
              className={`p-2 rounded-full transition relative ${showNotification ? 'bg-white/20' : 'hover:bg-white/10'}`}
            >
              <Bell className="w-5 h-5" />
              {alerts.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-[#2B6377] rounded-full animate-pulse"></span>
              )}
            </button>

            {/* DROPDOWN THÔNG BÁO */}
            {showNotification && (
              <div className="absolute right-0 top-full mt-3 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden text-gray-800 z-50 animate-in fade-in zoom-in duration-200 origin-top-right">
                <div className="p-3 border-b bg-gray-50 flex justify-between items-center">
                  <h3 className="font-bold text-sm text-gray-700">Thông báo hệ thống</h3>
                  {alerts.length > 0 && (
                    <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs font-bold">{alerts.length}</span>
                  )}
                </div>

                <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                  {alerts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                      <Bell className="w-8 h-8 mb-2 opacity-20" />
                      <p className="text-sm">Không có thông báo mới</p>
                    </div>
                  ) : (
                    alerts.map((alert, idx) => (
                      <div key={idx}
                        onClick={() => {
                          if (alert.targetId) {
                            navigate(`/admin/users/${alert.targetId}`);
                            setShowNotification(false);
                          }
                        }}
                        className="p-3 border-b border-gray-100 hover:bg-red-50/50 transition cursor-pointer group"
                      >
                        <div className="flex gap-3">
                          <div className="mt-1 p-1.5 bg-red-100 rounded-full shrink-0 h-fit">
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                          </div>
                          <div>
                            <div className="flex justify-between items-start w-full">
                              <p className="text-xs font-bold text-red-700 uppercase tracking-wide">{alert.type}</p>
                              <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                                {new Date(alert.time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 mt-0.5 leading-snug group-hover:text-gray-900">
                              {alert.message}
                            </p>
                            {alert.targetId && (
                              <p className="text-[10px] text-blue-500 mt-1 font-medium group-hover:underline">
                                Bấm để xem chi tiết →
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {alerts.length > 0 && (
                  <div className="p-2 border-t bg-gray-50 text-center">
                    <button className="text-xs text-blue-600 hover:underline font-medium">Đánh dấu tất cả là đã đọc</button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3. TÀI KHOẢN ADMIN (DROPDOWN) */}
          <div className="relative pl-4 border-l border-white/20" ref={userRef}>
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotification(false);
              }}
              className="flex items-center gap-3 hover:opacity-90 transition group"
            >
              <div className="text-right hidden md:block">
                {/* [HIỂN THỊ TÊN THẬT - CHECK NULL TRƯỚC KHI RENDER] */}
                <p className="text-sm font-bold leading-none group-hover:text-white max-w-[150px] truncate">
                  {currentUser?.fullName || 'Đang tải...'}
                </p>
                <p className="text-xs text-gray-300 group-hover:text-gray-100 mt-0.5 capitalize">
                  {currentUser?.role?.toLowerCase() || '...'}
                </p>
              </div>

              {/* Avatar: Lấy chữ cái đầu của tên */}
              <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold shadow-md border-2 border-transparent group-hover:border-white/30 transition">
                {currentUser?.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U'}
              </div>

              <ChevronDown className={`w-4 h-4 text-gray-300 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* DROPDOWN MENU USER */}
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-3 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in duration-200 origin-top-right text-gray-700">
                <div className="p-4 border-b bg-gray-50">
                  <p className="font-bold text-gray-900 truncate" title={currentUser?.fullName}>
                    {currentUser?.fullName || 'User'}
                  </p>

                </div>

                <div className="py-2">
                  <Link to="/admin/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-100 hover:text-[#2B6377] transition">
                    <User className="w-4 h-4" />
                    <span>Thông tin tài khoản</span>
                  </Link>
                  <Link to="/admin/settings" className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-100 hover:text-[#2B6377] transition">
                    <Settings className="w-4 h-4" />
                    <span>Cài đặt hệ thống</span>
                  </Link>
                </div>

                <div className="border-t my-1"></div>

                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}