// src/pages/admin/UserDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Edit, TrendingUp, Clock, CheckCircle, 
  FileText, Phone, Mail, Calendar, MapPin, Package, 
  AlertCircle, AlertTriangle // [THÊM] Import icon AlertTriangle
} from 'lucide-react';

import { 
    disableAccount, 
    getUserById, 
    getOrdersByCustomerId, 
    getOrdersByEmployeeId,
    getAllCustomers, 
    getAllEmployees,
    updateAccount,
    checkAccountRisk
} from '../../services/api'; 
import DisableAccountModal from '../../components/admin/DisableReason_Modal';
import EditRoleModal from '../../components/admin/EditRoleModal';
import { notifySuccess, notifyError } from '../../utils/toast.js';

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [riskData, setRiskData] = useState(null);
  const [user, setUser] = useState(null); 
  const [orders, setOrders] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [isDisableModalOpen, setIsDisableModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  const [stats, setStats] = useState({
    totalSpent: 0, completedOrders: 0, processedOrders: 0, totalRevenueManaged: 0
  });

  useEffect(() => {
  const token = localStorage.getItem('token');
  console.log('🔑 Current Token:', token);
  
  if (token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      console.log('📦 JWT Payload:', payload);
    } catch (e) {
      console.error('Cannot decode token:', e);
    }
  }
}, []);
  const calculateStats = (role, orderList) => {
    if (!Array.isArray(orderList)) return;

    const newStats = {
      totalSpent: 0,
      completedOrders: 0,
      processedOrders: 0,
      totalRevenueManaged: 0
    };

    if (role === 'CUSTOMER') {
      newStats.completedOrders = orderList.filter(o => o.status === 'DELIVERED').length;
      newStats.totalSpent = orderList
        .filter(o => o.status === 'DELIVERED')
        .reduce((sum, o) => sum + (o.total || 0), 0);
    } else {
      newStats.processedOrders = orderList.length;
      newStats.totalRevenueManaged = orderList
        .filter(o => o.status === 'DELIVERED')
        .reduce((sum, o) => sum + (o.total || 0), 0);
    }

    setStats(newStats);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
      
        const resAccount = await getUserById(id);
        const accountData = resAccount.data;
        setUser(accountData); 

        // === [THÊM MỚI] GỌI API CHECK RỦI RO NGAY KHI LOAD TRANG ===
        try {
            const resRisk = await checkAccountRisk(id);
            setRiskData(resRisk.data); // Lưu kết quả: { level: "HIGH", note: "..." }
            console.log("⚠️ Risk Data:", resRisk.data);
        } catch (err) {
            console.warn("Không lấy được thông tin rủi ro:", err);
        }
        // ============================================================

        console.log("🔹 Account đang xem:", accountData);

        let orderList = [];
        let targetId = null;

        if (accountData.role === 'CUSTOMER') {
            if (accountData.customer) {
                targetId = accountData.customer.id;
            } else {
                try {
                    const resAll = await getAllCustomers();
                    const listData = Array.isArray(resAll.data) ? resAll.data : (resAll.data.content || []);
                    const found = listData.find(c => c.account && c.account.id == accountData.id);
                    if (found) targetId = found.id;
                } catch (err) { console.warn("Lỗi tìm Customer map:", err); }
            }

            if (!targetId) {
                console.warn("⚠️ Không tìm thấy Customer ID khớp, thử dùng Account ID:", accountData.id);
                targetId = accountData.id; 
            }

            if (targetId) {
                console.log("🚀 Gọi API Order cho Customer ID:", targetId);
                const resOrders = await getOrdersByCustomerId(targetId);
                
                // ✅ FIX: Break circular reference bằng JSON parse
                let rawData = [];
                try {
                    const jsonString = JSON.stringify(resOrders.data);
                    const parsedData = JSON.parse(jsonString);
                    
                    if (Array.isArray(parsedData)) {
                        rawData = parsedData;
                    } else if (parsedData && parsedData.content) {
                        rawData = parsedData.content;
                    }
                } catch (jsonError) {
                    console.error("❌ JSON parse error:", jsonError);
                    // Fallback: Thử trực tiếp
                    if (Array.isArray(resOrders.data)) {
                        rawData = resOrders.data;
                    } else if (resOrders.data && resOrders.data.content) {
                        rawData = resOrders.data.content;
                    }
                }

                // CLEAN DATA
                orderList = rawData.map(order => {
                    try {
                        const cleaned = {
                            id: order.id,
                            total: order.total || 0,
                            status: order.status,
                            orderDate: order.orderDate,
                            cancelReason: order.cancelReason,
                            canceledAt: order.canceledAt,
                            shippingFee: order.shippingFee || 0,
                            orderDetails: order.orderDetails ? order.orderDetails.map(detail => ({
                                id: detail.id,
                                quantity: detail.quantity,
                                price: detail.price
                            })) : []
                        };
                        return cleaned;
                    } catch (err) {
                        return null;
                    }
                }).filter(Boolean);
            }
        } 
        else if (accountData.role === 'EMPLOYEE' || accountData.role === 'ADMIN') {
            if (accountData.employee) {
                targetId = accountData.employee.id;
            } else {
                try {
                    const resAll = await getAllEmployees();
                    const listData = Array.isArray(resAll.data) ? resAll.data : (resAll.data.content || []);
                    const found = listData.find(e => e.account && e.account.id == accountData.id);
                    if (found) targetId = found.id;
                } catch (err) { console.warn("Lỗi tìm Employee map:", err); }
            }

            if (!targetId) {
                targetId = accountData.id;
            }

            if (targetId) {
                const resOrders = await getOrdersByEmployeeId(targetId);

                let rawData = [];
                try {
                    const jsonString = JSON.stringify(resOrders.data);
                    const parsedData = JSON.parse(jsonString);
                    if (Array.isArray(parsedData)) {
                        rawData = parsedData;
                    } else if (parsedData && parsedData.content) {
                        rawData = parsedData.content;
                    }
                } catch (jsonError) {
                    if (Array.isArray(resOrders.data)) {
                        rawData = resOrders.data;
                    } else if (resOrders.data && resOrders.data.content) {
                        rawData = resOrders.data.content;
                    }
                }

                orderList = rawData.map(order => {
                    try {
                        const cleaned = {
                            id: order.id,
                            total: order.total || 0,
                            status: order.status,
                            orderDate: order.orderDate,
                            cancelReason: order.cancelReason,
                            canceledAt: order.canceledAt,
                            shippingFee: order.shippingFee || 0,
                            orderDetails: order.orderDetails ? order.orderDetails.map(detail => ({
                                id: detail.id,
                                quantity: detail.quantity,
                                price: detail.price
                            })) : []
                        };
                        return cleaned;
                    } catch (err) {
                        return null;
                    }
                }).filter(Boolean);
            }
        }

        // Sắp xếp
        if (Array.isArray(orderList) && orderList.length > 0) {
            const sortedOrders = [...orderList].sort((a, b) => {
                const dateA = a.orderDate ? new Date(a.orderDate) : new Date(0);
                const dateB = b.orderDate ? new Date(b.orderDate) : new Date(0);
                return dateB - dateA;
            });
            setOrders(sortedOrders);
            calculateStats(accountData.role, sortedOrders);
        } else {
            setOrders([]);
            calculateStats(accountData.role, []);
        }

      } catch (error) {
        console.error("🔥 Lỗi tải dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

    const handleUpdateRole = async (id, newRole) => {
        try {
            const payload = { ...user, role: newRole };
            await updateAccount(id, payload);

            notifySuccess('Cập nhật vai trò thành công!');

            setTimeout(() => window.location.reload(), 1500);
        } catch (err) {

            notifyError('Lỗi: ' + (err.response?.data?.message || err.message));
        }
    };

  if (loading) return <div className="p-10 text-center text-gray-500">Đang tải thông tin...</div>;
  if (!user) return <div className="p-10 text-center text-red-500">Không tìm thấy người dùng</div>;

  const isCustomer = user.role === 'CUSTOMER';

  const renderOrderStatus = (status) => {
      const statusMap = {
          'PENDING': { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-700' },
          'CONFIRMED': { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-700' },
          'PROCESSING': { label: 'Đang xử lý', color: 'bg-indigo-100 text-indigo-700' },
          'SHIPPING': { label: 'Đang giao', color: 'bg-purple-100 text-purple-700' },
          'DELIVERED': { label: 'Hoàn thành', color: 'bg-green-100 text-green-700' },
          'CANCELLED': { label: 'Đã hủy', color: 'bg-red-100 text-red-700' },
          'RETURNED': { label: 'Hoàn trả', color: 'bg-orange-100 text-orange-700' },
          'REFUNDED': { label: 'Hoàn tiền', color: 'bg-gray-100 text-gray-700' }
      };
      const conf = statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-700' };
      return <span className={`px-2 py-1 rounded text-xs font-bold ${conf.color}`}>{conf.label}</span>;
  };

  const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const handleOpenDisableModal = async () => {
      try {
          // Vẫn giữ check ở đây để refresh dữ liệu nếu cần
          const res = await checkAccountRisk(user.id);
          setRiskData(res.data); 
      } catch (error) {
          console.error("Lỗi check risk:", error);
          setRiskData(null);
      } finally {
          setIsDisableModalOpen(true);
      }
  };

  return (
    <div className="admin-user-detail-page p-8 bg-[#F8F9FA] min-h-screen font-sans">
      <div className="flex items-center gap-2 mb-6 text-sm text-gray-500">
        <button onClick={() => navigate(-1)} className="hover:text-gray-800 flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Tài khoản
        </button>
        <span>/</span>
        <span className="font-semibold text-gray-800">Chi tiết tài khoản</span>
      </div>

      {/* === [THÊM MỚI] BANNER CẢNH BÁO NGUY HIỂM (Chỉ hiện khi có rủi ro HIGH) === */}
      {riskData && riskData.level === 'HIGH' && (
        <div className="bg-red-50 border-l-4 border-red-600 p-4 mb-6 rounded-r shadow-sm flex items-start gap-4 animate-in slide-in-from-top-2">
            <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
                <h3 className="text-lg font-bold text-red-800">CẢNH BÁO HỆ THỐNG: TÀI KHOẢN CÓ DẤU HIỆU BẤT THƯỜNG</h3>
                <p className="text-red-700 mt-1 font-medium">
                    {riskData.note || riskData.suggestedReason}
                </p>
                <div className="mt-2 flex gap-3">
                     <button 
                        onClick={handleOpenDisableModal}
                        className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded hover:bg-red-700 transition shadow"
                    >
                        Xử lý ngay
                    </button>
                </div>
            </div>
        </div>
      )}
      {/* ========================================================================== */}

      <div className="bg-[#D5E2E6] rounded-2xl p-6 mb-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{user.fullName || 'No Name'}</h1>
          <p className="text-gray-500 mt-1">
            {isCustomer ? 'Customer ID:' : 'Employee ID:'} <span className="font-medium text-gray-700">#{user.id}</span>
          </p>
          <div className="flex items-center gap-6 mt-4 text-sm text-gray-600">
            <div>
              <span className="block text-gray-400 text-xs">Ngày tham gia</span>
              <span className="font-semibold text-gray-800">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '—'}
              </span>
            </div>
            <div className="flex items-end gap-3">
                <div>
                    <span className="block text-gray-400 text-xs">Vai trò</span>
                    <span className="font-semibold text-gray-800 capitalize">{user.role}</span>
                </div>
            </div>
          </div>
        </div>
        <div className="mt-4 md:mt-0">
          <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${
            user.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 
            user.status === 'LOCKED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
          }`}>
            {user.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#D5E2E6] rounded-2xl p-6 shadow-sm relative">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-700" />
                {isCustomer ? 'Thông tin khách hàng' : 'Thông tin nhân viên'}
              </h2>
             
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
              <div><p className="text-sm text-gray-500 mb-1">Full name</p><div className="flex items-center gap-2 font-semibold text-gray-800"><div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs">👤</div>{user.fullName}</div></div>
              <div><p className="text-sm text-gray-500 mb-1">Phone</p><div className="flex items-center gap-2 font-semibold text-gray-800"><Phone className="w-4 h-4 text-gray-500" />{user.phoneNumber || '—'}</div></div>
              <div><p className="text-sm text-gray-500 mb-1">Email</p><div className="flex items-center gap-2 font-semibold text-gray-800"><Mail className="w-4 h-4 text-gray-500" />{user.username || '—'}</div></div>
              
              {isCustomer && (
                  <div className="col-span-2">
                      <p className="text-sm text-gray-500 mb-1">Địa chỉ</p>
                      <div className="flex items-center gap-2 font-semibold text-gray-800">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span>Xem chi tiết trong đơn hàng</span> 
                      </div>
                  </div>
              )}
            </div>
          </div>

          <div className="bg-[#D5E2E6] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-2">
                 {isCustomer ? <Clock className="w-5 h-5 text-blue-700" /> : <Package className="w-5 h-5 text-blue-700" />}
                 <h3 className="font-bold text-gray-800">
                    {isCustomer ? 'Lịch sử mua hàng' : 'Lịch sử xử lý đơn hàng'}
                 </h3>
               </div>
               <span className="text-sm text-gray-500">Tổng: {orders.length} đơn</span>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {orders.length > 0 ? (
                orders.map((order) => (
                  <div key={order.id}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`mt-1 p-2 rounded-full ${order.status === 'DELIVERED' ? 'bg-green-100' : 'bg-blue-100'}`}>
                          <Package className="w-4 h-4 text-gray-600"/>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">Đơn hàng #{order.id}</p>
                          <p className="text-xs text-gray-500">
                            {order.orderDetails ? order.orderDetails.length : 0} sản phẩm • {formatCurrency(order.total || 0)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 mb-1">
                          {order.orderDate 
                            ? new Date(order.orderDate).toLocaleDateString('vi-VN')
                            : '—'}
                        </p>
                        {renderOrderStatus(order.status)}
                      </div>
                    </div>
                    <div className="w-full h-px bg-gray-300/50 mt-4"></div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">Chưa có dữ liệu đơn hàng</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
         {isCustomer ? (
  <div>
    <h3 className="font-bold text-gray-800 mb-4">Thống kê mua sắm</h3>
    <div className="space-y-4">
      {/* Tổng tiền đã chi */}
      <div className="bg-gradient-to-r from-pink-100 to-red-100 p-5 rounded-2xl border border-pink-200 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-pink-700 font-medium text-sm">Tổng chi tiêu</p>
            <p className="text-3xl font-bold text-red-800 mt-2">{formatCurrency(stats.totalSpent)}</p>
          </div>
          <div className="p-3 bg-red-200 rounded-xl">
            <Package className="w-6 h-6 text-red-700" />
          </div>
        </div>
      </div>

      {/* Đơn hàng hoàn thành */}
      <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-5 rounded-2xl border border-green-200 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-green-700 font-medium text-sm">Đơn hàng hoàn thành</p>
            <p className="text-3xl font-bold text-green-900 mt-2">{stats.completedOrders}</p>
          </div>
          <div className="p-3 bg-green-200 rounded-xl">
            <CheckCircle className="w-6 h-6 text-green-700" />
          </div>
        </div>
      </div>

      {/* Đơn hàng đang xử lý */}
      <div className="bg-gradient-to-r from-blue-100 to-cyan-100 p-5 rounded-2xl border border-blue-200 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-blue-700 font-medium text-sm">Đang xử lý</p>
            <p className="text-3xl font-bold text-blue-900 mt-2">
              {orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length}
            </p>
          </div>
          <div className="p-3 bg-blue-200 rounded-xl">
            <Clock className="w-6 h-6 text-blue-700" />
          </div>
        </div>
      </div>

      {/* Tỷ lệ hoàn thành */}
      <div className="bg-gradient-to-r from-purple-100 to-indigo-100 p-5 rounded-2xl border border-purple-200 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-purple-700 font-medium text-sm">Tỷ lệ hoàn thành</p>
            <p className="text-3xl font-bold text-purple-900 mt-2">
              {orders.length > 0 
                ? Math.round((stats.completedOrders / orders.length) * 100) 
                : 0}%
            </p>
          </div>
          <div className="p-3 bg-purple-200 rounded-xl">
            <TrendingUp className="w-6 h-6 text-purple-700" />
          </div>
        </div>
      </div>
    </div>
  </div>
) : (

  <div>
    <h3 className="font-bold text-gray-800 mb-4">Hiệu suất làm việc</h3>
    <div className="space-y-4">
      <div className="bg-purple-100/50 p-5 rounded-xl border border-purple-100">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-purple-800 font-medium text-sm">Đơn hàng đã xử lý</p>
            <p className="text-2xl font-bold text-purple-900 mt-2">{stats.processedOrders}</p>
          </div>
          <div className="p-2 bg-purple-200 rounded-lg"><CheckCircle className="w-5 h-5 text-purple-700" /></div>
        </div>
      </div>
      <div className="bg-blue-100/50 p-5 rounded-xl border border-blue-100">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-blue-800 font-medium text-sm">Doanh thu phụ trách</p>
            <p className="text-2xl font-bold text-blue-900 mt-2">{formatCurrency(stats.totalRevenueManaged)}</p>
          </div>
          <div className="p-2 bg-blue-200 rounded-lg"><TrendingUp className="w-5 h-5 text-blue-700" /></div>
        </div>
      </div>
    </div>
  </div>
)}

          <div className="bg-[#D5E2E6] rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4">Thao tác nhanh</h3>
            <button 
              onClick={handleOpenDisableModal}
              className="w-full py-3 bg-white border border-red-200 text-red-600 rounded-lg font-medium hover:bg-red-50 transition flex items-center justify-center gap-2"
            >
              <AlertCircle className="w-5 h-5" />
              Vô hiệu hóa tài khoản
            </button>
             {!isCustomer && (
                <button
                  onClick={() => setIsRoleModalOpen(true)}
                  className="flex mt-4 w-full py-3 items-center gap-1 px-3 py-1 bg-[#2B6377] text-white rounded-lg font-medium hover:bg-red-50 transition flex items-center justify-center gap-2"
                >
                  <Edit className="w-3.5 h-3.5" /> Chuyển đổi Role
                </button>
  )}
          </div>
        </div>
      </div>

      <DisableAccountModal 
        isOpen={isDisableModalOpen}
        onClose={() => setIsDisableModalOpen(false)}
        onConfirm={async (reason, customReason) => {
            try {
                const finalReason = reason === 'OTHER' ? customReason : (customReason ? `${reason}: ${customReason}` : reason);
                await disableAccount(user.id, finalReason);


                notifySuccess('Thành công! Email thông báo đã được gửi.');

                setTimeout(() => window.location.reload(), 1500);
            } catch(e) {

                notifyError('Lỗi: ' + e.message);
            }
        }}
        user={user} 
        riskData={riskData} 
      />
      {/* MODAL SỬA ROLE MỚI */}
      <EditRoleModal 
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        currentUser={user}
        onConfirm={handleUpdateRole}
      />
    </div>
  );
}