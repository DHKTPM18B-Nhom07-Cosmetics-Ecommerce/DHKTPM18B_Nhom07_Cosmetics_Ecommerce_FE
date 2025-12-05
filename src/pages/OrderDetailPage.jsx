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
    Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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

const AccountSidebar = () => (
    <div className="w-64 flex-shrink-0 bg-white p-4 rounded-lg shadow-sm font-sans sticky top-20 h-fit">
        <h3 className="font-semibold text-lg text-gray-800 mb-4 border-b pb-2">Tài khoản</h3>
        <nav className="space-y-2">
            <Link to="/order" className={`flex items-center p-2 ${TEAL_TEXT} ${TEAL_ACTIVE_BG} rounded-md font-medium transition`}>
                <Package className="w-4 h-4 mr-2" /> Quản lý đơn hàng
            </Link>
            <Link to="/profile" className={`flex items-center p-2 text-gray-700 hover:bg-red-50 rounded-md transition`}>
                <User className="w-4 h-4 mr-2" /> Thông tin cá nhân
            </Link>
            <Link to="/addresses" className={`flex items-center p-2 text-gray-700 hover:bg-red-50 rounded-md transition`}>
                <MapPin className="w-4 h-4 mr-2" /> Địa chỉ giao hàng
            </Link>
            <Link to="/logout" className={`flex items-center p-2 text-gray-700 hover:bg-red-50 rounded-md transition mt-4 border-t pt-2`}>
                <LogOut className="w-4 h-4 mr-2" /> Thoát
            </Link>
        </nav>
    </div>
);

/**
 * Hiển thị thông tin sản phẩm (tên, biến thể, ảnh)
 */
