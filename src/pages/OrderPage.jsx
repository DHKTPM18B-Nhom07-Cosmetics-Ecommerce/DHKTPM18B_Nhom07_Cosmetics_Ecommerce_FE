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
import { Link, useNavigate } from "react-router-dom"; // Thêm useNavigate
import { useAuth } from '../context/AuthContext';

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

const OrderPage = () => {

    // Sử dụng useNavigate để điều hướng
    const navigate = useNavigate();

    // SỬ DỤNG HOOK ĐỂ LẤY THÔNG TIN TỪ AuthProvider
    const { user, isLoading: authLoading, isLoggedIn, logout } = useAuth(); // Thêm logout
    const userToken = user?.token;

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [statusFilter, setStatusFilter] = useState('Tất cả');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const ordersPerPage = 5;

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

    // Hàm FETCH ĐƠN HÀNG (QUAN TRỌNG: Thêm Authorization Header)
    const fetchOrders = async () => {
        if (!isLoggedIn || !userToken) {
            // Không fetch nếu không có token
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

        // Lọc theo ngày
        if (startDate && endDate) {
            params.start = `${startDate}T00:00:00`;
            params.end = `${endDate}T23:59:59`;
        }
        // Lọc theo trạng thái
        else if (!startDate && !endDate && statusFilter !== 'Tất cả') {
            params.status = statusFilter;
        }

        // Cấu hình Authorization Header
        const config = {
            headers: {
                // Đảm bảo userToken có giá trị trước khi sử dụng!
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

            // XỬ LÝ LỖI XÁC THỰC RÕ RÀNG HƠN
            if (status === 401 || status === 403) {
                setError('Phiên đăng nhập hết hạn hoặc không có quyền. Vui lòng đăng nhập lại.');
                // Gợi ý đăng xuất và chuyển hướng đến trang đăng nhập
                // logout(); // Nếu bạn muốn tự động đăng xuất
                // navigate('/login');
            } else {
                setError('Không thể tải dữ liệu đơn hàng. Vui lòng kiểm tra kết nối.');
            }
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    // Hàm Hủy đơn hàng (Cần Token)
    const handleCancelOrder = async (orderId) => {
        if (!window.confirm(`Bạn có chắc chắn muốn hủy đơn hàng ${orderId} này không? Hành động này không thể hoàn tác.`)) {
            return;
        }
        if (!userToken) {
            alert('Lỗi xác thực. Vui lòng đăng nhập lại.');
            return;
        }

        try {
            setLoading(true);

            // Cấu hình Authorization Header cho hành động Hủy
            const config = {
                headers: {
                    Authorization: `Bearer ${userToken}`,
                },
            };

            await axios.put(`${API_BASE_URL}/${orderId}/cancel`, {}, config);

            alert(`Đơn hàng ${orderId} đã được hủy thành công.`);
            fetchOrders();

        } catch (err) {
            setLoading(false);
            console.error(`Lỗi khi hủy đơn hàng ${orderId}:`, err);
            const errorMessage = err.response?.data?.message || 'Không thể hủy đơn hàng. Vui lòng kiểm tra lại quyền hạn.';
            alert(`Lỗi: ${errorMessage}`);
        }
    };


    useEffect(() => {
        // Chỉ fetch nếu Auth đã tải xong và user đã đăng nhập
        if (!authLoading && isLoggedIn) {
            fetchOrders();
        } else if (!authLoading && !isLoggedIn) {
            // Chỉ đặt lỗi nếu loading auth đã xong và user chưa đăng nhập
            setError('Vui lòng đăng nhập để xem lịch sử đơn hàng.');
            setLoading(false);
        }

    }, [statusFilter, isLoggedIn, authLoading]); // Chạy lại khi trạng thái đăng nhập hoặc filter thay đổi

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
                    onClick={logout} // Dùng hàm logout từ context
                    className="cursor-pointer flex items-center p-2 text-gray-700 hover:bg-red-50 rounded-md transition mt-4 border-t pt-2"
                >
                    <LogOut className="w-4 h-4 mr-2" /> Thoát
                </a>
            </nav>
        </div>
    );


    return (
        <div className="min-h-screen flex flex-col bg-gray-50 font-sans">

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

                                                    {/* NÚT HỦY ĐƠN HÀNG */}
                                                    {order.status === 'PENDING' ? (
                                                        <button
                                                            onClick={() => handleCancelOrder(order.id)}
                                                            title="Hủy Đơn Hàng"
                                                            disabled={loading}
                                                            className="w-28 text-center px-3 py-1 text-xs rounded-lg font-medium transition bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
                                                        >
                                                            Hủy Đơn Hàng
                                                        </button>
                                                    ) : (
                                                        // Placeholder để căn chỉnh nút Xem Chi Tiết
                                                        <span className="w-28 inline-block" aria-hidden="true"></span>
                                                    )}
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