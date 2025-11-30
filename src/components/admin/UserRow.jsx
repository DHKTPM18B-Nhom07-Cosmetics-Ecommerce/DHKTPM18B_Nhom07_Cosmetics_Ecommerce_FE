// src/components/admin/UserRow.jsx
import { Eye, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return `${d.getDate().toString().padStart(2,'0')}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getFullYear()}`;
};

export default function UserRow({ user, index, onDisable, orderCounts = 0 }) {
  const navigate = useNavigate();

  const account = user.account || user;

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      <td className="py-4 px-6 text-gray-700">{index + 1}</td>
      <td className="py-4 px-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 border-2 border-dashed rounded-full"></div>
          <div>
            <p className="font-medium">{account.fullName || 'Chưa có tên'}</p>
            <p className="text-sm text-gray-500">{account.username}</p>
          </div>
        </div>
      </td>
      <td className="py-4 px-6 text-gray-700">{formatDate(account.createdAt)}</td>
      <td className="py-4 px-6 text-gray-700">{orderCounts} đơn</td>
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
          {account.status === 'ACTIVE' ? 'Hoạt động' : account.status === 'DISABLED' ? 'Không hoạt động' : account.status}
        </span>
      </td>
      <td className="py-4 px-6">
        <div className="flex gap-4">
          <button 
            onClick={() => navigate(`/admin/users/${account.id}`)} // Điều hướng tới trang chi tiết
            className="text-blue-600 hover:text-blue-800"
          >
            <Eye className="w-5 h-5" />
          </button>
          <button onClick={() => onDisable(user)} className="text-red-600 hover:text-red-800">
            <Lock className="w-5 h-5" />
          </button>
        </div>
      </td>
    </tr>
  );
}