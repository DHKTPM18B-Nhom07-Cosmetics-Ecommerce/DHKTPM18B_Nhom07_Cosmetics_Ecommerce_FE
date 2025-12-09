import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import {
    DollarSign,
    BarChart,
    Filter,
    RefreshCw,
    TrendingUp,
    Clock,
    ShoppingCart,
    ArrowUpCircle,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from "../../context/AuthContext"; // ĐÃ BỎ COMMENT VÀ IMPORT THẬT

// --- HẰNG SỐ VÀ TIỆN ÍCH ĐỒNG BỘ ---
const TEAL_COLOR = '#2B6377';
const LIGHT_TEAL_BG = '#D5E2E6'; // Màu nền cho Stat Cards
const ITEMS_PER_PAGE = 5; // ĐÃ CHỈNH SỬA THÀNH 5 DÒNG/TRANG
const API_BASE_URL = 'http://localhost:8080/api'; // BASE API URL
const STATS_API_URL = `${API_BASE_URL}/stats`;

// Hàm tiện ích định dạng tiền tệ
const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '0 ₫';
    // Đảm bảo số lượng luôn là số trước khi format
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(numericAmount);
};

// Hàm tiện ích định dạng số
const formatNumber = (num) => {
    if (num === null || num === undefined) return '0';
    return num.toLocaleString('vi-VN');
};

// Component StatCard đồng bộ
const StatCard = ({ title, value, icon: Icon, iconColor, bgColor = LIGHT_TEAL_BG }) => (
    <div className="rounded-2xl p-6 shadow-sm border border-gray-100" style={{ background: bgColor }}>
        <div className="flex items-center justify-between">
            <div>
                <p className="font-medium text-gray-700">{title}</p>
                <p className="text-3xl font-bold mt-2 text-gray-900">{value}</p>
            </div>
            <div className="w-12 h-12 bg-white/30 rounded-xl flex items-center justify-center text-2xl">
                <Icon className={`w-6 h-6 ${iconColor}`} />
            </div>
        </div>
    </div>
);

// Hàm tiện ích để tính toán ngày cho API
const calculateDates = (filterType, start, end) => {
    const now = new Date();
    let startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0); 
    let endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    switch (filterType) {
        case '7DAYS':
            startDate.setDate(now.getDate() - 6); 
            break;
        case '30DAYS':
            startDate.setDate(now.getDate() - 29);
            break;
        case 'MONTH':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59); 
            break;
        case 'YEAR':
            startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
            break;
        case 'CUSTOM':
            if (start && end) {
                startDate = new Date(start + 'T00:00:00'); 
                endDate = new Date(end + 'T23:59:59'); 
            } else {
                return null;
            }
            break;
        default:
             startDate.setDate(now.getDate() - 6);
    }
    
    const formatDateTime = (date) => date.toISOString().slice(0, 19); 

    return { 
        startDate: formatDateTime(startDate), 
        endDate: formatDateTime(endDate) 
    };
};


// --- LOGIC TÍNH TOÁN (Dựa trên dữ liệu đã fetch) ---
const calculateStats = (data) => {
    const totalRevenue = data.reduce((sum, item) => sum + (item.revenue || 0), 0);
    const totalOrders = data.reduce((sum, item) => sum + (item.orders || 0), 0);
    const days = data.length;
    
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0; 
    const averageRevenuePerDay = days > 0 ? totalRevenue / days : 0;

    return { totalRevenue, totalOrders, averageRevenuePerDay, averageOrderValue };
};


