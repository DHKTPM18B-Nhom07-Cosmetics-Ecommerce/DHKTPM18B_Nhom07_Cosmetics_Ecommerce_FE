// src/components/admin/AddNewAccountModal.jsx
import React, { useState } from 'react';
import { createUser } from '../../services/api';

const AddNewAccountModal = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: '',
    password: '',
    role: '',
    sendWelcomeEmail: true,
    requirePasswordChange: false,
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName || !formData.email || !formData.username || !formData.password || !formData.role) {
      alert('Vui lòng điền đầy đủ các trường có dấu *');
      return;
    }

    setLoading(true);
    try {
      await createUser({
        fullName: formData.fullName,
        email: formData.email,
        username: formData.username,
        password: formData.password,
        role: formData.role.toUpperCase().replace('-', '_'),
        sendWelcomeEmail: formData.sendWelcomeEmail,
        requirePasswordChange: formData.requirePasswordChange,
      });

      alert('Tạo tài khoản nhân viên thành công!');
      onClose();
    } catch (error) {
      console.error('Lỗi tạo user:', error);
      const msg = error.response?.data?.message || error.message || 'Tạo tài khoản thất bại!';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black bg-opacity-50 overflow-y-auto">
        <div className="min-h-screen px-4 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl my-8">
            <div className="p-8 space-y-6 overflow-y-auto max-h-[calc(100vh-8rem)]">
              {/* Header */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H9a4 4 0 01-4-4v-1m10 1h6a4 4 0 004-4v-1m-10-5h8m-8 0a4 4 0 00-4-4v-1m8 5a4 4 0 004-4v-1" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Create New Employee Account</h2>
                  <p className="text-sm text-gray-600">Fill in the information below to create a new user account</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e4f66] focus:border-[#0e4f66]"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter the user's first and last name</p>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="user@company.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e4f66] focus:border-[#0e4f66]"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">This will be used for login and notifications</p>
                </div>

                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Enter username"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e4f66] focus:border-[#0e4f66]"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Must be unique and contain only letters, numbers, and underscores</p>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter secure password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e4f66] focus:border-[#0e4f66]"
                    required
                  />
                  <div className="mt-2 text-xs text-gray-600">
                    <p>Password Requirements:</p>
                    <ul className="list-disc list-inside space-y-1 mt-1">
                      <li>At least 8 characters</li>
                      <li>One uppercase letter</li>
                      <li>One lowercase letter</li>
                      <li>One number</li>
                      <li>One special character</li>
                    </ul>
                  </div>
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role <span className="text-red-600">*</span>
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e4f66] focus:border-[#0e4f66]"
                    required
                  >
                    <option value="">Select a role</option>
                    <option value="admin">Admin</option>
                    <option value="manager">Employee</option>
                  
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Choose the appropriate role for this user's permissions</p>
                </div>

                {/* Permissions Info */}
                <div className="bg-blue-50 rounded-lg p-6 space-y-4">
                  <h3 className="font-medium text-gray-900">Role Permissions</h3>
                  <p className="text-sm text-gray-600">Permissions will be assigned based on selected role</p>
                </div>

                {/* Checkboxes */}
                <div className="space-y-4">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="sendWelcomeEmail"
                      checked={formData.sendWelcomeEmail}
                      onChange={handleChange}
                      className="w-4 h-4 text-[#0e4f66] rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">Send welcome email to user</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="requirePasswordChange"
                      checked={formData.requirePasswordChange}
                      onChange={handleChange}
                      className="w-4 h-4 text-[#0e4f66] rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">Require password change on first login</span>
                  </label>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 mt-8 sticky bottom-0 bg-white pb-6 -mx-8 px-8">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-[#0e4f66] text-white rounded-lg font-medium hover:bg-[#0c3f52] transition disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
                    {loading ? 'Saving...' : 'Save Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddNewAccountModal;