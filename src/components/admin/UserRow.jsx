// src/components/admin/UserRow.jsx
import { Eye, Lock, AlertTriangle } from 'lucide-react'; // [THÊM] Import AlertTriangle
import { useNavigate } from 'react-router-dom';

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return `${d.getDate().toString().padStart(2,'0')}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getFullYear()}`;
};

export default function UserRow({ user, index, onDisable, orderCounts = 0 }) {
  const navigate = useNavigate();

  const account = user.account || user;

  // [THÊM MỚI] Check xem tài khoản có bị đánh dấu rủi ro không
  // (Dữ liệu này lấy từ field ảo @Transient riskLevel mà Backend gửi lên)
  const isHighRisk = account.riskLevel === 'HIGH';

  return (
    // [SỬA] Nếu rủi ro cao -> Tô nền đỏ nhạt (bg-red-50) để gây chú ý
    <tr className={`border-b border-gray-100 transition ${isHighRisk ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50'}`}>
      
      <td className="py-4 px-6 text-gray-700">{index + 1}</td>
      
      <td className="py-4 px-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 border-2 border-dashed rounded-full flex items-center justify-center text-gray-500 font-bold">
             {/* Hiện chữ cái đầu cho đẹp */}
             {account.fullName ? account.fullName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
                <p className="font-medium text-gray-900">{account.fullName || 'Chưa có tên'}</p>
                
                {/* [THÊM MỚI] ICON CẢNH BÁO NẾU CÓ RỦI RO */}
                {isHighRisk && (
                    <div className="group relative">
                        <AlertTriangle className="w-4 h-4 text-red-600 animate-pulse cursor-help" />
                        {/* Tooltip hiển thị lý do khi rê chuột vào */}
                        <div className="absolute left-full top-0 ml-2 w-max max-w-xs p-2 bg-gray-800 text-white text-xs rounded shadow-lg hidden group-hover:block z-50">
                            {account.riskNote || "Tài khoản có dấu hiệu bất thường"}
                        </div>
                    </div>
                )}
            </div>
            <p className="text-sm text-gray-500">{account.username}</p>
          </div>
        </div>
      </td>

      <td className="py-4 px-6 text-gray-700">{formatDate(account.createdAt)}</td>
      
      {/* Tô đậm số đơn nếu nhiều */}
      <td className={`py-4 px-6 font-medium ${orderCounts >= 5 ? 'text-blue-600' : 'text-gray-700'}`}>
        {orderCounts} đơn
      </td>

      <td className="py-4 px-6">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          account.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
          account.role === 'EMPLOYEE' ? 'bg-blue-100 text-blue-700' :
          'bg-gray-100 text-gray-700'
        }`}>
          {account.role === 'ADMIN' ? 'Admin' : account.role === 'EMPLOYEE' ? 'Nhân viên' : 'Khách hàng'}
        </span>
      </td>

      <td className="py-4 px-6">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          account.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
          account.status === 'DISABLED' ? 'bg-red-100 text-red-700' :
          'bg-yellow-100 text-yellow-700'
        }`}>
          {account.status === 'ACTIVE' ? 'Hoạt động' : account.status === 'DISABLED' ? 'Vô hiệu hóa' : account.status}
        </span>
      </td>

      <td className="py-4 px-6">
        <div className="flex gap-4">
          <button 
            onClick={() => navigate(`/admin/users/${account.id}`)} 
            className="text-blue-600 hover:text-blue-800 transition"
            title="Xem chi tiết"
          >
            <Eye className="w-5 h-5" />
          </button>
          
          {/* Chỉ hiện nút khoá nếu chưa bị khoá */}
          {account.status !== 'DISABLED' && (
              <button 
                onClick={() => onDisable(user)} 
                className="text-red-600 hover:text-red-800 transition"
                title="Vô hiệu hóa tài khoản"
              >
                <Lock className="w-5 h-5" />
              </button>
          )}
        </div>
      </td>
    </tr>
  );
}