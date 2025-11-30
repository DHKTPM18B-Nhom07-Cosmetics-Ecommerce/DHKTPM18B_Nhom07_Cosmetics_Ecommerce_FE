// src/services/voucherApi.js
import axios from "axios";

const voucherApi = axios.create({
  baseURL: "http://localhost:8080",
  headers: { "Content-Type": "application/json" }
});

// =====================
// VOUCHER API CHUẨN
// =====================

// GET ALL
export const getAllVouchers = async () => {
  try {
    const res = await voucherApi.get("/api/vouchers");
    return res; // res.data = list
  } catch (err) {
    console.error("Load vouchers failed:", err.response?.data || err);
    return { data: [] };
  }
};

// GET BY ID
export const getVoucherById = async (id) => {
  const res = await voucherApi.get(`/api/vouchers/${id}`);
  return res.data;
};

// CREATE
export const createVoucher = (data) =>
  voucherApi.post("/api/vouchers", data);

// UPDATE
export const updateVoucher = (id, data) =>
  voucherApi.put(`/api/vouchers/${id}`, data);

// UPDATE STATUS
export const updateVoucherStatus = (id, newStatus) =>
  voucherApi.patch(`/api/vouchers/${id}/status`, { status: newStatus });

export default voucherApi;
