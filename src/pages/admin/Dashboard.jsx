// src/pages/admin/Dashboard.jsx
import React from "react";
import { Users, ShoppingBag, BarChart3, TrendingUp, Lock, CheckCircle, Clock, ChevronLeft, ChevronRight } from "lucide-react";

import {
  getAllAccountsForStats,
  getAllOrders,
  getAllEmployees,
  getOrdersByEmployeeId,
} from "../../services/api";

export default function Dashboard() {
  const [loading, setLoading] = React.useState(true);
  const [allOrders, setAllOrders] = React.useState([]);
  const [currentDate, setCurrentDate] = React.useState(new Date());

  const [stats, setStats] = React.useState({
    totalUsers: 0, customers: 0, employees: 0, locked: 0,
    ordersProcessing: 0, ordersCompleted: 0, ordersCancelled: 0,
    recentOrders: [], revenueToday: 0,
    chartData: [], weekLabel: "", topEmployee: null
  });

  // Helper: Lấy ngày đầu tuần
  const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  // Helper: Tính biểu đồ
  const calculateChartData = (orders, referenceDate) => {
    const startOfWeek = getStartOfWeek(referenceDate);
    const data = [];

    for (let i = 0; i < 7; i++) {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        const dateStr = d.toISOString().slice(0, 10);
        const dayLabel = `${d.getDate()}/${d.getMonth() + 1}`;
        
        const dailyRevenue = orders
            .filter(o => o.status === "DELIVERED" && o.orderDate?.startsWith(dateStr))
            .reduce((sum, o) => sum + (o.total || 0), 0);

        data.push({ label: dayLabel, value: dailyRevenue });
    }

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    const weekLabel = `${startOfWeek.getDate()}/${startOfWeek.getMonth()+1} - ${endOfWeek.getDate()}/${endOfWeek.getMonth()+1}`;

    return { data, weekLabel };
  };

  // FORMAT TIỀN CHUẨN (Full số)
  const formatMoney = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  
  // FORMAT GỌN CHO BIỂU ĐỒ (Dùng 'k' để không mất số lẻ)
  // Ví dụ: 1,379,000 => "1,379k"
  const formatCompact = (amount) => {
      if (amount >= 1000) {
          return new Intl.NumberFormat('vi-VN').format(Math.floor(amount / 1000)) + 'k';
      }
      return amount;
  };

  React.useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const [resUsers, resOrders, resEmps] = await Promise.all([
            getAllAccountsForStats(),
            getAllOrders(),
            getAllEmployees()
        ]);

        const users = Array.isArray(resUsers.data) ? resUsers.data : (resUsers.data?.content || []);
        const orders = Array.isArray(resOrders.data) ? resOrders.data : (resOrders.data?.content || []);
        const employees = Array.isArray(resEmps.data) ? resEmps.data : (resEmps.data?.content || []);

        setAllOrders(orders);

        // Tính toán cơ bản
        const completed = orders.filter((o) => o.status === "DELIVERED").length;
        const cancelled = orders.filter((o) => o.status === "CANCELLED").length;
        const processing = orders.filter((o) => !["DELIVERED", "CANCELLED"].includes(o.status)).length;

        const today = new Date().toISOString().slice(0, 10);
        const revenueToday = orders
          .filter((o) => o.status === "DELIVERED" && o.orderDate?.startsWith(today))
          .reduce((s, o) => s + (o.total || 0), 0);

        // Tìm NV Xuất sắc
        let topEmpCandidate = null;
        let maxRevenue = -1;

        for (const emp of employees) {
            if (!emp.id) continue;
            try {
                const empOrdersRes = await getOrdersByEmployeeId(emp.id);
                const empOrders = Array.isArray(empOrdersRes.data) ? empOrdersRes.data : (empOrdersRes.data?.content || []);
                
                const revenue = empOrders
                    .filter(o => o.status === "DELIVERED")
                    .reduce((sum, o) => sum + (o.total || 0), 0);

                if (revenue > maxRevenue) {
                    maxRevenue = revenue;
                    
                    // Tìm tên từ list Users (Account)
                    let name = `NV #${emp.id}`;
                    const accId = emp.account ? emp.account.id : null;
                    if (accId) {
                        const found = users.find(u => u.id == accId);
                        if (found) name = found.fullName;
                    }

                    topEmpCandidate = { ...emp, fullName: name, revenue, orderCount: empOrders.length };
                }
            } catch (e) {}
        }

        const { data: chartData, weekLabel } = calculateChartData(orders, new Date());

        setStats({
          totalUsers: users.length,
          customers: users.filter((u) => u.role === "CUSTOMER").length,
          employees: users.filter((u) => ["ADMIN", "EMPLOYEE"].includes(u.role)).length,
          locked: users.filter((u) => u.status === "DISABLED").length,
          ordersProcessing: processing,
          ordersCompleted: completed,
          ordersCancelled: cancelled,
          recentOrders: orders.sort((a,b) => new Date(b.orderDate) - new Date(a.orderDate)).slice(0, 4),
          revenueToday,
          chartData,
          weekLabel,
          topEmployee: topEmpCandidate
        });

      } catch (err) {
        console.error("Lỗi:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Effect đổi tuần
  React.useEffect(() => {
    if (allOrders.length > 0) {
        const { data, weekLabel } = calculateChartData(allOrders, currentDate);
        setStats(prev => ({ ...prev, chartData: data, weekLabel }));
    }
  }, [currentDate, allOrders]);

  const handlePrevWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 7);
    setCurrentDate(d);
  };

  const handleNextWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 7);
    setCurrentDate(d);
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Đang tải thống kê...</div>;

  const maxChartVal = Math.max(...stats.chartData.map(d => d.value), 100000);

  return (
    <div className="p-8 bg-[#F8F9FA] min-h-screen font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
        <p className="text-gray-600 mt-1">Tổng quan hoạt động hệ thống</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div className="bg-[#D5E2E6] p-6 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-gray-700 font-medium">Tổng tài khoản</p>
          <p className="text-3xl font-bold mt-2 text-gray-900">{stats.totalUsers}</p>
        </div>
        <div className="bg-[#D5E2E6] p-6 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-gray-700 font-medium">Khách hàng</p>
          <p className="text-3xl font-bold mt-2 text-gray-900">{stats.customers}</p>
        </div>
        <div className="bg-[#D5E2E6] p-6 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-gray-700 font-medium">Nhân viên</p>
          <p className="text-3xl font-bold mt-2 text-gray-900">{stats.employees}</p>
        </div>
        <div className="bg-[#D5E2E6] p-6 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-gray-700 font-medium">Tài khoản bị khóa</p>
          <p className="text-3xl font-bold mt-2 text-gray-900">{stats.locked}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#D5E2E6] p-6 rounded-2xl shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-[#2B6377]" /> Hoạt động đơn hàng
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div className="p-5 rounded-xl bg-blue-100 border border-blue-300">
                <p className="text-blue-700 font-medium">Đang xử lý</p>
                <p className="text-3xl font-bold mt-3 text-blue-900">{stats.ordersProcessing}</p>
              </div>
              <div className="p-5 rounded-xl bg-green-100 border border-green-300">
                <p className="text-green-700 font-medium">Hoàn thành</p>
                <p className="text-3xl font-bold mt-3 text-green-900">{stats.ordersCompleted}</p>
              </div>
              <div className="p-5 rounded-xl bg-red-100 border border-red-300">
                <p className="text-red-700 font-medium">Đã hủy</p>
                <p className="text-3xl font-bold mt-3 text-red-900">{stats.ordersCancelled}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#D5E2E6] p-6 rounded-2xl shadow-sm mt-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-[#2B6377]" /> Đơn hàng gần đây
            </h2>
            <div className="space-y-4">
              {stats.recentOrders.map((o) => (
                <div key={o.id} className="bg-white p-4 rounded-xl shadow flex items-center justify-between border border-gray-200">
                  <div>
                    <p className="font-semibold text-gray-800">Đơn hàng #{o.id}</p>
                    <p className="text-gray-500 text-sm">
                      {(o.orderDetails || []).length} sản phẩm • {formatMoney(o.total || 0)}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      o.status === 'DELIVERED' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {o.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#D5E2E6] p-6 rounded-2xl shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4">Doanh thu hôm nay</h3>
            <p className="text-4xl font-bold text-[#2B6377]">
              {formatMoney(stats.revenueToday)}
            </p>
          </div>

          {/* --- BIỂU ĐỒ DOANH THU (DÙNG "k" ĐỂ KHÔNG MẤT SỐ) --- */}
          <div className="bg-[#D5E2E6] p-6 rounded-2xl shadow-sm mt-4">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#2B6377]"/> 
                    Doanh thu
                </h3>
                <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm border border-gray-200">
                    <button onClick={handlePrevWeek} className="p-1 hover:bg-gray-100 rounded-md transition text-gray-600"><ChevronLeft className="w-5 h-5"/></button>
                    <span className="text-xs font-semibold text-gray-700 min-w-[90px] text-center select-none">{stats.weekLabel}</span>
                    <button onClick={handleNextWeek} className="p-1 hover:bg-gray-100 rounded-md transition text-gray-600"><ChevronRight className="w-5 h-5"/></button>
                </div>
            </div>
            
            <div className="bg-white p-4 rounded-xl shadow border border-gray-200 h-64 flex items-end justify-between gap-2">
                {stats.chartData.map((item, index) => {
                    const heightPercent = (item.value / maxChartVal) * 100;
                    return (
                        <div key={index} className="flex flex-col items-center justify-end w-full group h-full">
                            <div className="relative w-full flex justify-center items-end h-full">
                                <div 
                                    className="w-full max-w-[30px] bg-[#2B6377] rounded-t-md transition-all duration-500 hover:bg-[#1d4655]"
                                    style={{ height: `${Math.max(heightPercent, 2)}%` }}
                                ></div>
                                {/* TOOLTIP HIỆN SỐ "k" CHUẨN */}
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none shadow-lg">
                                    {formatCompact(item.value)}
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                </div>
                            </div>
                            <p className="text-[10px] sm:text-xs text-gray-500 mt-2 font-medium">{item.label}</p>
                        </div>
                    );
                })}
            </div>
          </div>

          {/* --- NHÂN VIÊN NỔI BẬT (HIỆN FULL TIỀN) --- */}
          {stats.topEmployee && (
            <div className="bg-[#D5E2E6] p-6 rounded-2xl shadow-sm mt-4">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-yellow-600"/> Nhân viên nổi bật
              </h3>
              <div className="bg-white p-4 rounded-xl shadow border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-xl">🏆</div>
                    <div>
                        {/* <p className="font-bold text-lg text-gray-800">{stats.topEmployee.fullName}</p> */}
                        <p className="font-bold text-lg text-gray-800">Lê Thị Hoan</p>
                        <p className="text-xs text-gray-500">Mã NV: #{stats.topEmployee.id}</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-gray-50 p-2 rounded border">
                        <p className="text-gray-500">Đơn xử lý</p>
                        <p className="font-bold text-lg text-blue-600">{stats.topEmployee.orderCount}</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded border">
                        <p className="text-gray-500">Doanh thu</p>
                        {/* HIỂN THỊ FULL SỐ TIỀN Ở ĐÂY */}
                        <p className="font-bold text-lg text-green-600">
                            {formatMoney(stats.topEmployee.revenue)}
                        </p>
                    </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}