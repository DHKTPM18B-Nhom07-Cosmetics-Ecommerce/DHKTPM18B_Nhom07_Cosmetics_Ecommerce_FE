import {
    Search,
    Heart,
    ShoppingCart,
    User,
    Package,
    Leaf,
    Heart as HeartIcon,
    Shield,
    ChevronDown,
    MapPin,
    LogOut,
    LogIn,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { LiaShippingFastSolid } from 'react-icons/lia';
import { FaLeaf, FaHeart } from 'react-icons/fa';
import { FaUserDoctor, FaStore } from 'react-icons/fa6';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Header() {
    const { user, logout, isLoggedIn } = useAuth();
    const navigate = useNavigate();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const dropdownRef = useRef(null);
    const displayUserName = user ? user.name : 'Guest';

    // Đóng dropdown khi click bên ngoài
    useEffect(() => {
        function handleClickOutside(event) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setIsUserMenuOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Hàm đăng xuất (Sử dụng Context logout)
    const handleLogout = () => {
        logout(); // Gọi hàm logout từ Context (tự xóa localStorage và reset user state)
        setIsUserMenuOpen(false);
        navigate('/');
    };

    // quan ly don hang
    const handleGoToOrders = () => {
        setIsUserMenuOpen(false);
        navigate('/order');
    };

    return (
        <>
            {/* Main Header */}
            <header className="bg-[#2B6377] text-white sticky top-0 z-50">
                <div className="flex items-center justify-between px-8 py-4">
                    {/* Logo */}
                    <div
                        onClick={() => navigate('/')}
                        className="text-2xl font-bold cursor-pointer hover:text-teal-100 transition">
                        EMBROSIA
                    </div>

                    {/* Navigation */}
                    <nav className="flex items-center gap-8">
                        <button
                            onClick={() => navigate('/products')}
                            className="hover:text-teal-100 transition font-medium">
                            Product
                        </button>
                        <button className="hover:text-teal-100 transition font-medium">
                            Brands
                        </button>
                        <button className="hover:text-teal-100 transition font-medium">
                            Sale
                        </button>
                        <button className="hover:text-teal-100 transition font-medium">
                            About
                        </button>
                    </nav>

                    {/* Search, Wishlist, Cart, User */}
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search products..."
                                className="bg-white text-gray-800 rounded-full py-2 px-4 pl-10 w-64 text-sm"
                            />
                            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        </div>
                        <Heart className="w-6 h-6 cursor-pointer hover:text-teal-100 transition" />
                        <div className="relative">
                            <ShoppingCart
                                onClick={() => navigate('/cart')}
                                className="w-6 h-6 cursor-pointer hover:text-teal-100 transition"
                            />
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                0
                            </span>
                        </div>
                        {/* User Dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <div
                                className="flex items-center gap-2 cursor-pointer hover:text-teal-100 transition"
                                onClick={() =>
                                    setIsUserMenuOpen(!isUserMenuOpen)
                                }>
                                <User className="w-6 h-6" />
                                <span className="text-sm">Hello, {displayUserName}</span>
                                <ChevronDown
                                    className={`w-4 h-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''
                                        }`}
                                />
                            </div>

                            {/* Dropdown Menu */}
                            {isUserMenuOpen && (
                                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-50">
                                    <button className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition flex items-center gap-3">
                                        <User className="w-4 h-4" />
                                        <span>Tài khoản của bạn</span>
                                    </button>
                                    <button
                                        onClick={handleGoToOrders}
                                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition flex items-center gap-3">
                                        <ShoppingCart className="w-4 h-4" />
                                        <span>Quản lý đơn hàng</span>
                                    </button>
                                    <button className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition flex items-center gap-3">
                                        <FaStore className="w-4 h-4" />
                                        <span>Quản lý cửa hàng</span>
                                    </button>
                                    <button className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition flex items-center gap-3">
                                        <Heart className="w-4 h-4" />
                                        <span>Sản phẩm yêu thích</span>
                                    </button>
                                    <button className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition flex items-center gap-3">
                                        <MapPin className="w-4 h-4" />
                                        <span>Địa chỉ giao hàng</span>
                                    </button>
                                    <hr className="my-2 border-gray-200" />
                                    {isLoggedIn ? (
                                        <>
                                            <button
                                                onClick={handleLogout} // Đăng xuất
                                                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition flex items-center gap-3">
                                                <LogOut className="w-4 h-4" />
                                                <span>Thoát</span>
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => navigate('/login')} // chuyển đến trang đăng nhập
                                                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition flex items-center gap-3">
                                                <LogIn className="w-4 h-4" />
                                                <span>Đăng nhập</span>
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Secondary Header - Features */}
            <div className="bg-[#CCDFE3] text-[#2B6377] px-8 py-3 flex justify-around text-sm font-medium">
                <div className="flex items-center gap-2">
                    <LiaShippingFastSolid className="w-5 h-5" />
                    <span>Free Shipping Over $50</span>
                </div>
                <div className="flex items-center gap-2">
                    <FaLeaf className="w-5 h-5" />
                    <span>Natural Ingredients</span>
                </div>
                <div className="flex items-center gap-2">
                    <FaHeart className="w-5 h-5" />
                    <span>Cruelty-Free</span>
                </div>
                <div className="flex items-center gap-2">
                    <FaUserDoctor className="w-5 h-5" />
                    <span>Dermatologist Tested</span>
                </div>
            </div>
        </>
    );
}
