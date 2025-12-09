import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Bật JWT Interceptor để thêm token vào request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;

// --- QUẢN LÝ TÀI KHOẢN (ACCOUNT) ---

// LẤY DANH SÁCH USER CHO ADMIN (Phân trang, lọc)
export const getUsers = (page = 0, size = 10, role, status, search) => {
  return api.get('/api/accounts/management', {
    params: { page, size, role, status, search }
  });
};
export const getAllAccountsForStats = () => api.get('/api/accounts');

// LẤY CHI TIẾT USER THEO ID
export const getUserById = (id) => {
  return api.get(`/api/accounts/${id}`); 
};

// TẠO USER MỚI (Employee)
export const createUser = (data) => {
  return api.post('/api/employees', data);
};

// VÔ HIỆU HÓA TÀI KHOẢN
export const disableAccount = (id, reason = 'Disabled by admin') => {
  return api.delete(`/api/accounts/${id}`, { params: { reason } });
};


// --- QUẢN LÝ ĐƠN HÀNG (ORDER) ---
// (Mới thêm để phục vụ trang UserDetail)

// Lấy lịch sử mua hàng của Khách hàng
export const getOrdersByCustomerId = (customerId) => {
  return api.get(`/api/orders/admin/customer/${customerId}`);
};


// Lấy lịch sử xử lý đơn hàng của Nhân viên
export const getOrdersByEmployeeId = (employeeId) => {
  return api.get(`/api/orders/admin/employee/${employeeId}`);
};


export const getAllCustomers = () => 
  api.get('/api/customers', { 
    params: { _t: Date.now() }  
  });
export const getAllEmployees = () => api.get('/api/employees');

export const getAllOrders = () => {
  return api.get('/api/orders/admin/all');
};

// Cập nhật thông tin Account (bao gồm role)
export const updateAccount = (id, data) => {
  return api.put(`/api/accounts/${id}`, data);
};
export const checkAccountRisk = (id) => {
  return api.get(`/api/accounts/${id}/risk-check`);
};
export const getSystemAlerts = () => {
  return api.get('/api/accounts/alerts');
};
export const sendContact = (data) => {
  return api.post('/api/contact/send', data);
};
