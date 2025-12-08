import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import {
    ChevronLeft,
    ChevronRight,
    User,
    Package,
    MapPin,
    LogOut,
    // Import icon cho Modal hủy
    XCircle,
    AlertTriangle,
} from 'lucide-react';
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';

// Định nghĩa trạng thái đơn hàng (Mở rộng nếu Backend có RETURNED/REFUNDED)
const ORDER_STATUSES = [
    'Tất cả',
    'DELIVERED',
    'SHIPPING',
    'PROCESSING',
    'CONFIRMED',
    'PENDING',
    'CANCELLED',
];

const API_BASE_URL = 'http://localhost:8080/api/orders';
const ORDERS_PER_PAGE = 5;

// Tùy chọn lý do hủy (Options)
const CANCEL_REASONS = [
    { value: 'CHANGE_PRODUCT', label: 'Thay đổi sản phẩm/kích cỡ' },
    { value: 'CHANGE_ADDRESS', label: 'Thay đổi địa chỉ giao hàng' },
    { value: 'PRICE_ISSUE', label: 'Tìm được giá tốt hơn' },
    { value: 'NOT_NEEDED', label: 'Không còn nhu cầu' },
    { value: 'OTHER', label: 'Lý do khác' }
];

// --- HÀM TIỆN ÍCH CHUNG VÀ CÁC COMPONENT PHỤ ---

const TEAL_TEXT = 'text-[#2B6377]';
const TEAL_ACTIVE_BG = 'bg-[#CCDFE3]';
const TEAL_HOVER_BG = 'hover:bg-[#E6F3F5]';


const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return 'N/A';
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(numericAmount);
};

const getStatusStyle = (status) => {
    switch (status) {
        case 'DELIVERED': return 'bg-green-100 text-green-700 border-green-500';
        case 'SHIPPING': return 'bg-blue-100 text-blue-700 border-blue-500';
        case 'PROCESSING': return 'bg-yellow-100 text-yellow-700 border-yellow-500';
        case 'CONFIRMED':
        case 'PENDING': return 'bg-purple-100 text-purple-700 border-purple-500';
        case 'CANCELLED': return 'bg-red-100 text-red-700 border-red-500';
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
        default: return status;
    }
};


