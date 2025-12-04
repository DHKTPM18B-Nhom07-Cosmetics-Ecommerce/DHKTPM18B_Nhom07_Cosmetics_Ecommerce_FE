import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ currentPage, totalPages, onPageChange, className = "", totalItems = 0, itemsPerPage = 10 }) {
  const page = currentPage + 1;
  const startItem = (currentPage * itemsPerPage) + 1;
  const endItem = Math.min((currentPage + 1) * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 3) {
        for (let i = 1; i <= 5; i++) pages.push(i);
      } else if (page >= totalPages - 2) {
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        for (let i = page - 2; i <= page + 2; i++) pages.push(i);
      }
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center justify-between bg-[#f5fafb] px-5 py-3 rounded-lg border border-[#d9e6ea] ${className}`}>
      <div className="text-[#4c7480] text-sm">
        Hiển thị <strong>{startItem}-{endItem}</strong> / {totalItems}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="p-2 rounded-lg text-[#34535c] hover:bg-[#ccdfe3] transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {pageNumbers.map((num) => (
          <button
            key={num}
            onClick={() => onPageChange(num - 1)}
            className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors flex items-center justify-center ${page === num
              ? "bg-[#2b6377] text-white"
              : "text-[#34535c] hover:bg-[#ccdfe3]"
              }`}
          >
            {num}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages - 1}
          className="p-2 rounded-lg text-[#34535c] hover:bg-[#ccdfe3] transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}