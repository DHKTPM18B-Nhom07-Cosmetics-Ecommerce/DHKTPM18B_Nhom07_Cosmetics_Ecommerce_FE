import api from "./api";

/**
 * API FILTER SẢN PHẨM
 */
export const filterProducts = async ({
  search = "",
  categories = "",   // chuỗi "1,2,3"
  brands = "",       // chuỗi "5,7"
  stocks = "",       // chuỗi "in,low,out"
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
        categories,
        brands,
        stocks,
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
