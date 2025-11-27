import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import {
    ChevronLeft,
    User,
    Package,
    MapPin,
    LogOut,
    Truck,
    DollarSign,
    Repeat2,
    Star,
    XCircle,
    ShoppingBag
} from 'lucide-react';
import Footer from '../components/Footer';
import Header from '../components/Header';

// Định nghĩa URL cơ sở của API
const API_BASE_URL = 'http://localhost:8080/api/orders';

// Màu chủ đạo
const TEAL_TEXT = 'text-[#2B6377]';
const TEAL_BG = 'bg-[#2B6377]';
const TEAL_HOVER_BG = 'hover:bg-[#E6F3F5]';
const TEAL_ACTIVE_BG = 'bg-[#CCDFE3]';

// --- HÀM TIỆN ÍCH CHUNG ---

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
        case 'CONFIRMED': return 'Chờ xác nhận';
        case 'PENDING': return 'Chờ xử lý';
        case 'CANCELLED': return 'Đã hủy';
        default: return status;
    }
};

const AccountSidebar = () => (
    <div className="w-64 flex-shrink-0 bg-white p-4 rounded-lg shadow-sm font-sans sticky top-20 h-fit">
        <h3 className="font-semibold text-lg text-gray-800 mb-4 border-b pb-2">Tài khoản</h3>
        <nav className="space-y-2">
            <Link to="/orders" className={`flex items-center p-2 ${TEAL_TEXT} ${TEAL_ACTIVE_BG} rounded-md font-medium transition`}>
                <Package className="w-4 h-4 mr-2" /> Quản lý đơn hàng
            </Link>
            <Link to="/profile" className={`flex items-center p-2 text-gray-700 ${TEAL_HOVER_BG} rounded-md transition`}>
                <User className="w-4 h-4 mr-2" /> Thông tin cá nhân
            </Link>
            <Link to="/addresses" className={`flex items-center p-2 text-gray-700 ${TEAL_HOVER_BG} rounded-md transition`}>
                <MapPin className="w-4 h-4 mr-2" /> Địa chỉ giao hàng
            </Link>
            <Link to="/logout" className={`flex items-center p-2 text-gray-700 hover:bg-red-50 rounded-md transition mt-4 border-t pt-2`}>
                <LogOut className="w-4 h-4 mr-2" /> Thoát
            </Link>
        </nav>
    </div>
);

// --- COMPONENT CHI TIẾT SẢN PHẨM ---
const OrderItemRow = ({ item }) => {
    const quantity = item.quantity;
    const unitPrice = parseFloat(item.unitPrice);
    const discountAmount = parseFloat(item.discountAmount || 0);

    const productName = item.productVariant?.product?.productName || 'Sản phẩm không rõ';
    const variantDetails = {
        color: item.productVariant?.color || 'N/A',
        dimension: item.productVariant?.size || 'N/A'
    };

    const lineSubTotal = quantity * unitPrice;
    const lineTotal = lineSubTotal - discountAmount;

    return (
        <div className="flex items-center py-4 border-b last:border-b-0">
            {/* THAY ĐỔI: Sửa layout cột sản phẩm 2/6 */}
            <div className="w-2/6 flex items-start pr-4">
                <img
                    src={item.productVariant?.imageUrl || 'placeholder-image.jpg'}
                    alt={productName}
                    className="w-16 h-16 object-cover rounded mr-3 border flex-shrink-0"
                />
                <div className="flex-grow">
                    <p className="font-medium text-gray-800">{productName}</p>
                    <p className="text-sm text-gray-500">
                        Màu: {variantDetails.color} | Kích thước: {variantDetails.dimension}
                    </p>
                </div>
            </div>

            <div className="text-right w-1/6 text-sm text-gray-700">
                {quantity}
            </div>
            <div className="text-right w-1/6 text-sm text-gray-700">
                {formatCurrency(unitPrice)}
            </div>
            {/* Cột giảm giá cho sản phẩm này */}
            <div className="text-right w-1/6 text-sm text-red-500">
                {discountAmount > 0 ? formatCurrency(discountAmount) : '-'}
            </div>
            {/* Cột Thành tiền cuối cùng */}
            <div className="text-right w-1/6 font-semibold text-gray-800">
                {formatCurrency(lineTotal)}
            </div>
        </div>
    );
};


