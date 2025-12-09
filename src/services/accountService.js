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

// Cập nhật thông tin - sử dụng endpoint PUT như trong api.js
export const updateAccountProfile = async (accountId, profileData) => {
    try {
        // Kiểm tra accountId
        if (!accountId) {
            throw new Error("Account ID không hợp lệ");
        }
        
        // profileData: { fullName: "...", phoneNumber: "..." }
        const response = await api.put(`/api/accounts/${accountId}`, profileData);
        return response.data;
    } catch (error) {
        console.error("Lỗi cập nhật tài khoản:", error);
        throw error;
    }
};