import {
  X,
  Tag,
  Globe,
  Clock,
  Users,
  DollarSign,
  Layers,
  PackageSearch,
  BadgePercent,
} from "lucide-react";

export default function VoucherDetailModal({ isOpen, onClose, voucher }) {
  if (!isOpen || !voucher) return null;
  const fmt = (d) => (d ? d.replace("T", " ").slice(0, 16) : "--");

  const typeMap = {
    PERCENT: "Giảm %",
    AMOUNT: "Giảm tiền",
    SHIPPING_FREE: "Miễn ship",
  };

  const scopeMap = {
    GLOBAL: "Toàn hệ thống",
    CATEGORY: "Theo danh mục",
    BRAND: "Theo thương hiệu",
    PRODUCT: "Theo sản phẩm",
  };

  const scopeIcon = {
    GLOBAL: <Globe className="w-4 h-4" />,
    CATEGORY: <Layers className="w-4 h-4" />,
    BRAND: <BadgePercent className="w-4 h-4" />,
    PRODUCT: <PackageSearch className="w-4 h-4" />,
  };

  const scopeColor = {
    CATEGORY: "bg-blue-50 text-blue-700 border-blue-200",
    BRAND: "bg-purple-50 text-purple-700 border-purple-200",
    PRODUCT: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };

  const ScopeChip = ({ text, icon, type }) => (
    <span
      className={`
        flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm border 
        ${scopeColor[type]}
        transition-all hover:shadow hover:-translate-y-[1px]
      `}
    >
      {icon}
      {text}
    </span>
  );

  const renderScopeTargets = () => {
    if (voucher.scope === "GLOBAL")
      return <i className="text-gray-500">Áp dụng toàn hệ thống</i>;

    const list =
      voucher.scope === "CATEGORY"
        ? voucher.categories
        : voucher.scope === "BRAND"
        ? voucher.brands
        : voucher.products;

    if (!list?.length)
      return <i className="text-gray-400">Không có mục áp dụng</i>;

    return (
      <div className="flex flex-wrap gap-2 mt-1 animate-fadeIn">
        {list.map((item) => (
          <ScopeChip
            key={item.id}
            type={voucher.scope}
            icon={scopeIcon[voucher.scope]}
            text={item.name}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6 z-[9999] animate-modalFade">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex flex-col animate-modalZoom">
        {/* HEADER */}
        <div className="px-6 py-4 bg-[#dfeaed] border-b-4 border-[#0e4f66] flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-[#0e4f66]">
              Chi tiết voucher
            </h2>
            <p className="text-lg font-semibold text-gray-700">
              {voucher.code}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white hover:bg-gray-100 shadow transition active:scale-90 hover:rotate-6"
          >
            <X className="w-6 h-6 text-gray-700" />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LEFT SIDE */}
            <div className="space-y-6">
              {/* PREVIEW CARD */}
              <div className="rounded-2xl p-6 bg-gradient-to-br from-[#e9f2f6] to-[#d8e4eb] border border-gray-200 shadow-sm hover:shadow transition-all hover:-translate-y-1">
                <p className="text-gray-700 font-medium">
                  {typeMap[voucher.type]}
                </p>

                <h3 className="mt-2 text-3xl font-bold text-[#0e4f66]">
                  {voucher.code}
                </h3>

                <p className="mt-3 text-gray-900 font-extrabold text-xl">
                  Giảm{" "}
                  {voucher.type === "PERCENT"
                    ? `${voucher.value}%`
                    : `${Number(voucher.value).toLocaleString()}đ`}
                </p>

                <p className="text-gray-600 text-sm mt-4">
                  {fmt(voucher.startAt)} → {fmt(voucher.endAt)}
                </p>
              </div>

              {/* BASIC INFO */}
              <section className="bg-white p-6 rounded-2xl shadow border border-gray-100 hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <Tag className="w-6 h-6 text-[#0e4f66]" />
                  <h3 className="text-lg font-bold">Thông tin cơ bản</h3>
                </div>

                <div className="space-y-3 text-gray-700">
                  <DetailRow label="Mã voucher" value={voucher.code} />
                  <DetailRow label="Loại" value={typeMap[voucher.type]} />

                  <DetailRow
                    label="Phạm vi"
                    value={
                      <span className="flex items-center gap-2 font-semibold">
                        {scopeIcon[voucher.scope]}
                        {scopeMap[voucher.scope]}
                      </span>
                    }
                  />
                </div>
              </section>

              {/* TIME */}
              <section className="bg-white p-6 rounded-2xl shadow border border-gray-100 hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="w-6 h-6 text-[#0e4f66]" />
                  <h3 className="text-lg font-bold">Thời gian hiệu lực</h3>
                </div>

                <DetailRow
                  label="Bắt đầu"
                  value={fmt(voucher.startAt)}
                  highlight="text-emerald-600"
                />
                <DetailRow
                  label="Kết thúc"
                  value={fmt(voucher.endAt)}
                  highlight="text-rose-600"
                />
              </section>
            </div>

            {/* RIGHT SIDE */}
            <div className="space-y-6">
              {/* VALUE */}
              <section className="bg-white p-6 rounded-2xl shadow border border-gray-100 hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <DollarSign className="w-6 h-6 text-[#0e4f66]" />
                  <h3 className="text-lg font-bold">Giá trị & điều kiện</h3>
                </div>

                <DetailRow
                  label="Giá trị giảm"
                  value={
                    voucher.type === "PERCENT"
                      ? `${voucher.value}%`
                      : `${Number(voucher.value).toLocaleString()}đ`
                  }
                  highlight="text-[#0e4f66]"
                />

                {voucher.maxDiscount && (
                  <DetailRow
                    label="Giảm tối đa"
                    value={`${Number(voucher.maxDiscount).toLocaleString()}đ`}
                    highlight="text-rose-600"
                  />
                )}

                <DetailRow
                  label="Đơn hàng tối thiểu"
                  value={
                    voucher.minOrderAmount
                      ? `${Number(voucher.minOrderAmount).toLocaleString()}đ`
                      : "Không giới hạn"
                  }
                  highlight="text-amber-600"
                />
              </section>

              {/* LIMITS */}
              <section className="bg-white p-6 rounded-2xl shadow border border-gray-100 hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-6 h-6 text-[#0e4f66]" />
                  <h3 className="text-lg font-bold">Giới hạn sử dụng</h3>
                </div>

                <DetailRow
                  label="Tổng lượt dùng"
                  value={voucher.maxUses || "Không giới hạn"}
                />
                <DetailRow label="Mỗi người" value={voucher.perUserLimit} />
                <DetailRow
                  label="Cho phép cộng dồn"
                  value={voucher.stackable ? "Có" : "Không"}
                  highlight={
                    voucher.stackable ? "text-emerald-600" : "text-gray-500"
                  }
                />
              </section>

              {/* SCOPE */}
              <section className="bg-white p-6 rounded-2xl shadow border border-gray-100 hover:shadow-md transition-all">
                <h3 className="text-lg font-bold mb-4">Áp dụng cho</h3>
                {renderScopeTargets()}
              </section>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-6 py-5 bg-[#dfeaed] border-t-4 border-[#0e4f66] flex justify-end">
          <button
            onClick={onClose}
            className="
              h-[44px] px-8
              bg-[#0e4f66] text-white rounded-xl font-semibold
              hover:bg-[#09394c] transition active:scale-95 shadow
            "
          >
            Đóng
          </button>
        </div>
      </div>

      {/* ANIMATION */}
      <style jsx>{`
        @keyframes modalFade {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes modalZoom {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}

/* GỌN GÀNG */
function DetailRow({ label, value, highlight }) {
  return (
    <div className="flex justify-between pl-1 pr-3 py-1.5 rounded-xl hover:bg-gray-50 transition-all">
      <span className="text-gray-700">{label}:</span>
      <span className={`font-semibold ${highlight}`}>{value}</span>
    </div>
  );
}
