import api from './api';

// Lấy danh sách địa chỉ theo Customer ID
export const getAddressesByCustomer = async (customerId) => {
    try {
        const response = await api.get(`/api/addresses/customer/${customerId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching addresses:", error);
        throw error;
    }
};

// Tạo địa chỉ mới
export const createAddress = async (customerId, addressData) => {
    try {
        // Backend bạn đang nhận Map<String, Object> nên gửi body y chang
        const payload = {
            customerId: customerId,
            fullName: addressData.fullName,
            phone: addressData.phone,
            address: addressData.address,
            city: addressData.city,
            state: addressData.state,
            country: 'Việt Nam',
            default: addressData.isDefault
        };
        const response = await api.post('/api/addresses', payload);
        return response.data;
    } catch (error) {
        console.error("Error creating address:", error);
        throw error;
    }
};

// Cập nhật địa chỉ
export const updateAddress = async (addressId, addressData) => {
    try {

        const payload = {
            fullName: addressData.fullName,
            phone: addressData.phone,
            address: addressData.address,
            city: addressData.city,
            state: addressData.state,
            country: addressData.country || 'Việt Nam', 
            default: addressData.isDefault 
        };

        const response = await api.put(`/api/addresses/${addressId}`, payload);
        return response.data;
    } catch (error) {
        console.error("Error updating address:", error);
        throw error;
    }
};

// Xóa địa chỉ
export const deleteAddress = async (addressId) => {
    try {
        await api.delete(`/api/addresses/${addressId}`);
    } catch (error) {
        console.error("Error deleting address:", error);
        throw error;
    }
};