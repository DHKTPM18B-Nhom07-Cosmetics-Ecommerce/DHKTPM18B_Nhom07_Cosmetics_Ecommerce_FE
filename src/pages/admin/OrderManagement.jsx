import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import {
    ChevronLeft,
    ChevronRight,
    Search,
    Filter,
    RefreshCw,
    Eye,
    ShoppingCart,
    DollarSign,
    Users,
    CheckSquare,
    Zap,
    XCircle,
    AlertTriangle,
    CheckCircle,
    Info
} from 'lucide-react';
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { notifySuccess, notifyError } from '../../utils/toast.js';

// Định nghĩa trạng thái đơn hàng
const ORDER_STATUSES = [
    'Tất cả',
    'PENDING',
    'CONFIRMED',
    'PROCESSING',
    'SHIPPING',
    'DELIVERED',
    'CANCELLED',
    'RETURNED',
    'REFUNDED',
];

const API_BASE_URL = 'http://localhost:8080/api/orders';
const ORDERS_PER_PAGE = 10;
const TEAL_COLOR = '#2B6377';
const TEAL_BG = 'bg-[#2B6377]';

// Map trạng thái tiếp theo cho Modal
const NEXT_STATUS_MAP = {
    PENDING: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['PROCESSING', 'CANCELLED'],
    PROCESSING: ['SHIPPING', 'CANCELLED'],
    SHIPPING: ['DELIVERED'],
    DELIVERED: ['RETURNED'],
    RETURNED: ['REFUNDED'],
    REFUNDED: [],
    CANCELLED: [],
};

// --- HÀM TIỆN ÍCH CHUNG ---

const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return 'N/A';
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(numericAmount);
};

const formatNumber = (num) => {
    if (num === null || num === undefined) return '0';
    return num.toLocaleString('vi-VN');
};

const getStatusStyle = (status) => {
    switch (status) {
        case 'DELIVERED': return 'bg-green-100 text-green-700 border-green-500';
        case 'SHIPPING': return 'bg-blue-100 text-blue-700 border-blue-500';
        case 'PROCESSING': return 'bg-yellow-100 text-yellow-700 border-yellow-500';
        case 'CONFIRMED':
        case 'PENDING': return 'bg-purple-100 text-purple-700 border-purple-500';
        case 'CANCELLED':
        case 'RETURNED':
        case 'REFUNDED': return 'bg-red-100 text-red-700 border-red-500';
        default: return 'bg-gray-100 text-gray-700 border-gray-400';
    }
};

const translateStatus = (status) => {
    switch (status) {
        case 'DELIVERED': return 'Hoàn thành';
        case 'SHIPPING': return 'Đang giao';
        case 'PROCESSING': return 'Đang xử lý';
        case 'CONFIRMED': return 'Đã xác nhận';
        case 'PENDING': return 'Chờ xử lý';
        case 'CANCELLED': return 'Đã hủy';
        case 'RETURNED': return 'Yêu cầu trả hàng';
        case 'REFUNDED': return 'Đã hoàn tiền';
        case 'Tất cả': return 'Tất cả';
        default: return status;
    }
};



// --- UTILITY COMPONENTS ---

