import React, { useState, useEffect } from 'react';
import axios from 'axios'; // <-- Cần import axios
import {
    ChevronLeft,
    ChevronRight,
    User,
    Package,
    MapPin,
    LogOut,
} from 'lucide-react';
import Footer from '../components/Footer';
import Header from '../components/Header';

const ORDER_STATUSES = [
    'Tất cả',
    'DELIVERED',
    'SHIPPING',
    'PROCESSING',
    'CONFIRMED',
    'PENDING',
    'CANCELLED',
];

// Định nghĩa URL cơ sở của API
const API_BASE_URL = 'http://localhost:8080/api/orders';

// --- COMPONENT CHÍNH ---
const OrderPage = () => {
    // --- STATE QUẢN LÝ DỮ LIỆU & LỌC ---
    const [orders, setOrders] = useState([]); // Danh sách đơn hàng từ API
    const [loading, setLoading] = useState(true); // Trạng thái tải dữ liệu
    const [error, setError] = useState(null); // Trạng thái lỗi

    // State lọc và phân trang
    const [statusFilter, setStatusFilter] = useState('Tất cả');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const ordersPerPage = 5;

    // --- CÁC HÀM TIỆN ÍCH GIỮ NGUYÊN ---
    const formatCurrency = (amount) => {
        // Kiểm tra amount có tồn tại không trước khi format
        if (amount === null || amount === undefined) return 'N/A';
        // Đảm bảo amount là số (nếu API trả về string)
        const numericAmount =
            typeof amount === 'string' ? parseFloat(amount) : amount;
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(numericAmount);
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'DELIVERED':
                return 'bg-green-100 text-green-700 border-green-500';
            case 'SHIPPING':
                return 'bg-blue-100 text-blue-700 border-blue-500';
            case 'PROCESSING':
                return 'bg-yellow-100 text-yellow-700 border-yellow-500';
            case 'CONFIRMED':
            case 'PENDING':
                return 'bg-purple-100 text-purple-700 border-purple-500';
            case 'CANCELLED':
                return 'bg-red-100 text-red-700 border-red-500';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-400';
        }
    };

    const translateStatus = (status) => {
        switch (status) {
            case 'DELIVERED':
                return 'Hoàn thành';
            case 'SHIPPING':
                return 'Đang giao';
            case 'PROCESSING':
                return 'Đang xử lý';
            case 'CONFIRMED':
                return 'Chờ xác nhận';
            case 'PENDING':
                return 'Chờ xử lý';
            case 'CANCELLED':
                return 'Đã hủy';
            default:
                return status;
        }
    };

    // --- HÀM GỌI API ĐỂ LỌC VÀ LẤY DỮ LIỆU ---
    const fetchOrders = async () => {
        setLoading(true);
        setError(null);
        // Reset về trang 1 khi áp dụng bộ lọc mới
        setCurrentPage(1);

        let url = `${API_BASE_URL}`;
        const params = {};

        // Lọc theo Khoảng Ngày
        if (startDate && endDate) {
            // Sử dụng endpoint tìm kiếm theo khoảng ngày của Spring
            url = `${API_BASE_URL}/search/date-range`;

            // Backend Spring Boot yêu cầu LocalDateTime (ISO 8601),
            // thêm T00:00:00 cho ngày bắt đầu và T23:59:59 cho ngày kết thúc
            params.start = `${startDate}T00:00:00`;
            params.end = `${endDate}T23:59:59`;
        }
        // Nếu KHÔNG có lọc ngày, ta ưu tiên gọi endpoint Status nếu filter khác "Tất cả"
        if (!startDate && !endDate && statusFilter !== 'Tất cả') {
            url = `${API_BASE_URL}/search/status/${statusFilter}`;
        }

        try {
            const response = await axios.get(url, { params: params });
            let fetchedOrders = response.data;

            // Lọc Trạng thai
            if (
                (startDate && endDate) ||
                (statusFilter !== 'Tất cả' && url === `${API_BASE_URL}`)
            ) {
                fetchedOrders = fetchedOrders.filter((order) => {
                    return (
                        statusFilter === 'Tất cả' ||
                        order.status === statusFilter
                    );
                });
            }

            setOrders(fetchedOrders);
        } catch (err) {
            console.error('Lỗi khi tải đơn hàng:', err);
            setError(
                'Không thể tải dữ liệu đơn hàng. Vui lòng kiểm tra kết nối.'
            );
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    // --- useEffect: Tải dữ liệu lần đầu ---
    useEffect(() => {
        // Tải đơn hàng ban đầu và khi statusFilter thay đổi (nếu không có lọc ngày)
        if (!startDate && !endDate) {
            fetchOrders();
        }
    }, [statusFilter]);

    // Hàm xử lý khi nhấn nút Áp dụng
    const handleApplyFilters = () => {
        // Kiểm tra hợp lệ ngày tháng trước khi gọi API
        if ((startDate && !endDate) || (!startDate && endDate)) {
            alert(
                'Vui lòng chọn cả "Từ Ngày" và "Đến Ngày" hoặc bỏ trống cả hai.'
            );
            return;
        }
        fetchOrders();
    };

    // --- LOGIC PHÂN TRANG (Áp dụng cho state orders) ---
    const totalPages = Math.ceil(orders.length / ordersPerPage);
    const startIndex = (currentPage - 1) * ordersPerPage;
    const currentOrders = orders.slice(startIndex, startIndex + ordersPerPage);

    const TEAL_TEXT = 'text-[#2B6377]';
    const TEAL_HOVER_BG = 'hover:bg-[#E6F3F5]';
    const TEAL_ACTIVE_BG = 'bg-[#CCDFE3]';

    // --- SUB-COMPONENTS (GIỮ NGUYÊN) ---
    const AccountSidebar = () => (
        <div className="w-64 flex-shrink-0 bg-white p-4 rounded-lg shadow-sm font-sans">
            <h3 className="font-semibold text-lg text-gray-800 mb-4 border-b pb-2">
                Tài khoản
            </h3>
            <nav className="space-y-2">
                <a
                    href="#"
                    className={`flex items-center p-2 ${TEAL_TEXT} ${TEAL_ACTIVE_BG} rounded-md font-medium transition`}>
                    <Package className="w-4 h-4 mr-2" /> Quản lý đơn hàng
                </a>
                <a
                    href="#"
                    className={`flex items-center p-2 text-gray-700 ${TEAL_HOVER_BG} rounded-md transition`}>
                    <User className="w-4 h-4 mr-2" /> Thông tin cá nhân
                </a>
                <a
                    href="#"
                    className={`flex items-center p-2 text-gray-700 ${TEAL_HOVER_BG} rounded-md transition`}>
                    <MapPin className="w-4 h-4 mr-2" /> Địa chỉ giao hàng
                </a>
                <a
                    href="#"
                    className={`flex items-center p-2 text-gray-700 hover:bg-red-50 rounded-md transition mt-4 border-t pt-2`}>
                    <LogOut className="w-4 h-4 mr-2" /> Thoát
                </a>
            </nav>
        </div>
    );

    const OrderCardRow = ({ order }) => (
        <div
            key={order.id}
            className="bg-white p-6 rounded-lg shadow-md border-l-4 border-[#2B6377] hover:shadow-lg transition font-sans">
            <div className="grid grid-cols-5 gap-4 items-center">
                {/* Mã đơn hàng (Left) */}
                <div className="col-span-2 flex flex-col items-start space-y-1">
                    <div className="text-sm font-medium text-gray-500">
                        Mã đơn hàng
                    </div>
                    <div className={`${TEAL_TEXT} font-semibold`}>
                        {order.id}
                    </div>
                </div>

                {/* Ngày đặt (Center Left) */}
                <div className="flex flex-col items-start space-y-1">
                    <div className="text-sm font-medium text-gray-500">
                        Ngày đặt
                    </div>
                    <div className="text-gray-600">
                        {order.orderDate
                            ? order.orderDate.substring(0, 10)
                            : 'N/A'}
                    </div>
                </div>

                {/* Tổng tiền (Center Right) */}
                <div className="flex flex-col items-start space-y-1">
                    <div className="text-sm font-medium text-gray-500">
                        Tổng tiền
                    </div>
                    <div className="text-lg font-semibold text-gray-800">
                        {formatCurrency(order.total)}
                    </div>
                </div>

                {/* Trạng thái & Thao tác (Right) */}
                <div className="col-span-1 flex flex-col items-end space-y-2">
                    <span
                        className={`px-3 py-1 text-xs font-semibold rounded-lg border ${getStatusStyle(
                            order.status
                        )}`}>
                        {translateStatus(order.status)}
                    </span>
                    <button
                        className={`bg-white border border-gray-300 ${TEAL_TEXT} px-4 py-1.5 rounded-md font-medium hover:bg-gray-100 transition text-sm`}>
                        Xem Chi Tiết
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
            <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
                {/* Breadcrumbs */}
                <div className="text-sm text-gray-500 mb-6">
                    <span className="cursor-pointer hover:text-[#2B6377]">
                        Home
                    </span>{' '}
                    /
                    <span className="cursor-pointer hover:text-[#2B6377]">
                        {' '}
                        Tài khoản
                    </span>{' '}
                    /
                    <span className="font-medium text-[#2B6377]">
                        {' '}
                        Quản lý đơn hàng
                    </span>
                </div>

                <div className="flex gap-8">
                    {/* Sidebar */}
                    <AccountSidebar />

                    {/* Main Content */}
                    <main className="flex-1">
                        <h2 className="text-3xl font-light text-gray-800 mb-8 pb-4 border-b">
                            LỊCH SỬ ĐƠN HÀNG
                        </h2>

                        {/* Filter Bar */}
                        <div className="bg-white p-6 rounded-lg shadow-md mb-8 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            {/* Lọc theo trạng thái */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Lọc theo Trạng thái
                                </label>
                                <select
                                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500"
                                    value={statusFilter}
                                    // Khi chọn trạng thái, nếu không có lọc ngày, useEffect sẽ tự động gọi fetchOrders
                                    onChange={(e) =>
                                        setStatusFilter(e.target.value)
                                    }>
                                    {ORDER_STATUSES.map((status) => (
                                        <option key={status} value={status}>
                                            {translateStatus(status)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Từ Ngày */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Từ Ngày
                                </label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) =>
                                            setStartDate(e.target.value)
                                        }
                                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm pr-10 focus:border-teal-500 focus:ring-teal-500"
                                        placeholder="mm/dd/yyyy"
                                    />
                                </div>
                            </div>

                            {/* Đến Ngày */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Đến Ngày
                                </label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) =>
                                            setEndDate(e.target.value)
                                        }
                                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm pr-10 focus:border-teal-500 focus:ring-teal-500"
                                        placeholder="mm/dd/yyyy"
                                    />
                                </div>
                            </div>

                            {/* Nút Áp dụng */}
                            <button
                                onClick={handleApplyFilters} // <-- GỌI HÀM XỬ LÝ LỌC
                                disabled={loading}
                                className="w-full bg-[#2B6377] text-white py-2.5 rounded-md hover:bg-teal-800 transition shadow-md disabled:bg-gray-400">
                                {loading ? 'Đang tải...' : 'Áp dụng'}
                            </button>
                        </div>

                        {/* Order List */}
                        {loading && (
                            <div className="text-center text-[#2B6377] py-8">
                                Đang tải đơn hàng...
                            </div>
                        )}
                        {error && (
                            <div className="text-center text-red-500 py-8">
                                Lỗi: {error}
                            </div>
                        )}
                        {!loading && !error && currentOrders.length === 0 && (
                            <div className="text-center text-gray-500 py-8 border rounded-lg bg-white">
                                Không tìm thấy đơn hàng nào phù hợp với bộ lọc.
                            </div>
                        )}

                        <div className="space-y-4">
                            {currentOrders.map((order) => (
                                <OrderCardRow key={order.id} order={order} />
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="flex justify-center items-center gap-2 mt-8">
                            <button
                                onClick={() =>
                                    setCurrentPage((p) => Math.max(1, p - 1))
                                }
                                disabled={currentPage === 1}
                                className="p-2 border border-gray-300 rounded hover:bg-gray-100 transition disabled:opacity-50">
                                <ChevronLeft className="w-5 h-5" />
                            </button>

                            {Array.from(
                                { length: totalPages },
                                (_, i) => i + 1
                            ).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`px-3 py-1 rounded transition font-medium ${
                                        page === currentPage
                                            ? 'bg-[#2B6377] text-white shadow-md'
                                            : 'border border-gray-300 hover:bg-gray-100 text-gray-700'
                                    }`}>
                                    {page}
                                </button>
                            ))}

                            <button
                                onClick={() =>
                                    setCurrentPage((p) =>
                                        Math.min(totalPages, p + 1)
                                    )
                                }
                                disabled={currentPage === totalPages}
                                className="p-2 border border-gray-300 rounded hover:bg-gray-100 transition disabled:opacity-50">
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default OrderPage;