// --- COMPONENT CHÍNH: OrderDetailPage ---
const OrderDetailPage = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Dữ liệu mẫu
    const [mockOrder] = useState({
        id: orderId || 'ORD-2024-001',
        orderDate: '2025-11-15T14:30:00',
        status: 'PENDING',
        orderDetails: [
            {
                id: 1,
                quantity: 2,
                unitPrice: '2500000.00',
                discountAmount: '250000.00',
                productVariant: {
                    imageUrl: 'necklace-placeholder.jpg',
                    color: 'Trắng',
                    size: 'Kích thước: 45cm',
                    product: { productName: 'Vòng Cổ Ngọc Trai Classique' }
                }
            },
            {
                id: 2,
                quantity: 1,
                unitPrice: '8500000.00',
                discountAmount: '0.00',
                productVariant: {
                    imageUrl: 'earrings-placeholder.jpg',
                    color: 'Vàng',
                    size: 'Kích thước: 1.2ct',
                    product: { productName: 'Bông Tai Kim Cương Étoile' }
                }
            },
        ],
        customer: { name: 'Nguyễn Văn A' },
        address: {
            fullName: 'Nguyễn Minh Anh',
            phone: '0912 345 678',
            address: '123 Nguyễn Huệ, Phường Bến Nghé',
            city: 'TP. Hồ Chí Minh',
            state: 'Hồ Chí Minh',
            country: 'Việt Nam'
        },

        orderDiscountAmount: 0,
        shippingFee: 50000,
    });


    // --- HÀM GỌI API LẤY CHI TIẾT ĐƠN HÀNG ---
    const fetchOrderDetail = async (id) => {
        // Hàm ánh xạ nội bộ để tránh lặp code
        const mapApiData = (data) => {
            const customer = data.customer;
            const address = data.address;

            if (customer && address) {
                data.shippingAddress = {
                    // Họ tên: Lấy từ Address.fullName
                    recipientName: address.fullName || customer.name || 'N/A',

                    // Số điện thoại: Lấy từ Address.phone
                    phone: address.phone || 'N/A',

                    // Địa chỉ đầy đủ: Ghép từ address (chi tiết), city, state, country
                    addressLine: [
                        address.address, // Địa chỉ chi tiết (street, ward, district)
                        address.city,
                        address.state,
                        address.country
                    ].filter(part => part).join(', ')
                };
            }
            return data;
        };

        if (!id) {
            setOrder(mapApiData({ ...mockOrder }));
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_BASE_URL}/${id}`);

            // Ánh xạ dữ liệu API
            const finalData = mapApiData(response.data);
            setOrder(finalData);

        } catch (err) {
            console.error(`Lỗi khi tải chi tiết đơn hàng ${id}:`, err);
            setError(`Không thể tải chi tiết đơn hàng #${id}. Vui lòng kiểm tra kết nối.`);
            // SỬ DỤNG MOCK DATA ĐÃ ÁNH XẠ
            setOrder(mapApiData({ ...mockOrder }));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrderDetail(orderId);
    }, [orderId]);

    // --- HÀM CẬP NHẬT TRẠNG THÁI UI ---
    const updateOrderStatus = (newStatus) => {
        setOrder(prevOrder => ({
            ...prevOrder,
            status: newStatus
        }));
    };

    // --- HÀM XỬ LÝ HỦY ĐƠN HÀNG  ---
    const handleCancelOrder = async () => {
        // Chỉ cho phép hủy nếu trạng thái là PENDING
        if (order.status !== 'PENDING') {
            alert('Chỉ đơn hàng đang ở trạng thái "Chờ xử lý" mới có thể hủy.');
            return;
        }

        if (!window.confirm(`Bạn có chắc chắn muốn hủy đơn hàng #${orderId} này không?`)) {
            return;
        }

        const CANCEL_URL = `${API_BASE_URL}/cancel/${orderId}`;

        try {
            // Sử dụng PUT để cập nhật trạng thái
            const response = await axios.put(CANCEL_URL);

            // Giả định API trả về status 200 OK
            if (response.status === 200) {
                // Cập nhật trạng thái trên UI thành 'CANCELLED'
                updateOrderStatus('CANCELLED');
                alert(`Đơn hàng #${orderId} đã được hủy thành công.`);
            } else {
                alert('Hủy đơn hàng thất bại. Vui lòng kiểm tra lại đơn hàng.');
            }

        } catch (err) {
            console.error('Lỗi khi hủy đơn hàng:', err);

            // Xử lý thông báo lỗi từ server
            let errorMessage = 'Không thể hủy đơn hàng do lỗi kết nối hoặc server.';
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.response?.status === 400) {
                errorMessage = 'Không thể hủy đơn hàng này. Trạng thái hiện tại không hợp lệ.';
            }

            alert(`Lỗi hủy đơn hàng: ${errorMessage}`);
        }
    };

    // --- CÁC HÀM XỬ LÝ HÀNH ĐỘNG KHÁC  ---
    const handleReorder = () => {
        alert('Chuyển hướng đến trang đặt lại (chức năng thật cần thêm sản phẩm vào giỏ hàng)');
    };

    const handleReturn = () => {
        alert('Chuyển hướng đến trang yêu cầu trả hàng');
    };

    const handleRate = () => {
        alert('Mở form đánh giá sản phẩm');
    };


    // --- LOGIC HIỂN THỊ NÚT HÀNH ĐỘNG ---
    const renderActionButtons = (status) => {
        const baseClass = 'font-semibold py-2 px-4 rounded-md transition duration-200 shadow-sm text-sm flex items-center justify-center';

        switch (status) {
            case 'PENDING':
                return (
                    <button
                        onClick={handleCancelOrder}
                        className={`${baseClass} bg-red-600 text-white hover:bg-red-700`}
                    >
                        <XCircle className="w-4 h-4 mr-2" /> Hủy Đơn Hàng
                    </button>
                );
            case 'DELIVERED':
                return (
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={handleReorder}
                            className={`${baseClass} ${TEAL_BG} text-white hover:opacity-90`}
                        >
                            <ShoppingBag className="w-4 h-4 mr-2" /> Mua Lại
                        </button>
                        <button
                            onClick={handleReturn}
                            className={`${baseClass} bg-white border border-gray-300 text-gray-700 hover:bg-gray-100`}
                        >
                            <Repeat2 className="w-4 h-4 mr-2" /> Trả Hàng
                        </button>
                        <button
                            onClick={handleRate}
                            className={`${baseClass} bg-white border border-gray-300 text-gray-700 hover:bg-gray-100`}
                        >
                            <Star className="w-4 h-4 mr-2" /> Đánh Giá
                        </button>
                    </div>
                );
            case 'CANCELLED':
                return (
                    <button
                        onClick={handleReorder}
                        className={`${baseClass} ${TEAL_BG} text-white hover:opacity-90`}
                    >
                        <ShoppingBag className="w-4 h-4 mr-2" /> Mua Lại
                    </button>
                );
            default:
                return <span className="text-gray-500 text-sm">Không có thao tác khả dụng</span>;
        }
    };

    // --- Xử lý tải dữ liệu và lỗi ---
    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
                <Header />
                <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 text-center text-lg text-gray-600">
                    Đang tải chi tiết đơn hàng...
                </div>
                <Footer />
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
                <Header />
                <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 text-center text-lg text-red-500">
                    {error || 'Không tìm thấy đơn hàng.'}
                </div>
                <Footer />
            </div>
        );
    }

    // --- LOGIC TÍNH TOÁN TỔNG KẾT ---
    const orderItems = order.orderDetails ?? [];

    const { subTotal, productDiscountTotal } = orderItems.reduce((acc, item) => {
        const unitPrice = parseFloat(item.unitPrice ?? 0);
        const quantity = item.quantity ?? 0;
        const discountAmount = parseFloat(item.discountAmount ?? 0);

        acc.subTotal += unitPrice * quantity;
        acc.productDiscountTotal += discountAmount;

        return acc;
    }, { subTotal: 0, productDiscountTotal: 0 });

    const orderDiscountAmount = parseFloat(order.orderDiscountAmount ?? 0);
    const shippingFee = parseFloat(order.shippingFee ?? 0);

    // Tổng giảm giá: Giảm giá trên từng sản phẩm + Giảm giá toàn đơn
    const grandDiscountTotal = productDiscountTotal + orderDiscountAmount;

    // Tổng thanh toán = Tổng tiền hàng - Tổng giảm giá + Phí vận chuyển
    const finalTotal = subTotal - grandDiscountTotal + shippingFee;


    // Format ngày giờ
    const orderDate = order.orderDate
        ? new Date(order.orderDate).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }) + ' - ' + new Date(order.orderDate).toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
    })
        : 'N/A';

    // Lấy thông tin giao hàng đã được ánh xạ (hoặc mock)
    const shippingInfo = order.shippingAddress;


    return (
        <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
            <Header />

            <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
                {/* Breadcrumbs */}
                <div className="text-sm text-gray-500 mb-6 flex items-center">
                    <Link to="/" className="cursor-pointer hover:text-[#2B6377]">Home</Link>
                    <span className="mx-2">/</span>
                    <Link to="/account" className="cursor-pointer hover:text-[#2B6377]">Tài khoản</Link>
                    <span className="mx-2">/</span>
                    <Link to="/orders" className="cursor-pointer hover:text-[#2B6377]">Quản lý đơn hàng</Link>
                    <span className="mx-2">/</span>
                    <span className="font-medium text-[#2B6377]">Chi tiết đơn hàng</span>
                </div>

                <div className="flex gap-8">
                    {/* Sidebar */}
                    <AccountSidebar />

                    {/* Main Content */}
                    <main className="flex-1">

                        {/* HEADER CHI TIẾT ĐƠN HÀNG */}
                        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                            <h2 className="text-xl font-semibold text-gray-800 mb-2">
                                CHI TIẾT ĐƠN HÀNG #{order.id}
                            </h2>
                            <div className="flex justify-between items-center border-b pb-4 mb-4">
                                <p className="text-sm text-gray-500">
                                    Ngày đặt: <span className="font-medium text-gray-700">{orderDate}</span>
                                </p>
                                {renderActionButtons(order.status)}
                            </div>

                            {/* Trạng thái hiện tại */}
                            <div className="flex justify-between items-center p-4 rounded-lg bg-gray-50 border border-gray-200">
                                <p className="font-semibold text-gray-700">Trạng thái hiện tại:</p>
                                <span
                                    className={`px-4 py-2 text-sm font-bold rounded-lg border-2 ${getStatusStyle(order.status)}`}
                                >
                                    {translateStatus(order.status)}
                                </span>
                            </div>
                        </div>

                        {/* DANH SÁCH SẢN PHẨM ĐÃ ĐẶT */}
                        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center border-b pb-2">
                                <ShoppingBag className="w-5 h-5 mr-2" /> Sản phẩm đã đặt
                            </h3>
                            {/* Header cột (Đã fix layout) */}
                            <div className="flex font-semibold text-sm text-gray-500 border-b pb-2 mb-2">
                                <div className="w-2/6">Sản Phẩm</div>
                                <div className="text-right w-1/6">Số Lượng</div>
                                <div className="text-right w-1/6">Đơn Giá</div>
                                <div className="text-right w-1/6">Giảm Giá</div>
                                <div className="text-right w-1/6">Thành Tiền</div>
                            </div>

                            <div className="space-y-2">
                                {orderItems.map(item => (
                                    <OrderItemRow key={item.id} item={item} />
                                ))}
                            </div>
                        </div>

                        {/* THÔNG TIN GIAO HÀNG & TỔNG KẾT */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Thông tin Giao Hàng */}
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center border-b pb-2">
                                    <Truck className="w-5 h-5 mr-2" /> Thông tin giao hàng
                                </h3>
                                <div className="space-y-3 text-gray-700">
                                    <p>
                                        <span className="font-medium block text-gray-500">Họ tên:</span>
                                        <span className="font-semibold text-gray-800">{shippingInfo?.recipientName || 'N/A'}</span>
                                    </p>
                                    <p>
                                        <span className="font-medium block text-gray-500">Số điện thoại:</span>
                                        <span className="font-semibold text-gray-800">{shippingInfo?.phone || 'N/A'}</span>
                                    </p>
                                    <p>
                                        <span className="font-medium block text-gray-500">Địa chỉ giao hàng:</span>
                                        <span className="font-semibold text-gray-800">{shippingInfo?.addressLine || 'N/A'}</span>
                                    </p>
                                </div>
                            </div>

                            {/* Tổng kết đơn hàng */}
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center border-b pb-2">
                                    <DollarSign className="w-5 h-5 mr-2" /> Tổng kết đơn hàng
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-gray-700">
                                        <span>Tổng tiền hàng:</span>
                                        <span className="font-medium">{formatCurrency(subTotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-red-500">
                                        <span>Tổng giảm giá:</span>
                                        <span className="font-medium">-{formatCurrency(grandDiscountTotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-700 border-b pb-3">
                                        <span>Phí vận chuyển:</span>
                                        <span className="font-medium">{formatCurrency(shippingFee)}</span>
                                    </div>

                                    <div className="flex justify-between items-center pt-3">
                                        <span className="text-lg font-bold text-gray-800">Tổng thanh toán:</span>
                                        <span className={`${TEAL_TEXT} text-2xl font-bold`}>
                                            {formatCurrency(finalTotal)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>

            <Footer/>
        </div>
    );
};

export default OrderDetailPage;