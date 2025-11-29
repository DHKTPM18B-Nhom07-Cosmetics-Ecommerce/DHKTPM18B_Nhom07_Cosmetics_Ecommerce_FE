// src/services/voucherScopeApi.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
  headers: { "Content-Type": "application/json" }
});

// CATEGORY
export const getAllCategories = async () => {
  try {
    const res = await api.get("/api/categories");
    return res.data;
  } catch (err) {
    console.error("Load categories error:", err);
    return [];
  }
};

// BRAND
export const getAllBrands = async () => {
  try {
    const res = await api.get("/api/brands");
    return res.data;
  } catch (err) {
    console.error("Load brands error:", err);
    return [];
  }
};

// PRODUCT
export const getAllProducts = async () => {
  try {
    const res = await api.get("/api/products");
    return res.data;
  } catch (err) {
    console.error("Load products error:", err);
    return [];
  }
};

export default api;
