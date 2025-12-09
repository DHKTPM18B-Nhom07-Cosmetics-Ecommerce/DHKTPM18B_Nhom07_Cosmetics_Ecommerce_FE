import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
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
} from "lucide-react";

// SỬ DỤNG AUTH CONTEXT
import { useAuth } from "../context/AuthContext";
import { notifySuccess, notifyError } from '../utils/toast';

// Định nghĩa URL cơ sở của API
const API_BASE_URL = "http://localhost:8080/api/orders";

// Màu chủ đạo
const TEAL_TEXT = "text-[#2B6377]";
const TEAL_BG = "bg-[#2B6377]";
const TEAL_HOVER_BG = "hover:bg-[#E6F3F5]";
const TEAL_ACTIVE_BG = "bg-[#CCDFE3]";

// Tùy chọn lý do hủy (Options)
const CANCEL_REASONS = [
    { value: "CHANGE_PRODUCT", label: "Thay đổi sản phẩm/kích cỡ" },
    { value: "CHANGE_ADDRESS", label: "Thay đổi địa chỉ giao hàng" },
    { value: "PRICE_ISSUE", label: "Tìm được giá tốt hơn" },
    { value: "NOT_NEEDED", label: "Không còn nhu cầu" },
    { value: "OTHER", label: "Lý do khác" },
];

// --- HÀM TIỆN ÍCH CHUNG VÀ CÁC COMPONENT PHỤ ---

const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return "N/A";
    const numericAmount =
        typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("vi-VN").format(Math.abs(numericAmount)) + "₫";
};

const getStatusStyle = (status) => {
    switch (status) {
        case "DELIVERED":
            return "bg-green-100 text-green-700 border-green-500";
        case "SHIPPING":
            return "bg-blue-100 text-blue-700 border-blue-500";
        case "PROCESSING":
            return "bg-yellow-100 text-yellow-700 border-yellow-500";
        case "CONFIRMED":
        case "PENDING":
            return "bg-purple-100 text-purple-700 border-purple-500";
        case "CANCELLED":
            return "bg-red-100 text-red-700 border-red-500";
        default:
            return "bg-gray-100 text-gray-700 border-gray-400";
    }
};

const translateStatus = (status) => {
    switch (status) {
        case "DELIVERED":
            return "Hoàn thành";
        case "SHIPPING":
            return "Đang giao";
        case "PROCESSING":
            return "Đang xử lý";
        case "CONFIRMED":
            return "Đã xác nhận";
        case "PENDING":
            return "Chờ xử lý";
        case "CANCELLED":
            return "Đã hủy";
        default:
            return status;
    }
};

const AccountSidebar = () => (
    <div className="w-64 flex-shrink-0 bg-white p-4 rounded-lg shadow-sm font-sans sticky top-20 h-fit">
        <h3 className="font-semibold text-lg text-gray-800 mb-4 border-b pb-2">
            Tài khoản
        </h3>
        <nav className="space-y-2">
            <Link
                to="/order"
                className={`flex items-center p-2 ${TEAL_TEXT} ${TEAL_ACTIVE_BG} rounded-md font-medium transition`}
            >
                <Package className="w-4 h-4 mr-2" /> Quản lý đơn hàng
            </Link>
            <Link
                to="/profile"
                className={`flex items-center p-2 text-gray-700 hover:bg-red-50 rounded-md transition`}
            >
                <User className="w-4 h-4 mr-2" /> Thông tin cá nhân
            </Link>
            <Link
                to="/addresses"
                className={`flex items-center p-2 text-gray-700 hover:bg-red-50 rounded-md transition`}
            >
                <MapPin className="w-4 h-4 mr-2" /> Địa chỉ giao hàng
            </Link>
            {/* Sử dụng window.location.href để mô phỏng logout nếu bạn chưa có component Logout riêng */}
            <a
                href="/logout"
                className={`flex items-center p-2 text-gray-700 hover:bg-red-50 rounded-md transition mt-4 border-t pt-2`}
            >
                <LogOut className="w-4 h-4 mr-2" /> Thoát
            </a>
        </nav>
    </div>
);

