// src/components/admin/FilterModal.jsx
import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';

const roles = ['All Role', 'ADMIN', 'EMPLOYEE', 'CUSTOMER'];
const statuses = ['All Status', 'ACTIVE', 'PENDING', 'DISABLED'];

export default function FilterModal({ isOpen, onClose, onApply }) {
  const [search, setSearch] = useState('');
 const [role, setRole] = useState('All Role');
 const [status, setStatus] = useState('All Status');

 const handleApply = () => {
   onApply({
     search: search.trim() || undefined,
     role: role === 'All Role' ? undefined : role,
     status: status === 'All Status' ? undefined : status,
   });
   onClose();
 };

 const handleReset = () => {
   setSearch('');
   setRole('All Role');
   setStatus('All Status');
 };

 return (
   <Transition appear show={isOpen} as={Fragment}>
     <Dialog as="div" className="relative z-50" onClose={onClose}>
       <Transition.Child
         as={Fragment}
         enter="ease-out duration-200"
         enterFrom="opacity-0"
         enterTo="opacity-100"
         leave="ease-in duration-150"
         leaveFrom="opacity-100"
         leaveTo="opacity-0"
       >
         <div className="fixed inset-0 bg-black bg-opacity-25" />
       </Transition.Child>

       <div className="fixed inset-0 overflow-y-auto">
         <div className="flex min-h-full items-center justify-center p-4">
           <Transition.Child
             as={Fragment}
             enter="ease-out duration-300"
             enterFrom="opacity-0 scale-95"
             enterTo="opacity-100 scale-100"
             leave="ease-in duration-200"
             leaveFrom="opacity-100 scale-100"
             leaveTo="opacity-0 scale-95"
           >
             <Dialog.Panel className="w-full max-w-2xl bg-white rounded-2xl p-8 shadow-xl">
               <div className="flex justify-between items-center mb-6">
                 <Dialog.Title className="text-xl font-semibold">Filter user</Dialog.Title>
                 <button onClick={onClose}>
                   <XMarkIcon className="h-6 w-6 text-gray-500" />
                 </button>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Search Name/Email
                   </label>
                   <input
                     type="text"
                     value={search}
                     onChange={(e) => setSearch(e.target.value)}
                     placeholder="Enter User fullname or email"
                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                   />
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                   <select
                     value={status}
                     onChange={(e) => setStatus(e.target.value)}
                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                   >
                     {statuses.map(s => <option key={s}>{s}</option>)}
                   </select>
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                   <select
                     value={role}
                     onChange={(e) => setRole(e.target.value)}
                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                   >
                     {roles.map(r => <option key={r}>{r}</option>)}
                   </select>
                 </div>
               </div>

               <div className="mt-8 flex justify-end gap-3">
                 <button
                   onClick={handleReset}
                   className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200"
                 >
                   Reset
                 </button>
                 <button
                   onClick={handleApply}
                   className="px-8 py-3 bg-teal-500 text-white rounded-xl hover:bg-teal-600 flex items-center gap-2"
                 >
                   <FunnelIcon className="h-5 w-5" />
                   Apply Filters
                 </button>
               </div>
             </Dialog.Panel>
           </Transition.Child>
         </div>
       </div>
     </Dialog>
   </Transition>
 );
}