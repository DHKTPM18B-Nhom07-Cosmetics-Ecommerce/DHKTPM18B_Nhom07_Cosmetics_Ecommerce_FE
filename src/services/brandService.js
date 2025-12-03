import api from "./api";

export const getAllBrands = async () => {
  try {
    const res = await api.get("/api/brands");
    return res.data;
  } catch (err) {
    console.error("Lỗi lấy danh sách thương hiệu:", err);
    return [];
  }
};
