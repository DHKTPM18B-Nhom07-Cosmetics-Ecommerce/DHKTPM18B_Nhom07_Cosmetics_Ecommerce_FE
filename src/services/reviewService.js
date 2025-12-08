import api from './api';

/**
 * Service xử lý API Review (Đánh giá sản phẩm)
 */

// Tạo đánh giá mới
export const createReview = async (reviewData) => {
    const response = await api.post('/api/reviews', reviewData);
    return response.data;
};

// Lấy đánh giá theo ID
export const getReviewById = async (reviewId) => {
    const response = await api.get(`/api/reviews/${reviewId}`);
    return response.data;
};

// Lấy tất cả đánh giá
export const getAllReviews = async () => {
    const response = await api.get('/api/reviews');
    return response.data;
};

// Cập nhật đánh giá
export const updateReview = async (reviewId, reviewData) => {
    const response = await api.put(`/api/reviews/${reviewId}`, reviewData);
    return response.data;
};

// Xóa đánh giá
export const deleteReview = async (reviewId) => {
    const response = await api.delete(`/api/reviews/${reviewId}`);
    return response.data;
};

// Lấy đánh giá theo sản phẩm
export const getReviewsByProduct = async (productId) => {
    const response = await api.get(`/api/reviews/product/${productId}`);
    return response.data;
};

// Lấy đánh giá theo khách hàng
export const getReviewsByCustomer = async (customerId) => {
    const response = await api.get(`/api/reviews/customer/${customerId}`);
    return response.data;
};

// Lọc theo số sao
export const getReviewsByRating = async (rating) => {
    const response = await api.get(`/api/reviews/rating/${rating}`);
    return response.data;
};

// Tìm kiếm theo khoảng thời gian
export const getReviewsByDateRange = async (startDate, endDate) => {
    const response = await api.get('/api/reviews/date-range', {
        params: { start: startDate, end: endDate }
    });
    return response.data;
};
