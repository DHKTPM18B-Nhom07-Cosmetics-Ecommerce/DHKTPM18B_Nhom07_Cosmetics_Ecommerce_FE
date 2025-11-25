// src/pages/admin/UserManagement.jsx
import { useState, useEffect } from 'react';
import { getUsers, disableAccount } from '../../services/api';
import FilterModal from '../../components/admin/FilterModal';
import UserTable from '../../components/admin/UserTable';
import { Filter } from 'lucide-react';
import UserDetailModal from '../../components/admin/UserDetailModal';
import AddNewAccountModal from '../../components/admin/AddNewAccount';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [addAccountOpen, setAddAccountOpen] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getUsers(page, 10, filters.role, filters.status, filters.search?.trim() || null);
      const userList = res.data.content || [];
      setUsers(userList);
      setTotalPages(res.data.totalPages || 0);
    } catch (err) {
      console.error('Lỗi khi lấy danh sách user:', err);
      setUsers([]);
      alert('Không thể kết nối tới backend! Kiểm tra console.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, filters]);

  const handleDisable = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn vô hiệu hóa tài khoản này?')) return;
    try {
      await disableAccount(id);
      alert('Vô hiệu hóa thành công!');
      fetchUsers();
    } catch (err) {
      alert('Lỗi khi vô hiệu hóa!');
    }
  };

  // TÍNH 4 THỐNG KÊ THẬT TỪ DỮ LIỆU API
  const totalUsers = users.length;
  const activeAccounts = users.filter(u => 
    (u.account?.status || u.status)?.toUpperCase() === 'ACTIVE'
  ).length;
  const premiumMembers = users.filter(u => 
    u.account?.type?.toUpperCase() === 'PREMIUM' || u.type?.toUpperCase() === 'PREMIUM'
  ).length;
  const pendingApprovals = users.filter(u => 
    (u.account?.status || u.status)?.toUpperCase() === 'PENDING'
  ).length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">User Account Management</h1>
      <p className="text-gray-600 mb-8">Manage user accounts, roles, and permissions</p>

      {/* 4 THỐNG KÊ ĐÃ ĐỘNG 100% */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Users */}
        <div className="bg-[#D5E2E6] rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className=" text-sm">Total Users</p>
              <p className="text-4xl font-bold mt-2">{totalUsers.toLocaleString()}</p>
            </div>
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Active Accounts */}
        <div className="bg-[#D5E2E6] rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className=" text-sm">Active Accounts</p>
              <p className="text-4xl font-bold mt-2">{activeAccounts.toLocaleString()}</p>
            </div>
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Premium Members */}
        <div className="bg-[#D5E2E6]  rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className=" text-sm">Premium Members</p>
              <p className="text-4xl font-bold mt-2">{premiumMembers.toLocaleString()}</p>
            </div>
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className=" bg-[#D5E2E6] rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">Pending Approvals</p>
              <p className="text-4xl font-bold mt-2">{pendingApprovals.toLocaleString()}</p>
            </div>
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Phần bảng user giữ nguyên */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-semibold">User Accounts</h2>
            <p className="text-sm text-gray-600">Manage all user accounts and their permissions</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setFilterOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#0e4f66] text-white rounded-lg hover:bg-[#0c3f52] transition"
            >
              <Filter className="w-4 h-4" />
              Add Filter
            </button>

            <input
              type="text"
              placeholder="Search users..."
              className="px-4 py-2 border rounded-lg"
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />

            <button
              onClick={() => setAddAccountOpen(true)}
              className="px-6 py-2 bg-[#0e4f66] text-white rounded-lg hover:bg-[#0c3f52] transition"
            >
              + Add New Account
            </button>
          </div>
        </div>

        <UserTable
          users={users}
          loading={loading}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          onDisable={handleDisable}
          onView={setSelectedUser}
        />
      </div>

      {/* Các Modal */}
      <FilterModal isOpen={filterOpen} onClose={() => setFilterOpen(false)} onApply={setFilters} />

      <UserDetailModal
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        user={selectedUser}
        onUserUpdated={fetchUsers} // reload khi disable từ modal
      />

      <AddNewAccountModal
        isOpen={addAccountOpen}
        onClose={() => {
          setAddAccountOpen(false);
          fetchUsers();
        }}
      />
    </div>
  );
}