import api from './api';

/**
 * Service xử lý API Customer (Khách hàng)
 */

// Lấy thông tin khách hàng theo ID
export const getCustomerById = async (customerId) => {
    const response = await api.get(`/api/customers/${customerId}`);
    return response.data;
};
