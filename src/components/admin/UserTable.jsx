// src/components/admin/UserTable.jsx
import UserRow from './UserRow';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function UserTable({ users, loading, page, totalPages, onPageChange, onDisable }) {
  if (loading) return <div className="p-8 text-center">Đang tải...</div>;

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 text-left text-sm font-medium text-gray-600">
              <th className="pb-4 px-6">Thứ tự</th>
              <th className="pb-4 px-6">Tên khách hàng</th>
              <th className="pb-4 px-6">Ngày tham gia</th>
              <th className="pb-4 px-6">Tổng đơn hàng</th>
              <th className="pb-4 px-6">Vai trò</th>
              <th className="pb-4 px-6">Trạng thái</th>
              <th className="pb-4 px-6">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-gray-500">Không có dữ liệu</td></tr>
            ) : (
              users.map((user, idx) => (
                <UserRow
                  key={user.id || user.account?.id}
                  user={user}
                  index={page * 10 + idx}
                  onDisable={onDisable}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200">
          <button
            onClick={() => onPageChange(Math.max(0, page - 1))}
            disabled={page === 0}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4" /> Trước
          </button>
          <span className="text-sm text-gray-600">
            Trang {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg disabled:opacity-50"
          >
            Sau <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </>
  );
}