const StatusUpdateModal = ({ isOpen, currentOrder, onUpdate, onCancel }) => {
    if (!isOpen || !currentOrder) return null;

    const currentStatus = currentOrder.status;
    const possibleNextStatus = NEXT_STATUS_MAP[currentStatus] || [];

    // 1. Logic để kiểm tra lý do hủy từ KH
    const isCustomerCancelRequest = currentOrder.cancelReason && currentOrder.cancelReason.startsWith('Yêu cầu hủy từ KH:');
    const customerReasonText = isCustomerCancelRequest ? currentOrder.cancelReason : '';

    // 🎯 THAY ĐỔI QUAN TRỌNG: Thiết lập trạng thái mặc định ưu tiên 'CANCELLED'
    const defaultStatus = useMemo(() => {
        if (isCustomerCancelRequest && currentStatus === 'PENDING' && possibleNextStatus.includes('CANCELLED')) {
            return 'CANCELLED';
        }
        return possibleNextStatus.length > 0 ? possibleNextStatus[0] : currentStatus;
    }, [isCustomerCancelRequest, currentStatus, possibleNextStatus]);

    // Sử dụng state cục bộ cho Modal
    const [selectedStatus, setSelectedStatus] = useState(defaultStatus);
    const [cancelReason, setCancelReason] = useState(customerReasonText);
    const [modalError, setModalError] = useState(null);

    const requiresReason = selectedStatus === 'CANCELLED' || selectedStatus === 'RETURNED';

    // EFFECT để RESET trạng thái khi Modal mở cho đơn hàng khác (QUAN TRỌNG)
    useEffect(() => {
        setSelectedStatus(defaultStatus);
        setCancelReason(customerReasonText);
        setModalError(null);
    }, [currentOrder.id, defaultStatus, customerReasonText]);


    const handleConfirm = () => {
        setModalError(null);

        if (requiresReason && !cancelReason.trim()) {
            setModalError('Vui lòng nhập hoặc xác nhận lý do hủy/trả hàng.');
            return;
        }

        onUpdate(currentOrder.id, selectedStatus, cancelReason);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm font-sans">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 m-4">
                <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2 flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-[#2B6377]" /> Cập nhật Đơn hàng #{currentOrder.id}
                </h3>
                <div className="text-gray-700 mb-6 space-y-4">
                    <p>Trạng thái hiện tại: <span className={`px-2 py-1 rounded text-white text-xs ${getStatusStyle(currentStatus)}`}>{translateStatus(currentStatus)}</span></p>

                    {/* HIỂN THỊ CẢNH BÁO YÊU CẦU HỦY CỦA KHÁCH HÀNG */}
                    {isCustomerCancelRequest && currentStatus === 'PENDING' && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-start">
                            <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
                            <div>
                                <span className="font-bold">YÊU CẦU HỦY TỪ KHÁCH HÀNG:</span>
                                <p className="mt-1">{customerReasonText.replace('Yêu cầu hủy từ KH: ', '')}</p>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col">
                        <label className="text-sm font-medium mb-1">Chọn trạng thái mới:</label>
                        <select
                            value={selectedStatus}
                            onChange={(e) => {
                                const newStatus = e.target.value;
                                setSelectedStatus(newStatus);

                                // Logic giữ hoặc reset lý do
                                if (isCustomerCancelRequest && newStatus === 'CANCELLED') {
                                    setCancelReason(customerReasonText);
                                } else if (newStatus === 'CANCELLED' || newStatus === 'RETURNED') {
                                    setCancelReason('');
                                } else {
                                    setCancelReason('');
                                }
                                setModalError(null);
                            }}
                            className="px-3 py-2 border rounded-lg focus:ring-[#2B6377] focus:border-[#2B6377]"
                            disabled={possibleNextStatus.length === 0}
                        >
                            {possibleNextStatus.length === 0 ? (
                                <option>Đơn hàng đã kết thúc</option>
                            ) : (
                                possibleNextStatus.map(s => (
                                    <option key={s} value={s}>{translateStatus(s)}</option>
                                ))
                            )}
                        </select>
                    </div>

                    {requiresReason && (
                        <div className="flex flex-col">
                            <label className="text-sm font-medium mb-1 text-red-600">
                                Lý do Hủy/Trả hàng: {isCustomerCancelRequest && currentStatus === 'PENDING' && "(Ghi đè nếu cần)"}
                            </label>
                            <textarea
                                value={cancelReason}
                                onChange={(e) => {
                                    setCancelReason(e.target.value);
                                    setModalError(null);
                                }}
                                rows="3"
                                className={`px-3 py-2 border rounded-lg focus:ring-red-500 focus:border-red-500 resize-none ${modalError ? 'border-red-500' : ''}`}
                                placeholder="Xác nhận hoặc nhập lý do của nhân viên..."
                            />
                        </div>
                    )}

                    {/* Hiển thị lỗi cục bộ */}
                    {modalError && (
                        <p className="text-sm text-red-500 flex items-center mt-2">
                            <AlertTriangle className="w-4 h-4 mr-1"/> {modalError}
                        </p>
                    )}

                </div>
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onCancel}
                        className="py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition duration-150 text-sm font-medium"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={possibleNextStatus.length === 0}
                        className={`py-2 px-4 ${TEAL_BG} text-white rounded-lg hover:opacity-90 transition duration-150 text-sm font-medium disabled:opacity-50`}
                    >
                        Áp dụng
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- COMPONENT CHÍNH: OrderManagement ---
const OrderManagement = () => {
    // --- SỬ DỤNG AUTH CONTEXT ĐỂ LẤY TRẠNG THÁI ---
    const { user, isLoggedIn, isLoading: authLoading } = useAuth();
    const adminToken = user?.token;

    // Kiểm tra quyền hạn
    const isAdminOrEmployee = user && (user.role === 'ADMIN' || user.role === 'EMPLOYEE');
    const isEmployeeRole = user?.role === 'EMPLOYEE';
    // const isAdminRole = user?.role === 'ADMIN'; // Không cần dùng

    // --- State Quản lý Dữ liệu ---
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [error, setError] = useState(null);

    // --- State Cập nhật Trạng thái ---
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // --- State Chính thức để gọi API ---
    const [filters, setFilters] = useState({
        search: '',
        status: '',
        startDate: '',
        endDate: ''
    });

    // --- State Tạm thời cho các ô input (giữ nguyên) ---
    const [tempSearch, setTempSearch] = useState('');
    const [tempStatus, setTempStatus] = useState('');
    const [tempStartDate, setTempStartDate] = useState('');
    const [tempEndDate, setTempEndDate] = useState('');


    // --- Logic Lấy Dữ liệu ---
    const fetchOrders = useCallback(async () => {

        if (authLoading) return;

        setLoading(true);
        setError(null);

        const token = adminToken;

        if (!isLoggedIn || !isAdminOrEmployee || !token) {
            setError('Lỗi xác thực: Vui lòng đăng nhập bằng tài khoản Quản lý.');
            setLoading(false);
            return;
        }

        let url;
        const params = {};

        // 1. LỌC THEO NGÀY (Ưu tiên Date Range)
        if (filters.startDate && filters.endDate) {
            url = `${API_BASE_URL}/admin/date-range`;
            params.start = `${filters.startDate}T00:00:00`;
            params.end = `${filters.endDate}T23:59:59`;

            if (filters.status) {
                params.status = filters.status;
            }
        }
        // 2. CHỈ LỌC THEO STATUS (Nếu không có Ngày)
        else if (filters.status) {
            url = `${API_BASE_URL}/admin/status/${filters.status}`;
        }
        // 3. MẶC ĐỊNH (Không có lọc Status hay Ngày)
        else {
            url = `${API_BASE_URL}/admin/all`;
        }

        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            params: params
        };

        try {
            const response = await axios.get(url, config);
            let fetchedOrders = Array.isArray(response.data) ? response.data : response.data?.content || response.data?.orders || [];

            setOrders(fetchedOrders);
        } catch (err) {
            console.error('Lỗi khi tải đơn hàng:', err);
            const status = err.response?.status;
            if (status === 401 || status === 403) {
                setError('Lỗi phân quyền: Token không đủ quyền truy cập hoặc hết hạn. Vui lòng đăng nhập lại.');
                notifyError('Lỗi phân quyền: Token không đủ quyền truy cập hoặc hết hạn. Vui lòng đăng nhập lại.');
            } else {
                setError(`Không thể tải dữ liệu đơn hàng. Lỗi HTTP: ${status || 'Không rõ'}. Vui lòng kiểm tra kết nối.`);
                notifyError(`Không thể tải dữ liệu đơn hàng. Lỗi HTTP: ${status || 'Không rõ'}.`);
            }
            setOrders([]);
        } finally {
            setLoading(false);
        }
    }, [authLoading, adminToken, isLoggedIn, isAdminOrEmployee, filters]);

    // --- Hàm GỌI API CẬP NHẬT TRẠNG THÁI (Giữ nguyên) ---
    const handleUpdateStatus = async (orderId, newStatus, cancelReason) => {
        setIsStatusModalOpen(false);

        let updateUrl = `${API_BASE_URL}/${orderId}/status`;
        let params = {
            newStatus: newStatus,
        };

        if (cancelReason) {
            params.cancelReason = cancelReason;
        }

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${adminToken}`,
                },
                params: params
            };

            // Backend sẽ tự động lấy Employee ID qua Principal (username) từ token
            await axios.post(updateUrl, null, config);

            notifySuccess(`Đã cập nhật trạng thái đơn hàng #${orderId} sang ${translateStatus(newStatus)}.`);
            fetchOrders();

        } catch (err) {
            console.error('Lỗi khi cập nhật trạng thái:', err);
            const errorMessage = err.response?.data?.message || 'Lỗi cập nhật trạng thái đơn hàng.';
            notifyError(errorMessage);
        }
    };


    // --- Effect và Hàm Xử lý Lọc (Giữ nguyên) ---
    useEffect(() => {
        if (!authLoading) {
            fetchOrders();
        }
    }, [filters, authLoading, fetchOrders]);

    const handleApplyFilters = () => {
        if ((tempStartDate && !tempEndDate) || (!tempStartDate && tempEndDate)) {
            notifyError('Vui lòng chọn cả "Từ Ngày" và "Đến Ngày" khi lọc theo ngày.');
            return;
        }
        setFilters({
            search: tempSearch,
            status: tempStatus === 'Tất cả' ? '' : tempStatus,
            startDate: tempStartDate,
            endDate: tempEndDate
        });
        setPage(0);
    };

    // --- Lọc dữ liệu trên Frontend (Giữ nguyên) ---
    const filteredOrdersByCustomer = useMemo(() => {
        let result = orders;

        if (filters.search) {
            result = result.filter(order => {
                const customerFullName = order.customer?.account?.fullName || '';
                const orderId = String(order.id);
                const searchLower = filters.search.toLowerCase();

                return customerFullName.toLowerCase().includes(searchLower) ||
                    orderId.includes(searchLower);
            });
        }

        return result;
    }, [orders, filters.search]);

    // --- Tính toán Thống kê (Giữ nguyên) ---
    const stats = useMemo(() => {
        const ordersData = filteredOrdersByCustomer;

        const totalOrdersCount = ordersData.length;

        const totalRevenueAmount = ordersData.reduce((sum, order) => {
            const amount = (order.status === 'DELIVERED' && order.total) ? order.total : 0;
            const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
            return sum + numericAmount;
        }, 0);

        const uniqueCustomerIds = new Set(
            ordersData.map(order => order.customer?.id).filter(id => id != null)
        );
        const totalCustomersCount = uniqueCustomerIds.size;

        const deliveredCount = ordersData.filter(o => o.status === 'DELIVERED').length;

        return {
            totalOrdersCount,
            totalRevenueAmount,
            totalCustomersCount,
            deliveredCount
        };
    }, [filteredOrdersByCustomer]);

    const { totalOrdersCount, totalRevenueAmount, totalCustomersCount, deliveredCount } = stats;

    // --- Logic Phân trang Frontend (Giữ nguyên) ---
    const totalOrders = filteredOrdersByCustomer.length;
    const totalPagesFE = Math.ceil(totalOrders / ORDERS_PER_PAGE);
    const startIndex = page * ORDERS_PER_PAGE;
    const currentOrders = filteredOrdersByCustomer.slice(startIndex, startIndex + ORDERS_PER_PAGE);

    // --- RENDER ACTION BUTTONS TRONG BẢNG (Giữ nguyên) ---
    const renderActionButton = (order) => {
        const isCompleted = order.status === 'DELIVERED' || order.status === 'CANCELLED' || order.status === 'REFUNDED';
        const hasCancelRequest = order.status === 'PENDING' && order.cancelReason && order.cancelReason.startsWith('Yêu cầu hủy từ KH:'); // Phân biệt dựa vào prefix

        return (
            <div className="flex justify-center gap-2">
                {/* 1. Nút Chi tiết (Admin/Employee luôn có) */}
                <Link
                    to={`/admin/orders/${order.id}`}
                    title="Xem Chi Tiết Đơn Hàng"
                    className={`px-3 py-1 text-xs rounded-lg font-medium transition 
                                text-blue-600 border border-gray-300 bg-white 
                                hover:bg-blue-50 hover:text-blue-800`}>
                    <Eye className="w-4 h-4 inline mr-1" /> Chi Tiết
                </Link>

                {/* 2. Nút Cập nhật Trạng thái (CHỈ HIỂN THỊ NẾU LÀ EMPLOYEE VÀ ĐƠN CHƯA KẾT THÚC) */}
                {isEmployeeRole && !isCompleted && (
                    <button
                        onClick={() => {
                            setSelectedOrder(order);
                            setIsStatusModalOpen(true);
                        }}
                        title={hasCancelRequest ? "Xác nhận Hủy" : "Cập nhật Trạng thái"}
                        className={`px-3 py-1 text-xs rounded-lg font-medium transition 
                                    ${hasCancelRequest ? 'bg-red-500 text-white hover:bg-red-600' : 'text-yellow-600 border border-gray-300 bg-white hover:bg-yellow-50'}`}>
                        <Zap className="w-4 h-4 inline mr-1" />
                        {hasCancelRequest ? 'Xác nhận Hủy' : 'Cập nhật'}
                    </button>
                )}
            </div>
        );
    };


    if (authLoading) {
        return <div className="p-8 text-center text-gray-500">Đang tải thông tin xác thực...</div>;
    }

    if (!isLoggedIn || !isAdminOrEmployee) {
        return (
            <div className="p-8 bg-white rounded-lg shadow-md max-w-xl mx-auto mt-16 text-center">
                <h2 className="text-xl font-bold text-red-600 mb-4">Không có quyền truy cập</h2>
                <p className="text-gray-700">Bạn cần đăng nhập bằng tài khoản Quản trị viên hoặc Nhân viên để xem trang này.</p>
            </div>
        );
    }


    return (
        <div className="p-8 bg-gray-50 min-h-screen">

            {/* MODAL CẬP NHẬT TRẠNG THÁI */}
            <StatusUpdateModal
                isOpen={isStatusModalOpen}
                currentOrder={selectedOrder}
                onUpdate={handleUpdateStatus}
                onCancel={() => setIsStatusModalOpen(false)}
            />


            {/* Tiêu đề (giữ nguyên) */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Quản lý Đơn hàng</h1>
                <p className="text-gray-600 mt-1">Tổng quan và quản lý tất cả đơn hàng </p>
            </div>

            {/* 4 ô thống kê */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

                {/* 1. Tổng số đơn (ShoppingCart) */}
                <div className="rounded-2xl p-6 shadow-sm border border-gray-100" style={{ background: '#D5E2E6' }}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-gray-700">Tổng số đơn hàng</p>
                            <p className="text-3xl font-bold mt-2 text-gray-900">{formatNumber(totalOrdersCount)}</p>
                        </div>
                        <div className="w-12 h-12 bg-white/30 rounded-xl flex items-center justify-center text-2xl">
                            <ShoppingCart className="w-6 h-6 text-[#2B6377]" />
                        </div>
                    </div>
                </div>

                {/* 2. Tổng doanh thu (DollarSign) */}
                <div className="rounded-2xl p-6 shadow-sm border border-gray-100" style={{ background: '#D5E2E6' }}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-gray-700">Tổng doanh thu</p>
                            <p className="text-2xl font-bold mt-2 text-gray-900">{formatCurrency(totalRevenueAmount)}</p>
                        </div>
                        <div className="w-12 h-12 bg-white/30 rounded-xl flex items-center justify-center text-2xl">
                            <DollarSign className="w-6 h-6 text-green-700" />
                        </div>
                    </div>
                </div>

                {/* 3. Tổng khách hàng (Users) */}
                <div className="rounded-2xl p-6 shadow-sm border border-gray-100" style={{ background: '#D5E2E6' }}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-gray-700">Tổng khách hàng</p>
                            <p className="text-3xl font-bold mt-2 text-gray-900">{formatNumber(totalCustomersCount)}</p>
                        </div>
                        <div className="w-12 h-12 bg-white/30 rounded-xl flex items-center justify-center text-2xl">
                            <Users className="w-6 h-6 text-purple-700" />
                        </div>
                    </div>
                </div>

                {/* 4. Đơn đã hoàn thành (CheckSquare) */}
                <div className="rounded-2xl p-6 shadow-sm border border-gray-100" style={{ background: '#D5E2E6' }}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-gray-700">Đã hoàn thành</p>
                            <p className="text-3xl font-bold mt-2 text-gray-900">{formatNumber(deliveredCount)}</p>
                        </div>
                        <div className="w-12 h-12 bg-white/30 rounded-xl flex items-center justify-center text-2xl">
                            <CheckSquare className="w-6 h-6 text-blue-700" />
                        </div>
                    </div>
                </div>
            </div>

            {/* --- KHU VỰC BỘ LỌC (FILTER BAR) ---*/}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-8">
                <div className="flex items-end gap-4 w-full">

                    {/* Search Tên Khách hàng/ID Đơn */}
                    <div className="flex-1">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Search Order ID/Customer</label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Enter Order ID or Customer fullname"
                                value={tempSearch}
                                onChange={(e) => setTempSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2B6377] focus:border-transparent"
                            />
                            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        </div>
                    </div>

                    {/* Status */}
                    <div className="w-40 shrink-0">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                        <select
                            value={tempStatus}
                            onChange={(e) => setTempStatus(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2B6377] bg-white cursor-pointer"
                        >
                            {ORDER_STATUSES.map((s) => (
                                <option key={s} value={s === 'Tất cả' ? '' : s}>{translateStatus(s)}</option>
                            ))}
                        </select>
                    </div>

                    {/* Từ Ngày */}
                    <div className="w-40 shrink-0">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Từ Ngày</label>
                        <input
                            type="date"
                            value={tempStartDate}
                            onChange={(e) => setTempStartDate(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2B6377] bg-white cursor-pointer"
                        />
                    </div>

                    {/* Đến Ngày */}
                    <div className="w-40 shrink-0">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Đến Ngày</label>
                        <input
                            type="date"
                            value={tempEndDate}
                            onChange={(e) => setTempEndDate(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2B6377] bg-white cursor-pointer"
                        />
                    </div>

                    {/* Nút Apply Filters */}
                    <div className="shrink-0 ml-auto">
                        <button
                            onClick={handleApplyFilters}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors hover:bg-opacity-90 disabled:opacity-50"
                            style={{ backgroundColor: '#D5E2E6', color: TEAL_COLOR }}
                        >
                            <Filter className="w-5 h-5" />
                            Áp dụng
                        </button>
                    </div>

                    {/* Nút Refresh */}
                    <div className="shrink-0">
                        <button
                            onClick={() => {
                                setFilters({ search: '', status: '', startDate: '', endDate: '' });
                                setTempSearch('');
                                setTempStatus('');
                                setTempStartDate('');
                                setTempEndDate('');
                            }}
                            className="p-3 border border-gray-300 rounded-xl hover:bg-gray-50 text-gray-600 hover:text-[#2B6377] transition-colors shadow-sm"
                            title="Reset Bộ Lọc"
                        >
                            <RefreshCw className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Bảng danh sách */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Danh sách Đơn hàng</h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Hiển thị {(page * ORDERS_PER_PAGE) + 1}-{Math.min((page + 1) * ORDERS_PER_PAGE, totalOrders)} trong tổng {totalOrders} đơn hàng
                            </p>
                        </div>
                        <button
                            onClick={fetchOrders}
                            className="p-3 border border-gray-300 rounded-xl hover:bg-gray-50 text-gray-600 hover:text-[#2B6377] transition-colors shadow-sm"
                            title="Làm mới dữ liệu"
                        >
                            <RefreshCw className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Table Content */}
                {loading && <div className="text-center text-[#2B6377] py-8">Đang tải đơn hàng...</div>}
                {error && <div className="text-center text-red-500 py-8">Lỗi: {error}</div>}

                {!loading && !error && currentOrders.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        Không tìm thấy đơn hàng nào phù hợp với bộ lọc.
                    </div>
                )}

                {!loading && !error && currentOrders.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-[#f4f7f8]">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Mã Đơn</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Khách hàng</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Ngày đặt</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Tổng tiền</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Trạng thái</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Thao tác</th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {currentOrders.map((order) => {
                                const customerName = order.customer?.account?.fullName || 'Khách vãng lai';

                                return (
                                    <tr key={order.id} className="hover:bg-gray-50 transition duration-150">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#2b6377]">#{order.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customerName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.orderDate?.substring(0, 10) || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700 text-right">
                                            {formatCurrency(order.total)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span
                                                className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusStyle(order.status)}`}>
                                                {/* Thêm biểu tượng Cảnh báo nếu có yêu cầu hủy */}
                                                {order.status === 'PENDING' && order.cancelReason && order.cancelReason.startsWith('Yêu cầu hủy từ KH:') && (
                                                    <AlertTriangle className="w-3 h-3 inline mr-1 text-red-500"/>
                                                )}
                                                {translateStatus(order.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                            {renderActionButton(order)}
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Phân trang */}
                <div className="flex justify-center items-center gap-2 py-4 border-t">
                    <button
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        disabled={page === 0}
                        className="p-2 border rounded disabled:opacity-50"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    <span className="text-sm text-gray-700">Trang {page + 1} / {totalPagesFE}</span>

                    <button
                        onClick={() => setPage(p => Math.min(totalPagesFE - 1, p + 1))}
                        disabled={page === totalPagesFE - 1 || totalPagesFE === 0}
                        className="p-2 border rounded disabled:opacity-50"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderManagement;