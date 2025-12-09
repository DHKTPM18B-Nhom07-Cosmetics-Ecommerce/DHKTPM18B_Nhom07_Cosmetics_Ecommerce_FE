// src/pages/admin/AddEmployeePage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { notifySuccess, notifyError } from '../../utils/toast.js';

export default function AddEmployeePage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Mật khẩu mặc định luôn là 12345678
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '12345678',
    role: 'EMPLOYEE'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    // 1. Kiểm tra Full Name (Max 50)
    if (formData.fullName.trim().length > 50) {
      notifyError('Họ và tên không được vượt quá 50 ký tự!');
      return false;
    }

    // 2. Kiểm tra Email (Format + Max 50)
    if (formData.email.trim().length > 50) {
      notifyError('Email không được vượt quá 50 ký tự!');
      return false;
    }
    // Regex email cơ bản
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      notifyError('Địa chỉ Email không đúng định dạng!');
      return false;
    }

    // 3. Kiểm tra Số điện thoại (Bắt đầu = 0, Độ dài 10-12, chỉ số)
    // Regex: Bắt đầu bằng 0, theo sau là 9 đến 11 chữ số (tổng 10-12)
    const phoneRegex = /^0\d{9,11}$/;

    // Nếu sđt là bắt buộc (vì có dấu * ở label):
    if (!formData.phoneNumber.trim()) {
      notifyError('Vui lòng nhập số điện thoại!');
      return false;
    }

    if (!phoneRegex.test(formData.phoneNumber.trim())) {
      notifyError('Số điện thoại phải bắt đầu bằng 0, độ dài từ 10-12 số và không chứa chữ cái!');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Kiểm tra điền đủ thông tin cơ bản
    if (!formData.fullName || !formData.email || !formData.password || !formData.role) {
      notifyError('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    // --- GỌI HÀM VALIDATE RIÊNG ---
    if (!validateForm()) {
      return; // Dừng nếu validate thất bại
    }

    setLoading(true);

    try {
      const payload = {
        hireDate: new Date().toISOString().split('T')[0] + "T00:00:00",
        account: {
          fullName: formData.fullName.trim(),
          username: formData.email.trim(),
          password: formData.password,
          phoneNumber: formData.phoneNumber.trim(),
          role: formData.role,
          status: "ACTIVE"
        }
      };

      console.log("Đang gửi dữ liệu:", payload);

      const response = await fetch('http://localhost:8080/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        notifySuccess('Thêm nhân viên thành công!');
        navigate('/admin/users');
      } else {
        const err = await response.json();
        console.error("Lỗi Server trả về:", err);
        notifyError('Lỗi: ' + (err.message || "Không thể tạo nhân viên"));
      }
    } catch (error) {
      console.error(error);
      notifyError('Lỗi kết nối server!');
    } finally {
      setLoading(false);
    }
  };

  return (
      <>

        <div className="min-h-screen bg-gray-50 flex items-center justify-center m-2">
          <div className="rounded-lg shadow-sm border border-gray-200 p-8 w-full max-w-4xl" style={{ background: '#D5E2E6' }}>
            {/* ... Phần Header giữ nguyên ... */}
            <div className="border-b mt-4" style={{ background: '#D5E2E6' }}>
              <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                    {/* SVG icon */}
                    <svg className="w-7 h-7 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">Thêm nhân viên mới</h1>
                    <p className="text-sm text-gray-600">Điền thông tin bên dưới để tạo tài khoản người dùng mới</p>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-7 mt-6" style={{ background: '#D5E2E6' }}noValidate>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên *</label>
                <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Nhập họ và tên đầy đủ"
                    maxLength={50} // Ràng buộc HTML: Max 50
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                />
                <p className="text-xs text-gray-500 mt-1 text-right">{formData.fullName.length}/50 ký tự</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ Email (Tên đăng nhập) *</label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="user@company.com"
                    maxLength={50} // Ràng buộc HTML: Max 50
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                />
                <p className="text-xs text-gray-500 mt-1">Email này sẽ được sử dụng để đăng nhập hệ thống (Tối đa 50 ký tự)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại *</label>
                <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="Ví dụ: 0987654321"
                    maxLength={12} // Ràng buộc HTML: Max 12
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                />
                <p className="text-xs text-gray-500 mt-1">Bắt đầu bằng 0, độ dài 10-12 số</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu *</label>
                <div className="relative">
                  <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      readOnly
                      className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-md focus:outline-none text-gray-500 cursor-not-allowed pr-12"
                      required
                  />
                  <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                <div className="mt-3 text-xs text-gray-600 bg-gray-50 p-4 rounded-md border border-gray-200">
                  <p className="font-bold text-red-600 mb-1">Lưu ý quan trọng:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Mật khẩu mặc định là: <span className="font-mono font-bold">12345678</span></li>
                    <li>Nhân viên <span className="font-bold">BẮT BUỘC</span> phải đổi mật khẩu sau khi nhận tài khoản.</li>
                  </ul>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vai trò *</label>
                <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                >
                  <option value="EMPLOYEE">Nhân viên (Employee)</option>
                  <option value="ADMIN">Quản trị viên (Admin)</option>
                </select>
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 mt-2">
                <button
                    type="button"
                    onClick={() => navigate('/admin/users')}
                    className="px-6 py-3 bg-white border border-gray-300 rounded-md font-medium hover:bg-gray-50"
                >
                  Hủy bỏ
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 text-white rounded-md font-medium disabled:opacity-70 flex items-center gap-2 shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5"
                    style={{ background: '#2B6377' }}
                >
                  {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                  Lưu tài khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      </>
  );
}