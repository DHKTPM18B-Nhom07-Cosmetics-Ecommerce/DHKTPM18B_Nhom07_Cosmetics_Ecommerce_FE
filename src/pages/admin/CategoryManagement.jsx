import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, Pencil, AlertCircle, ToggleLeft, ToggleRight, Filter, RotateCcw, Eye, Folder, CircleCheckBig, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { getAllCategories, createCategory, updateCategory, deleteCategory } from '../../services/categoryService';
import { filterProducts } from '../../services/productFilterApi';
import CategoryModal from '../../components/admin/CategoryModal';
import CategoryDetailModal from '../../components/admin/CategoryDetailModal';
import Pagination from '../../components/ui/Pagination';
import ConfirmationModal from '../../components/ui/ConfirmationModal';

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [paginatedCategories, setPaginatedCategories] = useState([]);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, inactive

  // Applied State (Triggers Table Update)
  const [appliedSearch, setAppliedSearch] = useState('');
  const [appliedStatus, setAppliedStatus] = useState('all');

  const [isLoading, setIsLoading] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);

  // Detail Modal State
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailCategory, setDetailCategory] = useState(null);

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    variant: "danger",
    confirmLabel: "Xác nhận"
  });

  // Selection State
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isAllSelected, setIsAllSelected] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Filter Logic (Triggered by Applied State)
  useEffect(() => {
    let result = categories;

    // 1. Search
    if (appliedSearch) {
      const lower = appliedSearch.toLowerCase();
      result = result.filter(c => c.name.toLowerCase().includes(lower));
    }

    // 2. Status
    if (appliedStatus !== 'all') {
      const isActive = appliedStatus === 'active';
      result = result.filter(c => {
        const cActive = c.isActive !== false;
        return cActive === isActive;
      });
    }

    setFilteredCategories(result);
    setCurrentPage(0);
  }, [appliedSearch, appliedStatus, categories]);

  // Pagination Logic
  useEffect(() => {
    const start = currentPage * itemsPerPage;
    const end = start + itemsPerPage;
    setPaginatedCategories(filteredCategories.slice(start, end));
  }, [currentPage, filteredCategories]);

  // Update isAllSelected
  useEffect(() => {
    if (paginatedCategories.length > 0) {
      setIsAllSelected(paginatedCategories.every(c => selectedCategories.includes(c.id)));
    } else {
      setIsAllSelected(false);
    }
  }, [paginatedCategories, selectedCategories]);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const data = await getAllCategories();
      // Sort by ID descending
      setCategories(data.sort((a, b) => b.id - a.id));
    } catch (e) { toast.error("Không thể tải danh sách danh mục"); }
    finally { setIsLoading(false); }
  };

  const handleApplyFilters = () => {
    setAppliedSearch(searchTerm);
    setAppliedStatus(statusFilter);
  };
  const handleSearchKeyDown = (e) => { if (e.key === 'Enter') handleApplyFilters(); };
  const handleOpenModal = (cat = null) => { setCurrentCategory(cat); setIsModalOpen(true); };
  const handleCloseModal = () => { setCurrentCategory(null); setIsModalOpen(false); };
  const handleViewDetail = (cat) => { setDetailCategory(cat); setIsDetailModalOpen(true); };

  const handleSaveCategory = async (data) => {
    try {
      if (data.id) { await updateCategory(data.id, data); toast.success("Cập nhật thành công!"); }
      else { await createCategory(data); toast.success("Tạo mới thành công!"); }
      handleCloseModal(); fetchCategories();
    } catch (e) { console.error(e); }
  };

  const handleToggleStatus = async (cat) => {
    const isActive = cat.isActive !== false;

    // If currently active (trying to disable), check for products
    if (isActive) {
      try {
        const res = await filterProducts({ categories: String(cat.id), size: 1 });
        const count = res.totalElements !== undefined ? res.totalElements : (Array.isArray(res) ? res.length : 0);

        if (count > 0) {
          toast.warn(`Danh mục này đang có ${count} sản phẩm, không thể vô hiệu hóa!`);
          return;
        }
      } catch (e) {
        console.error("Error checking products", e);
        // Fallback: warn user but allow or block? Safe to block if unsure.
        // But let's assume if check fails, we might just warn. 
        // User request "check... mới vô hiệu hóa". So if check fails or has products, DO NOT disable.
        toast.error("Không thể kiểm tra số lượng sản phẩm. Vui lòng thử lại.");
        return;
      }
    }

    setConfirmModal({
      isOpen: true,
      title: isActive ? "Vô hiệu hóa" : "Kích hoạt",
      message: `Bạn có chắc chắn muốn ${isActive ? "vô hiệu hóa" : "kích hoạt"} danh mục "${cat.name}"?`,
      variant: isActive ? "danger" : "success",
      confirmLabel: isActive ? "Vô hiệu hóa" : "Kích hoạt",
      onConfirm: async () => {
        try {
          // Optimistic
          const newStatus = !isActive;
          setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, isActive: newStatus } : c));
          await updateCategory(cat.id, { ...cat, isActive: newStatus });
          toast.success(`Đã ${newStatus ? 'kích hoạt' : 'vô hiệu hóa'} danh mục.`);
        } catch (e) {
          toast.error("Lỗi khi cập nhật trạng thái");
          fetchCategories();
        }
      }
    });
  };

  const handleBulkDisable = async () => {
    const activeSelected = categories.filter(c => selectedCategories.includes(c.id) && c.isActive !== false);
    if (!activeSelected.length) return;

    // Check all selected for products
    const validToDisable = [];
    const invalidNames = [];

    // Show loading or something? This might be slow for many items.
    // For now, serial check or parallel.
    setIsLoading(true); // blockade UI
    try {
      await Promise.all(activeSelected.map(async (cat) => {
        try {
          const res = await filterProducts({ categories: String(cat.id), size: 1 });
          const count = res.totalElements || 0;
          if (count === 0) validToDisable.push(cat);
          else invalidNames.push(cat.name);
        } catch (e) { /* ignore or treat as invalid */ }
      }));
    } finally {
      setIsLoading(false);
    }

    if (invalidNames.length > 0) {
      toast.warn(`Không thể vô hiệu hóa ${invalidNames.length} danh mục vì có sản phẩm: ${invalidNames.slice(0, 3).join(', ')}${invalidNames.length > 3 ? '...' : ''}`);
      if (validToDisable.length === 0) return;
    }

    if (validToDisable.length === 0) return;

    setConfirmModal({
      isOpen: true,
      title: "Xác nhận vô hiệu hóa",
      message: `Vô hiệu hóa ${validToDisable.length} danh mục hợp lệ (trống)?`,
      variant: "danger",
      confirmLabel: "Vô hiệu hóa",
      onConfirm: async () => {
        try {
          setCategories(prev => prev.map(c => validToDisable.some(v => v.id === c.id) ? { ...c, isActive: false } : c));
          setSelectedCategories([]);
          await Promise.all(validToDisable.map(c => updateCategory(c.id, { ...c, isActive: false })));
          toast.success(`Đã vô hiệu hóa ${validToDisable.length} danh mục.`);
        } catch (e) { toast.error("Lỗi vô hiệu hóa"); fetchCategories(); }
      }
    });
  };

  const handleBulkEnable = () => {
    const inactiveSelected = categories.filter(c => selectedCategories.includes(c.id) && c.isActive === false);
    if (!inactiveSelected.length) return;
    setConfirmModal({
      isOpen: true,
      title: "Xác nhận kích hoạt",
      message: `Kích hoạt lại ${inactiveSelected.length} danh mục đã chọn?`,
      variant: "success",
      confirmLabel: "Kích hoạt",
      onConfirm: async () => {
        try {
          setCategories(prev => prev.map(c => selectedCategories.includes(c.id) ? { ...c, isActive: true } : c));
          setSelectedCategories([]);
          await Promise.all(inactiveSelected.map(c => updateCategory(c.id, { ...c, isActive: true })));
          toast.success(`Đã kích hoạt ${inactiveSelected.length} danh mục.`);
        } catch (e) { toast.error("Lỗi kích hoạt"); fetchCategories(); }
      }
    });
  };

  const handlePageChange = (page) => setCurrentPage(page);
  const handleRefresh = () => {
    setSearchTerm(''); setAppliedSearch('');
    setStatusFilter('all'); setAppliedStatus('all');
    setCurrentPage(0); setSelectedCategories([]);
    fetchCategories();
  };
  const handleSelectAll = (e) => {
    const visibleIds = paginatedCategories.map(c => c.id);
    if (e.target.checked) setSelectedCategories([...new Set([...selectedCategories, ...visibleIds])]);
    else setSelectedCategories(selectedCategories.filter(id => !visibleIds.includes(id)));
  };
  const handleSelectCategory = (id) => {
    setSelectedCategories(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  // Search Suggestions
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);
  const isSuggestionClicked = useRef(false);

  useEffect(() => {
    // Close suggestions when clicking outside
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Suggestion Logic
  useEffect(() => {
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      const matches = categories.filter(c => c.name.toLowerCase().includes(lower));
      if (matches.length > 0) {
        setSuggestions(matches.slice(0, 5));
        if (!isSuggestionClicked.current) setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
    isSuggestionClicked.current = false;
  }, [searchTerm, categories]);

  const handleSuggestionClick = (name) => {
    isSuggestionClicked.current = true;
    setSearchTerm(name);
    setAppliedSearch(name);
    setShowSuggestions(false);
  };

  return (
    <div className="p-6 mx-auto space-y-6 bg-gray-50 rounded-2xl min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2B6377] flex items-center gap-2">
            Quản lý Danh mục
          </h1>
          <p className="text-gray-500 mt-1">Quản lý danh mục sản phẩm</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Tổng danh mục", value: categories.length, icon: Folder, color: "text-blue-600", bg: "bg-blue-100" },
          { label: "Đang hoạt động", value: categories.filter(c => c.isActive !== false).length, icon: CircleCheckBig, color: "text-green-600", bg: "bg-green-100" },
          { label: "Vô hiệu hóa", value: categories.filter(c => c.isActive === false).length, icon: AlertCircle, color: "text-red-600", bg: "bg-red-100" },
        ].map((stat, index) => (
          <div key={index} className="rounded-2xl p-6 shadow-sm border border-gray-100 bg-[#D5E2E6]">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-700">{stat.label}</p>
                <p className="text-3xl font-bold mt-2 text-gray-900">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-white/50`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Actions Bar */}
      <div className="flex justify-end gap-3 mb-8">
        <button
          onClick={() => handleOpenModal()}
          className="bg-[#2B6377] flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-white shadow-md hover:shadow-lg hover:translate-y-0.5 hover:bg-[#2B6377]/80 transition"
        >
          <Plus className="w-5 h-5" />
          Thêm danh mục
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <div className="flex items-end gap-4 w-full flex-wrap">

          {/* Search Input */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tìm kiếm danh mục</label>
            <div className="relative" ref={searchRef}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              <input
                type="text"
                placeholder="Nhập tên danh mục..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                onFocus={() => { if (searchTerm && suggestions.length > 0) setShowSuggestions(true); }}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2B6377] focus:border-transparent transition-all"
              />

              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-auto">
                  {suggestions.map((item) => (
                    <div
                      key={item.id}
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3 border-b last:border-0"
                      onClick={() => handleSuggestionClick(item.name)}
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Status Filter */}
          <div className="w-44 shrink-0">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Trạng thái</label>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-4 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2B6377] appearance-none bg-white cursor-pointer"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Hoạt động</option>
                <option value="inactive">Vô hiệu hóa</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-end pb-0.5 gap-2">
            <button
              onClick={handleApplyFilters}
              className="h-[42px] px-4 bg-[#2B6377] text-white rounded-lg hover:bg-[#235161] transition-colors flex items-center gap-2 font-medium shadow-sm active:scale-95"
            >
              <Filter className="w-4 h-4" />
              Áp dụng
            </button>
            <button
              onClick={handleRefresh}
              className="h-[42px] px-3 border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-[#2B6377] transition-colors shadow-sm bg-white flex items-center justify-center"
              title="Làm mới"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>

        </div>

        <div className="text-sm text-[#2B6377] whitespace-nowrap font-medium border-t border-gray-100 pt-3 mt-4">
          Hiển thị <b>{filteredCategories.length}</b> danh mục
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedCategories.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between mb-6 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900">
              Đã chọn: <span className="font-bold text-[#2B6377]">{selectedCategories.length}</span> danh mục
            </span>
          </div>
          <div className="flex items-center gap-3">
            {categories.some(c => selectedCategories.includes(c.id) && c.isActive === false) && (
              <button
                onClick={handleBulkEnable}
                className="flex items-center gap-2 px-4 py-2 bg-white text-green-600 border border-green-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors shadow-sm"
              >
                <ToggleRight size={18} />
                Kích hoạt ({categories.filter(c => selectedCategories.includes(c.id) && c.isActive === false).length})
              </button>
            )}
            {categories.some(c => selectedCategories.includes(c.id) && c.isActive !== false) && (
              <button
                onClick={handleBulkDisable}
                className="flex items-center gap-2 px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors shadow-sm"
              >
                <ToggleLeft size={18} />
                Vô hiệu hóa ({categories.filter(c => selectedCategories.includes(c.id) && c.isActive !== false).length})
              </button>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#2B6377] text-white text-sm whitespace-nowrap">
                <th className="p-4 font-bold tracking-wider w-12">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-[#2B6377] focus:ring-[#2B6377]"
                  />
                </th>
                <th className="p-4 font-bold tracking-wider">Tên danh mục</th>
                <th className="p-4 font-bold tracking-wider text-center">Trạng thái</th>
                <th className="p-4 font-bold tracking-wider text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : paginatedCategories.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <AlertCircle size={40} className="text-gray-300" />
                      <span className="text-lg font-medium text-gray-400">Chưa có danh mục nào phù hợp</span>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedCategories.map((cat, index) => {
                  const isActive = cat.isActive !== false;
                  const isSelected = selectedCategories.includes(cat.id);

                  return (
                    <tr
                      key={cat.id}
                      className={`transition-colors cursor-pointer border-b last:border-0 ${isSelected ? "bg-sky-50" : isActive ? 'hover:bg-gray-50' : 'bg-gray-50 opacity-75'}`}
                      onClick={() => handleSelectCategory(cat.id)}
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectCategory(cat.id)}
                          onClick={(e) => e.stopPropagation()}
                          className={`w-4 h-4 rounded border-gray-300 ${!isActive ? "text-gray-400" : "text-[#2B6377] focus:ring-[#2B6377]"}`}
                        />
                      </td>
                      <td className={`p-4 font-medium ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                        {cat.name}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${isActive ? 'bg-green-100 text-green-700' : 'bg-gray-300 text-gray-700'}`}>
                          {isActive ? 'Hoạt động' : 'Vô hiệu hóa'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          {isActive && (
                            <>
                              <button
                                onClick={() => handleViewDetail(cat)}
                                className="p-1.5 rounded-lg hover:bg-[#ccdfe3] text-[#2B6377] hover:text-[#235161] transition-colors"
                                title="Xem chi tiết"
                              >
                                <Eye size={18} />
                              </button>
                              <button
                                onClick={() => handleOpenModal(cat)}
                                className="p-1.5 rounded-lg hover:bg-[#ccdfe3] text-amber-600 hover:text-amber-700 transition-colors"
                                title="Chỉnh sửa"
                              >
                                <Pencil size={18} />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleToggleStatus(cat)}
                            className={`p-1.5 rounded-lg transition-colors hover:bg-[#ccdfe3] ${isActive ? 'text-green-600 hover:text-green-700' : 'text-gray-600 hover:text-gray-700'}`}
                            title={isActive ? "Vô hiệu hóa" : "Kích hoạt"}
                          >
                            {isActive ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {
          filteredCategories.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredCategories.length / itemsPerPage)}
              onPageChange={handlePageChange}
              totalItems={filteredCategories.length}
              itemsPerPage={itemsPerPage}
              className="border-0 border-t border-gray-200 rounded-none shadow-none"
            />
          )
        }
      </div >

      <CategoryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveCategory}
        category={currentCategory}
      />

      <CategoryDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        category={detailCategory}
        allCategories={categories}
      />

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant}
        confirmLabel={confirmModal.confirmLabel}
      />
    </div >
  );
}