/**
 * Hiển thị thông tin sản phẩm (tên, biến thể, ảnh)
 */
const ProductItemDisplay = ({ item }) => {
    const product = item.productVariant?.product;
    const variantName = item.productVariant?.variantName;
    const placeholderImage =
        "https://placehold.co/50x50/f5f5f5/f5f5f5.png?text=SP";

    // 1. TÊN SẢN PHẨM CHÍNH (LẤY TỪ PRODUCT.NAME)
    const productName = product?.name || "Sản phẩm không rõ tên";

    // 2. TẠO CHUỖI HIỂN THỊ CHÍNH: Tên Sản phẩm [ + (Tên Biến thể) ]
    const primaryDisplay =
        productName === variantName
            ? productName
            : variantName
                ? `${productName} (${variantName})`
                : productName;

    // 3. LẤY URL ẢNH (Ưu tiên từ Variant.imageUrls)
    let imageUrl = null;
    const variantImages = item.productVariant?.imageUrls;

    if (variantImages && variantImages.length > 0) {
        imageUrl = variantImages[0]; // Ưu tiên ảnh của Variant
    } else if (product?.images && product.images.length > 0) {
        // Dự phòng: Lấy ảnh từ Product.images
        const firstImage = product.images[0];
        if (typeof firstImage === "string") {
            imageUrl = firstImage;
        } else if (typeof firstImage === "object" && firstImage !== null) {
            imageUrl = firstImage.image_url || firstImage.imageUrl;
        }
    }
    imageUrl = imageUrl || placeholderImage;

    return (
        <div className="flex items-start w-full">
            <img
                src={imageUrl}
                alt={primaryDisplay}
                onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = placeholderImage;
                }}
                className="w-16 h-16 object-cover rounded-sm mr-4 border border-gray-200 flex-shrink-0"
            />

            <div className="flex-grow min-w-0 pt-1">
                {/* Tên sản phẩm chính  */}
                <p
                    className="font-bold text-gray-800 leading-snug text-sm"
                    title={primaryDisplay}
                >
                    {primaryDisplay}
                </p>

                {/* Dòng phụ: Chỉ hiển thị tên biến thể nếu nó khác với tên chính */}
                {variantName && variantName !== productName && (
                    <p className="text-xs text-gray-500">Loại: {variantName}</p>
                )}
            </div>
        </div>
    );
};

