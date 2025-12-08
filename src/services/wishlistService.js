import api from "./api";

/**
 * Service xử lý các API liên quan đến Wishlist (Danh sách yêu thích)
 */

const BASE_URL = "/api/wishlist";

/**
 * Thêm sản phẩm vào danh sách yêu thích
 * @param {number} accountId - ID của tài khoản
 * @param {number} productVariantId - ID của biến thể sản phẩm
 * @returns {Promise} Response từ server
 */
export const addToWishlist = async (accountId, productVariantId) => {
  try {
    const response = await api.post(
      `${BASE_URL}/add/${accountId}/${productVariantId}`
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi thêm vào wishlist:", error);
    throw error;
  }
};

/**
 * Xóa sản phẩm khỏi danh sách yêu thích
 * @param {number} accountId - ID của tài khoản
 * @param {number} productVariantId - ID của biến thể sản phẩm
 * @returns {Promise} Response từ server
 */
export const removeFromWishlist = async (accountId, productVariantId) => {
  try {
    const response = await api.delete(
      `${BASE_URL}/remove/${accountId}/${productVariantId}`
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi xóa khỏi wishlist:", error);
    throw error;
  }
};

/**
 * Lấy danh sách tất cả sản phẩm yêu thích
 * @param {number} accountId - ID của tài khoản
 * @returns {Promise<Array>} Danh sách sản phẩm yêu thích
 */
export const getWishlist = async (accountId) => {
  try {
    const response = await api.get(`${BASE_URL}/${accountId}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách wishlist:", error);
    throw error;
  }
};

/**
 * Kiểm tra sản phẩm có trong wishlist không
 * @param {number} accountId - ID của tài khoản
 * @param {number} productVariantId - ID của biến thể sản phẩm
 * @returns {Promise<boolean>} true nếu có, false nếu không
 */
export const checkInWishlist = async (accountId, productVariantId) => {
  try {
    const response = await api.get(
      `${BASE_URL}/check/${accountId}/${productVariantId}`
    );
    return response.data.isInWishlist;
  } catch (error) {
    console.error("Lỗi khi kiểm tra wishlist:", error);
    return false;
  }
};

/**
 * Xóa toàn bộ danh sách yêu thích
 * @param {number} accountId - ID của tài khoản
 * @returns {Promise} Response từ server
 */
export const clearWishlist = async (accountId) => {
  try {
    const response = await api.delete(`${BASE_URL}/clear/${accountId}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi xóa toàn bộ wishlist:", error);
    throw error;
  }
};
