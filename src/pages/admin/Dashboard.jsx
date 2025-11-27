// src/pages/admin/Dashboard.jsx
import { useState, useEffect } from 'react';
import { getUsers } from '../../services/api';
import { Users, UserCheck, UserX, Clock } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    pendingUsers: 0,
    disabledUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Lấy toàn bộ user (hoặc ít nhất 1 trang lớn để tính đúng)
        const res = await getUsers(0, 1000); // 1000 đủ để tính chính xác
        const users = res.data.content || [];

        const total = users.length;
        const active = users.filter(u => 
          (u.account?.status || u.status)?.toUpperCase() === 'ACTIVE'
        ).length;
        const pending = users.filter(u => 
          (u.account?.status || u.status)?.toUpperCase() === 'PENDING'
        ).length;
        const disabled = users.filter(u => 
          (u.account?.status || u.status)?.toUpperCase() === 'DISABLED'
        ).length;

        setStats({
          totalUsers: total,
          activeUsers: active,
          pendingUsers: pending,
          disabledUsers: disabled,
        });
      } catch (err) {
        console.error('Lỗi lấy dữ liệu dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const userStats = [
    {
      label: 'Total Users',
      value: loading ? '...' : stats.totalUsers.toLocaleString(),
      icon: Users,
      color: 'blue',
      bg: 'bg-blue-100',
      text: 'text-blue-600',
    },
    {
      label: 'Active Users',
      value: loading ? '...' : stats.activeUsers.toLocaleString(),
      icon: UserCheck,
      color: 'green',
      bg: 'bg-green-100',
      text: 'text-green-600',
    },
    {
      label: 'Pending Users',
      value: loading ? '...' : stats.pendingUsers.toLocaleString(),
      icon: Clock,
      color: 'yellow',
      bg: 'bg-yellow-100',
      text: 'text-yellow-600',
    },
    {
      label: 'Disabled Users',
      value: loading ? '...' : stats.disabledUsers.toLocaleString(),
      icon: UserX,
      color: 'red',
      bg: 'bg-red-100',
      text: 'text-red-600',
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
      <p className="text-gray-600 mb-8">Welcome back! Here's an overview of your system.</p>

      {/* 4 THỐNG KÊ USER – ĐỘNG 100%, ĐẸP NHƯ Figma */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {userStats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-4 rounded-full ${stat.bg}`}>
                <stat.icon className={`w-8 h-8 ${stat.text}`} />
              </div>
              <span className="text-xs font-medium text-gray-500">Real-time</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Phần cũ giữ nguyên (nếu muốn giữ doanh thu, đơn hàng...) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Có thể thêm lại doanh thu, đơn hàng sau nếu cần */}
      </div>

      {/* Recent Activity – giữ nguyên hoặc thêm sau */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="text-center text-gray-500 py-8">
          <Clock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>No recent activity to display</p>
        </div>
      </div>
    </div>
  );
}