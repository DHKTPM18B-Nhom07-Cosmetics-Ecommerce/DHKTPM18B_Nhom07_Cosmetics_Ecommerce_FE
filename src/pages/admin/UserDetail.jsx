// src/pages/admin/UserDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Edit, CreditCard, TrendingUp, TrendingDown, 
  Clock, CheckCircle, FileText, Phone, Mail, Calendar, MapPin 
} from 'lucide-react';
import { disableAccount, getUserById } from '../../services/api'; 
import DisableAccountModal from '../../components/admin/DisableReason_Modal';

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // State quản lý hiển thị Modal
  const [isDisableModalOpen, setIsDisableModalOpen] = useState(false);

  useEffect(() => {
    const fetchUserDetail = async () => {
      try {
        setLoading(true);
      
        const res = await getUserById(id);
        setUser(res.data); 
      } catch (error) {
        console.error("Lỗi tải dữ liệu", error);
       
      } finally {
        setLoading(false);
      }
    };
    fetchUserDetail();
  }, [id]);

  if (loading) return <div className="p-10 text-center text-gray-500">Đang tải thông tin...</div>;
  if (!user) return <div className="p-10 text-center text-red-500">Không tìm thấy người dùng</div>;

  const account = user.account || user;
  const isCustomer = account.role === 'CUSTOMER';
  const isEmployee = ['EMPLOYEE', 'ADMIN'].includes(account.role);

  // 1. Hàm mở Modal thay vì window.confirm
  const handleDisableClick = () => {
    setIsDisableModalOpen(true);
  };

  // 2. Hàm thực thi khi bấm "Xác nhận" trong Modal
  const handleConfirmDisable = async (id, reason) => {
    try {
      await disableAccount(id, reason);
      alert('Đã vô hiệu hóa thành công!');
      
      window.location.reload(); 
    } catch (err) {
      alert('Lỗi khi thao tác: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="admin-user-detail-page p-8 bg-[#F8F9FA] min-h-screen font-sans">
      {/* Breadcrumb & Back Button */}
      <div className="flex items-center gap-2 mb-6 text-sm text-gray-500">
        <button onClick={() => navigate(-1)} className="hover:text-gray-800 flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Tài khoản
        </button>
        <span>/</span>
        <span className="font-semibold text-gray-800">Chi tiết tài khoản</span>
      </div>

      {/* --- HEADER SECTION --- */}
      <div className="bg-[#D5E2E6] rounded-2xl p-6 mb-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{account.fullName || 'No Name'}</h1>
          <p className="text-gray-500 mt-1">
            {isCustomer ? 'Customer ID:' : 'Employee ID:'} <span className="font-medium text-gray-700">#{account.id}</span>
          </p>
          <div className="flex items-center gap-6 mt-4 text-sm text-gray-600">
            <div>
              <span className="block text-gray-400 text-xs">Tham gia từ</span>
              <span className="font-semibold text-gray-800">
                {new Date(account.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </span>
            </div>
            <div>
              <span className="block text-gray-400 text-xs">Account Type</span>
              <span className="font-semibold text-gray-800 capitalize">{account.role.toLowerCase()}</span>
            </div>
          </div>
        </div>
        
        <div className="mt-4 md:mt-0">
          <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${
            account.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {account.status}
          </span>
        </div>
      </div>

      {/* --- MAIN CONTENT GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* --- LEFT COLUMN --- */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* INFO CARD */}
          <div className="bg-[#D5E2E6] rounded-2xl p-6 shadow-sm relative">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-700" />
                {isCustomer ? 'Thông tin khách hàng' : 'Thông tin nhân viên'}
              </h2>
              <button className="flex items-center gap-1 px-4 py-1.5 bg-[#2B6377] text-white text-sm rounded-lg hover:opacity-90 transition">
                <Edit className="w-3.5 h-3.5" /> Edit
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
              <div><p className="text-sm text-gray-500 mb-1">Full name</p><div className="flex items-center gap-2 font-semibold text-gray-800"><div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs">👤</div>{account.fullName}</div></div>
              <div><p className="text-sm text-gray-500 mb-1">Phone Number</p><div className="flex items-center gap-2 font-semibold text-gray-800"><Phone className="w-4 h-4 text-gray-500" />{account.phoneNumber}</div></div>
              <div><p className="text-sm text-gray-500 mb-1">Email</p><div className="flex items-center gap-2 font-semibold text-gray-800"><Mail className="w-4 h-4 text-gray-500" />{account.email || account.username || 'Chưa có email'}</div></div>
              <div><p className="text-sm text-gray-500 mb-1">Password</p><div className="flex items-center gap-2"><span className="text-xl tracking-widest text-gray-800">••••••••</span></div></div>
              <div><p className="text-sm text-gray-500 mb-1">Joined Date</p><div className="flex items-center gap-2 font-semibold text-gray-800"><Calendar className="w-4 h-4 text-gray-500" />{new Date(account.createdAt).toLocaleDateString('en-GB')}</div></div>
              {user.address && (<div><p className="text-sm text-gray-500 mb-1">Address</p><div className="flex items-center gap-2 font-semibold text-gray-800"><MapPin className="w-4 h-4 text-gray-500" />{user.address}</div></div>)}
            </div>
          </div>

          {/* ACTIVITY */}
          <div className="bg-[#D5E2E6] rounded-2xl p-6 shadow-sm">
            {isCustomer ? (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-800">Recent Activity</h3>
                  <button className="text-blue-600 text-sm hover:underline">View All</button>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 bg-green-100 p-1.5 rounded-full"><CheckCircle className="w-4 h-4 text-green-600"/></div>
                    <div><p className="font-semibold text-gray-800">Payment Received</p><p className="text-xs text-gray-500">Transaction ID: #TXN-9847</p></div>
                    <span className="ml-auto text-xs text-gray-500">2 hours ago</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-blue-700" />
                  <h3 className="font-bold text-gray-800 uppercase text-sm">Lịch sử xử lý đơn hàng</h3>
                </div>
                <div className="p-4 bg-white/50 rounded-xl border border-dashed border-gray-400 text-center py-8">
                  <p className="text-gray-600 font-medium">THÊM Một vài thông tin về đơn hàng đã xử lý...</p>
                  <p className="text-sm text-gray-400 mt-2">(Placeholder Area)</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* --- RIGHT COLUMN --- */}
        <div className="space-y-6">
          {/* STATISTICS (Customer Only) */}
          {isCustomer && (
            <div>
              <h3 className="font-bold text-gray-800 mb-4">Thống kê tài khoản</h3>
              <div className="space-y-4">
                <div className="bg-blue-100/50 p-5 rounded-xl border border-blue-100">
                  <p className="text-blue-800 font-medium text-sm">Tổng tiền đã chi tiêu</p>
                  <p className="text-2xl font-bold text-blue-900 mt-2">$24,580.50</p>
                </div>
                <div className="bg-green-100/50 p-5 rounded-xl border border-green-100">
                   <p className="text-green-800 font-medium text-sm">Đơn hàng hoàn thành</p>
                   <p className="text-3xl font-bold text-green-900 mt-2">65</p>
                </div>
              </div>
            </div>
          )}

          {/* QUICK ACTIONS */}
          <div className="bg-[#D5E2E6] rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4">Hoạt động</h3>
            <div className="space-y-3">
              <button className="w-full py-3 bg-[#2B6377] text-white rounded-lg font-medium hover:opacity-90 transition">Chỉnh sửa</button>
              <button className="w-full py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition">Cấp lại mật khẩu</button>
              <button 
                onClick={handleDisableClick} // Gọi hàm mở modal
                className="w-full py-3 bg-white border border-red-200 text-red-600 rounded-lg font-medium hover:bg-red-50 transition"
              >
                Vô hiệu hoá
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- MODAL --- */}
      <DisableAccountModal 
        isOpen={isDisableModalOpen}
        onClose={() => setIsDisableModalOpen(false)}
        onConfirm={handleConfirmDisable}
        user={account} 
      />
    </div>
  );
}