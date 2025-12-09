import api from './api';

// Lấy thông tin cá nhân
export const getAccountProfile = async (accountId) => {
    try {
        const response = await api.get(`/api/accounts/${accountId}`);
        return response.data;
    } catch (error) {
        console.error("Lỗi lấy thông tin tài khoản:", error);
        throw error;
    }
};

// Cập nhật thông tin
export const updateAccountProfile = async (accountId, profileData) => {
    try {
        // profileData: { fullName: "...", phoneNumber: "..." }
        const response = await api.put(`/api/accounts/${accountId}`, profileData);
        return response.data;
    } catch (error) {
        console.error("Lỗi cập nhật tài khoản:", error);
        throw error;
    }
};