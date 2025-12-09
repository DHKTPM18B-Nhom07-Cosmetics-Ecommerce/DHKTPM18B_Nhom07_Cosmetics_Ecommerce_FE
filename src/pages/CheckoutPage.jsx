import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
// thông báo
import { toast } from "react-toastify";

import {
  getDefaultAddressForCurrentUser,
  getCustomerIdByAccountId,
  createOrder,
} from "../services/checkout";

import { getCartData, clearOrderedItems } from "../services/cartService";

import { getAllVouchers, applyVoucher } from "../services/voucherApi";

import Select from "react-select";

import {
  provinces,
  getDistrictsByProvince,
  getWardsByDistrict,
} from "../data/vietnamAddresses";

import { User, Phone, MapPin, ChevronRight, Lock, Truck } from "lucide-react";

import VoucherRuleModal from "../components/VoucherRuleModal";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: authUser } = useAuth();

  const selectedItemsData = location.state?.selectedItems;
  const selectedItemIds = location.state?.selectedItemIds; // nếu không dùng cũng không sao

  const [defaultAddress, setDefaultAddress] = useState({
    fullName: "",
    phone: "",
    fullAddressString: "",
  });
  const [addressObject, setAddressObject] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGuestCheckout, setIsGuestCheckout] = useState(false);
  const [noAddressFound, setNoAddressFound] = useState(false);

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [manualAddress, setManualAddress] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    province: null,
    district: null,
    ward: null,
    street: "",
    note: "",
  });
  const [availableDistricts, setAvailableDistricts] = useState([]);
  const [availableWards, setAvailableWards] = useState([]);

  const [cartData, setCartData] = useState(null);
  const [shippingMethod, setShippingMethod] = useState("standard");

  // ===== VOUCHER STATE =====
  const [selectedVouchers, setSelectedVouchers] = useState([]); // những voucher chọn từ list
  const [showRuleVoucher, setShowRuleVoucher] = useState(null); // modal rule
  const [voucherCode, setVoucherCode] = useState(""); // code nhập tay
  const [selectedVoucher, setSelectedVoucher] = useState(null); // label voucher đã áp dụng (string join)
  const [availableVouchers, setAvailableVouchers] = useState([]);
  const [applyingVoucher, setApplyingVoucher] = useState(false);
  const [voucherError, setVoucherError] = useState("");
  // voucher đã áp dụng thật (để gửi BE khi checkout)
  const [appliedVouchers, setAppliedVouchers] = useState([]);

  // tổng tiền giảm giá từ voucher
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  // giảm phí ship (BE trả về)
  const [shippingDiscount, setShippingDiscount] = useState(0);

  const shippingOptions = [
    {
      id: "standard",
      title: "Giao hàng tiêu chuẩn",
      subtitle: "Giao hàng trong 3-5 ngày làm việc",
      price: 30000,
    },
    {
      id: "fast",
      title: "Giao hàng nhanh",
      subtitle: "Giao hàng trong 1-2 ngày làm việc",
      price: 60000,
    },
    {
      id: "express",
      title: "Giao hàng trong ngày",
      subtitle: "Nhận hàng trong vòng 24 giờ",
      price: 100000,
    },
  ];

  const subtotal =
    cartData?.items?.reduce((sum, item) => {
      const price = item.salePrice || item.originalPrice || item.price || 0;
      return sum + price * (item.quantity || 1);
    }, 0) || 0;

  const baseShippingFee =
    shippingOptions.find((o) => o.id === shippingMethod)?.price || 0;
  const shippingFee = Math.max(0, baseShippingFee - shippingDiscount);

  const discount = appliedDiscount; // hiện đang = 0, BE mới là nơi trừ tiền thật
  const total = subtotal + shippingFee - discount;

  const hasValidAddress = showAddressForm
    ? manualAddress.firstName &&
      manualAddress.lastName &&
      manualAddress.email &&
      manualAddress.phone &&
      manualAddress.province &&
      manualAddress.district &&
      manualAddress.street
    : defaultAddress.fullName &&
      defaultAddress.phone &&
      defaultAddress.fullAddressString;

  const hasCartItems = cartData?.items && cartData.items.length > 0;

  // =============================
  // FETCH DEFAULT ADDRESS / GUEST
  // =============================

  useEffect(() => {
    const fetchDefaultAddress = async () => {
      try {
        const userStored = localStorage.getItem("user");
        if (!userStored) {
          console.log("Guest checkout mode - no user logged in");
          setIsGuestCheckout(true);
          setShowAddressForm(true);
          return;
        }

        setIsGuestCheckout(false);
        const addr = await getDefaultAddressForCurrentUser();
        if (!addr) {
          console.warn("No default address found for current user");
          setNoAddressFound(true);
          setShowAddressForm(false);
          return;
        }

        setNoAddressFound(false);
        setAddressObject(addr);
        setDefaultAddress({
          fullName: addr.fullName || addr.receiverName || "",
          phone: addr.phone || addr.phoneNumber || addr.receiverPhone || "",
          fullAddressString: `${addr.address || addr.street || ""}${
            addr.city ? ", " + addr.city : ""
          }${addr.state ? ", " + addr.state : ""}${
            addr.country ? ", " + addr.country : ""
          }`,
        });
        setShowAddressForm(false);
      } catch (error) {
        console.error("Failed to load address: ", error);
        setShowAddressForm(true);
      }
    };

    fetchDefaultAddress();
  }, []);

  // ============
  // FETCH CART
  // ============

  useEffect(() => {
    const fetchCart = async () => {
      try {
        if (selectedItemsData) {
          setCartData(selectedItemsData);
        } else {
          const data = await getCartData();
          if (data) setCartData(data);
        }
      } catch (err) {
        console.warn("Failed to load cart data", err);
      }
    };

    fetchCart();
  }, [authUser, selectedItemsData]);

  // ===============
  // FETCH VOUCHERS
  // ===============

  useEffect(() => {
    const loadVouchers = async () => {
      try {
        const userStored = localStorage.getItem("user");
        if (!userStored) {
          setAvailableVouchers([]);
          return;
        }

        const response = await getAllVouchers();
        const raw =
          response?.data?.content ||
          response?.data?.data ||
          response?.data ||
          [];

        const now = new Date();

        // ✅ LỌC HẾT HẠN + INACTIVE
        const filtered = raw.filter((v) => {
          if (v.status && v.status !== "ACTIVE") return false;

          const endDate = v.endAt
            ? new Date(v.endAt)
            : v.endDate
            ? new Date(v.endDate)
            : null;

          if (endDate && endDate < now) return false;

          return true;
        });

        setAvailableVouchers(filtered);
      } catch (error) {
        console.error("Failed to load vouchers:", error);
        setAvailableVouchers([]);
      }
    };

    loadVouchers();
  }, []);

  // ============================
  // ADDRESS SELECT HANDLERS
  // ============================

  const handleProvinceChange = (selectedOption) => {
    setManualAddress({
      ...manualAddress,
      province: selectedOption,
      district: null,
      ward: null,
    });
    setAvailableDistricts(getDistrictsByProvince(selectedOption.value) || []);
    setAvailableWards([]);
  };

  const handleDistrictChange = (selectedOption) => {
    setManualAddress({
      ...manualAddress,
      district: selectedOption,
      ward: null,
    });
    setAvailableWards(
      getWardsByDistrict(manualAddress.province.value, selectedOption.value) ||
        []
    );
  };

  const handleWardChange = (selectedOption) => {
    setManualAddress({
      ...manualAddress,
      ward: selectedOption,
    });
  };

  // Tính thử mức giảm giá để hiển thị trên UI (backend vẫn kiểm tra khi đặt hàng)
  const calculateVoucherSavings = (vouchers, orderSubtotal, currentShippingFee) => {
    let discountAmount = 0;
    let shipDiscount = 0;

    vouchers.forEach((voucher) => {
      if (!voucher) return;

      // Không đủ điều kiện đơn tối thiểu
      if (voucher.minOrderAmount && orderSubtotal < voucher.minOrderAmount) {
        return;
      }

      const type = voucher.type;
      const value = Number(voucher.value) || 0;

      if (type === "AMOUNT") {
        discountAmount += Math.max(0, value);
      } else if (type === "PERCENT") {
        const raw = Math.floor((orderSubtotal * value) / 100);
        const capped = voucher.maxDiscount ? Math.min(raw, voucher.maxDiscount) : raw;
        discountAmount += Math.max(0, capped);
      } else if (type === "SHIPPING_FREE") {
        const cap = voucher.maxDiscount || 50000; // default cap nếu BE không trả về
        shipDiscount = Math.max(shipDiscount, Math.min(currentShippingFee, cap));
      }
    });

    // Không cho giảm quá subtotal
    discountAmount = Math.min(discountAmount, orderSubtotal);

    return { discountAmount, shipDiscount };
  };

  // VOUCHER TOGGLE + RULES

  const toggleVoucher = (voucher) => {
    setSelectedVouchers((prev) => {
      const exists = prev.find((v) => v.id === voucher.id);

      if (exists) {
        return prev.filter((v) => v.id !== voucher.id);
      }

      // chỉ chặn freeship chồng freeship
      if (
        voucher.type === "SHIPPING_FREE" &&
        prev.some((v) => v.type === "SHIPPING_FREE")
      ) {
        return prev;
      }

      // giới hạn tối đa 3 cho UX (BE xử đúng/sai)
      if (prev.length >= 3) return prev;

      return [...prev, voucher];
    });
  };

  // Lý do voucher bị disable
  const getVoucherDisableReason = (voucher) => {
    // HẾT HẠN
    if (isVoucherExpired(voucher)) {
      return "Voucher đã hết hạn";
    }

    // HẾT LƯỢT TOÀN HỆ THỐNG
    if (
      voucher.maxUses != null &&
      voucher.usedCount != null &&
      voucher.usedCount >= voucher.maxUses
    ) {
      return "Voucher đã hết lượt sử dụng";
    }

    // USER DÙNG HẾT LƯỢT
    if (
      voucher.perUserLimit != null &&
      voucher.usedByUser != null &&
      voucher.usedByUser >= voucher.perUserLimit
    ) {
      return "Bạn đã dùng hết lượt voucher này";
    }

    // CHƯA ĐỦ ĐƠN TỐI THIỂU
    if (voucher.minOrderAmount && subtotal < voucher.minOrderAmount) {
      return "Đơn hàng chưa đạt giá trị tối thiểu";
    }

    // KHÔNG CHO STACK
    if (
      !voucher.stackable &&
      selectedVouchers.length > 0 &&
      !selectedVouchers.some((v) => v.id === voucher.id)
    ) {
      return "Voucher này không áp dụng cùng voucher khác";
    }

    return "";
  };

  // APPLY VOUCHER
  const handleRemoveVoucher = () => {
    setSelectedVoucher(null);
    setAppliedVouchers([]);
    setSelectedVouchers([]);
    setAppliedDiscount(0);
    setShippingDiscount(0);
    setVoucherCode("");
    setVoucherError("");
  };

  // sửa
  const handleApplyVoucher = async () => {
    const hasCode = !!voucherCode.trim();
    const hasSelection = selectedVouchers.length > 0;

    if (!hasCode && !hasSelection) {
      setVoucherError("Vui lòng nhập mã hoặc chọn voucher");
      return;
    }

    if (!cartData?.items?.length) {
      setVoucherError("Giỏ hàng trống");
      return;
    }

    setApplyingVoucher(true);
    setVoucherError("");

    try {
      // CHỈ GOM CODE
      const codes = hasCode
        ? [voucherCode.trim().toUpperCase()]
        : selectedVouchers.map((v) => v.code);

      // Tìm object voucher tương ứng để ước lượng giảm giá
      const voucherObjects = hasCode
        ? availableVouchers.filter((v) => codes.includes(v.code))
        : selectedVouchers;

      const { discountAmount, shipDiscount } = calculateVoucherSavings(
        voucherObjects,
        subtotal,
        baseShippingFee
      );

      // LƯU CODE ĐỂ GỬI BE KHI CHECKOUT
      setAppliedVouchers(codes.map((code) => ({ code })));

      // HIỂN THỊ CHO USER BIẾT ĐÃ CHỌN
      setSelectedVoucher({
        code: codes.join(" + "),
      });

      // HIỂN THỊ SỐ TIỀN GIẢM
      setAppliedDiscount(discountAmount);
      setShippingDiscount(shipDiscount);

      setVoucherError("");
    } catch (err) {
      setVoucherError("Không thể áp dụng voucher");
      handleRemoveVoucher();
    } finally {
      setApplyingVoucher(false);
    }
  };

  // Khi đổi phương thức vận chuyển hoặc subtotal đổi, tính lại mức giảm phí ship/giảm giá hiển thị
  useEffect(() => {
    if (!selectedVoucher || appliedVouchers.length === 0) return;

    const voucherObjects = availableVouchers.filter((v) =>
      appliedVouchers.some((applied) => applied.code === v.code)
    );

    const { discountAmount, shipDiscount } = calculateVoucherSavings(
      voucherObjects,
      subtotal,
      baseShippingFee
    );

    setAppliedDiscount(discountAmount);
    setShippingDiscount(shipDiscount);
  }, [shippingMethod, subtotal, appliedVouchers, availableVouchers, baseShippingFee, selectedVoucher]);

  // ============
  // CHECKOUT
  // ============
  const handleCheckout = async () => {
    if (!hasValidAddress) {
      toast.warn("Vui lòng thêm địa chỉ giao hàng để thanh toán!");

      return;
    }

    if (!hasCartItems) {
      toast.warn("Giỏ hàng trống! Vui lòng thêm sản phẩm.");
      return;
    }

    try {
      setIsSubmitting(true);

      // XÁC ĐỊNH CUSTOMER
      const userStored = localStorage.getItem("user");
      let customerId = null;

      if (userStored) {
        const user = JSON.parse(userStored);
        const accountId = user.id;

        const fetchedCustomerId = await getCustomerIdByAccountId(accountId);

        if (!fetchedCustomerId) {
          toast.error("Không tìm thấy thông tin khách hàng.");
          return;
        }

        customerId = Number(fetchedCustomerId);

        if (isNaN(customerId)) {
          toast.error("Customer ID không hợp lệ.");
          return;
        }
      } else {
        customerId = null; // guest
      }

      // ADDRESS INFO
      let addressInfo = null;

      if (showAddressForm) {
        const fullName =
          `${manualAddress.firstName} ${manualAddress.lastName}`.trim();

        if (!fullName || !manualAddress.phone || !manualAddress.street) {
          throw new Error("Vui lòng nhập đầy đủ Họ tên, SĐT và Địa chỉ.");
        }

        addressInfo = {
          shippingFullName: fullName,
          shippingPhone: manualAddress.phone,
          shippingAddress: manualAddress.street,
          shippingCity: manualAddress.district?.label || "",
          shippingState: manualAddress.province?.label || "",
          shippingCountry: "Vietnam",
        };
      } else if (userStored && addressObject) {
        addressInfo = {
          shippingFullName: addressObject.fullName,
          shippingPhone:
            manualAddress.phone ||
            authUser?.phoneNumber ||
            addressObject?.phone ||
            "",
          shippingAddress: addressObject.address,
          shippingCity: addressObject.city,
          shippingState: addressObject.state,
          shippingCountry: addressObject.country || "Vietnam",
        };
      }

      if (!addressInfo) {
        throw new Error("Thiếu thông tin địa chỉ giao hàng.");
      }

      // VALIDATE + NORMALIZE PHONE
      if (!addressInfo.shippingPhone) {
        toast.error("Thiếu số điện thoại giao hàng");
        return;
      }

      // bỏ ký tự không phải số
      addressInfo.shippingPhone = addressInfo.shippingPhone.replace(/\D/g, "");

      if (
        addressInfo.shippingPhone.length < 9 ||
        addressInfo.shippingPhone.length > 12
      ) {
        toast.error("Số điện thoại không hợp lệ");
        return;
      }

      console.log("☎️ PHONE GỬI BE:", addressInfo.shippingPhone);

      // ORDER DETAILS
      const orderDetails = cartData.items.map((item) => {
        if (!item.variantId) {
          throw new Error(`Sản phẩm ${item.productName} thiếu variantId`);
        }

        const price = item.salePrice || item.originalPrice || item.price || 0;

        if (price <= 0) {
          throw new Error(`Giá sản phẩm ${item.productName} không hợp lệ`);
        }

        return {
          productVariantId: Number(item.variantId),
          quantity: Number(item.quantity || 1),
        };
      });

      // Dùng danh sách voucher đã áp dụng thật
      const voucherCodes = appliedVouchers.map((v) => v.code);

      const orderPayload = {
        customerId,
        shippingFee: shippingFee,
        voucherCodes,
        orderDetails,
        ...addressInfo,
      };

      console.log("📦 ORDER PAYLOAD:", orderPayload);
      console.log("📞 SHIPPING PHONE FINAL:", addressInfo.shippingPhone);

      // CREATE ORDER
      const createdOrder = await createOrder(orderPayload);

      console.log("✅ ORDER CREATED:", createdOrder);

      const orderId = createdOrder?.id;

      toast.success(
        `Đặt hàng thành công${orderId ? ` • Mã đơn: ${orderId}` : ""}`,
        { autoClose: 3000 }
      );

      // CLEAR CART
      await clearOrderedItems(cartData.items);

      // REDIRECT
      if (!userStored) {
        navigate("/order-success", {
          state: {
            order: {
              id: orderId,
              totalAmount: total,
              shippingFee,
              discount,
            },
            isGuest: !userStored,
          },
        });
      } else {
        navigate(`/orders/${orderId}`);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Đặt hàng thất bại. Vui lòng thử lại.",
        { autoClose: 3000 }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatVoucherType = (type) => {
    switch (type) {
      case "PERCENT":
        return "Giảm %";
      case "AMOUNT":
        return "Giảm tiền";
      case "SHIPPING_FREE":
        return "Miễn phí ship";
      default:
        return type;
    }
  };

  // kiểm tra voucher hết hạn
  const isVoucherExpired = (voucher) => {
    const now = Date.now();

    if (voucher.status && voucher.status !== "ACTIVE") return true;

    const rawEnd = voucher.endAt || voucher.endDate;

    if (!rawEnd) return false;

    const end = new Date(rawEnd.replace(" ", "T")).getTime();

    return isNaN(end) || end < now;
  };

  // ==================
  // RENDER
  // ==================
  return (
    <div className="min-h-screen bg-[#FAF9F6] font-sans text-[#1f2d3d]">
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        <div className="flex items-center text-sm text-gray-500 mb-6 gap-2">
          <span
            className="cursor-pointer hover:text-[#2B5F68]"
            onClick={() => navigate("/")}
          >
            Trang chủ
          </span>
          <ChevronRight size={14} />
          <span
            className="cursor-pointer hover:text-[#2B5F68]"
            onClick={() => navigate("/cart")}
          >
            Giỏ hàng
          </span>
          <ChevronRight size={14} />
          <span className="text-[#2B5F68] font-semibold">Thanh toán</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* LEFT */}
          <div className="w-full lg:w-2/3 space-y-6">
            {isGuestCheckout && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-blue-900">
                    Bạn đang thanh toán mà không đăng nhập
                  </h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Vui lòng điền đầy đủ thông tin giao hàng bên dưới để tiếp
                    tục đặt hàng.
                  </p>
                </div>
              </div>
            )}

            {/* SHIPPING INFO */}
            <div className="bg-white rounded-2xl p-6 shadow-[0_6px_20px_rgba(45,55,72,0.06)] border border-[#f0ece8]">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-serif text-[#567A85] text-xl tracking-wide uppercase">
                  Thông tin giao hàng
                </h3>
                {!showAddressForm && !noAddressFound && (
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="text-xs bg-[#f3f8f8] px-3 py-1.5 rounded-md text-[#2B5F68] font-semibold hover:bg-[#e6f2f2]"
                  >
                    Thay đổi địa chỉ
                  </button>
                )}
              </div>

              {noAddressFound ? (
                <div className="py-8 px-4 text-center">
                  <MapPin size={48} className="mx-auto text-[#bfcfcf] mb-4" />
                  <h4 className="text-lg font-semibold text-[#12343b] mb-2">
                    Bạn chưa có địa chỉ giao hàng
                  </h4>
                  <p className="text-sm text-[#7b8a8b] mb-6">
                    Vui lòng thêm địa chỉ để tiếp tục thanh toán
                  </p>
                  <button
                    onClick={() => navigate("/add-address")}
                    className="px-6 py-2.5 bg-[#2B5F68] text-white font-semibold rounded-lg hover:bg-[#224b4b] transition-all"
                  >
                    Thêm địa chỉ giao hàng
                  </button>
                </div>
              ) : showAddressForm ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-[#8da0a0] uppercase tracking-wider font-semibold mb-2">
                        Họ <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Nguyễn"
                        value={manualAddress.firstName}
                        onChange={(e) =>
                          setManualAddress({
                            ...manualAddress,
                            firstName: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2B5F68]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#8da0a0] uppercase tracking-wider font-semibold mb-2">
                        Tên <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Văn A"
                        value={manualAddress.lastName}
                        onChange={(e) =>
                          setManualAddress({
                            ...manualAddress,
                            lastName: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2B5F68]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-[#8da0a0] uppercase tracking-wider font-semibold mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="example@email.com"
                      value={manualAddress.email}
                      onChange={(e) =>
                        setManualAddress({
                          ...manualAddress,
                          email: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2B5F68]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-[#8da0a0] uppercase tracking-wider font-semibold mb-2">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="0912 345 678"
                      value={manualAddress.phone}
                      onChange={(e) =>
                        setManualAddress({
                          ...manualAddress,
                          phone: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2B5F68]"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-[#8da0a0] uppercase tracking-wider font-semibold mb-2">
                        Tỉnh/Thành phố <span className="text-red-500">*</span>
                      </label>
                      <Select
                        value={manualAddress.province}
                        onChange={handleProvinceChange}
                        options={provinces}
                        placeholder="Chọn tỉnh/thành"
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#8da0a0] uppercase tracking-wider font-semibold mb-2">
                        Quận/Huyện <span className="text-red-500">*</span>
                      </label>
                      <Select
                        value={manualAddress.district}
                        onChange={handleDistrictChange}
                        options={availableDistricts}
                        placeholder="Chọn quận/huyện"
                        isDisabled={!manualAddress.province}
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#8da0a0] uppercase tracking-wider font-semibold mb-2">
                        Phường/Xã
                      </label>
                      <Select
                        value={manualAddress.ward}
                        onChange={handleWardChange}
                        options={availableWards}
                        placeholder="Chọn phường/xã"
                        isDisabled={!manualAddress.district}
                        className="text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-[#8da0a0] uppercase tracking-wider font-semibold mb-2">
                      Địa chỉ cụ thể <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Số nhà, tên đường"
                      value={manualAddress.street}
                      onChange={(e) =>
                        setManualAddress({
                          ...manualAddress,
                          street: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2B5F68]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-[#8da0a0] uppercase tracking-wider font-semibold mb-2">
                      Ghi chú đơn hàng (tùy chọn)
                    </label>
                    <textarea
                      placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay chỉ dẫn địa điểm giao hàng chi tiết hơn"
                      value={manualAddress.note}
                      onChange={(e) =>
                        setManualAddress({
                          ...manualAddress,
                          note: e.target.value,
                        })
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2B5F68]"
                    />
                  </div>
                </div>
              ) : (
                <div className="pl-3 space-y-4 border-l-2 border-[#ecf3f3]">
                  <div className="flex gap-4 items-start">
                    <div className="text-[#2B5F68]">
                      <User size={18} />
                    </div>
                    <div>
                      <p className="text-[11px] text-[#8da0a0] uppercase tracking-wider font-semibold mb-1">
                        Họ tên
                      </p>
                      <p className="font-semibold text-[#12343b]">
                        {defaultAddress.fullName || (
                          <span className="text-gray-400 italic">
                            Chưa có thông tin
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="text-[#2B5F68]">
                      <Phone size={18} />
                    </div>
                    <div>
                      <p className="text-[11px] text-[#8da0a0] uppercase tracking-wider font-semibold mb-1">
                        Số điện thoại
                      </p>
                      <p className="font-semibold text-[#12343b]">
                        {defaultAddress.phone || (
                          <span className="text-gray-400 italic">
                            Chưa có thông tin
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="text-[#2B5F68]">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <p className="text-[11px] text-[#8da0a0] uppercase tracking-wider font-semibold mb-1">
                        Địa chỉ giao hàng
                      </p>
                      <p className="font-semibold text-[#12343b]">
                        {defaultAddress.fullAddressString || (
                          <span className="text-gray-400 italic">
                            Chưa có thông tin
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* SHIPPING METHOD */}
            <div className="bg-white rounded-2xl p-6 shadow-[0_6px_20px_rgba(45,55,72,0.06)] border border-[#f0ece8]">
              <h3 className="font-serif text-[#567A85] text-xl tracking-wide uppercase mb-4">
                Phương thức vận chuyển
              </h3>

              <div className="space-y-3">
                {shippingOptions.map((option) => {
                  const active = shippingMethod === option.id;
                  return (
                    <div
                      key={option.id}
                      onClick={() => setShippingMethod(option.id)}
                      className={`flex justify-between items-center p-4 rounded-lg cursor-pointer transition-all ${
                        active
                          ? "ring-1 ring-[#2B5F68] bg-[#eaf6f6] border border-[#2B5F68]"
                          : "border border-[#e8e6e4] hover:border-[#b8d6d4]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center ${
                            active
                              ? "border-2 border-[#2B5F68]"
                              : "border border-gray-300"
                          }`}
                        >
                          <div
                            className={`${
                              active ? "w-2 h-2 bg-[#2B5F68] rounded-full" : ""
                            }`}
                          />
                        </div>
                        <div>
                          <div
                            className={`font-semibold ${
                              active ? "text-[#12343b]" : "text-[#23373a]"
                            }`}
                          >
                            {option.title}
                          </div>
                          <div className="text-xs text-[#7b8a8b]">
                            {option.subtitle}
                          </div>
                        </div>
                      </div>
                      <div className="font-semibold text-[#12343b]">
                        {active && shippingDiscount > 0 ? (
                          <span className="text-green-600">
                            Giảm {shippingDiscount.toLocaleString()}₫
                          </span>
                        ) : (
                          `${option.price.toLocaleString()}₫`
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PAYMENT METHOD */}
            <div className="bg-white rounded-2xl p-6 shadow-[0_6px_20px_rgba(45,55,72,0.06)] border border-[#f0ece8]">
              <h3 className="font-serif text-[#567A85] text-xl tracking-wide uppercase mb-4">
                Phương thức thanh toán
              </h3>

              <div className="p-3 rounded-lg border border-[#dfe9e9] bg-white flex items-start gap-3">
                <div className="w-5 h-5 rounded-full border-2 border-[#2B5F68] flex items-center justify-center">
                  <div className="w-2 h-2 bg-[#2B5F68] rounded-full" />
                </div>
                <div>
                  <div className="font-semibold text-[#12343b]">
                    Thanh toán khi nhận hàng (COD)
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 border border-[#f0ece8] bg-[#fbfaf9] text-sm text-[#6b7b7b] rounded-md">
                <ol className="list-decimal ml-4 space-y-2">
                  <li>
                    <p>
                      Khi click vào nút hoàn tất đơn hàng thì đơn hàng sẽ được
                      hệ thống tự động xác nhận mà không cần phải gọi qua điện
                      thoại, nếu điền thông tin địa chỉ và số điện thoại chính
                      xác thì đơn hàng sẽ được vận chuyển từ 3-4-5 ngày tùy vùng
                      miền.
                    </p>
                  </li>
                  <li>
                    <p>
                      Trường hợp đặt hàng xong nhưng muốn HỦY ĐƠN, vui lòng soạn
                      tin nhắn theo cú pháp: SĐT ĐÃ ĐẶT ĐƠN (hoặc MÃ ĐƠN hoặc
                      GMAIL ĐƠN HÀNG) + TÊN NGƯỜI NHẬN sau đó gửi qua các kênh
                      online: Page Facebook, Intagram.
                    </p>
                  </li>
                </ol>
              </div>
            </div>
          </div>

          {/* RIGHT - ORDER SUMMARY */}
          <aside className="w-full lg:w-1/3">
            <div className="bg-white rounded-2xl p-6 shadow-[0_6px_20px_rgba(45,55,72,0.06)] border border-[#f0ece8] sticky top-6">
              <h3 className="font-serif text-[#567A85] text-xl tracking-wide uppercase mb-4">
                Đơn hàng của bạn
              </h3>

              <div className="space-y-4 mb-4 max-h-56 overflow-y-auto pr-2">
                {cartData?.items?.map((item, idx) => (
                  <div key={item.id} className="flex gap-3 items-start">
                    <div className="relative">
                      <img
                        src={item.productImage || item.thumbnail}
                        alt={item.productName}
                        className="w-16 h-16 rounded-md object-cover border border-[#f0f0f0] bg-gray-50"
                      />
                      <div className="absolute -top-2 -left-2 bg-[#eaf6f6] text-[#2B5F68] text-xs font-semibold w-5 h-5 rounded-full flex items-center justify-center border border-white">
                        {idx + 1}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-[#12343b] leading-tight">
                        {item.productName}
                      </div>
                      <div className="text-xs text-[#7b8a8b] mt-1">
                        {item.variantName}
                      </div>
                      <div className="text-sm font-semibold text-[#12343b] mt-2">
                        {(
                          item.salePrice ||
                          item.unitPrice ||
                          item.originalPrice ||
                          item.price
                        ).toLocaleString()}
                        ₫ x {item.quantity}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* VOUCHER INPUT */}
              <div className="mb-4 pb-4 border-b border-[#f0ece8]">
                <label className="text-xs text-[#7b8a8b] font-semibold mb-2 block">
                  Nhập mã giảm giá:
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    value={voucherCode}
                    onChange={(e) => {
                      setVoucherCode(e.target.value);
                      setVoucherError("");
                    }}
                    placeholder="Nhập mã voucher"
                    disabled={applyingVoucher}
                    className="flex-1 px-3 py-2 rounded-md border border-[#e6e6e6] focus:outline-none focus:ring-1 focus:ring-[#2B5F68] disabled:bg-gray-100"
                  />
                  {selectedVoucher ? (
                    <button
                      onClick={handleRemoveVoucher}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md font-semibold"
                    >
                      Hủy
                    </button>
                  ) : (
                    <button
                      onClick={handleApplyVoucher}
                      disabled={applyingVoucher}
                      className="px-4 py-2 bg-[#2B5F68] hover:bg-[#224b4b] text-white rounded-md font-semibold disabled:bg-gray-400"
                    >
                      {applyingVoucher ? "..." : "Áp dụng"}
                    </button>
                  )}
                </div>

                {voucherError && (
                  <p className="text-xs text-red-500 mt-2">{voucherError}</p>
                )}

                {selectedVoucher && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-xs text-green-700 font-semibold">
                      ✓ Đã áp dụng voucher: {selectedVoucher.code}
                    </p>
                  </div>
                )}
              </div>

              {/* AVAILABLE VOUCHERS LIST (ONLY FOR LOGGED-IN USER) */}
              {availableVouchers.length > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-3">
                    <div className="text-xs font-semibold text-[#2B5F68]">
                      Voucher khả dụng
                    </div>
                    <div className="text-xs text-[#9aa8a8]">
                      {availableVouchers.length} voucher
                    </div>
                  </div>

                  <div className="space-y-3 max-h-40 overflow-y-auto pr-2">
                    {availableVouchers.map((voucher) => {
                      const isChecked = selectedVouchers.some(
                        (v) => v.id === voucher.id
                      );

                      const voucherColor =
                        voucher.type === "PERCENT"
                          ? "purple"
                          : voucher.type === "AMOUNT"
                          ? "green"
                          : "blue";

                      const leftBg =
                        voucherColor === "purple"
                          ? "bg-[#f3ecff]"
                          : voucherColor === "green"
                          ? "bg-[#e8fff0]"
                          : "bg-[#e8f6ff]";

                      const leftColor =
                        voucherColor === "purple"
                          ? "#7b4dd6"
                          : voucherColor === "green"
                          ? "#12a454"
                          : "#1f78d1";

                      const disableReason = getVoucherDisableReason(voucher);
                      const isDisabled = !!disableReason;

                      return (
                        <div
                          key={voucher.id}
                          className={`flex items-start gap-3 p-3 rounded-lg border transition
    ${isChecked ? "border-[#2B5F68] bg-[#eaf6f6]" : "border-[#e6e6e6] bg-white"}
    ${isDisabled ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}
  `}
                          title={disableReason || undefined}
                        >
                          {/* RADIO / CHECKBOX */}
                          <input
                            type={voucher.stackable ? "checkbox" : "radio"}
                            name="voucher"
                            checked={isChecked}
                            disabled={isDisabled}
                            onChange={() =>
                              !isDisabled && toggleVoucher(voucher)
                            }
                            className="mt-1 accent-[#2B5F68]"
                          />

                          {/* ICON */}
                          <div
                            className="w-10 h-10 rounded-md flex items-center justify-center shrink-0"
                            style={{ background: leftBg }}
                          >
                            <span style={{ color: leftColor, fontWeight: 700 }}>
                              {voucher.code[0]}
                            </span>
                          </div>

                          {/* CONTENT */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="text-sm font-semibold text-[#12343b]">
                                {voucher.code}
                              </div>
                              <div className="text-xs text-[#9aa8a8]">
                                {formatVoucherType(voucher.type)}
                              </div>
                            </div>

                            <div className="text-xs text-[#7b8a8b] mt-1">
                              {voucher.type === "PERCENT" &&
                                `Giảm ${
                                  voucher.value
                                }% (tối đa ${voucher.maxDiscount?.toLocaleString()}₫)`}

                              {voucher.type === "AMOUNT" &&
                                `Giảm ${voucher.value?.toLocaleString()}₫`}

                              {voucher.type === "SHIPPING_FREE" &&
                                "Miễn phí vận chuyển (tối đa 50.000₫)"}
                            </div>

                            {voucher.minOrderAmount > 0 && (
                              <div className="text-xs text-[#2B5F68] font-bold mt-1">
                                Đơn tối thiểu:{" "}
                                {voucher.minOrderAmount.toLocaleString()}₫
                              </div>
                            )}

                            {!voucher.stackable && (
                              <div className="text-[11px] text-red-500 font-semibold mt-1">
                                Không áp dụng cùng voucher khác
                              </div>
                            )}
                          </div>

                          {/* RULE BUTTON */}
                          <button
                            onClick={() => setShowRuleVoucher(voucher)}
                            className="text-xs text-blue-600 hover:underline shrink-0"
                          >
                            Điều kiện
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TOTAL */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm text-[#7b8a8b]">
                  <span>Tạm tính</span>
                  <span className="font-semibold text-[#12343b]">
                    {subtotal.toLocaleString()}₫
                  </span>
                </div>
                <div className="flex justify-between text-sm text-[#7b8a8b]">
                  <span>Phí vận chuyển</span>
                  <span className="font-semibold text-[#12343b]">
                    {shippingDiscount > 0 ? (
                      <span className="text-green-600">
                        {shippingFee.toLocaleString()}₫
                      </span>
                    ) : (
                      `${shippingFee.toLocaleString()}₫`
                    )}
                  </span>
                </div>
                {selectedVoucher && discount > 0 && (
                  <div className="flex justify-between text-sm text-[#7b8a8b]">
                    <span>Giảm giá ({selectedVoucher.code})</span>
                    <span className="font-semibold text-green-600">
                      -{discount.toLocaleString()}₫
                    </span>
                  </div>
                )}

                <div className="pt-3 border-t border-[#f0ece8] flex justify-between items-center">
                  <div className="text-lg font-semibold text-[#12343b]">
                    Tổng cộng
                  </div>
                  <div className="text-2xl font-bold text-[#2B5F68]">
                    {total.toLocaleString()}₫
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isSubmitting || !hasValidAddress || !hasCartItems}
                className={`w-full mt-2 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-md transition-all ${
                  isSubmitting || !hasValidAddress || !hasCartItems
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#2B5F68] hover:bg-[#224b4b] text-white"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    Đặt hàng
                    <span className="text-sm">→</span>
                  </>
                )}
              </button>

              <p className="text-xs text-[#9aa8a8] text-center mt-3">
                Bằng cách đặt hàng, bạn đồng ý với{" "}
                <a className="underline text-[#2B5F68]">Điều khoản dịch vụ</a>{" "}
                và{" "}
                <a className="underline text-[#2B5F68]">Chính sách bảo mật</a>
              </p>

              <div className="mt-4 p-3 rounded-lg bg-[#f7fbfb] border border-[#edf7f6] text-xs text-[#6b7b7b]">
                <div className="flex items-center gap-2 mb-2">
                  <Lock size={14} className="text-[#2B5F68]" />
                  <span className="font-semibold text-[#12343b]">
                    Thanh toán an toàn
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck size={14} className="text-[#2B5F68]" />
                  <span className="text-sm text-[#6b7b7b]">
                    Giao hàng nhanh chóng
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {showRuleVoucher && (
        <VoucherRuleModal
          voucher={showRuleVoucher}
          onClose={() => setShowRuleVoucher(null)}
        />
      )}
    </div>
  );
}
