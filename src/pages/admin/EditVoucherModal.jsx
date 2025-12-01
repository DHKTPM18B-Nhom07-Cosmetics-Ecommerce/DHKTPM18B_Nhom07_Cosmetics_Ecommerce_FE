import { X, Info } from "lucide-react";
import { useState, useEffect } from "react";

// MUI
import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import FormLabel from "@mui/material/FormLabel";

import { getVoucherById, updateVoucher } from "../../services/voucherApi";
import {
  getAllCategories,
  getAllBrands,
  getAllProducts,
} from "../../services/voucherScopeApi";

import { diffToText } from "../../utils/timeLeft";
import { formatToMySQL } from "../../utils/datetime";
import "../../../styles/voucher.css";

export default function EditVoucherModal({
  isOpen,
  onClose,
  voucherId,
  onUpdated,
}) {
  const [form, setForm] = useState({
    code: "",
    type: "",
    value: "",
    maxDiscount: "",
    minOrderAmount: "",
    maxUses: "",
    perUserLimit: "",
    stackable: true,
    scope: "",
    startAt: null,
    endAt: null,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);

  /* ======================================================
        LOAD DATA
  ====================================================== */
  useEffect(() => {
    if (isOpen) loadData();
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);

    const [cats, brs, prods] = await Promise.all([
      getAllCategories(),
      getAllBrands(),
      getAllProducts(),
    ]);

    setCategories(cats);
    setBrands(brs);
    setProducts(prods);

    const v = await getVoucherById(voucherId);

    setForm({
      code: v.code,
      type: v.type,
      value: v.value,
      maxDiscount: v.maxDiscount || "",
      minOrderAmount: v.minOrderAmount || "",
      maxUses: v.maxUses || "",
      perUserLimit: v.perUserLimit || "",
      stackable: v.stackable,
      scope: v.scope,
      startAt: v.startAt ? new Date(v.startAt.replace(" ", "T")) : null,
      endAt: v.endAt ? new Date(v.endAt.replace(" ", "T")) : null,
    });

    setSelectedCategories(v.categories?.map((c) => c.id) || []);
    setSelectedBrands(v.brands?.map((b) => b.id) || []);
    setSelectedProducts(v.products?.map((p) => p.id) || []);

    setLoading(false);
  };

  if (!isOpen) return null;

  /* ======================================================
        FORM CHANGE
  ====================================================== */
  const change = (e) => {
    let { name, value, type, checked } = e.target;
    if (type === "number" && value < 0) value = 0;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const toggleSelect = (list, setList, id) => {
    list.includes(id)
      ? setList(list.filter((x) => x !== id))
      : setList([...list, id]);
  };

  /* ======================================================
        VALIDATION
  ====================================================== */
  const validate = () => {
    const e = {};

    if (!form.code.trim()) e.code = "Mã voucher bắt buộc.";
    if (!/^[A-Z0-9_]+$/.test(form.code.trim()))
      e.code = "Mã chỉ chứa A–Z, số, không dấu.";

    if (!form.value) e.value = "Giá trị giảm bắt buộc.";
    if (form.type === "PERCENT" && (form.value < 1 || form.value > 100))
      e.value = "Phần trăm phải từ 1–100.";

    if (form.type === "PERCENT" && !form.maxDiscount)
      e.maxDiscount = "Giảm tối đa bắt buộc.";

    if (!form.startAt) e.startAt = "Chọn ngày bắt đầu.";
    if (!form.endAt) e.endAt = "Chọn ngày kết thúc.";

    if (form.startAt && form.endAt && form.endAt <= form.startAt)
      e.endAt = "Kết thúc phải sau thời gian bắt đầu.";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ======================================================
        SUBMIT
  ====================================================== */
  const submit = async () => {
    if (!validate()) return;

    const payload = {
      code: form.code.toUpperCase(),
      type: form.type,
      scope: form.scope,
      value: Number(form.value),
      maxDiscount: form.type === "PERCENT" ? Number(form.maxDiscount) : null,
      minOrderAmount: Number(form.minOrderAmount || 0),
      maxUses: form.maxUses ? Number(form.maxUses) : null,
      perUserLimit: Number(form.perUserLimit || 1),
      stackable: form.stackable,

      startAt: formatToMySQL(form.startAt),
      endAt: formatToMySQL(form.endAt),

      categoryIds: selectedCategories,
      brandIds: selectedBrands,
      productIds: selectedProducts,
    };

    try {
      await updateVoucher(voucherId, payload);
      onUpdated();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  /* ======================================================
        MUI THEME
  ====================================================== */
  const theme = createTheme({
    palette: {
      primary: { main: "#0e4f66" },
      error: { main: "#d32f2f" },
    },
    components: {
      MuiFormLabel: {
        styleOverrides: {
          root: {
            fontSize: "14px",
            fontWeight: 600,
            color: "#0e4f66",
            marginBottom: "4px",
            display: "inline-flex",
            alignItems: "center",
            gap: "3px",
          },
          asterisk: {
            color: "#d32f2f !important",
            fontSize: "18px",
            fontWeight: 700,
            marginLeft: "3px",
          },
        },
      },
      MuiPickersPopper: {
        styleOverrides: {
          paper: {
            zIndex: 999999,
            borderRadius: "14px",
            padding: "10px",
            border: "1px solid #dce5e8",
            boxShadow: "0 6px 24px rgba(14,79,102,0.15)",
          },
        },
      },
    },
  });

  /* ======================================================
        COMPONENTS
  ====================================================== */
  const Tip = ({ text }) => (
    <span className="relative group">
      <Info className="w-4 h-4 text-gray-500 cursor-pointer" />
      <span className="absolute invisible group-hover:visible left-0 top-6 w-52 bg-black text-white text-xs p-2 rounded shadow-xl z-[9999]">
        {text}
      </span>
    </span>
  );

  const SelectCard = ({ data, list, setList }) => (
    <div className="grid grid-cols-2 gap-2 mt-2">
      {data.map((item) => (
        <button
          key={item.id}
          onClick={() => toggleSelect(list, setList, item.id)}
          className={`p-2 rounded-md border text-sm transition ${
            list.includes(item.id)
              ? "bg-[#0e4f66] text-white border-[#0e4f66] scale-[1.02]"
              : "bg-white hover:bg-gray-100"
          }`}
        >
          {item.name}
        </button>
      ))}
    </div>
  );

  const Preview = () => (
    <div className="rounded-xl p-4 bg-[#eef5f7] border shadow-sm">
      <p className="font-bold text-lg text-[#0e4f66]">
        {form.code || "VOUCHER"}
      </p>

      <p className="text-sm mt-1 font-medium text-[#245d6e]">
        {form.type === "PERCENT"
          ? `Giảm ${form.value || 0}%`
          : form.type === "AMOUNT"
          ? `Giảm ${Number(form.value || 0).toLocaleString()}đ`
          : "Miễn phí vận chuyển"}
      </p>

      {form.minOrderAmount > 0 && (
        <p className="text-xs mt-1">
          Tối thiểu {Number(form.minOrderAmount).toLocaleString()}đ
        </p>
      )}

      {form.startAt && form.endAt && (
        <>
          <p className="text-xs mt-2 text-[#557d89]">
            {formatToMySQL(form.startAt)} → {formatToMySQL(form.endAt)}
          </p>

          <p className="text-[11px] mt-1 font-semibold text-[#245d6e]">
            {(() => {
              const now = new Date();
              if (now < form.startAt)
                return `Sắp bắt đầu sau ${diffToText(now, form.startAt)}`;
              if (now > form.endAt) return "Voucher đã hết hạn";
              return `Còn ${diffToText(now, form.endAt)} là hết hạn`;
            })()}
          </p>
        </>
      )}
    </div>
  );

  /* ======================================================
        UI
  ====================================================== */
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center p-4 z-[9999]">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-xl overflow-hidden flex flex-col modal-animate">
        {/* HEADER */}
        <div className="bg-[#dfeaed] px-6 py-3 border-b-4 border-[#0e4f66] flex justify-between items-center">
          <p className="font-bold text-[#0e4f66] text-[1.05rem]">
            Chỉnh sửa voucher
          </p>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white hover:bg-gray-100 shadow transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <p className="text-center text-gray-500">Đang tải dữ liệu...</p>
          ) : (
            <div className="grid grid-cols-12 gap-8">
              {/* LEFT */}
              <div className="col-span-7 space-y-8">
                {/* BASIC INFO */}
                <section className="p-5 bg-white border rounded-xl shadow-sm space-y-5">
                  <h3 className="font-semibold text-[#0e4f66] text-[15px]">
                    Thông tin cơ bản
                  </h3>

                  {/* CODE */}
                  <div className="space-y-1">
                    <FormLabel required>Mã voucher</FormLabel>

                    <div className="flex items-center gap-2">
                      <input
                        name="code"
                        value={form.code}
                        onChange={change}
                        placeholder="SALE2024"
                        className={`w-full border rounded-lg px-3 py-2 text-sm outline-none transition ${
                          errors.code
                            ? "border-red-500"
                            : "border-gray-300 focus:border-[#0e4f66]"
                        }`}
                      />
                      <Tip text="IN HOA, không dấu, không khoảng trắng." />
                    </div>

                    {errors.code && (
                      <p className="text-red-500 text-xs mt-1">{errors.code}</p>
                    )}
                  </div>

                  {/* TYPE */}
                  <div className="space-y-1">
                    <FormLabel>Loại voucher</FormLabel>

                    <select
                      name="type"
                      value={form.type}
                      onChange={change}
                      className="w-full border rounded-lg px-3 py-2 text-sm border-gray-300 focus:border-[#0e4f66]"
                    >
                      <option value="PERCENT">Giảm %</option>
                      <option value="AMOUNT">Giảm tiền</option>
                      <option value="SHIPPING_FREE">Miễn phí vận chuyển</option>
                    </select>
                  </div>
                </section>

                {/* VALUE & CONDITIONS */}
                <section className="p-5 bg-white border rounded-xl shadow-sm space-y-5">
                  <h3 className="font-semibold text-[#0e4f66] text-[15px]">
                    Giá trị & điều kiện
                  </h3>

                  {/* VALUE */}
                  <div className="space-y-1">
                    <FormLabel required>Giá trị giảm</FormLabel>

                    <input
                      type="number"
                      name="value"
                      value={form.value}
                      onChange={change}
                      className={`w-full border rounded-lg px-3 py-2 text-sm outline-none transition ${
                        errors.value
                          ? "border-red-500"
                          : "border-gray-300 focus:border-[#0e4f66]"
                      }`}
                    />

                    {errors.value && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.value}
                      </p>
                    )}
                  </div>

                  {/* MAX DISCOUNT */}
                  {form.type === "PERCENT" && (
                    <div className="space-y-1">
                      <FormLabel required>Giảm tối đa</FormLabel>

                      <input
                        type="number"
                        name="maxDiscount"
                        value={form.maxDiscount}
                        onChange={change}
                        className={`w-full border rounded-lg px-3 py-2 text-sm outline-none transition ${
                          errors.maxDiscount
                            ? "border-red-500"
                            : "border-gray-300 focus:border-[#0e4f66]"
                        }`}
                      />

                      {errors.maxDiscount && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.maxDiscount}
                        </p>
                      )}
                    </div>
                  )}

                  {/* MIN ORDER */}
                  <div className="space-y-1">
                    <FormLabel>Đơn hàng tối thiểu</FormLabel>

                    <input
                      type="number"
                      name="minOrderAmount"
                      value={form.minOrderAmount}
                      onChange={change}
                      className="w-full border rounded-lg px-3 py-2 text-sm border-gray-300 focus:border-[#0e4f66]"
                    />
                  </div>
                </section>
              </div>

              {/* RIGHT */}
              <div className="col-span-5 space-y-8">
                {/* TIME RANGE */}
                <section className="p-5 bg-white border rounded-xl shadow-sm space-y-5">
                  <h3 className="font-semibold text-[#0e4f66] text-[15px]">
                    Thời gian hiệu lực
                  </h3>

                  <ThemeProvider theme={theme}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      {/* START */}
                      <div className="space-y-1">
                        <FormLabel required>Bắt đầu</FormLabel>

                        <DateTimePicker
                          ampm={false}
                          disablePortal
                          format="yyyy-MM-dd HH:mm"
                          value={form.startAt}
                          onChange={(value) =>
                            setForm((prev) => ({ ...prev, startAt: value }))
                          }
                          slotProps={{
                            textField: {
                              size: "small",
                              fullWidth: true,
                              error: Boolean(errors.startAt),
                              helperText: errors.startAt || "",
                            },
                          }}
                        />
                      </div>

                      {/* END */}
                      <div className="space-y-1 mt-4">
                        <FormLabel required>Kết thúc</FormLabel>

                        <DateTimePicker
                          ampm={false}
                          disablePortal
                          format="yyyy-MM-dd HH:mm"
                          value={form.endAt}
                          onChange={(value) =>
                            setForm((prev) => ({ ...prev, endAt: value }))
                          }
                          slotProps={{
                            textField: {
                              size: "small",
                              fullWidth: true,
                              error: Boolean(errors.endAt),
                              helperText: errors.endAt || "",
                            },
                          }}
                        />
                      </div>
                    </LocalizationProvider>
                  </ThemeProvider>
                </section>

                {/* SCOPE */}
                <section className="p-5 bg-white border rounded-xl shadow-sm space-y-4">
                  <h3 className="font-semibold text-[#0e4f66] text-[15px]">
                    Phạm vi áp dụng
                  </h3>

                  <select
                    name="scope"
                    value={form.scope}
                    onChange={change}
                    className="w-full border rounded-lg px-3 py-2 text-sm border-gray-300 focus:border-[#0e4f66]"
                  >
                    <option value="GLOBAL">Toàn hệ thống</option>
                    <option value="CATEGORY">Danh mục</option>
                    <option value="BRAND">Thương hiệu</option>
                    <option value="PRODUCT">Sản phẩm</option>
                  </select>

                  {form.scope === "CATEGORY" && (
                    <SelectCard
                      data={categories}
                      list={selectedCategories}
                      setList={setSelectedCategories}
                    />
                  )}

                  {form.scope === "BRAND" && (
                    <SelectCard
                      data={brands}
                      list={selectedBrands}
                      setList={setSelectedBrands}
                    />
                  )}

                  {form.scope === "PRODUCT" && (
                    <SelectCard
                      data={products}
                      list={selectedProducts}
                      setList={setSelectedProducts}
                    />
                  )}
                </section>

                <Preview />
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="px-6 py-3 bg-[#dfeaed] border-t-4 border-[#0e4f66] flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white rounded-md text-sm hover:bg-gray-100"
          >
            Hủy
          </button>

          <button
            onClick={submit}
            className="px-6 py-2 bg-[#0e4f66] text-white rounded-md text-sm hover:bg-[#09374a]"
          >
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
}
