// src/components/admin/UserDetailModal.jsx
import { Dialog, Transition } from '@headlessui/react';
import { Fragment,useState, useEffect } from 'react';
import { getClientIP } from '../../services/getClientIP';
import {
  XMarkIcon,
  PencilIcon,
  KeyIcon,
  UserMinusIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  UserCircleIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  ClockIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { disableAccount } from '../../services/api';

export default function UserDetailModal({ isOpen, onClose, user, onUserUpdated }) {
  if (!user) return null;

  // ĐÚNG CHO CẢ CUSTOMER VÀ EMPLOYEE/ADMIN
  const [clientIP, setClientIP] = useState('Loading IP...');
  const account = user.account || user; // Customer có .account, Employee thì không
  const isCustomer = account.role?.toUpperCase() === 'CUSTOMER';
  const isEmployeeOrAdmin = ['EMPLOYEE', 'ADMIN'].includes(account.role?.toUpperCase());

  useEffect(() => {
    if (isOpen && isEmployeeOrAdmin) {
      getClientIP().then(ip => setClientIP(ip));
    }
  }, [isOpen, isEmployeeOrAdmin]);
  // DỮ LIỆU THẬT TỪ BE — KHÔNG HARDCODE
  const fullName = isCustomer ? user.name : (account.fullName || account.username || 'Unknown');
  const email = account.email || account.username || '—';
  const phoneNumber = account.phoneNumber || 'Not provided';
  const address = user.address;
  const createdAt = account.createdAt;

  const handleDisable = async () => {
    if (!window.confirm(`Vô hiệu hóa tài khoản "${fullName}"?`)) return;
    try {
      await disableAccount(account.id); 
      alert('Đã vô hiệu hóa thành công!');
      onUserUpdated?.();
      onClose();
    } catch (err) {
      alert('Lỗi khi vô hiệu hóa!');
    }
  };

  const getStatusBadge = () => {
    const status = account.status?.toUpperCase();
    if (status === 'ACTIVE')
      return <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-xs font-medium">Active</span>;
    if (status === 'DISABLED')
      return <span className="px-4 py-2 bg-red-100 text-red-800 rounded-full text-xs font-medium">Disabled</span>;
    return <span className="px-4 py-2 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">Unknown</span>;
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child as={Fragment}
          enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
          leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black bg-opacity-40" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child as={Fragment}
              enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
              leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden">

                {/* Header */}
                <div className="bg-gradient-to-r from-teal-600 to-cyan-700 text-white p-6 relative">
                  <button onClick={onClose} className="absolute right-6 top-6 hover:bg-white/20 rounded-lg p-2 transition">
                    <XMarkIcon className="w-8 h-8" />
                  </button>
                  <div className="flex items-start gap-6">
                    <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-4xl font-bold">
                      {fullName?.split(' ').map(n => n[0]).slice(-2).join('').toUpperCase() || '??'}
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold">{fullName}</h2>
                      <p className="opacity-90 text-lg">
                        {isCustomer ? 'Customer' : 'User'} ID: #{isCustomer ? user.id : account.id || '—'}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-sm">Member Since</span>
                        <span className="font-medium">
                          {createdAt ? new Date(createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'}
                        </span>
                        {isCustomer && (
                          <>
                            <span className="mx-2">•</span>
                            {/* <span>Account Type</span> */}
                            {/* <span className="bg-white/20 px-3 py-1 rounded-full text-sm">Premium</span> */}
                          </>
                        )}
                        <span className="mx-2">•</span>
                        {getStatusBadge()}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

                 {/* CUSTOMER VIEW */}
                  {isCustomer && (
                    <>
                      <div className="lg:col-span-2 space-y-8">
                        
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold">Contact Details</h3>
                            <button className="text-cyan-600 hover:text-cyan-700 flex items-center gap-2 text-sm font-medium">
                              <PencilIcon className="w-5 h-5" /> Edit
                            </button>
                          </div>
                          <div className="bg-gray-50 rounded-2xl p-6 space-y-5">
                            <div className="flex items-center gap-4">
                              <EnvelopeIcon className="w-6 h-6 text-gray-500" />
                              <div>
                                <p className="text-sm text-gray-600">Email Address</p>
                                <p className="font-medium">{email || '—'}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <PhoneIcon className="w-6 h-6 text-gray-500" />
                              <div>
                                <p className="text-sm text-gray-600">Phone Number</p>
                                <p className="font-medium">{phoneNumber || 'Not provided'}</p>
                              </div>
                            </div>
                            {address && (
                              <div className="flex items-center gap-4">
                                <MapPinIcon className="w-6 h-6 text-gray-500" />
                                <div>
                                  <p className="text-sm text-gray-600">Address</p>
                                  <p className="font-medium">{address}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Recent Activity - giữ nguyên mẫu */}
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold">Recent Activity</h3>
                            <a href="#" className="text-cyan-600 text-sm font-medium hover:underline">View All</a>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                              <CheckCircleIcon className="w-6 h-6 text-green-500" />
                              <div className="flex-1">
                                <p className="font-medium">Payment Received</p>
                                <p className="text-sm text-gray-500">Transaction ID: #TXN-8647</p>
                              </div>
                              <p className="text-sm text-gray-500">2 hours ago</p>
                            </div>
                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                              <DocumentTextIcon className="w-6 h-6 text-blue-500" />
                              <div className="flex-1">
                                <p className="font-medium">Invoice Generated</p>
                                <p className="text-sm text-gray-500">Invoice #INV-2024-0156</p>
                              </div>
                              <p className="text-sm text-gray-500">5 hours ago</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* CỘT PHẢI - GIỮ NGUYÊN HẾT MẪU THỐNG KÊ */}
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-xl font-bold mb-4">Account Statistics</h3>
                          <div className="space-y-4">
                            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
                              <p className="text-sm text-gray-600">Total Balance</p>
                              <p className="text-3xl font-bold text-cyan-700">$24,580.50</p>
                              <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                                <ArrowUpIcon className="w-4 h-4" /> +12.5% from last month
                              </p>
                            </div>
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                              <p className="text-sm text-gray-600">Total Income</p>
                              <p className="text-2xl font-bold text-green-700">$18,420.00</p>
                              <p className="text-xs text-gray-500 mt-1">This month</p>
                            </div>
                            <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl p-6 border border-red-100">
                              <p className="text-sm text-gray-600">Total Expenses</p>
                              <p className="text-2xl font-bold text-red-600">$6,840.00</p>
                              <p className="text-xs text-gray-500 mt-1">This month</p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-purple-50 rounded-2xl p-6 border border-purple-200">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-bold">Pending Transactions</h4>
                            <ExclamationTriangleIcon className="w-6 h-6 text-purple-600" />
                          </div>
                          <p className="text-3xl font-bold text-purple-700">8</p>
                          <p className="text-sm text-purple-600">Awaiting approval</p>
                        </div>

                        <div className="bg-gray-50 rounded-2xl p-6">
                          <h4 className="font-bold mb-4">Quick Actions</h4>
                          <div className="space-y-3">
                            <button className="w-full py-4 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition font-medium">
                              Edit
                            </button>
                            <button className="w-full py-4 border border-gray-300 rounded-xl hover:bg-gray-100 transition font-medium">
                              Reset password
                            </button>
                            <button onClick={handleDisable} className="w-full py-4 border border-red-300 text-red-600 rounded-xl hover:bg-red-50 transition font-medium">
                              Disable account
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

              
                  {isEmployeeOrAdmin && (
                    <>
                      <div className="lg:col-span-2 space-y-8">
                        <div>
                          <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                            <UserCircleIcon className="w-8 h-8 text-cyan-600" />
                            Employee Information
                          </h3>
                          <div className="grid grid-cols-2 gap-6">
                            <div><p className="text-sm text-gray-600">Work Email</p><p className="font-medium text-lg">{email}</p></div>
                            <div><p className="text-sm text-gray-600">Phone Number</p><p className="font-medium text-lg">{phoneNumber}</p></div>
                          
                            <div><p className="text-sm text-gray-600">Employee ID</p><p className="font-medium text-lg">{account.id}</p></div>
                            <div><p className="text-sm text-gray-600">Joined Date</p><p className="font-medium text-lg">{createdAt}</p></div>
                            
                          </div>
                        </div>

                        <div>
                          <h3 className="text-xl font-bold mb-4">Recent System Activity</h3>
                          <div className="space-y-3">
                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <ClockIcon className="w-6 h-6 text-blue-600" />
                              </div>
                              
                        <div className="flex-1">
                          <p className="font-medium">Logged in from IP {clientIP}</p>
                        </div>
                        <span className="text-sm text-gray-500">Vừa xong</span>
                            </div>
                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircleIcon className="w-6 h-6 text-green-600" />
                              </div>
                              <div className="flex-1"><p className="font-medium">Updated ticket #CRM-204</p></div>
                              <span className="text-sm text-gray-500">1 ngày trước</span>
                            </div>
                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                <DocumentTextIcon className="w-6 h-6 text-purple-600" />
                              </div>
                              <div className="flex-1"><p className="font-medium">Submitted weekly sales report</p></div>
                              <span className="text-sm text-gray-500">3 ngày trước</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="bg-gradient-to-b from-cyan-50 to-blue-50 rounded-2xl p-6 border border-cyan-200">
                          <h4 className="font-bold text-lg mb-4">Access Summary</h4>
                          <div className="space-y-4">
                            <div><p className="text-sm text-gray-600">Access Level</p><p className="font-bold text-lg">Admin (Sales)</p></div>
                            <div><p className="text-sm text-gray-600">Tasks Assigned</p><p className="text-3xl font-bold">12</p></div>
                            <div><p className="text-sm text-gray-600">Last Login</p><p className="font-medium">08/11/2025, 10:30 AM</p></div>
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-2xl p-6">
                          <h4 className="font-bold mb-4">Quick Actions</h4>
                          <div className="space-y-3">
                            <button className="w-full py-4 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition font-medium flex items-center justify-center gap-3">
                              <PencilIcon className="w-5 h-5" /> Edit
                            </button>
                            <button className="w-full py-4 border border-gray-300 rounded-xl hover:bg-gray-100 transition font-medium flex items-center justify-center gap-3">
                              <KeyIcon className="w-5 h-5" /> Reset Password
                            </button>
                            <button className="w-full py-4 border border-gray-300 rounded-xl hover:bg-gray-100 transition font-medium">
                              View Access Logs
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}