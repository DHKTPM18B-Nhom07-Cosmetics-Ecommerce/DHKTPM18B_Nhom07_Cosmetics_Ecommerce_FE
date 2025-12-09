import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, Pencil, AlertCircle, ToggleLeft, ToggleRight, Filter, RotateCcw, Eye, Folder, FolderOpen, CircleCheckBig } from 'lucide-react';
import { toast } from 'react-toastify';
import { getAllCategories, createCategory, updateCategory } from '../../services/categoryService';
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
  const [levelFilter, setLevelFilter] = useState('all'); // all, level1, level2... derived dynamic

  // Applied State (Triggers Table Update)
  const [appliedSearch, setAppliedSearch] = useState('');
  const [appliedStatus, setAppliedStatus] = useState('all');
  const [appliedLevel, setAppliedLevel] = useState('all');

  const [isLoading, setIsLoading] = useState(true);

  // Search Suggestions
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);
  const isSuggestionClicked = useRef(false);

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

  // Filter Logic (Triggered by Applied State)
  useEffect(() => {
    let result = categories;

    // 1. Search (using applied term)
    if (appliedSearch) {
      const lower = appliedSearch.toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(lower) ||
        (c.parent && c.parent.name.toLowerCase().includes(lower))
      );
    }

    // 2. Status Filter (using applied status)
    // 2. Status Filter (using applied status)
    if (appliedStatus !== 'all') {
      const isActive = appliedStatus === 'active';
      result = result.filter(c => {
        const cActive = c.isActive !== false;
        return cActive === isActive;
      });
    }

    // 3. Level Filter (using applied level)
    if (appliedLevel !== 'all') {
      // We can use the helper, but since we are inside useEffect, we might need to define getLevel here or make it pure/hoisted.
      // Easiest is to inline the depth check logic or just use the helper if it's stable.
      // Let's hoist getLevel logic or replicate it simply.
      // Actually, we can move `getLevel` outside the component or use useCallback, but simple inline count is robust:
      const getDepth = (c) => {
        let depth = 1;
        let current = c;
        while (current.parent) {
          depth++;
          current = current.parent;
        }
        return depth;
      };

      const targetLevel = parseInt(appliedLevel.replace('level', ''));
      if (!isNaN(targetLevel)) {
        result = result.filter(c => getDepth(c) === targetLevel);
      }
    }

    setFilteredCategories(result);
    setCurrentPage(0);
  }, [appliedSearch, appliedStatus, appliedLevel, categories]);

  // Suggestion Logic (Immediate type-ahead)
  useEffect(() => {
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      const matches = categories.filter(c =>
        c.name.toLowerCase().includes(lower) ||
        (c.parent && c.parent.name.toLowerCase().includes(lower))
      );

      if (matches.length > 0) {
        setSuggestions(matches.slice(0, 5));
        if (!isSuggestionClicked.current) {
          setShowSuggestions(true);
        }
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

  // Pagination Logic
  useEffect(() => {
    const start = currentPage * itemsPerPage;
    const end = start + itemsPerPage;
    setPaginatedCategories(filteredCategories.slice(start, end));
  }, [currentPage, filteredCategories]);

  // Update isAllSelected
  useEffect(() => {
    if (paginatedCategories.length > 0) {
      const allVisibleSelected = paginatedCategories.every(c => selectedCategories.includes(c.id));
      setIsAllSelected(allVisibleSelected);
    } else {
      setIsAllSelected(false);
    }
  }, [paginatedCategories, selectedCategories]);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const data = await getAllCategories();
      const sorted = data.sort((a, b) => b.id - a.id);
      setCategories(sorted);
    } catch (error) {
      toast.error("Không thể tải danh sách danh mục");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyFilters = () => {
    setAppliedSearch(searchTerm);
    setAppliedStatus(statusFilter);
    setAppliedLevel(levelFilter);
    setShowSuggestions(false);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleApplyFilters();
    }
  };

  const handleOpenModal = (category = null) => {
    setCurrentCategory(category);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setCurrentCategory(null);
    setIsModalOpen(false);
  };

  const handleViewDetail = (category) => {
    setDetailCategory(category);
    setIsDetailModalOpen(true);
  };

  const handleSaveCategory = async (categoryData) => {
    try {
      if (categoryData.id) {
        await updateCategory(categoryData.id, categoryData);
        toast.success("Cập nhật danh mục thành công!");
      } else {
        await createCategory(categoryData);
        toast.success("Tạo danh mục mới thành công!");
      }
      handleCloseModal();
      fetchCategories();
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggleStatus = (category) => {
    const isActive = category.isActive !== false;
    setConfirmModal({
      isOpen: true,
      title: isActive ? "Vô hiệu hóa danh mục" : "Kích hoạt danh mục",
      message: isActive
        ? `Bạn có chắc chắn muốn vô hiệu hóa danh mục "${category.name}"?`
        : `Bạn có chắc chắn muốn kích hoạt lại danh mục "${category.name}"?`,
      variant: isActive ? "danger" : "success",
      confirmLabel: isActive ? "Vô hiệu hóa" : "Kích hoạt",
      onConfirm: async () => {
        try {
          const newStatus = !isActive;
          const updatedCategories = categories.map(c =>
            c.id === category.id ? { ...c, isActive: newStatus } : c
          );
          setCategories(updatedCategories);

          await updateCategory(category.id, { ...category, isActive: newStatus });
          toast.success(`Đã ${newStatus ? 'kích hoạt' : 'vô hiệu hóa'} danh mục "${category.name}"`);
        } catch (error) {
          console.error(error);
          const activeErrorMsg = error.response?.data?.message || "Lỗi khi cập nhật trạng thái";
          toast.error(activeErrorMsg);
          fetchCategories();
        }
      }
    });
  };

  const handleBulkDisable = () => {
    const activeSelected = categories.filter(c => selectedCategories.includes(c.id) && c.isActive !== false);
    if (activeSelected.length === 0) return;

    setConfirmModal({
      isOpen: true,
      title: "Xác nhận vô hiệu hóa",
      message: `Bạn có chắc chắn muốn vô hiệu hóa ${activeSelected.length} danh mục đã chọn?`,
      variant: "danger",
      confirmLabel: "Vô hiệu hóa",
      onConfirm: async () => {
        try {
          // Optimistic UI Update
          const updatedCategories = categories.map(c =>
            selectedCategories.includes(c.id) ? { ...c, isActive: false } : c
          );
          setCategories(updatedCategories);
          setSelectedCategories([]); // Clear selection immediately

          await Promise.all(activeSelected.map(c => updateCategory(c.id, { ...c, isActive: false })));

          toast.success(`Đã vô hiệu hóa thành công ${activeSelected.length} danh mục.`);
        } catch (error) {
          console.error(error);
          const bulkErrorMsg = error.response?.data?.message || "Có lỗi xảy ra khi vô hiệu hóa danh mục.";
          toast.error(bulkErrorMsg);
          fetchCategories(); // Revert on error
        }
      }
    });
  };

  const handleBulkEnable = () => {
    const inactiveSelected = categories.filter(c => selectedCategories.includes(c.id) && c.isActive === false);
    if (inactiveSelected.length === 0) return;

    setConfirmModal({
      isOpen: true,
      title: "Xác nhận kích hoạt",
      message: `Bạn có chắc chắn muốn kích hoạt lại ${inactiveSelected.length} danh mục đã chọn?`,
      variant: "success",
      confirmLabel: "Kích hoạt",
      onConfirm: async () => {
        try {
          // Optimistic UI Update
          const updatedCategories = categories.map(c =>
            selectedCategories.includes(c.id) ? { ...c, isActive: true } : c
          );
          setCategories(updatedCategories);
          setSelectedCategories([]); // Clear selection immediately

          await Promise.all(inactiveSelected.map(c => updateCategory(c.id, { ...c, isActive: true })));

          toast.success(`Đã kích hoạt thành công ${inactiveSelected.length} danh mục.`);
        } catch (error) {
          console.error(error);
          toast.error("Có lỗi xảy ra khi kích hoạt danh mục.");
          fetchCategories(); // Revert on error
        }
      }
    });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleRefresh = () => {
    setSearchTerm('');
    setSearchTerm('');
    setStatusFilter('all');
    setLevelFilter('all');
    setAppliedSearch('');
    setAppliedStatus('all');
    setAppliedLevel('all');
    setCurrentPage(0);
    setSelectedCategories([]);
  };

  const handleSuggestionClick = (categoryName) => {
    isSuggestionClicked.current = true;
    setSearchTerm(categoryName);
    setAppliedSearch(categoryName); // Auto-apply on suggestion click
    setShowSuggestions(false);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const visibleIds = paginatedCategories.map(c => c.id);
      const newSelection = [...new Set([...selectedCategories, ...visibleIds])];
      setSelectedCategories(newSelection);
    } else {
      const visibleIds = paginatedCategories.map(c => c.id);
      const newSelection = selectedCategories.filter(id => !visibleIds.includes(id));
      setSelectedCategories(newSelection);
    }
  };

  const handleSelectCategory = (id) => {
    setSelectedCategories(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const getLevel = (cat) => {
    let depth = 1;
    let current = cat;
    let count = 0;
    while (current.parent && count < 20) { // Limit loop just for safety
      depth++;
      current = current.parent;
      count++;
    }
    return depth;
  };

  // Dynamic Level Palette
  const LEVEL_COLORS = [
    'bg-blue-100 text-blue-800 border-blue-200',   // Level 1
    'bg-teal-100 text-teal-800 border-teal-200',   // Level 2
    'bg-purple-100 text-purple-800 border-purple-200', // Level 3
    'bg-orange-100 text-orange-800 border-orange-200', // Level 4
    'bg-rose-100 text-rose-800 border-rose-200',   // Level 5
    'bg-indigo-100 text-indigo-800 border-indigo-200', // Level 6
    'bg-pink-100 text-pink-800 border-pink-200',   // Level 7
    'bg-amber-100 text-amber-800 border-amber-200', // Level 8
  ];

  const getLevelColor = (level) => {
    // Cycle through colors if level exceeds palette length
    const index = (level - 1) % LEVEL_COLORS.length;
    return LEVEL_COLORS[index] || LEVEL_COLORS[0];
  };

  // Compute available levels dynamically from data
  const maxDataLevel = categories.reduce((max, cat) => Math.max(max, getLevel(cat)), 1);
  const levelOptions = Array.from({ length: maxDataLevel }, (_, i) => i + 1);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 bg-gray-50 rounded-2xl min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2B6377] flex items-center gap-2">
            Quản lý Danh mục
          </h1>
          <p className="text-gray-500 mt-1">Quản lý phân cấp và hiển thị danh mục</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Tổng danh mục", value: categories.length, icon: Folder, color: "text-blue-600", bg: "bg-blue-100" },
          { label: "Đang hoạt động", value: categories.filter(c => c.isActive !== false).length, icon: CircleCheckBig, color: "text-green-600", bg: "bg-green-100" },
          { label: "Vô hiệu hóa", value: categories.filter(c => c.isActive === false).length, icon: AlertCircle, color: "text-red-600", bg: "bg-red-100" },
          { label: "Danh mục gốc", value: categories.filter(c => !c.parent).length, icon: FolderOpen, color: "text-indigo-600", bg: "bg-indigo-100" },
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
                placeholder="Nhập tên sản phẩm..."
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
                      <img
                        src={item.imageUrl || "https://placehold.co/40"}
                        alt=""
                        className="w-8 h-8 rounded object-cover border border-gray-100"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.name}</p>
                        <p className="text-xs text-gray-500">
                          {item.parent ? `Thuộc: ${item.parent.name}` : 'Danh mục gốc'}
                        </p>
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

          {/* Level Filter */}
          <div className="w-44 shrink-0">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Cấp danh mục</label>
            <div className="relative">
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="w-full pl-4 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2B6377] appearance-none bg-white cursor-pointer"
              >
                <option value="all">Tất cả cấp</option>
                {levelOptions.map(level => (
                  <option key={level} value={`level${level}`}>Cấp {level}</option>
                ))}
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
      {
        selectedCategories.length > 0 && (
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
        )
      }

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
                <th className="p-4 font-bold tracking-wider">Hình ảnh</th>
                <th className="p-4 font-bold tracking-wider">Tên danh mục</th>
                <th className="p-4 font-bold tracking-wider">Cấp danh mục</th>
                <th className="p-4 font-bold tracking-wider">Danh mục cha</th>
                <th className="p-4 font-bold tracking-wider text-center">Trạng thái</th>
                <th className="p-4 font-bold tracking-wider text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-500">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : paginatedCategories.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-12 text-center text-gray-500">
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
                  const level = getLevel(cat);

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
                      <td className="p-4">
                        <div className={`w-12 h-12 rounded-lg border border-gray-200 overflow-hidden bg-white p-1 ${!isActive ? 'grayscale' : ''}`}>
                          <img
                            src={cat.imageUrl || "https://placehold.co/100?text=No+Img"}
                            alt={cat.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </td>
                      <td className={`p-4 font-medium ${isActive ? 'text-gray-900' : 'text-gray-500 line-through'}`}>
                        {cat.name}
                      </td>
                      <td className="p-4">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border border-opacity-50 font-semibold whitespace-nowrap ${getLevelColor(level)}`}>
                          Cấp {level}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600">
                        {cat.parent ? (
                          <div className="flex flex-col gap-1">
                            <span className={`inline-flex items-center w-fit px-2 py-0.5 rounded text-xs font-medium ${getLevelColor(getLevel(cat.parent))}`}>
                              {cat.parent.name}
                            </span>
                            {cat.parent.parent && (
                              <span className="text-[10px] text-gray-400 pl-1">Target: {cat.parent.parent.name}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs italic">Gốc</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${isActive ? 'bg-green-100 text-green-700' : 'bg-gray-300 text-gray-700'}`}>
                          {isActive ? 'Hoạt động' : 'Vô hiệu hóa'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleViewDetail(cat)}
                            className="p-1.5 rounded-lg hover:bg-[#ccdfe3] text-[#2B6377] hover:text-[#235161] transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye size={18} />
                          </button>
                          {isActive && (
                            <button
                              onClick={() => handleOpenModal(cat)}
                              className="p-1.5 rounded-lg hover:bg-[#ccdfe3] text-amber-600 hover:text-amber-700 transition-colors"
                              title="Chỉnh sửa"
                            >
                              <Pencil size={18} />
                            </button>
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

        {filteredCategories.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredCategories.length / itemsPerPage)}
            onPageChange={handlePageChange}
            totalItems={filteredCategories.length}
            itemsPerPage={itemsPerPage}
            className="border-0 border-t border-gray-200 rounded-none shadow-none"
          />
        )}
      </div>

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
