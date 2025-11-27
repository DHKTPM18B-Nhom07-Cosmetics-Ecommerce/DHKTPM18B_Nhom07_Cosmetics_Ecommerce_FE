import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
import {Link} from "react-router-dom";

const ORDER_STATUSES = [
    'Tất cả',
    'DELIVERED',
    'SHIPPING',
    'PROCESSING',
    'CONFIRMED',
    'PENDING',
    'CANCELED',   // dùng đúng enum backend
];

const API_BASE_URL = 'http://localhost:8080/api/orders';

const OrderPage = () => {

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [statusFilter, setStatusFilter] = useState('Tất cả');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const ordersPerPage = 5;

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
            case 'CANCELED': return 'bg-red-100 text-red-700 border-red-500';
            default: return 'bg-gray-100 text-gray-700 border-gray-400';
        }
    };

    const translateStatus = (status) => {
        switch (status) {
            case 'DELIVERED': return 'Hoàn thành';
            case 'SHIPPING': return 'Đang giao';
            case 'PROCESSING': return 'Đang xử lý';
            case 'CONFIRMED': return 'Chờ xác nhận';
            case 'PENDING': return 'Chờ xử lý';
            case 'CANCELED': return 'Đã hủy';
            default: return status;
        }
    };

    const fetchOrders = async () => {
        setLoading(true);
        setError(null);
        setCurrentPage(1);

        let url = `${API_BASE_URL}`;
        const params = {};

        if (startDate && endDate) {
            url = `${API_BASE_URL}/search/date-range`;
            params.start = `${startDate}T00:00:00`;
            params.end = `${endDate}T23:59:59`;
        }

        if (!startDate && !endDate && statusFilter !== 'Tất cả') {
            url = `${API_BASE_URL}/search/status/${statusFilter}`;
        }

        try {
            const response = await axios.get(url, { params });
            console.log("RAW RESPONSE:", response.data);

            let fetchedOrders = Array.isArray(response.data)
                ? response.data
                : response.data?.orders ||
                response.data?.content ||
                [];

            console.log("FETCHED ORDERS:", fetchedOrders);

            setOrders(fetchedOrders);

        } catch (err) {
            console.error('Lỗi khi tải đơn hàng:', err);
            setError('Không thể tải dữ liệu đơn hàng. Vui lòng kiểm tra kết nối.');
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!startDate && !endDate) {
            fetchOrders();
        }
    }, [statusFilter]);

    const handleApplyFilters = () => {
        if ((startDate && !endDate) || (!startDate && endDate)) {
            alert('Vui lòng chọn cả "Từ Ngày" và "Đến Ngày".');
            return;
        }
        fetchOrders();
    };

    const totalPages = Math.ceil(orders.length / ordersPerPage);
    const startIndex = (currentPage - 1) * ordersPerPage;
    const currentOrders = orders.slice(startIndex, startIndex + ordersPerPage);

    const TEAL_TEXT = 'text-[#2B6377]';
    const TEAL_ACTIVE_BG = 'bg-[#CCDFE3]';
    const TEAL_HOVER_BG = 'hover:bg-[#E6F3F5]';

    const AccountSidebar = () => (
        <div className="w-64 flex-shrink-0 bg-white p-4 rounded-lg shadow-sm font-sans">
            <h3 className="font-semibold text-lg text-gray-800 mb-4 border-b pb-2">Tài khoản</h3>
            <nav className="space-y-2">
                <Link to="/orders" className={`flex items-center p-2 ${TEAL_TEXT} ${TEAL_ACTIVE_BG} rounded-md font-medium transition`}>
                    <Package className="w-4 h-4 mr-2" /> Quản lý đơn hàng
                </Link>
                <a className={`flex items-center p-2 text-gray-700 ${TEAL_HOVER_BG} rounded-md transition`}>
                    <User className="w-4 h-4 mr-2" /> Thông tin cá nhân
                </a>
                <a className={`flex items-center p-2 text-gray-700 ${TEAL_HOVER_BG} rounded-md transition`}>
                    <MapPin className="w-4 h-4 mr-2" /> Địa chỉ giao hàng
                </a>
                <Link to="/logout" className="flex items-center p-2 text-gray-700 hover:bg-red-50 rounded-md transition mt-4 border-t pt-2">
                    <LogOut className="w-4 h-4 mr-2" /> Thoát
                </Link>
            </nav>
        </div>
    );

    const OrderCardRow = ({ order }) => (
        <div key={order.id} className="bg-white p-6 rounded-lg shadow-md border-l-4 border-[#2B6377] hover:shadow-lg transition font-sans">
            <div className="grid grid-cols-5 gap-4 items-center">
                <div className="col-span-2 flex flex-col space-y-1">
                    <div className="text-sm text-gray-500">Mã đơn hàng</div>
                    <div className={`${TEAL_TEXT} font-semibold`}>{order.id}</div>
                </div>

                <div className="flex flex-col space-y-1">
                    <div className="text-sm text-gray-500">Ngày đặt</div>
                    <div className="text-gray-600">{order.orderDate?.substring(0, 10) || 'N/A'}</div>
                </div>

                <div className="flex flex-col space-y-1">
                    <div className="text-sm text-gray-500">Tổng tiền</div>
                    <div className="text-lg font-semibold text-gray-800">{formatCurrency(order.total)}</div>
                </div>

                <div className="col-span-1 flex flex-row items-center justify-end space-x-8">
                    <span className={`px-4 py-2 text-xs font-semibold rounded-xl border-2 ${getStatusStyle(order.status)}`}>
                        {translateStatus(order.status)}
                    </span>

                    <Link
                        to={`/orders/${order.id}`}
                        className={`bg-white border-2 border-gray-300 ${TEAL_TEXT} px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition text-xs ml-8`}
                    >
                        Xem Chi Tiết
                    </Link>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
            <Header />

            <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

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
                        <div className="bg-white p-6 rounded-lg shadow-md mb-8 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">

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
                                className="w-full bg-[#2B6377] text-white py-2.5 rounded-md hover:bg-teal-800 transition disabled:bg-gray-400"
                            >
                                {loading ? 'Đang tải...' : 'Áp dụng'}
                            </button>
                        </div>

                        {/* ORDER LIST */}
                        {loading && <div className="text-center text-[#2B6377] py-8">Đang tải đơn hàng...</div>}
                        {error && <div className="text-center text-red-500 py-8">Lỗi: {error}</div>}

                        {!loading && !error && currentOrders.length === 0 && (
                            <div className="text-center py-8 bg-white rounded-lg border text-gray-500">
                                Không tìm thấy đơn hàng nào phù hợp.
                            </div>
                        )}

                        <div className="space-y-4">
                            {currentOrders.map(order => (
                                <OrderCardRow key={order.id} order={order} />
                            ))}
                        </div>

                        {/* PAGINATION */}
                        <div className="flex justify-center items-center gap-2 mt-8">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 border rounded disabled:opacity-50"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
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
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>

                    </main>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default OrderPage;
