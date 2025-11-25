// src/components/admin/UserTable.jsx
import UserRow from './UserRow'
import Pagination from '../ui/Pagination'

export default function UserTable({ users, loading, page, totalPages, onPageChange, onDisable, onView }) {
  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">User Full Name</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {users.map(user => (
            <UserRow key={user.id} user={user} onDisable={onDisable} onView={onView} />
          ))}
        </tbody>
      </table>
      <div className="px-6 py-4 bg-gray-50 flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Showing {page * 10 + 1} to {Math.min((page + 1) * 10, 1247)} of 1,247 results
        </p>
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={onPageChange} />
      </div>
    </div>
  )
}