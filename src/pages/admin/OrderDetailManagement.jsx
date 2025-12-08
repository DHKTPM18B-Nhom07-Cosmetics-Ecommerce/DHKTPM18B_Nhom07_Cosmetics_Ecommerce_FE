import React, { useState, useEffect, useCallback } from 'react';
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
    ShoppingBag,
    CheckCircle,
    AlertTriangle,
    Info,
    CheckSquare
} from 'lucide-react';
// SỬ DỤNG AUTH CONTEXT
import { useAuth } from '../../context/AuthContext';

// Định nghĩa URL cơ sở của API
const API_BASE_URL = 'http://localhost:8080/api/orders';

// Màu chủ đạo
const TEAL_TEXT = 'text-[#2B6377]';
const TEAL_BG = 'bg-[#2B6377]';
const TEAL_HOVER_BG = 'hover:bg-[#E6F3F5]';
const TEAL_ACTIVE_BG = 'bg-[#CCDFE3]';

// --- HÀM TIỆN ÍCH CHUNG (Giữ nguyên) ---

const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return 'N/A';
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('vi-VN').format(Math.abs(numericAmount)) + '₫';
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

/**
 * Hiển thị thông tin sản phẩm (tên, biến thể, ảnh)
 * ĐÃ SỬA: Lấy Tên Sản phẩm gốc làm tiêu đề chính.
 */
const ProductItemDisplay = ({ item }) => {

    const product = item.productVariant?.product;
    const variantName = item.productVariant?.variantName;
    const placeholderImage = 'https://placehold.co/50x50/f5f5f5/f5f5f5.png?text=SP';

    // 1. TÊN SẢN PHẨM CHÍNH (LẤY TỪ PRODUCT.NAME)
    const productName = product?.name || 'Sản phẩm không rõ tên';

    // 2. TẠO CHUỖI HIỂN THỊ CHÍNH: Tên Sản phẩm [ + (Tên Biến thể) ]
    // Ví dụ: "Sữa Rửa Mặt CeraVe (473ml)"
    const primaryDisplay = (productName === variantName) ?
        productName :
        (variantName ? `${productName} (${variantName})` : productName);

    // 3. LẤY URL ẢNH (Ưu tiên từ Variant.imageUrls)
    let imageUrl = null;
    const variantImages = item.productVariant?.imageUrls;

    if (variantImages && variantImages.length > 0) {
        imageUrl = variantImages[0]; // Ưu tiên ảnh của Variant (index 0)
    }
    // Logic dự phòng (nếu cần) có thể được thêm ở đây, nhưng tạm thời dùng placeholder
    imageUrl = imageUrl || placeholderImage;


    return (
        <div className="flex items-start w-full">
            <img
                src={imageUrl}
                alt={primaryDisplay}
                onError={(e) => { e.target.onerror = null; e.target.src = placeholderImage; }}
                className="w-16 h-16 object-cover rounded-sm mr-4 border border-gray-200 flex-shrink-0"
            />

            <div className="flex-grow min-w-0 pt-1">
                {/* Tên sản phẩm chính (đã kết hợp tên biến thể) */}
                <p className="font-bold text-gray-800 leading-tight text-sm" title={primaryDisplay}>
                    {primaryDisplay}
                </p>

                {/* Dòng phụ: Chỉ hiển thị tên biến thể nếu nó khác với tên chính */}
                {variantName && variantName !== productName && (
                    <p className="text-xs text-gray-600 leading-snug truncate" title={`Biến thể: ${variantName}`}>
                        loại: {variantName}
                    </p>
                )}


                {/*<p className="text-xs text-gray-500 mt-1">*/}
                {/*    Mã Variant: #{item.productVariant?.id || 'N/A'}*/}
                {/*</p>*/}
            </div>
        </div>
    );
};


// --- COMPONENT CHI TIẾT SẢN PHẨM (MỘT DÒNG) ---
const OrderItemRow = ({ item }) => {
    const quantity = item.quantity;
    const unitPrice = parseFloat(item.unitPrice || 0);
    const discountAmount = parseFloat(item.discountAmount || 0);

    const lineSubTotal = quantity * unitPrice;
    const lineTotal = lineSubTotal - discountAmount;

    return (
        <div className="flex items-center py-2 border-b border-gray-100 last:border-b-0 min-h-[80px]">

            {/* CỘT SẢN PHẨM: Chiếm 2/5 (40%) */}
            <div className="w-2/5 pr-4 flex items-center justify-start">
                <ProductItemDisplay item={item} />
            </div>

            {/* CỘT SỐ LƯỢNG */}
            <div className="text-center w-1/5 text-sm text-gray-700">
                {quantity}
            </div>

            {/* CỘT ĐƠN GIÁ */}
            <div className="text-right w-1/5 text-sm text-gray-700">
                {formatCurrency(unitPrice)}
            </div>

            {/* CỘT GIẢM GIÁ */}
            <div className={`text-right w-1/5 text-sm ${discountAmount > 0 ? 'text-red-600' : 'text-gray-500'}`}>
                {discountAmount > 0 ? `-${formatCurrency(discountAmount)}` : '-'}
            </div>

            {/* CỘT THÀNH TIỀN */}
            <div className="text-right w-1/5 font-bold text-gray-800">
                {formatCurrency(lineTotal)}
            </div>
        </div>
    );
};