const ProductItemDisplay = ({ item }) => {

    const product = item.productVariant?.product;
    const productName = product?.name;
    const variantName = item.productVariant?.variantName;
    const primaryDisplay = productName || variantName || 'Sản phẩm không rõ';
    const secondaryInfo = (productName && variantName && productName !== variantName) ?
        `(${variantName})` :
        '';

    const placeholderImage = 'https://placehold.co/50x50/f5f5f5/f5f5f5.png?text=SP';

    let imageUrl = null;
    const productImages = product?.images;

    if (productImages && productImages.length > 0) {
        const firstImage = productImages[0];
        if (typeof firstImage === 'string') {
            imageUrl = firstImage;
        } else if (typeof firstImage === 'object' && firstImage !== null) {
            imageUrl = firstImage.image_url || firstImage.imageUrl;
        }
    }
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
                <p className="font-bold text-gray-800 leading-tight text-sm truncate" title={primaryDisplay}>
                    {primaryDisplay}
                </p>

                {secondaryInfo && (
                    <p className="text-xs text-gray-600 leading-snug truncate" title={secondaryInfo}>
                        {secondaryInfo}
                    </p>
                )}

                <p className="text-xs text-gray-500 mt-1">
                    Mã Variant: #{item.productVariant?.id || 'N/A'}
                </p>
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


// --- UTILITY COMPONENTS (Modal & Message Box) ---

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

// Confirmation Modal
const ConfirmModal = ({ isOpen, title, children, onConfirm, onCancel }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 font-sans">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 m-4">
                <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2 flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2 text-red-500" /> {title}
                </h3>
                <div className="text-gray-700 mb-6">
                    {children}
                </div>
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onCancel}
                        className="py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition duration-150 text-sm font-medium"
                    >
                        Không
                    </button>
                    <button
                        onClick={onConfirm}
                        className="py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-150 text-sm font-medium"
                    >
                        Xác nhận Hủy
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- COMPONENT CHÍNH: OrderDetailPage ---
const OrderDetailPage = () => {
    const { orderId } = useParams();

    // SỬA LỖI: Sử dụng useAuth thực tế
    const { user, isLoading: authLoading, isLoggedIn } = useAuth();
    const userToken = user?.token;

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State cho thông báo và modal
    const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
    const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: '...' }


    // Dữ liệu mock ĐÃ ĐƯỢC SỬA để phản ánh dữ liệu DB chính xác (Nguyễn Thị Mỹ Hoa)
    const [mockOrder] = useState({
        id: orderId || 'ORD-2024-001',
        orderDate: '2025-03-20T09:00:00',
        status: 'PENDING',
        orderDetails: [
            {
                id: 1,
                quantity: 2,
                unitPrice: '150000.00',
                totalPrice: 300000,
                discountAmount: '0.00',
                productVariant: {
                    id: 1,
                    variantName: '473ml (Da Dầu)',
                    price: 439000,
                    quantity: 100,
                    inStock: true,
                    product: {
                        name: 'Sữa Rửa Mặt CeraVe Sạch Sâu (MOCK)',
                        images: [{ id: 1, image_url: 'https://placehold.co/100x100/155724/FFFFFF?text=SP_CERAVE' }]
                    }
                }
            },
            {
                id: 2,
                quantity: 1,
                unitPrice: '250000.00',
                totalPrice: 250000,
                discountAmount: '0.00',
                productVariant: {
                    id: 2,
                    variantName: '236ml (Da Khô)',
                    price: 309000,
                    quantity: 100,
                    inStock: true,
                    product: {
                        name: 'Kem Dưỡng La Roche-Posay (MOCK)',
                        images: ['https://placehold.co/100x100/004085/FFFFFF?text=SP_LAROCHE']
                    }
                }
            },
        ],
        customer: { name: 'Nguyễn Thị Mỹ Hoa' },
        address: { // Dữ liệu này khớp với DB (address_id 6)
            fullName: 'Nguyễn Thị Mỹ Hoa',
            phone: '0963059030',
            address: '45 Huỳnh Tấn Phát',
            city: 'Quận 7',
            state: 'TPHCM',
            country: 'Việt Nam'
        },

        orderDiscountAmount: 50000,
        shippingFee: 30000,
    });


    // --- HÀM GỌI API LẤY CHI TIẾT ĐƠN HÀNG ---
    const fetchOrderDetail = useCallback(async (id) => {

        // 🚨 LOGIC ĐÃ SỬA: Ánh xạ dữ liệu địa chỉ chính xác từ Backend
        const mapApiData = (data) => {
            const address = data.address;
            const customer = data.customer;

            if (address) {
                data.shippingAddress = {
                    // SỬA LỖI HIỂN THỊ TÊN SAI: Ưu tiên tên trong Address
                    recipientName: address.fullName || customer?.name || 'N/A',
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
            return data;
        };

        if (!isLoggedIn || !userToken) {
            setError('Vui lòng đăng nhập để xem chi tiết đơn hàng này.');
            setLoading(false);
            return;
        }

        if (!id) {
            setOrder(mapApiData({ ...mockOrder }));
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${userToken}`,
                },
            };

            // const response = await axios.get(`${API_BASE_URL}/${id}`, config);
            // const finalData = mapApiData(response.data);

            // Dùng mock data để giả lập thành công
            const finalData = mapApiData({ ...mockOrder, id: id });
            setOrder(finalData);

        } catch (err) {
            console.error('Lỗi khi tải chi tiết đơn hàng:', err);
            const status = err.response?.status;
            if (status === 401 || status === 403) {
                setError('Phiên đăng nhập hết hạn hoặc không có quyền xem đơn hàng này. Vui lòng đăng nhập lại.');
            } else {
                setError(`Không thể tải chi tiết đơn hàng #${id}. Vui lòng kiểm tra kết nối hoặc quyền sở hữu.`);
            }
        } finally {
            setLoading(false);
        }
    }, [isLoggedIn, userToken, mockOrder]); // Thêm mockOrder để ổn định hóa hook

    useEffect(() => {
        if (!authLoading) {
            fetchOrderDetail(orderId);
        }
    }, [orderId, authLoading, fetchOrderDetail]);

    // --- HÀM CẬP NHẬT TRẠNG THÁI UI (được giữ nguyên) ---
    const updateOrderStatus = (newStatus) => {
        setOrder(prevOrder => ({
            ...prevOrder,
            status: newStatus
        }));
    };

    // --- HÀM HỦY ĐƠN HÀNG (được giữ nguyên) ---
    const handleCancelOrder = () => {
        if (order.status !== 'PENDING' && order.status !== 'CONFIRMED') {
            setMessage({ type: 'error', text: 'Chỉ đơn hàng đang ở trạng thái "Chờ xử lý" hoặc "Chờ xác nhận" mới có thể hủy.' });
            return;
        }

        if (!userToken) {
            setMessage({ type: 'error', text: 'Lỗi xác thực. Vui lòng đăng nhập lại.' });
            return;
        }

        setIsCancelConfirmOpen(true);
    };

    const confirmCancelOrder = async () => {
        setIsCancelConfirmOpen(false);

        const CANCEL_URL = `${API_BASE_URL}/${orderId}/cancel`;

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${userToken}`,
                },
            };

            // await axios.put(CANCEL_URL, {}, config); // Bỏ comment khi chạy với API thật

            // Giả lập thành công
            await new Promise(resolve => setTimeout(resolve, 500));

            updateOrderStatus('CANCELLED');
            setMessage({ type: 'success', text: `Đơn hàng #${orderId} đã được hủy thành công.` });
            fetchOrderDetail(orderId);

        } catch (err) {
            console.error('Lỗi khi hủy đơn hàng:', err);
            const errorMessage = err.response?.data?.message || 'Không thể hủy đơn hàng. Vui lòng kiểm tra lại quyền hạn.';
            setMessage({ type: 'error', text: `Lỗi hủy đơn hàng: ${errorMessage}` });
        }
    };


    // --- CÁC HÀM XỬ LÝ HÀNH ĐỘNG KHÁC (được giữ nguyên) ---
    const handleReorder = () => {
        setMessage({ type: 'info', text: 'Chức năng đặt lại đang được phát triển.' });
    };

    const handleReturn = () => {
        setMessage({ type: 'info', text: 'Chức năng yêu cầu trả hàng đang được phát triển.' });
    };

    const handleRate = () => {
        setMessage({ type: 'info', text: 'Chức năng đánh giá sản phẩm đang được phát triển.' });
    };


    // --- LOGIC HIỂN THỊ NÚT HÀNH ĐỘNG (được giữ nguyên) ---
    const renderActionButtons = (status) => {
        const baseClass = 'font-semibold py-2 px-4 rounded-md transition duration-200 shadow-sm text-sm flex items-center justify-center';

        switch (status) {
            case 'PENDING':
            case 'CONFIRMED':
                return (
                    <button
                        onClick={handleCancelOrder}
                        className={`${baseClass} bg-red-600 text-white hover:bg-red-700`}
                    >
                        Hủy Đơn Hàng
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

    // --- Xử lý tải dữ liệu và lỗi (được giữ nguyên) ---
    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
                <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 text-center text-lg text-gray-600">
                    Đang tải {authLoading ? 'thông tin xác thực' : 'chi tiết đơn hàng'}...
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
                <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 text-center text-lg text-red-500">
                    {error || 'Không tìm thấy đơn hàng.'}
                </div>
            </div>
        );
    }

    // --- LOGIC TÍNH TOÁN TỔNG KẾT (được giữ nguyên) ---
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


    // Format ngày giờ (được giữ nguyên)
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

    // Lấy thông tin giao hàng đã được ánh xạ (shippingInfo)
    const shippingInfo = order.shippingAddress;


    return (
        <div className="min-h-screen flex flex-col bg-gray-50 font-sans">

            {/* MESSAGE BOX */}
            <MessageDisplay
                message={message}
                onClose={() => setMessage(null)}
            />

            {/* CONFIRMATION MODAL */}
            <ConfirmModal
                isOpen={isCancelConfirmOpen}
                title="Xác nhận Hủy Đơn Hàng"
                onConfirm={confirmCancelOrder}
                onCancel={() => setIsCancelConfirmOpen(false)}
            >
                <p>Bạn có chắc chắn muốn hủy đơn hàng <span className="font-bold">#{order.id}</span> này không?</p>
                <p className="text-sm mt-2 text-red-500">Thao tác này không thể hoàn tác.</p>
            </ConfirmModal>

            <div className="flex-1 w-full mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
                {/* Breadcrumbs */}
                <div className="text-sm text-gray-500 mb-6 flex items-center">
                    <Link to="/" className="cursor-pointer hover:text-[#2B6377]">Home</Link>
                    <span className="mx-2">/</span>
                    <Link to="/account" className="cursor-pointer hover:text-[#2B6377]">Tài khoản</Link>
                    <span className="mx-2">/</span>
                    <Link to="/order" className="cursor-pointer hover:text-[#2B6377]">Quản lý đơn hàng</Link>
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
                                        <span className="text-sm text-gray-500">Họ tên:</span>
                                        <span className="font-semibold text-gray-800">{shippingInfo?.recipientName || 'N/A'}</span>
                                    </p>
                                    <p className="flex flex-col">
                                        <span className="text-sm text-gray-500">Số điện thoại:</span>
                                        <span className="font-semibold text-gray-800">{shippingInfo?.phone || 'N/A'}</span>
                                    </p>
                                    <p className="flex flex-col">
                                        <span className="text-sm text-gray-500">Địa chỉ giao hàng:</span>
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
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailPage;