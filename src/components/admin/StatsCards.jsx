// src/components/admin/StatsCards.jsx
import { Users, UserCheck, Clock, UserX } from 'lucide-react'

const stats = [
  { label: 'Total Users', value: '1,247', icon: Users, color: 'blue' },
  { label: 'Active Users', value: '1,156', icon: UserCheck, color: 'green' },
  { label: 'Pending', value: '23', icon: Clock, color: 'yellow' },
  { label: 'Disabled', value: '68', icon: UserX, color: 'red' },
]

export default function StatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {stats.map(stat => (
        <div key={stat.label} className="bg-white rounded-lg shadow p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{stat.label}</p>
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
            </div>
            <div className={`p-3 rounded-full bg-${stat.color}-100`}>
              <stat.icon className={`w-8 h-8 text-${stat.color}-600`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}