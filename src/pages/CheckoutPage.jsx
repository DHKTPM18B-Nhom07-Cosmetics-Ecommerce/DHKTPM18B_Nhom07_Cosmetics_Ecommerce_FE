// src/pages/CheckoutPage.jsx
import React, { useState } from "react";
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

  const [shippingMethod, setShippingMethod] = useState("standard");
  const shippingOptions = [
    { id: "standard", title: "Giao hàng tiêu chuẩn", subtitle: "Giao hàng trong 3-5 ngày làm việc", price: 30000 },
    { id: "fast", title: "Giao hàng nhanh", subtitle: "Giao hàng trong 1-2 ngày làm việc", price: 60000 },
    { id: "express", title: "Giao hàng trong ngày", subtitle: "Nhận hàng trong vòng 24 giờ", price: 100000 },
  ];
  const shippingFee = shippingOptions.find(o => o.id === shippingMethod).price;
  const [voucherCode, setVoucherCode] = useState("");
  const [selectedVoucher, setSelectedVoucher] = useState(null);

  // sample vouchers
  const vouchers = [
    { code: "SUMMER25", title: "Get 25% off your order", save: "Save $92.49", color: "purple" },
    { code: "WELCOME10", title: "Get $10 off your first order", save: "Save $10.00", color: "green" },
    { code: "FREESHIP", title: "Free shipping on all orders", save: "Save $12.00", color: "blue" },
  ];

  const subtotal = checkoutData.cart.subtotal;
  const discount = selectedVoucher ? 92490 : 0; // mock discount in VND if a voucher applied
  const total = subtotal + shippingFee - discount;

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
            {/* address card */}
            <div className="bg-white rounded-2xl p-6 shadow-[0_6px_20px_rgba(45,55,72,0.06)] border border-[#f0ece8]">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-serif text-[#567A85] text-xl tracking-wide uppercase">Thông tin giao hàng</h3>
                <button className="text-xs bg-[#f3f8f8] px-3 py-1.5 rounded-md text-[#2B5F68] font-semibold hover:bg-[#e6f2f2]">Thay đổi địa chỉ</button>
              </div>

              <div className="pl-3 space-y-4 border-l-2 border-[#ecf3f3]">
                <div className="flex gap-4 items-start">
                  <div className="text-[#2B5F68]"><User size={18} /></div>
                  <div>
                    <p className="text-[11px] text-[#8da0a0] uppercase tracking-wider font-semibold mb-1">Họ tên</p>
                    <p className="font-semibold text-[#12343b]">{checkoutData.address.fullName}</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="text-[#2B5F68]"><Phone size={18} /></div>
                  <div>
                    <p className="text-[11px] text-[#8da0a0] uppercase tracking-wider font-semibold mb-1">Số điện thoại</p>
                    <p className="font-semibold text-[#12343b]">{checkoutData.address.phone}</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="text-[#2B5F68]"><MapPin size={18} /></div>
                  <div>
                    <p className="text-[11px] text-[#8da0a0] uppercase tracking-wider font-semibold mb-1">Địa chỉ giao hàng</p>
                    <p className="font-semibold text-[#12343b]">{checkoutData.address.fullAddressString}</p>
                  </div>
                </div>
              </div>
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
                  <li>Khi click vào nút hoàn tất đơn hàng thì đơn hàng sẽ được hệ thống tự động xác nhận...</li>
                  <li>Trường hợp đặt hàng xong nhưng muốn HỦY ĐƠN, vui lòng soạn tin nhắn theo cú pháp...</li>
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
                {checkoutData.cart.items.map((it, idx) => (
                  <div key={it.id} className="flex gap-3 items-start">
                    <div className="relative">
                      <img src={it.thumbnail} alt={it.productName} className="w-16 h-16 rounded-md object-cover border border-[#f0f0f0] bg-gray-50" />
                      <div className="absolute -top-2 -left-2 bg-[#eaf6f6] text-[#2B5F68] text-xs font-semibold w-5 h-5 rounded-full flex items-center justify-center border border-white">
                        {idx+1}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-[#12343b] leading-tight">{it.productName}</div>
                      <div className="text-xs text-[#7b8a8b] mt-1">{it.variantName}</div>
                      <div className="text-sm font-semibold text-[#12343b] mt-2">{it.unitPrice.toLocaleString()}₫</div>
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
              <button className="w-full mt-2 py-3 rounded-xl bg-[#2B5F68] hover:bg-[#224b4b] text-white font-semibold flex items-center justify-center gap-2 shadow-md">
                Đặt hàng
                <span className="text-sm">→</span>
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
