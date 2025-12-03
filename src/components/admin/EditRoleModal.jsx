import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';

export default function EditRoleModal({ isOpen, onClose, onConfirm, currentUser }) {
  const [role, setRole] = useState(currentUser?.role || 'EMPLOYEE');

  if (!currentUser) return null;

  const handleSubmit = () => {
    onConfirm(currentUser.id, role);
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-sm transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
            <div className="flex justify-between items-center mb-4">
              <Dialog.Title className="text-lg font-bold text-gray-900">
                Cập nhật vai trò
              </Dialog.Title>
              <button onClick={onClose}><X className="w-5 h-5 text-gray-500" /></button>
            </div>

            <div className="mt-2">
              <p className="text-sm text-gray-500 mb-4">
                Chọn vai trò mới cho tài khoản <strong>{currentUser.username}</strong>:
              </p>
              
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B6377]"
              >
                {/* Chỉ cho phép đổi qua lại giữa ADMIN và EMPLOYEE (theo yêu cầu của bạn) */}
                <option value="EMPLOYEE">EMPLOYEE (Nhân viên)</option>
                <option value="ADMIN">ADMIN (Quản trị viên)</option>
              </select>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 text-white rounded-lg hover:opacity-90"
                style={{ backgroundColor: '#2B6377' }}
              >
                Lưu thay đổi
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </Transition>
  );
}