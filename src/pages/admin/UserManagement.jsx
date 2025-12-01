// src/pages/admin/UserManagement.jsx
import { useState, useEffect } from 'react';
import { getUsers, getAllAccountsForStats, disableAccount } from '../../services/api';
import {
  getAllCustomers,
  getAllEmployees,
  getOrdersByCustomerId,
  getOrdersByEmployeeId
} from '../../services/api';

import { Plus, Search, Filter, RefreshCw } from 'lucide-react';
import DisableAccountModal from '../../components/admin/DisableReason_Modal';
import UserTable from '../../components/admin/UserTable';
import { useNavigate } from 'react-router-dom';

export default function UserManagement() {
  const [users, setUsers] = useState([]); // Danh sách trang hiện tại
  const [allUsers, setAllUsers] = useState([]); // ← THÊM: Toàn bộ users cho stats
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [userOrderCounts, setUserOrderCounts] = useState({});
const [orderCounts, setOrderCounts] = useState({});
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    role: ''
  });

  const [tempSearch, setTempSearch] = useState('');
  const [tempStatus, setTempStatus] = useState('');
  const [tempRole, setTempRole] = useState('');

  const [disableModalOpen, setDisableModalOpen] = useState(false);
  const [userToDisable, setUserToDisable] = useState(null);
  const navigate = useNavigate();


  const fetchAllUsersForStats = async () => {
    try {
      const res = await getAllAccountsForStats();
      const allData = res.data || []; 
      setAllUsers(allData);
   
      // Tính stats từ allData 
      const customers = allData.filter(u => u.role === 'CUSTOMER').length;
      const employees = allData.filter(u => ['ADMIN', 'EMPLOYEE'].includes(u.role)).length;
      const locked = allData.filter(u => u.status === 'DISABLED').length;
      setTotalUsers(allData.length);
      
      // Log để debug (xóa sau)
      console.log('All users count:', allData.length, { customers, employees, locked });
    } catch (err) {
      console.error('Lỗi lấy stats:', err);
      setAllUsers([]);
    }
  };

  const fetchUsers = async () => { // Chỉ lấy trang hiện tại cho table
    setLoading(true);
    try {
      const res = await getUsers(page, 10, filters.role, filters.status, filters.search);
      setUsers(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
    } catch (err) {
      console.error(err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, filters]);


  useEffect(() => {
    fetchAllUsersForStats();
  }, []); // Không depend filters, vì stats là tổng không filter

  const handleApplyFilters = () => {
    setFilters({
      search: tempSearch,
      status: tempStatus === 'All Status' ? '' : tempStatus,
      role: tempRole === 'All role' ? '' : tempRole
    });
    setPage(0);
  };

  const handleDisableClick = (user) => {
    setUserToDisable(user);
    setDisableModalOpen(true);
  };

  const confirmDisable = async (id, reason) => {
    try {
      await disableAccount(id, reason);
      alert('Tài khoản đã bị vô hiệu hóa');
      fetchUsers();
      fetchAllUsersForStats(); // ← Refresh stats sau disable
    } catch (err) {
      alert('Lỗi khi vô hiệu hóa');
    }
  };
useEffect(() => {
  if (users.length === 0) return;

  const loadOrderCountsForUsers = async () => {
    const newCounts = { ...orderCounts };

    for (const user of users) {
      const accountId = user.id || user.account?.id;
      if (!accountId || newCounts[accountId] !== undefined) continue;

      let targetId = null;
      let count = 0;

      try {
        // === COPY 100% TỪ USERDETAIL ===
        if (user.role === 'CUSTOMER') {
          if (user.customer?.id) {
            targetId = user.customer.id;
          } else {
            // Fallback giống UserDetail
           const resAll = await getAllCustomers();
const listData = Array.isArray(resAll.data) ? resAll.data : (resAll.data?.content || []);

            const found = listData.find(c => c.account?.id == accountId);
            if (found) targetId = found.id;
          }

          if (targetId) {
            const resOrders = await getOrdersByCustomerId(targetId);
            let rawData = [];
            try {
              const jsonStr = JSON.stringify(resOrders.data);
              const parsed = JSON.parse(jsonStr);
              rawData = Array.isArray(parsed) ? parsed : (parsed?.content || []);
            } catch {
              rawData = Array.isArray(resOrders.data) ? resOrders.data : (resOrders.data?.content || []);
            }
            count = rawData.length;
          }
        }
        // === NHÂN VIÊN / ADMIN ===
       else if (user.role === 'EMPLOYEE' || user.role === 'ADMIN') {
  if (user.employee && user.employee.id) {
    targetId = user.employee.id;
  } else {
    try {
      const resAll = await getAllEmployees();
      const listData = Array.isArray(resAll.data)
        ? resAll.data
        : (resAll.data?.content || []);

      const found = listData.find(e => {
        return e.account && e.account.id == accountId;
      });

      if (found) targetId = found.id;
    } catch (err) {
      console.warn("Lỗi tìm Employee map:", err);
    }
  }

  if (targetId) {
    const resOrders = await getOrdersByEmployeeId(targetId);
    let rawData = [];

    try {
      const jsonStr = JSON.stringify(resOrders.data);
      const parsed = JSON.parse(jsonStr);
      rawData = Array.isArray(parsed) ? parsed : (parsed.content || []);
    } catch {
      rawData = Array.isArray(resOrders.data)
        ? resOrders.data
        : (resOrders.data?.content || []);
    }

    count = rawData.length;
  }
}

      } catch (err) {
        console.warn("Lỗi load đơn hàng cho user", accountId, err);
        count = 0;
      }

      newCounts[accountId] = count;
    }

    setOrderCounts(newCounts);
  };

  loadOrderCountsForUsers();
}, [users]); 

  const customers = allUsers.filter(u => u.role === 'CUSTOMER').length;
  const employees = allUsers.filter(u => ['ADMIN', 'EMPLOYEE'].includes(u.role)).length;
  const locked = allUsers.filter(u => u.status === 'DISABLED').length;

  return (
    <>
      <div className="p-8 bg-gray-50 min-h-screen">
        {/* Tiêu đề */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Quản lý tài khoản</h1>
          <p className="text-gray-600 mt-1">Quản lý tài khoản người dùng, vai trò và quyền hạn</p>
        </div>

        {/* 4 ô thống kê - BÂY GIỜ ĐÚNG 100%! */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="rounded-2xl p-6 shadow-sm border border-gray-100" style={{ background: '#D5E2E6' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-700">Tổng số người dùng</p>
                <p className="text-3xl font-bold mt-2 text-gray-900">{totalUsers.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-white/30 rounded-xl flex items-center justify-center text-2xl">👥</div>
            </div>
          </div>

          <div className="rounded-2xl p-6 shadow-sm border border-gray-100" style={{ background: '#D5E2E6' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-700">Khách hàng</p>
                <p className="text-3xl font-bold mt-2 text-gray-900">{customers.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-white/30 rounded-xl flex items-center justify-center text-2xl">👤</div>
            </div>
          </div>

          <div className="rounded-2xl p-6 shadow-sm border border-gray-100" style={{ background: '#D5E2E6' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-700">Nhân viên</p>
                <p className="text-3xl font-bold mt-2 text-gray-900">{employees.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-white/30 rounded-xl flex items-center justify-center text-2xl">💼</div>
            </div>
          </div>

          <div className="rounded-2xl p-6 shadow-sm border border-gray-100" style={{ background: '#D5E2E6' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-700">Tài khoản bị khóa</p>
                <p className="text-3xl font-bold mt-2 text-gray-900">{locked.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-white/30 rounded-xl flex items-center justify-center text-2xl">🚫</div>
            </div>
          </div>
        </div>

        {/* Bộ lọc */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-8">
          <div className="flex items-end gap-4 w-full">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Search Name/Email</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter User fullname or email"
                  value={tempSearch}
                  onChange={(e) => setTempSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2B6377] focus:border-transparent"
                />
              </div>
            </div>

            <div className="w-48 shrink-0">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
              <select
                value={tempStatus}
                onChange={(e) => setTempStatus(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2B6377] bg-white cursor-pointer"
              >
                <option value="">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="DISABLED">Disabled</option>
              </select>
            </div>

            <div className="w-48 shrink-0">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
              <select
                value={tempRole}
                onChange={(e) => setTempRole(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2B6377] bg-white cursor-pointer"
              >
                <option value="">All role</option>
                <option value="CUSTOMER">Customer</option>
                <option value="EMPLOYEE">Employee</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <div className="shrink-0 ml-auto">
              <button
                onClick={handleApplyFilters}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors hover:bg-opacity-90"
                style={{ backgroundColor: '#D5E2E6', color: '#2B6377' }}
              >
                <Filter className="w-5 h-5" />
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        {/* Bảng danh sách */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Danh sách tài khoản</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Hiển thị {(page * 10) + 1}-{Math.min((page + 1) * 10, users.length)} trong tổng {totalUsers} tài khoản
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => { fetchUsers(); fetchAllUsersForStats(); }} 
                  className="p-3 border border-gray-300 rounded-xl hover:bg-gray-50 text-gray-600 hover:text-[#2B6377] transition-colors shadow-sm"
                  title="Làm mới dữ liệu"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
                <button
                  onClick={() => navigate('/admin/users/add')}
                  className="flex items-center gap-2 px-6 py-3 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5"
                  style={{ background: '#2B6377' }}
                >
                  <Plus className="w-5 h-5" />
                  Thêm tài khoản
                </button>
              </div>
            </div>
          </div>

          <UserTable
            users={users}
            loading={loading}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            onDisable={handleDisableClick}
            orderCounts={orderCounts}
          />
        </div>
      </div>

      <DisableAccountModal
        isOpen={disableModalOpen}
        onClose={() => setDisableModalOpen(false)}
        user={userToDisable}
        onConfirm={confirmDisable}
      />
    </>
  );
}