// --- COMPONENT CHÍNH: Stats ---
const Stats = () => {
    
    // LẤY TOKEN THỰC TẾ TỪ CONTEXT
    const { user } = useAuth();
    const adminToken = user?.token;
    const userRole = user?.role;

    const isAuthorized = userRole === 'ADMIN' || userRole === 'EMPLOYEE';

    // --- State Quản lý Dữ liệu ---
    const [salesData, setSalesData] = useState([]); 
    const [topProducts, setTopProducts] = useState([]); 
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // --- State Phân trang ---
    const [page, setPage] = useState(0);

    // --- State Bộ lọc ---
    const [filterType, setFilterType] = useState('7DAYS');
    const [tempStartDate, setTempStartDate] = useState('');
    const [tempEndDate, setTempEndDate] = useState('');

    // --- Logic Lấy Dữ liệu THẬT từ API ---
    const fetchSalesData = useCallback(async () => {
        
        // KIỂM TRA TRƯỚC KHI GỌI API
        if (!adminToken) { 
            // Không gọi API nếu không có token (chưa đăng nhập hoặc token đã hết hạn)
            setError('Lỗi phân quyền: Vui lòng đăng nhập với tài khoản Admin/Employee.');
            setLoading(false);
            setSalesData([]);
            setTopProducts([]);
            return;
        }

        const dates = calculateDates(filterType, tempStartDate, tempEndDate);

        if (!dates) {
            setError('Vui lòng chọn đầy đủ khoảng thời gian tùy chỉnh.');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        setPage(0); // Reset trang khi tải dữ liệu mới

        const revenueUrl = `${STATS_API_URL}/revenue/daily`;
        const topProductUrl = `${STATS_API_URL}/products/top5`; 
        
        const config = {
            headers: {
                Authorization: `Bearer ${adminToken}`, // SỬ DỤNG TOKEN THỰC TẾ
            },
            params: {
                startDate: dates.startDate,
                endDate: dates.endDate,
            }
        };

        try {
            // 2. Gọi cả hai API song song
            const [revenueResponse, topProductResponse] = await Promise.all([
                axios.get(revenueUrl, config),
                axios.get(topProductUrl, config) 
            ]);
            
            // Xử lý dữ liệu Doanh thu
            const fetchedSalesData = revenueResponse.data.map(item => ({
                date: item.date, // 'yyyy-MM-dd'
                revenue: item.revenue, 
                orders: item.orders,
            }));

            setSalesData(fetchedSalesData); 

            // 3. Xử lý dữ liệu Top Products
            setTopProducts(topProductResponse.data); // Gán dữ liệu thực từ API

        } catch (err) {
            console.error('Lỗi khi tải thống kê:', err.response?.data || err);
            const status = err.response?.status;
            let errorMessage = 'Không thể tải dữ liệu thống kê. Vui lòng kiểm tra kết nối API.';
            if (status === 401 || status === 403) {
                 errorMessage = 'Lỗi phân quyền: Token không đủ quyền truy cập hoặc hết hạn.';
            }
            setError(errorMessage);
            setSalesData([]);
            setTopProducts([]);
        } finally {
            setLoading(false);
        }
    }, [filterType, tempStartDate, tempEndDate, adminToken]); // adminToken là dependency

    useEffect(() => {
        // Chỉ fetch data nếu có token
        if (adminToken) {
            fetchSalesData();
        } else {
            // Hiển thị lỗi phân quyền nếu không có token
             setError('Lỗi phân quyền: Vui lòng đăng nhập với tài khoản Admin/Employee.');
        }
    }, [fetchSalesData, adminToken]); 

    // --- Tính toán Thống kê ---
    const stats = useMemo(() => calculateStats(salesData), [salesData]);
    const { totalRevenue, totalOrders, averageRevenuePerDay, averageOrderValue } = stats; 


    // --- Logic Phân trang Bảng Chi tiết ---
    const totalSalesItems = salesData.length;
    const totalPagesFE = Math.ceil(totalSalesItems / ITEMS_PER_PAGE);
    const startIndex = page * ITEMS_PER_PAGE;
    // Đảo ngược dữ liệu để hiển thị ngày mới nhất lên đầu bảng chi tiết
    const reversedSalesData = useMemo(() => [...salesData].reverse(), [salesData]); 
    const currentSalesData = reversedSalesData.slice(startIndex, startIndex + ITEMS_PER_PAGE);


    // --- Xử lý Lọc Tùy chỉnh ---
    const handleApplyCustomFilter = () => {
        if (filterType === 'CUSTOM') {
            if (!tempStartDate || !tempEndDate) {
                alert('Vui lòng chọn cả "Từ Ngày" và "Đến Ngày" cho bộ lọc tùy chỉnh.');
                return;
            }
        }
        // Gọi fetchSalesData để tải dữ liệu mới
        fetchSalesData(); 
    };

    // Nếu không có quyền truy cập, hiển thị thông báo lỗi
    if (!adminToken || !isAuthorized) {
        return (
            <div className="p-8 bg-white rounded-lg shadow-md max-w-xl mx-auto mt-16 text-center">
                <h2 className="text-xl font-bold text-red-600 mb-4">Không có quyền truy cập</h2>
                <p className="text-gray-700">Bạn cần đăng nhập bằng tài khoản Quản trị viên hoặc Nhân viên để xem trang này.</p>
            </div>
        );
    }

    return (
        <div className="p-8 bg-gray-50 min-h-screen font-sans">
            
            {/* Tiêu đề */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Thống kê Doanh thu</h1>
                <p className="text-gray-600 mt-1">Phân tích hiệu suất tài chính theo thời gian</p>
            </div>

            {/* --- KHU VỰC BỘ LỌC (FILTER BAR) ---*/}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-8">
                <div className="flex flex-wrap items-end gap-4 w-full">

                    {/* Lọc nhanh */}
                    <div className="shrink-0">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Phạm vi Thời gian</label>
                        <select
                            value={filterType}
                            onChange={(e) => {
                                setFilterType(e.target.value);
                            }}
                            className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2B6377] bg-white cursor-pointer text-sm"
                        >
                            <option value="7DAYS">7 Ngày qua</option>
                            <option value="30DAYS">30 Ngày qua</option>
                            <option value="MONTH">Tháng này</option>
                            <option value="YEAR">Năm nay</option>
                            <option value="CUSTOM">Tùy chỉnh khoảng ngày</option>
                        </select>
                    </div>

                    {/* Tùy chọn Ngày (Chỉ hiển thị khi chọn Tùy chỉnh) */}
                    {filterType === 'CUSTOM' && (
                        <>
                            <div className="w-40 shrink-0">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Từ Ngày</label>
                                <input
                                    type="date"
                                    value={tempStartDate}
                                    onChange={(e) => setTempStartDate(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2B6377] bg-white cursor-pointer text-sm"
                                />
                            </div>

                            <div className="w-40 shrink-0">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Đến Ngày</label>
                                <input
                                    type="date"
                                    value={tempEndDate}
                                    onChange={(e) => setTempEndDate(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2B6377] bg-white cursor-pointer text-sm"
                                />
                            </div>
                        </>
                    )}

                    {/* Nút Apply Filters */}
                    <div className="shrink-0 ml-auto flex gap-3">

                        {/* Nút Refresh */}
                        <button
                            onClick={fetchSalesData}
                            className="p-3 border border-gray-300 rounded-xl hover:bg-gray-50 text-gray-600 hover:text-[#2B6377] transition-colors shadow-sm"
                            title="Làm mới dữ liệu"
                        >
                            <RefreshCw className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* --- 4 CHỈ SỐ DOANH THU CHÍNH --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                
                {/* 1. Tổng Doanh Thu */}
                <StatCard
                    title="Tổng Doanh Thu"
                    value={loading && salesData.length === 0 ? 'Đang tải...' : formatCurrency(totalRevenue)}
                    icon={DollarSign}
                    iconColor="text-green-700"
                />

                {/* 2. Giá trị Đơn hàng Trung bình (AOV) */}
                <StatCard
                    title="Giá trị ĐH Trung bình (AOV)"
                    value={loading && salesData.length === 0 ? 'Đang tải...' : formatCurrency(averageOrderValue)}
                    icon={TrendingUp}
                    iconColor="text-red-600"
                />

                {/* 3. Doanh thu Trung bình/Ngày */}
                <StatCard
                    title="Doanh Thu TB/Ngày"
                    value={loading && salesData.length === 0 ? 'Đang tải...' : formatCurrency(averageRevenuePerDay)}
                    icon={Clock}
                    iconColor="text-purple-700"
                />
                
                {/* 4. Tổng số đơn hàng */}
                <StatCard
                    title="Tổng số Đơn hàng"
                    value={loading && salesData.length === 0 ? 'Đang tải...' : formatNumber(totalOrders)}
                    icon={ShoppingCart}
                    iconColor="text-[#2B6377]"
                />
            </div>

            {/* --- KHU VỰC BIỂU ĐỒ VÀ CHI TIẾT (Grid 1) --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                
                {/* 1. Biểu đồ Doanh thu (Chiếm 2/3) - GIỮ NGUYÊN VỊ TRÍ */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <BarChart className="w-5 h-5 mr-2 text-[#2B6377]" />
                        Xu hướng Doanh thu theo Thời gian
                    </h2>

                    {loading ? (
                        <div className="text-center py-16 text-[#2B6377]">Đang tải dữ liệu biểu đồ...</div>
                    ) : error ? (
                         <div className="text-center py-16 text-red-500">{error}</div>
                    ) : salesData.length === 0 ? (
                        <div className="h-80 flex items-center justify-center text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                             Không có dữ liệu doanh thu trong khoảng thời gian này.
                        </div>
                    ) : (
                        // KHỐI CODE BIỂU ĐỒ THỰC TẾ
                        <div style={{ width: '100%', height: 320 }}>
                            <ResponsiveContainer>
                                <LineChart 
                                    // SỬA LỖI: Tạo bản sao mảng trước khi sắp xếp
                                    data={[...salesData].sort((a, b) => new Date(a.date) - new Date(b.date))} 
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                    <XAxis dataKey="date" tickFormatter={(tick) => tick.slice(5)} stroke="#555" />
                                    <YAxis tickFormatter={(tick) => formatCurrency(tick).replace(' ₫', '')} stroke="#555" />
                                    <Tooltip formatter={(value) => formatCurrency(value)} labelFormatter={(label) => `Ngày: ${label}`} />
                                    <Legend />
                                    <Line type="monotone" dataKey="revenue" stroke={TEAL_COLOR} strokeWidth={2} name="Doanh Thu" dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        // KẾT THÚC KHỐI CODE BIỂU ĐỒ
                    )}
                </div>

                {/* 2. BẢNG CHI TIẾT DOANH THU THEO NGÀY (Chiếm 1/3) */}
                <div className="lg:col-span-1 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">Chi tiết Doanh thu theo Ngày</h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Hiển thị {(page * ITEMS_PER_PAGE) + 1}-{Math.min((page + 1) * ITEMS_PER_PAGE, totalSalesItems)} trong tổng {totalSalesItems} dòng
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Table Content */}
                    <div className="overflow-x-auto">
                        {loading && salesData.length === 0 && <div className="text-center text-[#2B6377] py-8">Đang tải chi tiết doanh thu...</div>}
                        {error && <div className="text-center text-red-500 py-8">Lỗi: {error}</div>}
                        {!loading && !error && currentSalesData.length === 0 && (
                            <div className="text-center text-gray-500 py-8">Không tìm thấy chi tiết doanh thu nào cho khoảng thời gian này.</div>
                        )}
                        
                        {currentSalesData.length > 0 && (
                             <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-[#f4f7f8]">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Thời gian</th>
                                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Tổng Doanh thu</th>
                                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Tổng Đơn hàng</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {currentSalesData.map((item, index) => (
                                        <tr key={index} className="hover:bg-gray-50 transition duration-150">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#2b6377]">{item.date}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700 text-right">
                                                {formatCurrency(item.revenue)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                                {formatNumber(item.orders)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Phân trang */}
                    {totalSalesItems > ITEMS_PER_PAGE && (
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
                    )}
                </div>
            </div>

            {/* --- BẢNG TOP 5 SẢN PHẨM BÁN CHẠY (Full Width) --- */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center">
                        <ArrowUpCircle className="w-5 h-5 mr-2 text-red-500" />
                        Top Sản phẩm Bán chạy
                    </h2>
                </div>
                {/* Bảng Top Products */}
                <div className="p-4">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-[#f4f7f8]">
                            <tr>
                                <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Sản phẩm</th>
                                <th className="px-3 py-2 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Số lượng</th>
                                <th className="px-3 py-2 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Doanh thu</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {topProducts.slice(0, 5).map((product, index) => (
                                <tr key={product.variantId || index} className="hover:bg-gray-50 transition duration-150">
                                    <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-[#2b6377] max-w-xs overflow-hidden text-ellipsis">{product.name}</td>
                                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900 text-center">{formatNumber(product.sales)}</td>
                                    <td className="px-3 py-3 whitespace-nowrap text-sm font-semibold text-gray-700 text-right">{formatCurrency(product.revenue)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {topProducts.length === 0 && !loading && (
                            <div className="text-center text-gray-500 py-4">Không có dữ liệu Top Sản phẩm.</div>
                    )}
                </div>
            </div>

        </div>
    );
};

export default Stats;