// src/pages/CheckoutPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getDefaultAddressForCurrentUser, getCustomerIdByAccountId, createOrder, createAddress } from "../services/checkout";
import { getCartData, clearOrderedItems } from "../services/cartService";
import Select from 'react-select';
import { provinces, getDistrictsByProvince, getWardsByDistrict } from '../data/vietnamAddresses';
import {
  User,
  Phone,
  MapPin,
  ChevronRight,
  Ticket,
  Lock,
  Truck,
} from "lucide-react";

/**
 * CheckoutPage.jsx
 * - Tailwind CSS required
 * - lucide-react required
 *
 * Thumbnails use the uploaded local image paths (transform path to url in your setup):
 *  - '/mnt/data/017b082d-9bee-4dba-8f4a-c0ff5c414868.png'
 *  - '/mnt/data/254e0a83-c4e4-4435-a781-529d4613340f.png'
 */

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get selected items from CartPage via navigation state
  const selectedItemsData = location.state?.selectedItems;
  const selectedItemIds = location.state?.selectedItemIds;
  
  // Mock data (you'll replace with real props / API)
  const checkoutData = {
    address: {
      fullName: "Nguyễn Minh Anh",
      phone: "0912 345 678",
      fullAddressString:
        "123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
    },
    cart: {
      subtotal: 1470000,
      items: [
        {
          id: 1,
          productName: "Bình gốm Oceanique Classic",
          variantName: "Xanh dương / Cỡ M",
          quantity: 1,
          unitPrice: 850000,
          thumbnail: "/mnt/data/017b082d-9bee-4dba-8f4a-c0ff5c414868.png",
        },
        {
          id: 2,
          productName: "Bộ chén Coastal White",
          variantName: "Trắng / Set 4 chiếc",
          quantity: 1,
          unitPrice: 620000,
          thumbnail: "/mnt/data/254e0a83-c4e4-4435-a781-529d4613340f.png",
        },
      ],
    },
  };


  const [defaultAddress, setDefaultAddress] = useState({
    fullName: "",
    phone: "",
    fullAddressString: ""
  });
  const [addressObject, setAddressObject] = useState(null); // Store full address object for order creation
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGuestCheckout, setIsGuestCheckout] = useState(false); // Track if user is logged in
  const [noAddressFound, setNoAddressFound] = useState(false); // Track if logged-in user has no address
  
  // Manual address form state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [manualAddress, setManualAddress] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    province: null,
    district: null,
    ward: null,
    street: '',
    note: ''
  });
  const [availableDistricts, setAvailableDistricts] = useState([]);
  const [availableWards, setAvailableWards] = useState([]);

  const { user: authUser } = useAuth();

  const [cartData, setCartData] = useState(checkoutData.cart);

  const subtotal = cartData?.subtotal || checkoutData.cart.subtotal;
  useEffect(() => {
    const fetchDefaultAddress = async () => {
      try {
        // Check if user is logged in
        const userStored = localStorage.getItem('user');
        if (!userStored) {
          console.log('Guest checkout mode - no user logged in');
          setIsGuestCheckout(true);
          setShowAddressForm(true); // Show form for guest
          return;
        }

        // User is logged in, try to fetch their default address
        setIsGuestCheckout(false);
        const addr = await getDefaultAddressForCurrentUser();
        if (!addr) {
          console.warn('No default address found for current user');
          // Show UI to go to add address page - will display button in render
          setNoAddressFound(true);
          setShowAddressForm(false);
          return;
        }

        setNoAddressFound(false);

        setAddressObject(addr); // Store full address object
        setDefaultAddress({
          fullName: addr.fullName || addr.receiverName || '',
          phone: addr.phone || addr.phoneNumber || addr.receiverPhone || '',
          fullAddressString: `${addr.address || addr.street || ''}${addr.city ? ', ' + addr.city : ''}${addr.state ? ', ' + addr.state : ''}${addr.country ? ', ' + addr.country : ''}`
        });
        setShowAddressForm(false); // Hide form if address found
      } catch (error) {
        console.error('Failed to load address: ', error);
        setShowAddressForm(true); // Show form on error
      }
    };

    fetchDefaultAddress();
  }, []);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        // Use selectedItemsData from CartPage if available
        if (selectedItemsData) {
          setCartData(selectedItemsData);
        } else {
          const data = await getCartData();
          if (data) setCartData(data);
        }
      } catch (err) {
        console.warn('Failed to load cart data', err);
      }
    };

    fetchCart();
  }, [authUser, selectedItemsData]);



  const [shippingMethod, setShippingMethod] = useState("standard");
  const shippingOptions = [
    { id: "standard", title: "Giao hàng tiêu chuẩn", subtitle: "Giao hàng trong 3-5 ngày làm việc", price: 30000 },
    { id: "fast", title: "Giao hàng nhanh", subtitle: "Giao hàng trong 1-2 ngày làm việc", price: 60000 },
    { id: "express", title: "Giao hàng trong ngày", subtitle: "Nhận hàng trong vòng 24 giờ", price: 100000 },
  ];
  const shippingFee = shippingOptions.find(o => o.id === shippingMethod)?.price || 0;
  const [voucherCode, setVoucherCode] = useState("");
  const [selectedVoucher, setSelectedVoucher] = useState(null);

  // sample vouchers
  const vouchers = [
    { code: "SUMMER25", title: "Get 25% off your order", save: "Save $92.49", color: "purple" },
    { code: "WELCOME10", title: "Get $10 off your first order", save: "Save $10.00", color: "green" },
    { code: "FREESHIP", title: "Free shipping on all orders", save: "Save $12.00", color: "blue" },
  ];

  const discount = selectedVoucher ? 92490 : 0; // mock discount in VND if a voucher applied
  const total = subtotal + shippingFee - discount;

  // Validation checks
  const hasValidAddress = showAddressForm 
    ? (manualAddress.firstName && manualAddress.lastName && manualAddress.email && manualAddress.phone && manualAddress.province && manualAddress.district && manualAddress.street)
    : (defaultAddress.fullName && defaultAddress.phone && defaultAddress.fullAddressString);
  const hasCartItems = cartData?.items && cartData.items.length > 0;

  // Handle province change
  const handleProvinceChange = (selectedOption) => {
    setManualAddress({
      ...manualAddress,
      province: selectedOption,
      district: null,
      ward: null
    });
    setAvailableDistricts(getDistrictsByProvince(selectedOption.value) || []);
    setAvailableWards([]);
  };

  // Handle district change
  const handleDistrictChange = (selectedOption) => {
    setManualAddress({
      ...manualAddress,
      district: selectedOption,
      ward: null
    });
    setAvailableWards(getWardsByDistrict(manualAddress.province.value, selectedOption.value) || []);
  };

  // Handle ward change
  const handleWardChange = (selectedOption) => {
    setManualAddress({
      ...manualAddress,
      ward: selectedOption
    });
  };

  // Handle order submission
  const handleCheckout = async () => {
    // Validate address
    if (!hasValidAddress) {
      alert('Vui lòng thêm địa chỉ giao hàng để thanh toán!');
      return;
    }

    // Validate cart
    if (!hasCartItems) {
      alert('Giỏ hàng trống! Vui lòng thêm sản phẩm trước khi thanh toán.');
      return;
    }

    // For manual address form, we need to create address or use temporary address
    // Since we don't have addressId for manual form, we'll need to handle this differently
    // For now, we'll skip addressId validation if using manual form
    if (!showAddressForm && (!addressObject || !addressObject.id)) {
      alert('Không tìm thấy thông tin địa chỉ. Vui lòng thử lại.');
      return;
    }

    // Get customer ID (or create guest customer for guest checkout)
    try {
      setIsSubmitting(true);
      let customerId = null;
      
      const userStored = localStorage.getItem('user');
      if (userStored) {
        // User is logged in - get their customer ID
        const user = JSON.parse(userStored);
        const accountId = user.id;
        customerId = await getCustomerIdByAccountId(accountId);
        
        if (!customerId) {
          alert('Không tìm thấy thông tin khách hàng. Vui lòng liên hệ hỗ trợ.');
          return;
        }
        
        // Ensure customerId is a valid number
        customerId = parseInt(customerId);
        if (isNaN(customerId)) {
          alert('ID khách hàng không hợp lệ.');
          return;
        }
      } else {
        // Guest checkout - use customerId = 0
        console.log('👤 Guest checkout with customerId = 0');
        customerId = 0;
      }

      // Prepare address information for order (from form or existing)
      let addressInfo = null;
      
      if (showAddressForm) {
        // Use manual form address
        const fullName = `${manualAddress.firstName} ${manualAddress.lastName}`.trim();
        const addressLine = manualAddress.street;
        const city = manualAddress.district?.label || '';
        const state = manualAddress.province?.label || '';
        const country = 'Vietnam';
        
        // Validate required fields
        if (!fullName || !manualAddress.phone || !addressLine) {
          throw new Error('Vui lòng điền đầy đủ thông tin: Họ tên, Số điện thoại, và Địa chỉ cụ thể.');
        }
        
        addressInfo = {
          fullName: fullName,
          phone: manualAddress.phone,
          address: addressLine,
          city: city || 'N/A',
          state: state || 'N/A',
          country: country
        };
        
        console.log('📍 Using address from form:', addressInfo);
      } else if (!showAddressForm && userStored) {
        // Use existing address for logged-in users
        addressInfo = {
          fullName: addressObject?.fullName || '',
          phone: addressObject?.phone || '',
          address: addressObject?.address || '',
          city: addressObject?.city || '',
          state: addressObject?.state || '',
          country: addressObject?.country || 'Vietnam'
        };
        
        console.log('📍 Using existing address:', addressInfo);
      }
      
      // For guest checkout, validate address fields
      if (!userStored && addressInfo) {
        if (!addressInfo.fullName || !addressInfo.phone || !addressInfo.address) {
          throw new Error('Vui lòng điền đầy đủ thông tin: Họ tên, Số điện thoại, và Địa chỉ cụ thể.');
        }
      }

      // Validate cart items have variantId
      const invalidItems = cartData.items.filter(item => !item.variantId);
      if (invalidItems.length > 0) {
        console.error('❌ Items without variantId:', invalidItems);
        throw new Error('Một số sản phẩm trong giỏ hàng thiếu thông tin. Vui lòng thử lại.');
      }

      console.log('🔍 Building order payload...');
      console.log('  Cart items:', cartData.items);
      console.log('  Total:', total);
      console.log('  Shipping:', shippingFee);
      console.log('  Discount:', discount);

      // Build order payload with address fields embedded
      const orderPayload = {
        customerId: customerId,
        orderDate: new Date().toISOString(),
        status: "PENDING",
        totalAmount: parseFloat(total) || 0,
        shippingFee: parseFloat(shippingFee) || 0,
        discount: parseFloat(discount) || 0,
        // Address fields
        ...(addressInfo && {
          shippingFullName: addressInfo.fullName,
          shippingPhone: addressInfo.phone,
          shippingAddress: addressInfo.address,
          shippingCity: addressInfo.city,
          shippingState: addressInfo.state,
          shippingCountry: addressInfo.country
        }),
        orderDetails: cartData.items.map(item => {
          const itemPrice = item.salePrice || item.originalPrice || item.price || 0;
          const itemQuantity = item.quantity || 1;
          const itemSubtotal = itemPrice * itemQuantity;
          
          console.log(`  Processing item: ${item.productName}`, {
            variantId: item.variantId,
            price: itemPrice,
            quantity: itemQuantity,
            subtotal: itemSubtotal
          });
          
          // Ensure all required fields are present
          if (!item.variantId) {
            console.error('❌ Invalid item - missing variantId:', item);
            throw new Error(`Sản phẩm "${item.productName || 'Unknown'}" thiếu thông tin variant`);
          }
          
          if (!itemPrice || itemPrice <= 0) {
            console.error('❌ Invalid item - invalid price:', item);
            throw new Error(`Sản phẩm "${item.productName || 'Unknown'}" có giá không hợp lệ`);
          }
          
          if (!itemQuantity || itemQuantity <= 0) {
            console.error('❌ Invalid item - invalid quantity:', item);
            throw new Error(`Sản phẩm "${item.productName || 'Unknown'}" có số lượng không hợp lệ`);
          }
          
          return {
            productVariantId: parseInt(item.variantId),
            quantity: parseInt(itemQuantity),
            price: parseFloat(itemPrice),
            subtotal: parseFloat(itemSubtotal)
          };
        })
      };

      // Log order details
      console.log('📝 Order Details:');
      console.log('  Guest Checkout:', isGuestCheckout);
      console.log('  Customer ID:', customerId);
      console.log('  Address Info:', addressInfo);

      console.log('📦 Order Payload:', JSON.stringify(orderPayload, null, 2));

      // Call create order API
      const createdOrder = await createOrder(orderPayload);
      
      console.log('✅ Created Order:', createdOrder);
      
      const orderId = createdOrder?.id || createdOrder?.orderId;
      const successMsg = `Đặt hàng thành công!${orderId ? ' Mã đơn hàng: ' + orderId : ''}`;
      alert(successMsg);
      
      // Clear only ordered items from cart - use selectedItemIds if available, otherwise use all cart items
      const itemsToClear = selectedItemIds ? 
        cartData.items.filter(item => selectedItemIds.includes(item.id)) : 
        cartData.items;
      
      await clearOrderedItems(itemsToClear);
      
      // Navigate to order success page or order detail
      if (orderId) {
        navigate(`/orders/${orderId}`);
      } else {
        // If no order ID returned, go back to home
        navigate('/');
      }
    } catch (error) {
      console.error('❌ Checkout error:', error);
      let errorMsg = 'Đặt hàng thất bại. Vui lòng thử lại sau.';
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.message) {
        errorMsg = error.message;
      }
      alert(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] font-sans text-[#1f2d3d]">
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* breadcrumb */}
        <div className="flex items-center text-sm text-gray-500 mb-6 gap-2">
          <span className="cursor-pointer hover:text-[#2B5F68]">Trang chủ</span>
          <ChevronRight size={14} />
          <span className="cursor-pointer hover:text-[#2B5F68]">Giỏ hàng</span>
          <ChevronRight size={14} />
          <span className="text-[#2B5F68] font-semibold">Thanh toán</span>
        </div>

        {/* main layout */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* left column */}
          <div className="w-full lg:w-2/3 space-y-6">
            {/* Guest Checkout Notification */}
            {isGuestCheckout && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-blue-900">Bạn đang thanh toán mà không đăng nhập</h4>
                  <p className="text-sm text-blue-700 mt-1">Vui lòng điền đầy đủ thông tin giao hàng bên dưới để tiếp tục đặt hàng.</p>
                </div>
              </div>
            )}
            
            {/* address card */}
            <div className="bg-white rounded-2xl p-6 shadow-[0_6px_20px_rgba(45,55,72,0.06)] border border-[#f0ece8]">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-serif text-[#567A85] text-xl tracking-wide uppercase">Thông tin giao hàng</h3>
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
                /* No Address Found - Show Button to Add */
                <div className="py-8 px-4 text-center">
                  <MapPin size={48} className="mx-auto text-[#bfcfcf] mb-4" />
                  <h4 className="text-lg font-semibold text-[#12343b] mb-2">Bạn chưa có địa chỉ giao hàng</h4>
                  <p className="text-sm text-[#7b8a8b] mb-6">Vui lòng thêm địa chỉ để tiếp tục thanh toán</p>
                  <button
                    onClick={() => navigate('/add-address')}
                    className="px-6 py-2.5 bg-[#2B5F68] text-white font-semibold rounded-lg hover:bg-[#224b4b] transition-all"
                  >
                    Thêm địa chỉ giao hàng
                  </button>
                </div>
              ) : showAddressForm ? (
                /* Manual Address Form */
                <div className="space-y-4">
                  {/* Name fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-[#8da0a0] uppercase tracking-wider font-semibold mb-2">
                        Họ <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Nguyễn"
                        value={manualAddress.firstName}
                        onChange={(e) => setManualAddress({...manualAddress, firstName: e.target.value})}
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
                        onChange={(e) => setManualAddress({...manualAddress, lastName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2B5F68]"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs text-[#8da0a0] uppercase tracking-wider font-semibold mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="example@email.com"
                      value={manualAddress.email}
                      onChange={(e) => setManualAddress({...manualAddress, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2B5F68]"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs text-[#8da0a0] uppercase tracking-wider font-semibold mb-2">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="0912 345 678"
                      value={manualAddress.phone}
                      onChange={(e) => setManualAddress({...manualAddress, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2B5F68]"
                    />
                  </div>

                  {/* Address dropdowns */}
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
                        Phường/Xã <span className="text-red-500">*</span>
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

                  {/* Street address */}
                  <div>
                    <label className="block text-xs text-[#8da0a0] uppercase tracking-wider font-semibold mb-2">
                      Địa chỉ cụ thể <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Số nhà, tên đường"
                      value={manualAddress.street}
                      onChange={(e) => setManualAddress({...manualAddress, street: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2B5F68]"
                    />
                  </div>

                  {/* Note */}
                  <div>
                    <label className="block text-xs text-[#8da0a0] uppercase tracking-wider font-semibold mb-2">
                      Ghi chú đơn hàng (tùy chọn)
                    </label>
                    <textarea
                      placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay chỉ dẫn địa điểm giao hàng chi tiết hơn"
                      value={manualAddress.note}
                      onChange={(e) => setManualAddress({...manualAddress, note: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2B5F68]"
                    />
                  </div>
                </div>
              ) : (
                /* Display existing address */
                <div className="pl-3 space-y-4 border-l-2 border-[#ecf3f3]">
                  {!hasValidAddress && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                      <MapPin size={16} className="text-yellow-600 mt-0.5" />
                      <p className="text-sm text-yellow-800 font-semibold">Vui lòng thêm địa chỉ giao hàng để thanh toán</p>
                    </div>
                  )}
                  <div className="flex gap-4 items-start">
                    <div className="text-[#2B5F68]"><User size={18} /></div>
                    <div>
                      <p className="text-[11px] text-[#8da0a0] uppercase tracking-wider font-semibold mb-1">Họ tên</p>
                      <p className="font-semibold text-[#12343b]">{defaultAddress.fullName || <span className="text-gray-400 italic">Chưa có thông tin</span>}</p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="text-[#2B5F68]"><Phone size={18} /></div>
                    <div>
                      <p className="text-[11px] text-[#8da0a0] uppercase tracking-wider font-semibold mb-1">Số điện thoại</p>
                      <p className="font-semibold text-[#12343b]">{defaultAddress.phone || <span className="text-gray-400 italic">Chưa có thông tin</span>}</p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="text-[#2B5F68]"><MapPin size={18} /></div>
                    <div>
                      <p className="text-[11px] text-[#8da0a0] uppercase tracking-wider font-semibold mb-1">Địa chỉ giao hàng</p>
                      <p className="font-semibold text-[#12343b]">{defaultAddress.fullAddressString || <span className="text-gray-400 italic">Chưa có thông tin</span>}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* shipping */}
            <div className="bg-white rounded-2xl p-6 shadow-[0_6px_20px_rgba(45,55,72,0.06)] border border-[#f0ece8]">
              <h3 className="font-serif text-[#567A85] text-xl tracking-wide uppercase mb-4">Phương thức vận chuyển</h3>

              <div className="space-y-3">
                {shippingOptions.map(option => {
                  const active = shippingMethod === option.id;
                  return (
                    <div key={option.id} onClick={() => setShippingMethod(option.id)}
                         className={`flex justify-between items-center p-4 rounded-lg cursor-pointer transition-all ${active ? 'ring-1 ring-[#2B5F68] bg-[#eaf6f6] border border-[#2B5F68]' : 'border border-[#e8e6e4] hover:border-[#b8d6d4]'}`}>
                      <div className="flex items-center gap-3">
                        {/* custom radio */}
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${active ? 'border-2 border-[#2B5F68]' : 'border border-gray-300'}`}>
                          <div className={`${active ? 'w-2 h-2 bg-[#2B5F68] rounded-full' : ''}`} />
                        </div>
                        <div>
                          <div className={`font-semibold ${active ? 'text-[#12343b]' : 'text-[#23373a]'}`}>{option.title}</div>
                          <div className="text-xs text-[#7b8a8b]">{option.subtitle}</div>
                        </div>
                      </div>
                      <div className="font-semibold text-[#12343b]">{option.price.toLocaleString()}₫</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* payment */}
            <div className="bg-white rounded-2xl p-6 shadow-[0_6px_20px_rgba(45,55,72,0.06)] border border-[#f0ece8]">
              <h3 className="font-serif text-[#567A85] text-xl tracking-wide uppercase mb-4">Phương thức thanh toán</h3>

              <div className="p-3 rounded-lg border border-[#dfe9e9] bg-white flex items-start gap-3">
                <div className="w-5 h-5 rounded-full border-2 border-[#2B5F68] flex items-center justify-center">
                  <div className="w-2 h-2 bg-[#2B5F68] rounded-full" />
                </div>
                <div>
                  <div className="font-semibold text-[#12343b]">Thanh toán khi nhận hàng (COD)</div>
                </div>
              </div>

              <div className="mt-4 p-4 border border-[#f0ece8] bg-[#fbfaf9] text-sm text-[#6b7b7b] rounded-md">
                <ol className="list-decimal ml-4 space-y-2">
                  <li><p>Khi click vào nút hoàn tất đơn hàng thì đơn hàng sẽ được hệ thống tự động xác nhận mà không cần phải gọi qua điện thoại, nếu điền thông tin địa chỉ và số điện thoại chính xác thì đơn hàng sẽ được vận chuyển từ 3-4-5 ngày tùy vùng miền.</p></li>
                  <li><p>Trường hợp đặt hàng xong nhưng muốn HỦY ĐƠN, vui lòng soạn tin nhắn theo cú pháp: SĐT ĐÃ ĐẶT ĐƠN (hoặc MÃ ĐƠN hoặc GMAIL ĐƠN HÀNG) + TÊN NGƯỜI NHẬN sau đó gửi qua các kênh online: Page Facebook, Intagram. Nhân viên check tin nhắn sẽ xử lý hủy giúp quý khách hàng.</p></li>
                </ol>
              </div>
            </div>
          </div>

          {/* right column */}
          <aside className="w-full lg:w-1/3">
            <div className="bg-white rounded-2xl p-6 shadow-[0_6px_20px_rgba(45,55,72,0.06)] border border-[#f0ece8] sticky top-6">
              <h3 className="font-serif text-[#567A85] text-xl tracking-wide uppercase mb-4">Đơn hàng của bạn</h3>

              {/* products list */}
              <div className="space-y-4 mb-4 max-h-56 overflow-y-auto pr-2">
                {(cartData?.items || checkoutData.cart.items).map((it, idx) => (
                  <div key={it.id} className="flex gap-3 items-start">
                    <div className="relative">
                      <img src={it.productImage || it.thumbnail} alt={it.productName} className="w-16 h-16 rounded-md object-cover border border-[#f0f0f0] bg-gray-50" />
                      <div className="absolute -top-2 -left-2 bg-[#eaf6f6] text-[#2B5F68] text-xs font-semibold w-5 h-5 rounded-full flex items-center justify-center border border-white">
                        {idx+1}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-[#12343b] leading-tight">{it.productName}</div>
                      <div className="text-xs text-[#7b8a8b] mt-1">{it.variantName}</div>
                      <div className="text-sm font-semibold text-[#12343b] mt-2">{(it.salePrice || it.unitPrice || it.originalPrice).toLocaleString()}₫</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* coupon input */}
              <div className="mb-4 pb-4 border-b border-[#f0ece8]">
                <label className="text-xs text-[#7b8a8b] font-semibold mb-2 block">Nhập mã code :</label>
                <div className="flex gap-2 items-center">
                  <input value={voucherCode} onChange={(e)=>setVoucherCode(e.target.value)} placeholder="Nhập mã giảm giá" className="flex-1 px-3 py-2 rounded-md border border-[#e6e6e6] focus:outline-none focus:ring-1 focus:ring-[#2B5F68]" />
                  <button onClick={()=> {
                    // mock apply: choose first voucher if code matches
                    const found = vouchers.find(v=>v.code === voucherCode.toUpperCase());
                    setSelectedVoucher(found || null);
                  }} className="px-4 py-2 bg-[#2B5F68] hover:bg-[#224b4b] text-white rounded-md font-semibold">Áp dụng</button>
                </div>

                <label className="mt-3 text-xs block text-[#7b8a8b]">chọn mã giảm giá</label>
                <div className="mt-2 border rounded-md px-3 py-2 flex items-center justify-between cursor-pointer bg-white">
                  <span className="text-sm text-[#9aa8a8]">Choose a voucher...</span>
                  <ChevronRight size={16} className="text-[#bfcfcf]" />
                </div>
              </div>

              {/* available vouchers */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-3">
                  <div className="text-xs font-semibold text-[#2B5F68]">Available Vouchers</div>
                  <div className="text-xs text-[#9aa8a8]">3 available</div>
                </div>

                <div className="space-y-3 max-h-40 overflow-y-auto pr-2">
                  {vouchers.map((v, i) => {
                    const applied = selectedVoucher && selectedVoucher.code === v.code;
                    const baseBg = applied ? "bg-white" : "bg-white";
                    const borderColor = applied ? "border-[#a3d6f0]" : "border-[#e6e6e6]";
                    const leftBg = v.color === "purple" ? "bg-[#f3ecff]" : v.color === "green" ? "bg-[#e8fff0]" : "bg-[#e8f6ff]";
                    const leftColor = v.color === "purple" ? "#7b4dd6" : v.color === "green" ? "#12a454" : "#1f78d1";

                    return (
                      <div key={v.code} className={`flex items-start gap-3 p-3 rounded-lg border ${borderColor} ${baseBg}`}>
                        <div className={`w-10 h-10 rounded-md flex items-center justify-center`} style={{ background: leftBg }}>
                          <span style={{ color: leftColor, fontWeight: 700 }}>{v.code[0]}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-semibold text-[#12343b]">{v.code}</div>
                            <div className="text-xs text-[#9aa8a8]">Valid until Dec 31</div>
                          </div>
                          <div className="text-xs text-[#7b8a8b] mt-1">{v.title}</div>
                          <div className="text-xs text-[#2B5F68] font-bold mt-1">{v.save}</div>
                        </div>
                        <div>
                          <button onClick={() => setSelectedVoucher(v)} className="text-sm text-[#2B5F68] font-semibold">Apply</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* totals */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm text-[#7b8a8b]">
                  <span>Tạm tính</span>
                  <span className="font-semibold text-[#12343b]">{subtotal.toLocaleString()}₫</span>
                </div>
                <div className="flex justify-between text-sm text-[#7b8a8b]">
                  <span>Phí vận chuyển</span>
                  <span className="font-semibold text-[#12343b]">{shippingFee.toLocaleString()}₫</span>
                </div>
                {selectedVoucher && (
                  <div className="flex justify-between text-sm text-[#7b8a8b]">
                    <span>Giảm giá ({selectedVoucher.code})</span>
                    <span className="font-semibold text-[#12343b]">-{discount.toLocaleString()}₫</span>
                  </div>
                )}

                <div className="pt-3 border-t border-[#f0ece8] flex justify-between items-center">
                  <div className="text-lg font-semibold text-[#12343b]">Tổng cộng</div>
                  <div className="text-2xl font-bold text-[#2B5F68]">{total.toLocaleString()}₫</div>
                </div>
              </div>

              {/* main CTA */}
              <button 
                onClick={handleCheckout}
                disabled={isSubmitting || !hasValidAddress || !hasCartItems}
                className={`w-full mt-2 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-md transition-all ${
                  isSubmitting || !hasValidAddress || !hasCartItems
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-[#2B5F68] hover:bg-[#224b4b] text-white'
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
                Bằng cách đặt hàng, bạn đồng ý với <a className="underline text-[#2B5F68]">Điều khoản dịch vụ</a> và <a className="underline text-[#2B5F68]">Chính sách bảo mật</a>
              </p>

              {/* trust box */}
              <div className="mt-4 p-3 rounded-lg bg-[#f7fbfb] border border-[#edf7f6] text-xs text-[#6b7b7b]">
                <div className="flex items-center gap-2 mb-2">
                  <Lock size={14} className="text-[#2B5F68]" />
                  <span className="font-semibold text-[#12343b]">Thanh toán an toàn</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck size={14} className="text-[#2B5F68]" />
                  <span className="text-sm text-[#6b7b7b]">Giao hàng nhanh chóng</span>
                </div>
              </div>

            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
