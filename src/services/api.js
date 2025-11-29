// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080', 
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
// Nếu  có JWT thì mở comment dòng dưới
// api.interceptors.request.use(config => {
//   const token = localStorage.getItem('token');
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

// LẤY DANH SÁCH USER CHO ADMIN
export const getUsers = (page = 0, size = 10, role, status, search) => {
  return api.get('/api/accounts/management', {
    params: { page, size, role, status, search }
  });
};

// TẠO USER MỚI (Employee)
export const createUser = (data) => {
  return api.post('/api/employees', data);
};

// VÔ HIỆU HÓA TÀI KHOẢN
export const disableAccount = (id, reason = 'Disabled by admin') => {
  return api.delete(`/api/accounts/${id}`, { params: { reason } });
};

