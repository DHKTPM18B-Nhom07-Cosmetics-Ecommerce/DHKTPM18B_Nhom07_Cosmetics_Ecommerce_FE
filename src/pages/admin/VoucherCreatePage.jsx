import { X, Info } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import FormLabel from "@mui/material/FormLabel";

import { createVoucher } from "../../services/voucherApi";
import {
  getAllCategories,
  getAllBrands,
  getAllProducts,
} from "../../services/voucherScopeApi";

import { formatToMySQL } from "../../utils/datetime";
import "../../../styles/voucher.css";
import { notifySuccess, notifyError } from "../../utils/toast";

export default function VoucherCreatePage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    code: "",
    type: "PERCENT",
    value: "",
    maxDiscount: "",
    minOrderAmount: "",
    maxUses: "",
    perUserLimit: "1",
    stackable: true,
    scope: "GLOBAL",
    startAt: null,
    endAt: null,
  });

  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setCategories(await getAllCategories());
    setBrands(await getAllBrands());
    setProducts(await getAllProducts());
  };

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

    if (!form.startAt) e.startAt = "Chọn thời gian bắt đầu.";
    if (!form.endAt) e.endAt = "Chọn thời gian kết thúc.";
    if (form.startAt && form.endAt && form.endAt <= form.startAt)
      e.endAt = "Ngày kết thúc phải sau ngày bắt đầu.";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

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
      await createVoucher(payload);
      notifySuccess("Tạo voucher thành công!");
      navigate("/admin/vouchers");
    } catch (err) {
      notifyError("Tạo voucher thất bại!");
      console.error(err);
    }
  };

  const theme = createTheme({
    palette: {
      primary: { main: "#0e4f66" },
      error: { main: "#d32f2f" },
    },
  });

  const Tip = ({ text }) => (
    <span className="relative group">
      <Info className="w-4 h-4 text-gray-500 cursor-pointer" />
      <span className="absolute invisible group-hover:visible left-0 top-6 w-52 bg-black text-white text-xs p-2 rounded shadow-xl">
        {text}
      </span>
    </span>
  );

  const SelectCard = ({ data, list, setList }) => (
    <div className="grid grid-cols-2 gap-2 mt-2">
      {data.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => toggleSelect(list, setList, item.id)}
          className={`p-2 rounded-md border text-sm transition ${
            list.includes(item.id)
              ? "bg-[#0e4f66] text-white border-[#0e4f66]"
              : "bg-white hover:bg-gray-100"
          }`}
        >
          {item.name}
        </button>
      ))}
    </div>
  );

  const handleCancel = () => navigate("/admin/vouchers");

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* PAGE TITLE */}
      <h1 className="text-3xl font-bold text-[#0e4f66] mb-6">Tạo voucher</h1>

      {/* FORM WRAPPER FULL-WIDTH LIKE ADMIN PAGES */}
      <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
        <div className="grid grid-cols-12 gap-8">
          {/* LEFT */}
          <div className="col-span-12 md:col-span-7 space-y-8">
            {/* BASIC INFO */}
            <section className="p-5 rounded-xl border bg-gray-50 space-y-5">
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
                    className={`w-full border rounded-lg px-3 py-2 text-sm outline-none ${
                      errors.code
                        ? "border-red-500"
                        : "border-gray-300 focus:border-[#0e4f66]"
                    }`}
                  />

                  <Tip text="IN HOA, không dấu, không khoảng trắng." />
                </div>

                {errors.code && (
                  <p className="text-red-500 text-xs">{errors.code}</p>
                )}
              </div>

              {/* TYPE */}
              <div className="space-y-1">
                <FormLabel>Loại voucher</FormLabel>

                <select
                  name="type"
                  value={form.type}
                  onChange={change}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="PERCENT">Giảm %</option>
                  <option value="AMOUNT">Giảm tiền</option>
                  <option value="SHIPPING_FREE">Miễn phí vận chuyển</option>
                </select>
              </div>
            </section>

            {/* VALUE */}
            <section className="p-5 rounded-xl border bg-gray-50 space-y-5">
              <h3 className="font-semibold text-[#0e4f66] text-[15px]">
                Giá trị & điều kiện
              </h3>

              {/* VALUE INPUT */}
              <div className="space-y-1">
                <FormLabel required>Giá trị giảm</FormLabel>

                <input
                  type="number"
                  name="value"
                  value={form.value}
                  onChange={change}
                  className={`w-full border rounded-lg px-3 py-2 text-sm ${
                    errors.value
                      ? "border-red-500"
                      : "border-gray-300 focus:border-[#0e4f66]"
                  }`}
                />

                {errors.value && (
                  <p className="text-red-500 text-xs">{errors.value}</p>
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
                    className={`w-full border rounded-lg px-3 py-2 text-sm ${
                      errors.maxDiscount
                        ? "border-red-500"
                        : "border-gray-300 focus:border-[#0e4f66]"
                    }`}
                  />

                  {errors.maxDiscount && (
                    <p className="text-red-500 text-xs">{errors.maxDiscount}</p>
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
                  className="w-full border rounded-lg px-3 py-2 text-sm border-gray-300"
                />

                <p className="text-xs text-gray-500">
                  Bỏ trống nếu không yêu cầu tối thiểu
                </p>
              </div>
            </section>
          </div>

          {/* RIGHT */}
          <div className="col-span-12 md:col-span-5 space-y-8">
            {/* TIME */}
            <section className="p-5 rounded-xl border bg-gray-50 space-y-5">
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
                      format="yyyy-MM-dd HH:mm"
                      value={form.startAt}
                      onChange={(v) =>
                        setForm((prev) => ({ ...prev, startAt: v }))
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
                      format="yyyy-MM-dd HH:mm"
                      value={form.endAt}
                      onChange={(v) =>
                        setForm((prev) => ({ ...prev, endAt: v }))
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
            <section className="p-5 rounded-xl border bg-gray-50 space-y-4">
              <h3 className="font-semibold text-[#0e4f66] text-[15px]">
                Phạm vi áp dụng
              </h3>

              <select
                name="scope"
                value={form.scope}
                onChange={change}
                className="w-full border rounded-lg px-3 py-2 text-sm"
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

            {/* PREVIEW */}
            <section className="p-4 bg-[#eef5f7] rounded-xl border">
              <p className="font-bold text-lg">{form.code || "VOUCHER"}</p>

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
                <p className="text-xs mt-2 text-[#557d89]">
                  {formatToMySQL(form.startAt)} → {formatToMySQL(form.endAt)}
                </p>
              )}
            </section>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-3 mt-10">
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-200 rounded-md"
          >
            Hủy
          </button>
          <button
            onClick={submit}
            className="px-6 py-2 bg-[#0e4f66] text-white rounded-md"
          >
            Tạo voucher
          </button>
        </div>
      </div>
    </div>
  );
}
