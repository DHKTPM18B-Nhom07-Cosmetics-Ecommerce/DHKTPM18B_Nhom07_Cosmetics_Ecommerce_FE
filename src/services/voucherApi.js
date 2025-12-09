
import api from "./api";
/* ===== READ ===== */
export const getAllVouchers = () => api.get("/api/vouchers");

export const getVoucherById = async (id) => {
  if (!id) throw new Error("Thiếu voucher id");
  const res = await api.get(`/api/vouchers/${id}`);
  return res.data;
};

/* ===== CREATE / UPDATE ===== */
export const createVoucher = (payload) =>
  api.post("/api/vouchers", payload);

export const updateVoucher = (id, payload) => {
  if (!id) throw new Error("Thiếu voucher id");
  return api.put(`/api/vouchers/${id}`, payload);
};

/*  */
export const updateVoucherStatus = (id, status) => {
  if (!id || !status)
    throw new Error("Thiếu voucherId hoặc status");

  return api.patch(`/api/vouchers/${id}/status`, { status });
};

/* ===== DELETE ===== */
export const deleteVoucher = (id) =>
  api.delete(`/api/vouchers/${id}`);

/* ===== APPLY (CHECKOUT) ===== */
export const applyVoucher = ({ code, items }) =>
  api.post("/api/vouchers/apply", { code, items });

export default {
  getAllVouchers,
  getVoucherById,
  createVoucher,
  updateVoucher,
  updateVoucherStatus,
  deleteVoucher,
  applyVoucher,
};
