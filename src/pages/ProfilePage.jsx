import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Package, User, MapPin, LogOut, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getAccountProfile, updateAccountProfile } from '../services/accountService';

const TEAL_TEXT = 'text-[#2B6377]';
const TEAL_ACTIVE_BG = 'bg-[#CCDFE3]';
const TEAL_HOVER_BG = 'hover:bg-[#E6F3F5]';

export default function ProfilePage() {
    const { user, logout, login } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    const [formData, setFormData] = useState({
        fullName: '',
        phoneNumber: '',
        username: '',
        role: ''
    });

    useEffect(() => {
        let userId = user?.id;
        if (!userId) {
            const localUser = localStorage.getItem('user');
            if (localUser) userId = JSON.parse(localUser).id;
        }

        if (!userId) {
            navigate('/login');
            return;
        }

        fetchProfile(userId);
    }, [user]);

    const fetchProfile = async (id) => {
        try {
            setLoading(true);
            const data = await getAccountProfile(id);
            setFormData({
                fullName: data.fullName || '',
                phoneNumber: data.phoneNumber || '',
                username: data.username || '',
                role: data.role || 'CUSTOMER'
            });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.fullName.trim()) {
            alert("Họ tên không được để trống!");
            return;
        }

        try {
            setIsSaving(true);
            // Lấy thông tin user hiện tại từ LocalStorage
            const currentUser = JSON.parse(localStorage.getItem('user'));
            let userId = user?.id || currentUser?.id;

            // 1. Gọi API cập nhật Backend
            await updateAccountProfile(userId, {
                fullName: formData.fullName,
                phoneNumber: formData.phoneNumber
            });

            // 2. Cập nhật LocalStorage (Quan trọng để F5 không mất)
            const updatedUserObj = { 
                ...currentUser, 
                fullName: formData.fullName,
                phoneNumber: formData.phoneNumber 
            };
            localStorage.setItem('user', JSON.stringify(updatedUserObj));

            // 3. Cập nhật Context & Header (QUAN TRỌNG: Gọi đúng tham số)
            // Hàm login cũ của bạn yêu cầu: login(token, fullName, role)
            if (login) {
                login(currentUser.token, formData.fullName, currentUser.role);
            }

            alert("Cập nhật thông tin thành công!");
        } catch (error) {
            console.error(error);
            alert("Có lỗi xảy ra khi cập nhật!");
        } finally {
            setIsSaving(false);
        }
    };

    // Sidebar Menu
    const AccountSidebar = () => (
        <div className="w-64 flex-shrink-0 bg-white p-4 rounded-lg shadow-sm font-sans border border-gray-100 h-fit">
            <h3 className="font-semibold text-lg text-gray-800 mb-4 border-b pb-2">Tài khoản</h3>
            <nav className="space-y-2">
                <Link to="/order" className={`flex items-center p-2 text-gray-700 ${TEAL_HOVER_BG} rounded-md transition`}>
                    <Package className="w-4 h-4 mr-2" /> Quản lý đơn hàng
                </Link>
                
                {/* Active Link */}
                <Link to="/profile" className={`flex items-center p-2 ${TEAL_TEXT} ${TEAL_ACTIVE_BG} rounded-md font-medium transition`}>
                    <User className="w-4 h-4 mr-2" /> Thông tin cá nhân
                </Link>
                
                <Link to="/addresses" className={`flex items-center p-2 text-gray-700 ${TEAL_HOVER_BG} rounded-md transition`}>
                    <MapPin className="w-4 h-4 mr-2" /> Địa chỉ giao hàng
                </Link>
                
                <button onClick={() => { logout(); navigate('/'); }} className="w-full flex items-center p-2 text-gray-700 hover:bg-red-50 rounded-md transition mt-4 border-t pt-2">
                    <LogOut className="w-4 h-4 mr-2" /> Thoát
                </button>
            </nav>
        </div>
    );

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
            <div className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                
                {/* Breadcrumb */}
                <div className="text-sm text-gray-500 mb-6">
                    <Link to="/" className="hover:text-[#2B6377]">Home</Link> / 
                    <span className="mx-1">Tài khoản</span> / 
                    <span className="font-medium text-[#2B6377]"> Thông tin cá nhân</span>
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* SIDEBAR */}
                    <AccountSidebar />

                    {/* MAIN CONTENT */}
                    <main className="flex-1">
                        <div className="bg-white rounded-lg shadow-sm p-8 min-h-[500px]">
                            <h2 className="text-2xl font-light text-gray-800 mb-2">Hồ Sơ Của Tôi</h2>
                            <p className="text-sm text-gray-500 mb-8 border-b pb-4">Quản lý thông tin hồ sơ để bảo mật tài khoản</p>

                            {loading ? (
                                <div className="text-center py-10 text-[#2B6377]">Đang tải dữ liệu...</div>
                            ) : (
                                /* Chỉ hiển thị Form, đã bỏ cột ảnh bên phải */
                                <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
                                    
                                    <div className="flex items-center">
                                        <label className="w-40 text-gray-600 text-sm font-medium">Tên đăng nhập</label>
                                        <div className="text-gray-800 font-medium">{formData.username}</div>
                                    </div>

                                    <div className="flex items-center">
                                        <label className="w-40 text-gray-600 text-sm font-medium">Họ và Tên</label>
                                        <input 
                                            type="text" 
                                            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#2B6377] focus:ring-1 focus:ring-[#2B6377]/20"
                                            value={formData.fullName}
                                            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                                        />
                                    </div>

                                    <div className="flex items-center">
                                        <label className="w-40 text-gray-600 text-sm font-medium">Số điện thoại</label>
                                        <input 
                                            type="text" 
                                            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#2B6377] focus:ring-1 focus:ring-[#2B6377]/20"
                                            value={formData.phoneNumber}
                                            onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                                        />
                                    </div>

                                    <div className="pt-6 flex items-center">
                                        <div className="w-40"></div> {/* Spacer căn lề */}
                                        <button 
                                            type="submit" 
                                            disabled={isSaving}
                                            className="bg-[#2B6377] text-white px-8 py-2.5 rounded-lg shadow-sm hover:bg-[#1f4654] transition flex items-center gap-2 disabled:opacity-70 font-medium"
                                        >
                                            {isSaving ? 'Đang lưu...' : (
                                                <>
                                                    <Save size={18} /> Lưu Thay Đổi
                                                </>
                                            )}
                                        </button>
                                    </div>

                                </form>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}