// --- UTILITY COMPONENTS (Message Box) ---

// Message Display
const MessageDisplay = ({ message, onClose }) => {
    if (!message) return null;

    const { type, text } = message;
    const baseClass = 'fixed top-4 right-4 z-50 p-4 rounded-lg shadow-xl flex items-center max-w-sm transition-opacity duration-300';
    let style = {};
    let Icon = Info;

    switch (type) {
        case 'success':
            style = { backgroundColor: '#D4EDDA', color: '#155724', border: '1px solid #C3E6CB' };
            Icon = CheckCircle;
            break;
        case 'error':
            style = { backgroundColor: '#F8D7DA', color: '#721C24', border: '1px solid #F5C6CB' };
            Icon = XCircle;
            break;
        case 'info':
        default:
            style = { backgroundColor: '#CCE5FF', color: '#004085', border: '1px solid #B8DAFF' };
            Icon = Info;
            break;
    }

    return (
        <div className={baseClass} style={style}>
            <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
            <span className="text-sm font-medium flex-1">{text}</span>
            <button
                onClick={onClose}
                className="ml-4 p-1 rounded-full hover:bg-black/10"
                style={{ color: style.color }}
            >
                <XCircle className="w-4 h-4" />
            </button>
        </div>
    );
};


// --- COMPONENT CHÍNH: OrderDetailManagement ---
const OrderDetailManagement = () => {
    const { orderId } = useParams();

    // SỬ DỤNG AUTH CONTEXT
    const { user, isLoggedIn, isLoading: authLoading } = useAuth();
    const adminToken = user?.token;
    const isAdminOrEmployee = user && (user.role === 'ADMIN' || user.role === 'EMPLOYEE');

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: '...' }


    // --- HÀM GỌI API LẤY CHI TIẾT ĐƠN HÀNG ADMIN ---
    const fetchOrderDetail = useCallback(async (id) => {

        // Logic ánh xạ dữ liệu địa chỉ và tên khách hàng từ cấu trúc Backend
        const mapApiData = (data) => {
            const address = data.address;
            const customer = data.customer;

            // Lấy Tên Khách hàng từ cấu trúc Customer -> Account
            const customerFullName = customer?.account?.fullName;

            if (address) {
                data.shippingAddress = {
                    // Ưu tiên tên trong Address, sau đó là tên từ Customer Account
                    recipientName: address.fullName || customerFullName || 'Khách vãng lai', // SỬA N/A thành Khách vãng lai
                    phone: address.phone || 'N/A',
                    addressLine: [
                        address.address,
                        address.city,
                        address.state
                    ].filter(part => part).join(', ')
                };
            } else {
                data.shippingAddress = null;
            }

            // Thêm trường hiển thị tên khách hàng cho giao diện (tên tài khoản)
            // SỬA N/A thành Khách vãng lai
            data.displayCustomerName = customerFullName || 'Khách vãng lai';

            return data;
        };


        if (!isLoggedIn || !isAdminOrEmployee || !adminToken) {
            setError('Lỗi phân quyền: Yêu cầu tài khoản quản lý.');
            setLoading(false);
            return;
        }

        if (!id) {
            setError('Thiếu ID đơn hàng.');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${adminToken}`,
                },
            };

            const response = await axios.get(`${API_BASE_URL}/admin/${id}`, config);
            const finalData = mapApiData(response.data);

            setOrder(finalData);

        } catch (err) {
            console.error('Lỗi khi tải chi tiết đơn hàng:', err);
            const status = err.response?.status;
            if (status === 401 || status === 403) {
                setError('Lỗi phân quyền: Token không hợp lệ hoặc không phải Admin/Employee.');
            } else {
                setError(`Không thể tải chi tiết đơn hàng #${id}. Lỗi HTTP: ${status || 'Không rõ'}. Vui lòng kiểm tra ID hoặc trạng thái tồn tại của đơn hàng.`);
            }
        } finally {
            setLoading(false);
        }
    }, [isLoggedIn, isAdminOrEmployee, adminToken]);

    useEffect(() => {
        if (!authLoading) {
            fetchOrderDetail(orderId);
        }
    }, [orderId, authLoading, fetchOrderDetail]);

    // --- LOGIC HIỂN THỊ NÚT HÀNH ĐỘNG (Được giữ nguyên) ---
    const renderActionButtons = () => {
        return (
            <span className="text-sm text-gray-500 italic">
                (Không có thao tác nào trong chế độ quản lý)
            </span>
        );
    };

    // --- Xử lý tải dữ liệu và lỗi ---
    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
                <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 text-center text-lg text-gray-600">
                    Đang tải {authLoading ? 'thông tin xác thực' : 'chi tiết đơn hàng'}...
                </div>
            </div>
        );
    }

    // Kiểm tra quyền truy cập lần cuối
    if (!isLoggedIn || !isAdminOrEmployee || error) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
                <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 text-center text-lg text-red-500">
                    {error || 'Bạn không có quyền truy cập trang này.'}
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
                <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 text-center text-lg text-red-500">
                    Không tìm thấy đơn hàng.
                </div>
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

    const grandDiscountTotal = productDiscountTotal + orderDiscountAmount;
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

    // Lấy thông tin giao hàng đã được ánh xạ
    const shippingInfo = order.shippingAddress;


    return (
        <div className="min-h-screen flex flex-col bg-gray-50 font-sans">

            {/* MESSAGE BOX */}
            <MessageDisplay
                message={message}
                onClose={() => setMessage(null)}
            />

            <div className="flex-1 w-full mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
                {/* Breadcrumbs */}
                <div className="text-sm text-gray-500 mb-6 flex items-center">
                    <Link to="/" className="cursor-pointer hover:text-[#2B6377]">Home</Link>
                    <span className="mx-2">/</span>
                    <Link to="/admin/orders" className="cursor-pointer hover:text-[#2B6377]">Quản lý đơn hàng</Link>
                    <span className="mx-2">/</span>
                    <span className="font-medium text-[#2B6377]">Chi tiết đơn hàng</span>
                </div>

                <div className="flex gap-8">

                    {/* Main Content */}
                    <main className="flex-1">

                        {/* HEADER CHI TIẾT ĐƠN HÀNG */}
                        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                            <h2 className="text-xl font-semibold text-gray-800 mb-2">
                                CHI TIẾT ĐƠN HÀNG #{order.id} (KH: {order.displayCustomerName || 'Khách vãng lai'})
                            </h2>
                            <div className="flex justify-between items-center border-b pb-4 mb-4">
                                <p className="text-sm text-gray-500">
                                    Ngày đặt: <span className="font-medium text-gray-700">{orderDate}</span>
                                </p>
                                {/* KHÔNG CÓ NÚT THAO TÁC */}
                                {renderActionButtons()}
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
                            <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
                                Sản phẩm đã đặt
                            </h3>
                            {/* Header cột */}
                            <div className="hidden sm:flex font-semibold text-sm text-gray-800 bg-gray-50 p-2 rounded-t-lg">
                                <div className="w-2/5">Sản Phẩm</div>
                                <div className="text-center w-1/5">Số Lượng</div>
                                <div className="text-right w-1/5">Đơn Giá</div>
                                <div className="text-right w-1/5">Giảm Giá</div>
                                <div className="text-right w-1/5">Thành Tiền</div>
                            </div>

                            <div className="border-t border-gray-200 pt-2">
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
                                    <p className="flex flex-col">
                                        <span className="text-sm text-gray-500">Họ tên người nhận:</span>
                                        <span className="font-semibold text-gray-800">{shippingInfo?.recipientName || 'Khách vãng lai'}</span>
                                    </p>
                                    <p className="flex flex-col">
                                        <span className="text-sm text-gray-500">Số điện thoại:</span>
                                        <span className="font-semibold text-gray-800">{shippingInfo?.phone || 'N/A'}</span>
                                    </p>
                                    <p className="flex flex-col">
                                        <span className="text-sm text-gray-500">Địa chỉ:</span>
                                        <span className="font-semibold text-gray-800">{shippingInfo?.addressLine || 'N/A'}</span>
                                    </p>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-2 border-t pt-2">
                                    Nhân viên xử lý
                                </h3>
                                {/* Thông tin Employee (Mock) */}
                                <div className="text-sm text-gray-700">
                                    {/* Trong thực tế, bạn sẽ dùng order.employee.account.fullName */}
                                    <p>Tên: Lê Minh Tuấn (ID: 1)</p>
                                    <p>Thời gian xử lý: 2025-03-21</p>
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
                                    <div className="flex justify-between text-red-600">
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

                                    {/* Lý do hủy/Trả hàng (Nếu có) */}
                                    {order.status === 'CANCELLED' && order.cancelReason && (
                                        <div className="mt-4 p-3 bg-red-50 rounded-lg text-red-700 text-sm border border-red-200">
                                            <p className="font-semibold">Lý do Hủy:</p>
                                            <p>{order.cancelReason}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailManagement;