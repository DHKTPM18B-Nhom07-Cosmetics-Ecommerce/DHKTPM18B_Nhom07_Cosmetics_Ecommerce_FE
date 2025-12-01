import api from "./api";

/**
 * API FILTER SẢN PHẨM
 * KHÔNG ảnh hưởng file productService.js
 */
export const filterProducts = async ({
  search = "",
  category = null,
  brand = null,
  minPrice = null,
  maxPrice = null,
  rating = null,
  page = 0,
  size = 12,
  sort = "newest",
}) => {
  try {
    const response = await api.get("/api/products/filter", {
      params: {
        search,
        category,
        brand,
        minPrice,
        maxPrice,
        rating,
        page,
        size,
        sort,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error filtering products:", error);
    throw error;
  }
};
