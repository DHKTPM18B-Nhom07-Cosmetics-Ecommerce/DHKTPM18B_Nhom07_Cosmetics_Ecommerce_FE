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

export const createBrand = async (brandData) => {
  const res = await api.post("/api/brands", brandData);
  return res.data;
};

export const updateBrand = async (id, brandData) => {
  const res = await api.put(`/api/brands/${id}`, brandData);
  return res.data;
};

export const deleteBrand = async (id) => {
  const res = await api.delete(`/api/brands/${id}`);
  return res.data;
};