// --- MODAL YÊU CẦU HỦY ĐƠN HÀNG ---
const CancelConfirmationModal = ({ isOpen, orderId, onConfirmCancel, onCancel }) => {
    if (!isOpen) return null;

    const [selectedReason, setSelectedReason] = useState(CANCEL_REASONS[0].value);
    const [otherReason, setOtherReason] = useState('');

    const isOtherReason = selectedReason === 'OTHER';

    const handleConfirm = () => {
        let finalReason = selectedReason;
        if (isOtherReason) {
            finalReason = otherReason.trim();
            if (!finalReason) {
                alert('Vui lòng nhập chi tiết lý do khác.');
                return;
            }
        } else {
            // Lấy nhãn của lý do đã chọn
            finalReason = CANCEL_REASONS.find(r => r.value === selectedReason)?.label || 'Lý do không xác định';
        }

        onConfirmCancel(orderId, finalReason);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 font-sans">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 m-4">
                <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2 flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2 text-red-500" /> Yêu cầu Hủy Đơn hàng #{orderId}
                </h3>
                <div className="text-gray-700 mb-6 space-y-4">
                    <p className="text-sm">Vui lòng chọn lý do hủy để gửi yêu cầu đến nhân viên. Đơn hàng chỉ bị hủy khi nhân viên xác nhận.</p>

                    {/* Chọn Lý do */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium mb-1">Lý do hủy:</label>
                        <select
                            value={selectedReason}
                            onChange={(e) => {
                                setSelectedReason(e.target.value);
                                setOtherReason('');
                            }}
                            className="px-3 py-2 border rounded-lg focus:ring-red-500 focus:border-red-500"
                        >
                            {CANCEL_REASONS.map(r => (
                                <option key={r.value} value={r.value}>{r.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Lý do khác (nếu chọn "OTHER") */}
                    {isOtherReason && (
                        <div className="flex flex-col">
                            <label className="text-sm font-medium mb-1">Chi tiết lý do khác:</label>
                            <textarea
                                value={otherReason}
                                onChange={(e) => setOtherReason(e.target.value)}
                                rows="3"
                                className="px-3 py-2 border rounded-lg focus:ring-red-500 focus:border-red-500 resize-none"
                                placeholder="Nhập lý do chi tiết..."
                            />
                        </div>
                    )}
                </div>
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onCancel}
                        className="py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition duration-150 text-sm font-medium"
                    >
                        Đóng
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-150 text-sm font-medium"
                    >
                        Gửi Yêu cầu Hủy
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- COMPONENT CHÍNH ---

const OrderPage = () => {

    const navigate = useNavigate();
    const { user, isLoading: authLoading, isLoggedIn, logout } = useAuth();
    const userToken = user?.token;

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [statusFilter, setStatusFilter] = useState('Tất cả');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const ordersPerPage = 5;

    // State cho Modal hủy
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [orderToCancelId, setOrderToCancelId] = useState(null);

    // Hàm FETCH ĐƠN HÀNG (Sử dụng useCallback)
    const fetchOrders = useCallback(async () => {
        if (!isLoggedIn || !userToken) {
            setOrders([]);
            setLoading(false);
            setError('Vui lòng đăng nhập để xem lịch sử đơn hàng.');
            return;
        }

        setLoading(true);
        setError(null);
        setCurrentPage(1);

        let url = `${API_BASE_URL}`;
        const params = {};

        // Lọc theo trạng thái
        if (statusFilter !== 'Tất cả') {
            params.status = statusFilter;
        }
        // Lọc theo ngày
        if (startDate && endDate) {
            params.start = `${startDate}T00:00:00`;
            params.end = `${endDate}T23:59:59`;
        }

        // Chú ý: Backend hiện tại chỉ hỗ trợ lọc [Status + Customer] HOẶC [Date Range + All Customers] HOẶC [All].
        // Vì ta đang dùng endpoint /api/orders (Customer), Backend sẽ tự động lọc theo Customer ID.

        const config = {
            headers: {
                Authorization: `Bearer ${userToken}`,
            },
            params: params
        };

        try {
            const response = await axios.get(url, config);
            let fetchedOrders = Array.isArray(response.data)
                ? response.data
                : response.data?.orders ||
                response.data?.content ||
                [];

            setOrders(fetchedOrders);

        } catch (err) {
            console.error('Lỗi khi tải đơn hàng:', err);
            const status = err.response?.status;

            if (status === 401 || status === 403) {
                setError('Phiên đăng nhập hết hạn hoặc không có quyền. Vui lòng đăng nhập lại.');
            } else {
                setError('Không thể tải dữ liệu đơn hàng. Vui lòng kiểm tra kết nối.');
            }
            setOrders([]);
        } finally {
            setLoading(false);
        }
    }, [isLoggedIn, userToken, statusFilter, startDate, endDate]);


    // Hàm GỬI YÊU CẦU HỦY ĐƠN HÀNG (Sửa đổi logic)
    const handleConfirmCancel = async (orderId, cancelReason) => {
        setIsCancelModalOpen(false);

        if (!userToken) {
            alert('Lỗi xác thực. Vui lòng đăng nhập lại.');
            return;
        }

        try {
            setLoading(true);

            const config = {
                headers: {
                    Authorization: `Bearer ${userToken}`,
                },
                params: { // Thêm lý do hủy vào query params
                    cancelReason: cancelReason
                }
            };

            // GỌI API PUT /api/orders/{id}/cancel
            await axios.put(`${API_BASE_URL}/${orderId}/cancel`, null, config);

            alert(`Yêu cầu hủy đơn hàng ${orderId} đã được gửi thành công với lý do: ${cancelReason}. Đơn hàng sẽ được cập nhật sau khi nhân viên xử lý.`);
            fetchOrders();

        } catch (err) {
            setLoading(false);
            console.error(`Lỗi khi hủy đơn hàng ${orderId}:`, err);
            const errorMessage = err.response?.data?.message || 'Không thể hủy đơn hàng. Vui lòng kiểm tra trạng thái.';
            alert(`Lỗi: ${errorMessage}`);
        }
    };

    // Hàm khởi tạo yêu cầu hủy (gọi Modal)
    const handleInitiateCancel = (orderId) => {
        const orderToCancel = orders.find(o => o.id === orderId);

        if (!orderToCancel || orderToCancel.status !== 'PENDING') {
            alert('Chỉ đơn hàng ở trạng thái "Chờ xử lý" mới có thể hủy.');
            return;
        }

        setOrderToCancelId(orderId);
        setIsCancelModalOpen(true);
    };


    // 🚨 LOGIC MỚI: Render các nút thao tác dựa trên trạng thái
    const renderActionButtons = (status, orderId) => {
        const baseClass = 'w-28 text-center px-3 py-1 text-xs rounded-lg font-medium transition';

        switch (status) {
            case 'PENDING':
                return (
                    <button
                        onClick={() => handleInitiateCancel(orderId)}
                        title="Yêu cầu Hủy Đơn Hàng"
                        disabled={loading}
                        className={`${baseClass} bg-red-500 text-white hover:bg-red-600 disabled:opacity-50`}
                    >
                        Yêu cầu Hủy
                    </button>
                );

            case 'DELIVERED':
                return (
                    <button
                        title="Đánh Giá"
                        className={`${baseClass} bg-green-500 text-white hover:bg-green-600`}
                        onClick={() => navigate('/review-product', { 
                            state: { 
                                orderId: orderId 
                            } 
                        })}
                    >
                        Đánh Giá
                    </button>
                );

            case 'CANCELLED':
                return (
                    <button
                        title="Mua Lại"
                        className={`${baseClass} ${TEAL_TEXT} border border-gray-300 hover:bg-gray-100`}
                        onClick={() => alert(`Chức năng mua lại đơn hàng #${orderId} đang được phát triển`)}
                    >
                        Mua Lại
                    </button>
                );

            case 'CONFIRMED':
            case 'PROCESSING':
            case 'SHIPPING':
                return <span className="w-28 inline-block text-gray-500 text-xs">Đang trong quy trình</span>;

            default:
                return <span className="w-28 inline-block text-gray-500 text-xs">Không có thao tác</span>;
        }
    };


    useEffect(() => {
        if (!authLoading && isLoggedIn) {
            fetchOrders();
        } else if (!authLoading && !isLoggedIn) {
            setError('Vui lòng đăng nhập để xem lịch sử đơn hàng.');
            setLoading(false);
        }

    }, [isLoggedIn, authLoading, fetchOrders]);

    const handleApplyFilters = () => {
        if ((startDate && !endDate) || (!startDate && endDate)) {
            alert('Vui lòng chọn cả "Từ Ngày" và "Đến Ngày" khi lọc theo ngày.');
            return;
        }
        fetchOrders();
    };

    const totalPages = Math.ceil(orders.length / ordersPerPage);
    const startIndex = (currentPage - 1) * ordersPerPage;
    const currentOrders = orders.slice(startIndex, startIndex + ordersPerPage);

    // Component Sidebar
    const AccountSidebar = () => (
        <div className="w-64 flex-shrink-0 bg-white p-4 rounded-lg shadow-sm font-sans">
            <h3 className="font-semibold text-lg text-gray-800 mb-4 border-b pb-2">Tài khoản</h3>
            <nav className="space-y-2">
                <Link to="/order" className={`flex items-center p-2 ${TEAL_TEXT} ${TEAL_ACTIVE_BG} rounded-md font-medium transition`}>
                    <Package className="w-4 h-4 mr-2" /> Quản lý đơn hàng
                </Link>
                <a className={`flex items-center p-2 text-gray-700 ${TEAL_HOVER_BG} rounded-md transition`}>
                    <User className="w-4 h-4 mr-2" /> Thông tin cá nhân
                </a>
                <a className={`flex items-center p-2 text-gray-700 ${TEAL_HOVER_BG} rounded-md transition`}>
                    <MapPin className="w-4 h-4 mr-2" /> Địa chỉ giao hàng
                </a>
                <a
                    onClick={logout}
                    className="cursor-pointer flex items-center p-2 text-gray-700 hover:bg-red-50 rounded-md transition mt-4 border-t pt-2"
                >
                    <LogOut className="w-4 h-4 mr-2" /> Thoát
                </a>
            </nav>
        </div>
    );


    return (
        <div className="min-h-screen flex flex-col bg-gray-50 font-sans">

            {/* MODAL YÊU CẦU HỦY */}
            <CancelConfirmationModal
                isOpen={isCancelModalOpen}
                orderId={orderToCancelId}
                onConfirmCancel={handleConfirmCancel}
                onCancel={() => setIsCancelModalOpen(false)}
            />

            <div className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">

                <div className="text-sm text-gray-500 mb-6">
                    <span className="cursor-pointer hover:text-[#2B6377]">Home</span> /
                    <span className="cursor-pointer hover:text-[#2B6377]"> Tài khoản</span> /
                    <span className="font-medium text-[#2B6377]"> Quản lý đơn hàng</span>
                </div>

                <div className="flex gap-8">
                    <AccountSidebar />

                    <main className="flex-1">

                        <h2 className="text-3xl font-light text-gray-800 mb-8 pb-4 border-b">
                            LỊCH SỬ ĐƠN HÀNG
                        </h2>

                        {/* FILTER BAR */}
                        <div className="bg-white p-6 rounded-lg shadow-md mb-8 grid grid-cols-1 md:grid-cols-4 gap-4 items-end border border-gray-200">

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Lọc theo Trạng thái</label>
                                <select
                                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    {ORDER_STATUSES.map((s) => (
                                        <option key={s} value={s}>{translateStatus(s)}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Từ Ngày</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full p-2 border rounded-md"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Đến Ngày</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full p-2 border rounded-md"
                                />
                            </div>

                            <button
                                onClick={handleApplyFilters}
                                disabled={loading}
                                className="w-full bg-[#2B6377] text-white py-3 rounded-md hover:bg-teal-800 transition disabled:bg-gray-400"
                            >
                                {loading ? 'Đang tải...' : 'Áp dụng'}
                            </button>
                        </div>

                        {/* ORDER LIST (Bảng) */}
                        {authLoading && <div className="text-center text-[#2B6377] py-8">Đang tải thông tin xác thực...</div>}
                        {error && <div className="text-center text-red-500 py-8 border border-red-300 bg-red-50 rounded-lg">{error}</div>}

                        {loading && isLoggedIn && <div className="text-center text-[#2B6377] py-8">Đang tải đơn hàng...</div>}


                        {!loading && !error && currentOrders.length === 0 && isLoggedIn && (
                            <div className="text-center py-8 bg-white rounded-lg border text-gray-500">
                                Không tìm thấy đơn hàng nào phù hợp.
                            </div>
                        )}

                        {!loading && !error && currentOrders.length > 0 && isLoggedIn && (
                            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-[#eaf4f7]">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Mã Đơn</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Ngày đặt</th>
                                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Tổng tiền</th>
                                        <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Trạng thái</th>
                                        <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Hành động</th>
                                    </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                    {currentOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50 transition duration-150">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#2b6377]">#{order.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{order.orderDate?.substring(0, 10) || 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800 text-right">
                                                {formatCurrency(order.total)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <span
                                                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusStyle(order.status)}`}>
                                                        {translateStatus(order.status)}
                                                    </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center justify-center space-x-2">

                                                    {/* Nút Xem Chi Tiết */}
                                                    <Link
                                                        to={`/orders/${order.id}`}
                                                        title="Xem Chi Tiết"
                                                        className={`w-28 text-center px-3 py-1 text-xs rounded-lg font-medium transition ${TEAL_TEXT} hover:bg-[#E6F3F5] border border-gray-300`}
                                                    >
                                                        Xem Chi Tiết
                                                    </Link>

                                                    {/* NÚT HỦY ĐƠN HÀNG VÀ THAO TÁC KHÁC */}
                                                    {renderActionButtons(order.status, order.id)}

                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}


                        {/* PAGINATION */}
                        <div className="flex justify-center items-center gap-2 mt-8">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 border rounded disabled:opacity-50"
                            >
                                <ChevronLeft className="w-5 h-5"/>
                            </button>

                            {Array.from({length: totalPages}, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`px-3 py-1 rounded ${
                                        page === currentPage
                                            ? 'bg-[#2B6377] text-white'
                                            : 'border hover:bg-gray-100'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 border rounded disabled:opacity-50"
                            >
                                <ChevronRight className="w-5 h-5"/>
                            </button>
                        </div>

                    </main>
                </div>
            </div>

        </div>
    );
};

export default OrderPage;