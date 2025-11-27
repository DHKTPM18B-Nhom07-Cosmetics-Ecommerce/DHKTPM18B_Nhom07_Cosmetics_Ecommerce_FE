// src/components/admin/UserRow.jsx
import { Trash2 } from 'lucide-react'
import Badge from '../ui/Badge'

const getTimeAgo = (date) => {
  const now = new Date()
  const diff = now - new Date(date)
  const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30))
  return months === 0 ? 'Just now' : `${months} month${months > 1 ? 's' : ''} ago`
}

export default function UserRow({ user, onDisable, onView }) {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-300 rounded-full border-2 border-dashed"></div>
          <div>
            <p className="font-medium">{user.fullName}</p>
            <p className="text-sm text-gray-500">Joined {getTimeAgo(user.createdAt)}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-gray-700">{user.username}</td>
      <td className="px-6 py-4">
        <Badge variant={user.role === 'ADMIN' ? 'purple' : user.role === 'EMPLOYEE' ? 'blue' : 'gray'}>
          {user.role}
        </Badge>
      </td>
      <td className="px-6 py-4">
        <Badge variant={user.status === 'ACTIVE' ? 'green' : user.status === 'PENDING' ? 'yellow' : 'red'}>
          {user.status}
        </Badge>
      </td>
      <td className="px-6 py-4">
        <div className="flex gap-4">
          <button onClick={() => onView(user)} className="text-blue-600 hover:underline">View</button>
          <button onClick={() => onDisable(user.id)} className="text-red-600">
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </td>
    </tr>
  )
}