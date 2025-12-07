import { useLocation, useNavigate } from "react-router-dom";
import {
  CheckCircle,
  PackageCheck,
  UserPlus,
  AlertTriangle,
} from "lucide-react";

export default function OrderSuccessPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const { order, isGuest } = state || {};

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
        <p className="text-gray-600">Không tìm thấy dữ liệu đơn hàng.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center px-4">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-lg overflow-hidden">
        {/* HEADER */}
        <div className="bg-[#2B5F68] text-white px-8 py-10 text-center">
          <CheckCircle size={56} className="mx-auto mb-4 text-green-300" />
          <h1 className="text-2xl md:text-3xl font-bold">
            Đặt hàng thành công 🎉
          </h1>
          <p className="text-sm text-[#d6ebeb] mt-2">
            Cảm ơn bạn đã tin tưởng và mua sắm tại cửa hàng
          </p>
        </div>

        {/* CONTENT */}
        <div className="px-8 py-10 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* LEFT – ORDER INFO */}
          <div>
            <div className="flex items-center gap-2 mb-4 text-[#2B5F68]">
              <PackageCheck size={20} />
              <h2 className="text-lg font-semibold">Thông tin đơn hàng</h2>
            </div>

            <div className="space-y-3 text-sm text-[#12343b]">
              <div className="flex justify-between">
                <span className="text-gray-500">Mã đơn hàng</span>
                <span className="font-bold">{order.id}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Tạm tính</span>
                <span>
                  {(
                    (order.totalAmount || 0) +
                    (order.discount || 0) -
                    (order.shippingFee || 0)
                  ).toLocaleString()}
                  ₫
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Phí vận chuyển</span>
                <span>{order.shippingFee?.toLocaleString()}₫</span>
              </div>

              <div className="flex justify-between text-green-600">
                <span>Giảm giá</span>
                <span>-{order.discount?.toLocaleString() || 0}₫</span>
              </div>

              <div className="pt-3 border-t flex justify-between text-base font-bold">
                <span>Tổng thanh toán</span>
                <span className="text-[#2B5F68]">
                  {order.totalAmount?.toLocaleString()}₫
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT – NEXT ACTION */}
          <div className="flex flex-col justify-between">
            {isGuest ? (
              <div className="space-y-4">
                {/* INFO */}
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 text-sm">
                  <div className="flex items-center gap-2 mb-2 text-orange-700 font-semibold">
                    <UserPlus size={18} />
                    Mua hàng với tư cách khách
                  </div>

                  <p className="text-orange-700">
                    Bạn <strong>chưa thể theo dõi đơn hàng</strong> vì chưa đăng
                    nhập.
                  </p>
                </div>

                {/* WARNING BOX */}
                <div className="bg-[#fff8ed] border-2 border-[#f59e0b] rounded-2xl p-5 text-sm">
                  <div className="flex items-center gap-2 mb-3 text-[#92400e] font-bold">
                    <AlertTriangle size={20} />
                    LƯU Ý QUAN TRỌNG
                  </div>

                  <p className="text-[#92400e] text-sm leading-relaxed">
                    Khi đăng ký tài khoản để theo dõi đơn hàng này, bạn{" "}
                    <strong>PHẢI nhập đúng</strong> thông tin đã dùng khi mua:
                  </p>

                  <ul className="list-disc ml-5 mt-2 text-[#92400e] text-sm space-y-1">
                    <li>Số điện thoại người nhận</li>
                    <li>Họ tên người nhận hàng</li>
                  </ul>

                  <p className="mt-3 text-xs text-[#a16207]">
                    ⚠ Nếu thông tin không khớp, hệ thống{" "}
                    <strong>không thể liên kết</strong> đơn hàng này với tài
                    khoản của bạn.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-sm text-green-700">
                Bạn đã đăng nhập – có thể theo dõi đơn hàng trong mục
                <strong> Đơn hàng của tôi</strong>.
              </div>
            )}

            {/* BUTTONS */}
            <div className="mt-6 space-y-3">
              {!isGuest && (
                <button
                  onClick={() => navigate(`/orders/${order.id}`)}
                  className="w-full py-3 rounded-xl font-semibold border border-[#2B5F68] text-[#2B5F68] hover:bg-[#eef6f6] transition"
                >
                  Xem chi tiết đơn hàng
                </button>
              )}

              {isGuest && (
                <button
                  onClick={() => navigate("/signup")}
                  className="w-full py-3 rounded-xl font-semibold bg-[#2B5F68] text-white hover:bg-[#224b4b] transition"
                >
                  Đăng ký tài khoản
                </button>
              )}

              <button
                onClick={() => navigate("/")}
                className="w-full py-3 rounded-xl font-semibold bg-gray-100 hover:bg-gray-200 transition"
              >
                Tiếp tục mua sắm
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
