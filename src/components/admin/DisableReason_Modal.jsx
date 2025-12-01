// src/components/admin/DisableAccountModal.jsx
import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function DisableAccountModal({ isOpen, onClose, onConfirm, user }) {
  const [reason, setReason] = useState('Vi phạm điều khoản');
  const [note, setNote] = useState('');

  if (!user) return null;

  const reasons = ['Vi phạm điều khoản', 'Không hoạt động', 'Yêu cầu từ người dùng', 'Khác'];

  const handleSubmit = () => {
    const fullReason = `${reason}${note ? `: ${note}` : ''}`;
    onConfirm(user.id, fullReason);
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl">
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title className="text-lg font-bold">Vô hiệu hóa tài khoản?</Dialog.Title>
                  <button onClick={onClose}><XMarkIcon className="h-6 w-6 text-gray-500" /></button>
                </div>
                <p className="mb-4">Tài khoản này sẽ không thể đăng nhập. Vui lòng chọn lý do và thêm ghi chú nếu cần.</p>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Lý do vô hiệu hóa</label>
                  <select value={reason} onChange={(e) => setReason(e.target.value)} className="w-full px-4 py-2 border rounded-lg">
                    {reasons.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Ghi chú / Lý do khác</label>
                  <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Nhập ghi chú..." className="w-full px-4 py-2 border rounded-lg h-24"></textarea>
                </div>
                <div className="flex justify-end gap-3">
                  <button onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg">Hủy</button>
                  <button onClick={handleSubmit} className="px-6 py-2 bg-red-600 text-white rounded-lg">Xác nhận</button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}