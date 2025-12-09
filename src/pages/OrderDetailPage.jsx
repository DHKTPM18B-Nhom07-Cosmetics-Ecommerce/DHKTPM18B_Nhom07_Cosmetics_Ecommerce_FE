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
      <div className="text-center w-1/5 text-sm text-gray-700">{quantity}</div>

      {/* CỘT ĐƠN GIÁ */}
      <div className="text-right w-1/5 text-sm text-gray-700">
        {formatCurrency(unitPrice)}
      </div>

      {/* CỘT GIẢM GIÁ */}
      <div
        className={`text-right w-1/5 text-sm ${
          discountAmount > 0 ? "text-red-600" : "text-gray-500"
        }`}
      >
        {discountAmount > 0 ? `-${formatCurrency(discountAmount)}` : "-"}
      </div>

      {/* CỘT THÀNH TIỀN */}
      <div className="text-right w-1/5 font-bold text-gray-800">
        {formatCurrency(lineTotal)}
      </div>
    </div>
  );
};

// --- UTILITY COMPONENTS (Message Display) ---

const MessageDisplay = ({ message, onClose }) => {
  if (!message) return null;

  const { type, text } = message;
  const baseClass =
    "fixed top-4 right-4 z-50 p-4 rounded-lg shadow-xl flex items-center max-w-sm transition-opacity duration-300";
  let style = {};
  let Icon = Info;

  switch (type) {
    case "success":
      style = {
        backgroundColor: "#D4EDDA",
        color: "#155724",
        border: "1px solid #C3E6CB",
      };
      Icon = CheckCircle;
      break;
    case "error":
      style = {
        backgroundColor: "#F8D7DA",
        color: "#721C24",
        border: "1px solid #F5C6CB",
      };
      Icon = XCircle;
      break;
    case "info":
    default:
      style = {
        backgroundColor: "#CCE5FF",
        color: "#004085",
        border: "1px solid #B8DAFF",
      };
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

// --- MODAL YÊU CẦU HỦY ĐƠN HÀNG (MỚI) ---
const CancelConfirmationModal = ({
  isOpen,
  orderId,
  onConfirmCancel,
  onCancel,
}) => {
  if (!isOpen) return null;

  const [selectedReason, setSelectedReason] = useState(CANCEL_REASONS[0].value);
  const [otherReason, setOtherReason] = useState("");

  const isOtherReason = selectedReason === "OTHER";

  const handleConfirm = () => {
    let finalReason = selectedReason;
    if (isOtherReason) {
      finalReason = otherReason.trim();
      if (!finalReason) {
        alert("Vui lòng nhập chi tiết lý do khác.");
        return;
      }
    } else {
      // Lấy nhãn của lý do đã chọn
      finalReason =
        CANCEL_REASONS.find((r) => r.value === selectedReason)?.label ||
        "Lý do không xác định";
    }

    onConfirmCancel(orderId, finalReason);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 font-sans">
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

  // State cho modal
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: '...' }

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
      } catch (err) {
        console.error("Lỗi khi tải chi tiết đơn hàng:", err);
        const status = err.response?.status;

        if (status === 401 || status === 403 || status === 404) {
          setError(
            "Không tìm thấy đơn hàng hoặc bạn không có quyền sở hữu đơn hàng này. Vui lòng kiểm tra lại."
          );
        } else {
          setError(
            `Không thể tải chi tiết đơn hàng #${id}. Lỗi HTTP: ${
              status || "Không rõ"
            }.`
          );
        }
      } finally {
        setLoading(false);
      }
    },
    [isLoggedIn, userToken]
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
      setMessage({
        type: "success",
        text: `Yêu cầu hủy đơn hàng #${orderId} đã được gửi thành công. Đơn hàng sẽ được hủy sau khi nhân viên xác nhận.`,
      });

      // Re-fetch để cập nhật trạng thái mới nhất
      fetchOrderDetail(orderId);
    } catch (err) {
      console.error("Lỗi khi gửi yêu cầu hủy đơn hàng:", err);
      const errorMessage =
        err.response?.data?.message ||
        "Không thể hủy đơn hàng. Vui lòng kiểm tra trạng thái.";
      setMessage({ type: "error", text: `Lỗi: ${errorMessage}` });
    }
  };

  // 2. Khởi tạo Modal khi nhấn nút Hủy
  const handleCancelOrder = () => {
    // Chỉ cho phép hủy khi là PENDING
    if (order.status !== "PENDING") {
      setMessage({
        type: "error",
        text: 'Chỉ đơn hàng đang ở trạng thái "Chờ xử lý" mới có thể hủy.',
      });
      return;
    }

    if (!userToken) {
      setMessage({
        type: "error",
        text: "Lỗi xác thực. Vui lòng đăng nhập lại.",
      });
      return;
    }

    setIsCancelConfirmOpen(true);
  };

  const handleReorder = () => {
    setMessage({
      type: "info",
      text: "Chức năng đặt lại đang được phát triển.",
    });
  };

  const handleReturn = () => {
    setMessage({
      type: "info",
      text: "Chức năng yêu cầu trả hàng đang được phát triển.",
    });
  };

  const handleRate = () => {
    navigate("/review-product", {
      state: {
        orderId: orderId,
      },
    });
  };

  const renderActionButtons = (status) => {
    const baseClass =
      "font-semibold py-2 px-4 rounded-md transition duration-200 shadow-sm text-sm flex items-center justify-center";

    switch (status) {
      case "PENDING":
        // Nút Hủy khi là PENDING
        return (
          <button
            onClick={handleCancelOrder} // Gọi hàm mở Modal
            className={`${baseClass} bg-red-600 text-white hover:bg-red-700`}
          >
            Yêu cầu Hủy
          </button>
        );
      case "CONFIRMED":
      case "PROCESSING":
      case "SHIPPING":
        // KHÔNG CÓ NÚT HỦY/MUA LẠI/TRẢ HÀNG khi đang trong quá trình vận chuyển
        return (
          <span className="text-gray-500 text-sm">Đang trong quy trình</span>
        );

      case "DELIVERED":
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
      case "CANCELLED":
      case "RETURNED":
      case "REFUNDED":
        return (
          <button
            onClick={handleReorder}
            className={`${baseClass} ${TEAL_BG} text-white hover:opacity-90`}
          >
            <ShoppingBag className="w-4 h-4 mr-2" /> Mua Lại
          </button>
        );
      default:
        return (
          <span className="text-gray-500 text-sm">
            Không có thao tác khả dụng
          </span>
        );
    }
  };

  // --- Xử lý tải dữ liệu và lỗi (được giữ nguyên) ---
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
        <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 text-center text-lg text-gray-600">
          Đang tải {authLoading ? "thông tin xác thực" : "chi tiết đơn hàng"}...
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
      {/* MESSAGE BOX */}
      <MessageDisplay message={message} onClose={() => setMessage(null)} />

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
                <div className="text-right w-1/5">Giảm Giá</div>
                <div className="text-right w-1/5">Thành Tiền</div>
              </div>

              <div className="border-t border-gray-200 pt-2">
                {orderItems.map((item) => (
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