// --- COMPONENT CHI TIẾT SẢN PHẨM (MỘT DÒNG) ---
const OrderItemRow = ({ item, orderStatus, orderId, onRateProduct, isReviewed }) => {
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
            <div className="text-center w-1/5 text-sm text-gray-700">{quantity}</div>

            {/* CỘT ĐƠN GIÁ */}
            <div className="text-right w-1/5 text-sm text-gray-700">
                {formatCurrency(unitPrice)}
            </div>

            {/* CỘT GIẢM GIÁ
            <div
                className={`text-right w-1/5 text-sm ${
                    discountAmount > 0 ? "text-red-600" : "text-gray-500"
                }`}
            >
                {discountAmount > 0 ? `-${formatCurrency(discountAmount)}` : "-"}
            </div> */}

            {/* CỘT THÀNH TIỀN */}
            <div className="text-right w-1/5 font-bold text-gray-800">
                {formatCurrency(lineTotal)}
            </div>

            {/* CỘT ĐÁNH GIÁ - Chỉ hiển thị khi đơn hàng đã hoàn thành */}
            {orderStatus === 'DELIVERED' && (
                <div className="w-1/6 text-center pl-2">
                    {isReviewed ? (
                        <button
                            disabled
                            className="inline-flex items-center justify-center px-3 py-1.5 bg-gray-200 border border-gray-300 text-gray-400 rounded-md text-sm font-medium cursor-not-allowed"
                        >
                            <Star className="w-4 h-4 mr-1" /> Đã đánh giá
                        </button>
                    ) : (
                        <button
                            onClick={() => onRateProduct(item)}
                            className="inline-flex items-center justify-center px-3 py-1.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md text-sm font-medium transition duration-150"
                        >
                            <Star className="w-4 h-4 mr-1" /> Đánh Giá
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};


// --- MODAL YÊU CẦU HỦY ĐƠN HÀNG (Đã thêm state lỗi cục bộ) ---
const CancelConfirmationModal = ({
                                     isOpen,
                                     orderId,
                                     onConfirmCancel,
                                     onCancel,
                                 }) => {
    if (!isOpen) return null;

    const [selectedReason, setSelectedReason] = useState(CANCEL_REASONS[0].value);
    const [otherReason, setOtherReason] = useState("");
    const [modalError, setModalError] = useState(null); // 💡 State lỗi cục bộ

    const isOtherReason = selectedReason === "OTHER";

    const handleConfirm = () => {
        setModalError(null); // Reset lỗi
        let finalReason = selectedReason;

        if (isOtherReason) {
            finalReason = otherReason.trim();
            if (!finalReason) {
                // Thay alert() bằng hiển thị lỗi trong modal
                setModalError("Vui lòng nhập chi tiết lý do khác.");
                return;
            }
        } else {
            // Lấy nhãn của lý do đã chọn
            finalReason =
                CANCEL_REASONS.find((r) => r.value === selectedReason)?.label ||
                "Lý do không xác định";
        }

        // Gửi lý do với prefix
        onConfirmCancel(orderId, `Yêu cầu hủy từ KH: ${finalReason}`);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-40 backdrop-blur-sm font-sans">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 m-4">
                <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2 flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2 text-red-500" /> Yêu cầu Hủy
                    Đơn hàng #{orderId}
                </h3>
                <div className="text-gray-700 mb-6 space-y-4">
                    <p className="text-sm">
                        Vui lòng chọn lý do hủy để gửi yêu cầu đến nhân viên. Đơn hàng chỉ
                        bị hủy khi nhân viên xác nhận.
                    </p>

                    {/* Chọn Lý do */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium mb-1">Lý do hủy:</label>
                        <select
                            value={selectedReason}
                            onChange={(e) => {
                                setSelectedReason(e.target.value);
                                setOtherReason("");
                                setModalError(null); // Reset lỗi
                            }}
                            className="px-3 py-2 border rounded-lg focus:ring-red-500 focus:border-red-500"
                        >
                            {CANCEL_REASONS.map((r) => (
                                <option key={r.value} value={r.value}>
                                    {r.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Lý do khác (nếu chọn "OTHER") */}
                    {isOtherReason && (
                        <div className="flex flex-col">
                            <label className="text-sm font-medium mb-1">
                                Chi tiết lý do khác:
                            </label>
                            <textarea
                                value={otherReason}
                                onChange={(e) => {
                                    setOtherReason(e.target.value);
                                    setModalError(null); // Reset lỗi
                                }}
                                rows="3"
                                className={`px-3 py-2 border rounded-lg focus:ring-red-500 focus:border-red-500 resize-none ${modalError ? 'border-red-500' : ''}`}
                                placeholder="Nhập lý do chi tiết..."
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

// --- COMPONENT CHÍNH: OrderDetailPage ---
const OrderDetailPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();

    // SỬ DỤNG AUTH CONTEXT
    const { user, isLoading: authLoading, isLoggedIn } = useAuth();
    const userToken = user?.token;

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [reviewedProducts, setReviewedProducts] = useState(new Set());

    // State cho modal
    const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);

    // --- HÀM KIỂM TRA SẢN PHẨM ĐÃ ĐƯỢC ĐÁNH GIÁ ---
    const checkReviewedProducts = useCallback(async (customerId, orderDetails) => {
        if (!customerId || !orderDetails || orderDetails.length === 0) {
            setReviewedProducts(new Set());
            return;
        }

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${userToken}`,
                },
            };

            // Gọi API lấy danh sách đánh giá của khách hàng
            const response = await axios.get(`http://localhost:8080/api/reviews/customer/${customerId}`, config);

            if (Array.isArray(response.data)) {
                const reviews = response.data;
                const reviewedProductIds = new Set();

                reviews.forEach(review => {
                    const productId = review.product?.id || review.productId;
                    if (productId) {
                        reviewedProductIds.add(productId);
                    }
                });

                setReviewedProducts(reviewedProductIds);
            } else {
                setReviewedProducts(new Set());
            }
        } catch (err) {
            console.error('Lỗi khi kiểm tra sản phẩm đã đánh giá:', err);
            setReviewedProducts(new Set());
        }
    }, [userToken]);


    // --- HÀM GỌI API LẤY CHI TIẾT ĐƠN HÀNG ---
    const fetchOrderDetail = useCallback(
        async (id) => {
            // Logic ánh xạ dữ liệu địa chỉ và tên khách hàng từ cấu trúc Customer -> Account
            const mapApiData = (data) => {
                const address = data.address;
                const customer = data.customer;

                const customerFullName = customer?.account?.fullName;
                const defaultName = "N/A";

                if (address) {
                    data.shippingAddress = {
                        recipientName: address.fullName || customerFullName || defaultName,
                        phone: address.phone || "N/A",
                        addressLine: [address.address, address.city, address.state]
                            .filter((part) => part)
                            .join(", "),
                    };
                } else {
                    data.shippingAddress = null;
                }

                data.displayCustomerName = customerFullName || defaultName;
                // Thêm tên nhân viên nếu có
                data.displayEmployeeName =
                    data.employee?.account?.fullName || "Chưa phân công";

                // Thêm customer ID cho việc kiểm tra review
                data.customerId = customer?.id;

                return data;
            };

            if (!isLoggedIn || !userToken) {
                setError("Vui lòng đăng nhập để xem chi tiết đơn hàng này.");
                setLoading(false);
                return;
            }

            if (!id) {
                setError("Thiếu ID đơn hàng.");
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

                // Gọi API Customer /api/orders/{id}
                const response = await axios.get(`${API_BASE_URL}/${id}`, config);
                const finalData = mapApiData(response.data);

                setOrder(finalData);

                // Kiểm tra sản phẩm đã được đánh giá ngay sau khi có Order Data
                // eslint-disable-next-line react-hooks/exhaustive-deps
                await checkReviewedProducts(finalData.customerId, finalData.orderDetails);

            } catch (err) {
                console.error("Lỗi khi tải chi tiết đơn hàng:", err);
                const status = err.response?.status;

                if (status === 401 || status === 403 || status === 404) {
                    setError(
                        "Không tìm thấy đơn hàng hoặc bạn không có quyền sở hữu đơn hàng này. Vui lòng kiểm tra lại."
                    );
                    notifyError("Không tìm thấy đơn hàng hoặc bạn không có quyền truy cập."); // 💡 Thêm Toast
                } else {
                    setError(
                        `Không thể tải chi tiết đơn hàng #${id}. Lỗi HTTP: ${
                            status || "Không rõ"
                        }.`
                    );
                    notifyError(`Không thể tải chi tiết đơn hàng #${id}. Vui lòng kiểm tra kết nối.`); // 💡 Thêm Toast
                }
            } finally {
                setLoading(false);
            }
        },
        [isLoggedIn, userToken, checkReviewedProducts]
    );

    useEffect(() => {
        if (!authLoading) {
            fetchOrderDetail(orderId);
        }
    }, [orderId, authLoading, fetchOrderDetail]);

    // --- HÀM NGHIỆP VỤ HỦY ĐƠN HÀNG ---

    // 1. Gửi yêu cầu hủy với lý do (Được gọi từ Modal)
    const confirmCancelOrderWithReason = async (orderId, cancelReason) => {
        setIsCancelConfirmOpen(false);

        const CANCEL_URL = `${API_BASE_URL}/${orderId}/cancel`;

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${userToken}`,
                },
                params: {
                    // Gửi lý do hủy qua query params
                    cancelReason: cancelReason,
                },
            };

            // Sử dụng axios.put và truyền null cho body
            const response = await axios.put(CANCEL_URL, null, config);

            // Cập nhật trạng thái hiển thị bằng dữ liệu trả về từ Backend
            setOrder(response.data);

            // 💡 Sử dụng notifySuccess
            notifySuccess(`Yêu cầu hủy đơn hàng #${orderId} đã được gửi thành công. Đơn hàng sẽ được hủy sau khi nhân viên xác nhận.`);

            // Re-fetch để cập nhật trạng thái mới nhất
            fetchOrderDetail(orderId);
        } catch (err) {
            console.error('Lỗi khi gửi yêu cầu hủy đơn hàng:', err);
            const errorMessage = err.response?.data?.message || 'Không thể hủy đơn hàng. Vui lòng kiểm tra trạng thái.';
            // 💡 Sử dụng notifyError
            notifyError(`Lỗi: ${errorMessage}`);
        }
    };


    // 2. Khởi tạo Modal khi nhấn nút Hủy
    const handleCancelOrder = () => {
        // Chỉ cho phép hủy khi là PENDING
        if (order.status !== 'PENDING') {
            // 💡 Sử dụng notifyError
            notifyError('Chỉ đơn hàng đang ở trạng thái "Chờ xử lý" mới có thể hủy.');
            return;
        }

        if (!userToken) {
            // 💡 Sử dụng notifyError
            notifyError('Lỗi xác thực. Vui lòng đăng nhập lại.');
            return;
        }

        setIsCancelConfirmOpen(true);
    };

    const handleReorder = () => {
        // 💡 Sử dụng notifyError
        notifyError('Chức năng đặt lại đang được phát triển.');
    };

    const handleReturn = () => {
        // 💡 Sử dụng notifyError
        notifyError('Chức năng yêu cầu trả hàng đang được phát triển.');
    };

    const handleRateProduct = (item) => {
        navigate('/review-product', {
            state: {
                orderId: orderId,
                preSelectedProduct: {
                    variantId: item.productVariant?.id,
                    productId: item.productVariant?.product?.id,
                    productName: item.productVariant?.product?.name || item.productVariant?.variantName,
                    variantName: item.productVariant?.variantName,
                }
            }
        });
    };


    const renderActionButtons = (status) => {
        const baseClass = 'font-semibold py-2 px-4 rounded-md transition duration-200 shadow-sm text-sm flex items-center justify-center';

        switch (status) {
            case 'PENDING':
                // Nút Hủy khi là PENDING
                return (
                    <button
                        onClick={handleCancelOrder} // Gọi hàm mở Modal
                        className={`${baseClass} bg-red-600 text-white hover:bg-red-700`}
                    >
                        Yêu cầu Hủy
                    </button>
                );
            case 'CONFIRMED':
            case 'PROCESSING':
            case 'SHIPPING':
                // KHÔNG CÓ NÚT HỦY/MUA LẠI/TRẢ HÀNG khi đang trong quá trình vận chuyển
                return <span className="text-gray-500 text-sm">Đang trong quy trình</span>;

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
                    </div>
                );
            case 'CANCELLED':
            case 'RETURNED':
            case 'REFUNDED':
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
                    {error || "Không tìm thấy đơn hàng."}
                </div>
            </div>
        );
    }

    // ===== TỔNG TIỀN =====
    const orderItems = order.orderDetails ?? [];

    // backend đã tính sẵn
    const subTotal = Number(order.subtotal ?? 0);
    const shippingFee = Number(order.shippingFee ?? 0);
    const orderDiscountAmount = Number(order.discountAmount ?? 0);

    // cộng discount item chỉ để HIỂN THỊ
    const productDiscountTotal = orderItems.reduce(
        (sum, item) => sum + Number(item.discountAmount || 0),
        0
    );

    // tổng giảm (display)
    const grandDiscountTotal = productDiscountTotal + orderDiscountAmount;

    // tổng thanh toán cuối – không được tính lại
    const finalTotal = Number(order.total ?? 0);

    // Format ngày giờ (được giữ nguyên)
    const orderDate = order.orderDate
        ? new Date(order.orderDate).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        }) +
        " - " +
        new Date(order.orderDate).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
        })
        : "N/A";

    // Lấy thông tin giao hàng đã được ánh xạ (shippingInfo)
    const shippingInfo = order.shippingAddress;

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
            {/* CONFIRMATION MODAL */}
            <CancelConfirmationModal
                isOpen={isCancelConfirmOpen}
                orderId={order.id}
                onConfirmCancel={confirmCancelOrderWithReason}
                onCancel={() => setIsCancelConfirmOpen(false)}
            />

            <div className="flex-1 w-full mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
                {/* Breadcrumbs */}
                <div className="text-sm text-gray-500 mb-6 flex items-center">
                    <Link to="/" className="cursor-pointer hover:text-[#2B6377]">
                        Home
                    </Link>
                    <span className="mx-2">/</span>
                    <Link to="/account" className="cursor-pointer hover:text-[#2B6377]">
                        Tài khoản
                    </Link>
                    <span className="mx-2">/</span>
                    <Link to="/order" className="cursor-pointer hover:text-[#2B6377]">
                        Quản lý đơn hàng
                    </Link>
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
                                CHI TIẾT ĐƠN HÀNG #{order.id} (KH:{" "}
                                {order.displayCustomerName || "N/A"})
                            </h2>
                            <div className="flex justify-between items-center border-b pb-4 mb-4">
                                <p className="text-sm text-gray-500">
                                    Ngày đặt:{" "}
                                    <span className="font-medium text-gray-700">{orderDate}</span>
                                </p>
                                {renderActionButtons(order.status)}
                            </div>

                            {/* Trạng thái hiện tại */}
                            <div className="flex justify-between items-center p-4 rounded-lg bg-gray-50 border border-gray-200">
                                <p className="font-semibold text-gray-700">
                                    Trạng thái hiện tại:
                                </p>
                                <span
                                    className={`px-4 py-2 text-sm font-bold rounded-lg border-2 ${getStatusStyle(
                                        order.status
                                    )}`}
                                >
                  {translateStatus(order.status)}
                </span>
                            </div>

                            {/* Lý do hủy/Trả hàng (Nếu có) */}
                            {(order.status === "CANCELLED" || order.status === "RETURNED") &&
                                order.cancelReason && (
                                    <div className="mt-4 p-3 bg-red-50 rounded-lg text-red-700 text-sm border border-red-200">
                                        <p className="font-semibold">Lý do Hủy/Trả hàng:</p>
                                        <p>{order.cancelReason}</p>
                                    </div>
                                )}
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
                                <div className="text-right w-1/5">Thành Tiền</div>
                                {order.status === 'DELIVERED' && (
                                    <div className="w-1/6 text-center">Đánh Giá</div>
                                )}
                            </div>

                            <div className="border-t border-gray-200 pt-2">
                                {orderItems.map((item) => {
                                    const productId = item.productVariant?.product?.id;
                                    const isReviewed = reviewedProducts.has(productId);

                                    return (
                                        <OrderItemRow
                                            key={item.id}
                                            item={item}
                                            orderStatus={order.status}
                                            orderId={order.id}
                                            onRateProduct={handleRateProduct}
                                            isReviewed={isReviewed}
                                        />
                                    );
                                })}
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
                                        <span className="font-semibold text-gray-800">
                      {shippingInfo?.recipientName || "N/A"}
                    </span>
                                    </p>
                                    <p className="flex flex-col">
                    <span className="text-sm text-gray-500">
                      Số điện thoại:
                    </span>
                                        <span className="font-semibold text-gray-800">
                      {shippingInfo?.phone || "N/A"}
                    </span>
                                    </p>
                                    <p className="flex flex-col">
                    <span className="text-sm text-gray-500">
                      Địa chỉ giao hàng:
                    </span>
                                        <span className="font-semibold text-gray-800">
                      {shippingInfo?.addressLine || "N/A"}
                    </span>
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
                                        <span className="font-medium">
                      {formatCurrency(subTotal)}
                    </span>
                                    </div>
                                    <div className="flex justify-between text-red-600">
                                        <span>Tổng giảm giá:</span>
                                        <span className="font-medium">
                      -{formatCurrency(grandDiscountTotal)}
                    </span>
                                    </div>
                                    <div className="flex justify-between text-gray-700 border-b pb-3">
                                        <span>Phí vận chuyển:</span>
                                        <span className="font-medium">
                      {formatCurrency(shippingFee)}
                    </span>
                                    </div>

                                    <div className="flex justify-between items-center pt-3">
                    <span className="text-lg font-bold text-gray-800">
                      Tổng thanh toán:
                    </span>
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