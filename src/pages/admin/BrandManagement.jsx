import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, Pencil, AlertCircle, ToggleLeft, ToggleRight, Filter, RotateCcw, Eye, CircleCheckBig, Layers } from 'lucide-react';
import { toast } from 'react-toastify';
import { getAllBrands, createBrand, updateBrand } from '../../services/brandService';
import { filterProducts } from '../../services/productFilterApi';
import BrandModal from '../../components/admin/BrandModal';
import BrandDetailModal from '../../components/admin/BrandDetailModal';
import Pagination from '../../components/ui/Pagination';
import ConfirmationModal from '../../components/ui/ConfirmationModal';

export default function BrandManagement() {
  const [brands, setBrands] = useState([]);
  const [filteredBrands, setFilteredBrands] = useState([]);
  const [paginatedBrands, setPaginatedBrands] = useState([]);
  const [brandCounts, setBrandCounts] = useState({}); // { [brandId]: count }

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, inactive

  // Applied State (Triggers Table Update)
  const [appliedSearch, setAppliedSearch] = useState('');
  const [appliedStatus, setAppliedStatus] = useState('all');

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
  const [currentBrand, setCurrentBrand] = useState(null);

  // Detail Modal State
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailBrand, setDetailBrand] = useState(null);

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
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [isAllSelected, setIsAllSelected] = useState(false);

  useEffect(() => {
    fetchBrands();

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
    let result = brands;

    // 1. Search (using applied term)
    if (appliedSearch) {
      const lower = appliedSearch.toLowerCase();
      result = result.filter(b =>
        b.name.toLowerCase().includes(lower)
      );
    }

    // 2. Status Filter (using applied status)
    if (appliedStatus !== 'all') {
      const isActive = appliedStatus === 'active';
      result = result.filter(b => {
        const bActive = b.isActive !== false;
        return bActive === isActive;
      });
    }

    setFilteredBrands(result);
    setCurrentPage(0);
  }, [appliedSearch, appliedStatus, brands]);

  // Suggestion Logic (Immediate type-ahead)
  useEffect(() => {
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      const matches = brands.filter(b =>
        b.name.toLowerCase().includes(lower)
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
  }, [searchTerm, brands]);

  // Pagination Logic
  useEffect(() => {
    const start = currentPage * itemsPerPage;
    const end = start + itemsPerPage;
    setPaginatedBrands(filteredBrands.slice(start, end));
  }, [currentPage, filteredBrands]);

  // Fetch Product Counts for Visible Brands
  useEffect(() => {
    const fetchCounts = async () => {
      if (paginatedBrands.length === 0) return;

      const counts = {};
      await Promise.all(paginatedBrands.map(async (brand) => {
        if (brandCounts[brand.id] !== undefined) return;
        try {
          const res = await filterProducts({ brands: brand.id, size: 1 });
          counts[brand.id] = res.totalElements !== undefined ? res.totalElements : (Array.isArray(res) ? res.length : 0);
        } catch (err) {
          console.error("Error fetching count for brand", brand.id, err);
          counts[brand.id] = 0;
        }
      }));

      if (Object.keys(counts).length > 0) {
        setBrandCounts(prev => ({ ...prev, ...counts }));
      }
    };

    fetchCounts();
  }, [paginatedBrands]);

  // Update isAllSelected
  useEffect(() => {
    if (paginatedBrands.length > 0) {
      const allVisibleSelected = paginatedBrands.every(b => selectedBrands.includes(b.id));
      setIsAllSelected(allVisibleSelected);
    } else {
      setIsAllSelected(false);
    }
  }, [paginatedBrands, selectedBrands]);

  const fetchBrands = async () => {
    setIsLoading(true);
    try {
      const data = await getAllBrands();
      console.log("Brands Data:", data);
      // Sort by ID DESC (newest first)
      const sorted = data.sort((a, b) => b.id - a.id);
      setBrands(sorted);
    } catch (error) {
      toast.error("Không thể tải danh sách thương hiệu");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyFilters = () => {
    setAppliedSearch(searchTerm);
    setAppliedStatus(statusFilter);
    setShowSuggestions(false);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleApplyFilters();
    }
  };

  const handleOpenModal = (brand = null) => {
    setCurrentBrand(brand);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setCurrentBrand(null);
    setIsModalOpen(false);
  };

  const handleViewDetail = (brand) => {
    setDetailBrand(brand);
    setIsDetailModalOpen(true);
  };

  const handleSaveBrand = async (brandData) => {
    try {
      if (brandData.id) {
        await updateBrand(brandData.id, brandData);
        toast.success("Cập nhật thương hiệu thành công!");
      } else {
        await createBrand(brandData);
        toast.success("Tạo thương hiệu mới thành công!");
      }
      handleCloseModal();
      fetchBrands();
    } catch (error) {
      console.error(error);
    }
  };

  // Helper: Check if brand has products
  const checkBrandHasProducts = async (brandId) => {
    try {
      // Filter by this brand, size 1 just to check existence
      const res = await filterProducts({ brands: brandId, size: 1 });
      // Depending on API structure, it usually returns { content, totalElements } or just content array
      // Based on typical Spring Data or similar:
      if (res.totalElements !== undefined) return res.totalElements > 0;
      // If it returns list directly
      if (Array.isArray(res)) return res.length > 0;
      if (res.content && Array.isArray(res.content)) return res.content.length > 0;

      return false;
    } catch (error) {
      console.error("Error checking brand products:", error);
      return false; // Fail safe? Or block? Let's assume false to allow disable if check fails, or maybe warn.
    }
  };

  const handleToggleStatus = async (brand) => {
    const isActive = brand.isActive !== false;

    // [NEW] Check product count via API before disabling
    if (isActive) {
      const hasProducts = await checkBrandHasProducts(brand.id);
      if (hasProducts) {
        toast.error(`Không thể vô hiệu hóa thương hiệu "${brand.name}" vì đang có sản phẩm.`);
        return;
      }
    }

    setConfirmModal({
      isOpen: true,
      title: isActive ? "Vô hiệu hóa thương hiệu" : "Kích hoạt thương hiệu",
      message: isActive
        ? `Bạn có chắc chắn muốn vô hiệu hóa thương hiệu "${brand.name}"?`
        : `Bạn có chắc chắn muốn kích hoạt lại thương hiệu "${brand.name}"?`,
      variant: isActive ? "danger" : "success",
      confirmLabel: isActive ? "Vô hiệu hóa" : "Kích hoạt",
      onConfirm: async () => {
        try {
          const newStatus = !isActive;
          // Optimistic update
          const updatedBrands = brands.map(b =>
            b.id === brand.id ? { ...b, isActive: newStatus } : b
          );
          setBrands(updatedBrands);

          await updateBrand(brand.id, { ...brand, isActive: newStatus });
          toast.success(`Đã ${newStatus ? 'kích hoạt' : 'vô hiệu hóa'} thương hiệu "${brand.name}"`);
        } catch (error) {
          console.error(error);
          toast.error("Lỗi khi cập nhật trạng thái");
          fetchBrands(); // Revert
        }
      }
    });
  };

  const handleBulkDisable = async () => {
    const activeSelected = brands.filter(b => selectedBrands.includes(b.id) && b.isActive !== false);
    if (activeSelected.length === 0) return;

    // Check all selected brands for products
    const brandsWithProducts = [];
    const brandsToDisable = [];

    // This might be slow if many selected, but safe.
    setIsLoading(true); // Show loading state briefly
    await Promise.all(activeSelected.map(async (b) => {
      const has = await checkBrandHasProducts(b.id);
      if (has) brandsWithProducts.push(b);
      else brandsToDisable.push(b);
    }));
    setIsLoading(false);

    if (brandsWithProducts.length > 0) {
      toast.error(`Không thể vô hiệu hóa ${brandsWithProducts.length} thương hiệu vì đang có sản phẩm. Chỉ vô hiệu hóa ${brandsToDisable.length} thương hiệu hợp lệ.`);
    }

    if (brandsToDisable.length === 0) return;

    setConfirmModal({
      isOpen: true,
      title: "Xác nhận vô hiệu hóa",
      message: `Bạn có chắc chắn muốn vô hiệu hóa ${brandsToDisable.length} thương hiệu đã chọn?`,
      variant: "danger",
      confirmLabel: "Vô hiệu hóa",
      onConfirm: async () => {
        try {
          // Optimistic UI Update
          const updatedBrands = brands.map(b =>
            selectedBrands.includes(b.id) && (brandsToDisable.some(d => d.id === b.id))
              ? { ...b, isActive: false }
              : b
          );
          setBrands(updatedBrands);
          setSelectedBrands([]);

          await Promise.all(brandsToDisable.map(b => updateBrand(b.id, { ...b, isActive: false })));
          toast.success(`Đã vô hiệu hóa thành công ${brandsToDisable.length} thương hiệu.`);
        } catch (error) {
          console.error(error);
          toast.error("Có lỗi xảy ra khi vô hiệu hóa thương hiệu.");
          fetchBrands();
        }
      }
    });
  };

  const handleBulkEnable = () => {
    const inactiveSelected = brands.filter(b => selectedBrands.includes(b.id) && b.isActive === false);
    if (inactiveSelected.length === 0) return;

    setConfirmModal({
      isOpen: true,
      title: "Xác nhận kích hoạt",
      message: `Bạn có chắc chắn muốn kích hoạt lại ${inactiveSelected.length} thương hiệu đã chọn?`,
      variant: "success",
      confirmLabel: "Kích hoạt",
      onConfirm: async () => {
        try {
          const updatedBrands = brands.map(b =>
            selectedBrands.includes(b.id) ? { ...b, isActive: true } : b
          );
          setBrands(updatedBrands);
          setSelectedBrands([]);

          await Promise.all(inactiveSelected.map(b => updateBrand(b.id, { ...b, isActive: true })));
          toast.success(`Đã kích hoạt thành công ${inactiveSelected.length} thương hiệu.`);
        } catch (error) {
          console.error(error);
          toast.error("Có lỗi xảy ra khi kích hoạt thương hiệu.");
          fetchBrands();
        }
      }
    });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleRefresh = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setAppliedSearch('');
    setAppliedStatus('all');
    setCurrentPage(0);
    setSelectedBrands([]);
    fetchBrands();
  };

  const handleSuggestionClick = (brandName) => {
    isSuggestionClicked.current = true;
    setSearchTerm(brandName);
    setAppliedSearch(brandName);
    setShowSuggestions(false);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const visibleIds = paginatedBrands.map(b => b.id);
      const newSelection = [...new Set([...selectedBrands, ...visibleIds])];
      setSelectedBrands(newSelection);
    } else {
      const visibleIds = paginatedBrands.map(b => b.id);
      const newSelection = selectedBrands.filter(id => !visibleIds.includes(id));
      setSelectedBrands(newSelection);
    }
  };

  const handleSelectBrand = (id) => {
    setSelectedBrands(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  return (
    <div className="p-6 mx-auto space-y-6 bg-gray-50 rounded-2xl min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2B6377] flex items-center gap-2">
            Quản lý Thương hiệu
          </h1>
          <p className="text-gray-500 mt-1">Danh sách các thương hiệu sản phẩm</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Tổng thương hiệu", value: brands.length, icon: Layers, color: "text-blue-600", bg: "bg-blue-100" },
          { label: "Đang hoạt động", value: brands.filter(b => b.isActive !== false).length, icon: CircleCheckBig, color: "text-green-600", bg: "bg-green-100" },
          { label: "Vô hiệu hóa", value: brands.filter(b => b.isActive === false).length, icon: AlertCircle, color: "text-red-600", bg: "bg-red-100" },
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
          Thêm thương hiệu
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <div className="flex items-end gap-4 w-full flex-wrap">

          {/* Search Input */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tìm kiếm thương hiệu</label>
            <div className="relative" ref={searchRef}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              <input
                type="text"
                placeholder="Nhập tên thương hiệu..."
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
                        src={item.logo || item.imageUrl || "https://placehold.co/40"}
                        alt=""
                        className="w-8 h-8 rounded object-cover border border-gray-100"
                      />
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
          Hiển thị <b>{filteredBrands.length}</b> thương hiệu
        </div>
      </div>

      {/* Bulk Actions */}
      {
        selectedBrands.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between mb-6 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900">
                Đã chọn: <span className="font-bold text-[#2B6377]">{selectedBrands.length}</span> thương hiệu
              </span>
            </div>
            <div className="flex items-center gap-3">
              {brands.some(b => selectedBrands.includes(b.id) && b.isActive === false) && (
                <button
                  onClick={handleBulkEnable}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-green-600 border border-green-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors shadow-sm"
                >
                  <ToggleRight size={18} />
                  Kích hoạt ({brands.filter(b => selectedBrands.includes(b.id) && b.isActive === false).length})
                </button>
              )}
              {brands.some(b => selectedBrands.includes(b.id) && b.isActive !== false) && (
                <button
                  onClick={handleBulkDisable}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors shadow-sm"
                >
                  <ToggleLeft size={18} />
                  Vô hiệu hóa ({brands.filter(b => selectedBrands.includes(b.id) && b.isActive !== false).length})
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
                <th className="p-4 font-bold tracking-wider">Logo</th>
                <th className="p-4 font-bold tracking-wider">Tên thương hiệu</th>
                <th className="p-4 font-bold tracking-wider">Mô tả</th>
                <th className="p-4 font-bold tracking-wider text-center">Trạng thái</th>
                <th className="p-4 font-bold tracking-wider text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : paginatedBrands.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <AlertCircle size={40} className="text-gray-300" />
                      <span className="text-lg font-medium text-gray-400">Chưa có thương hiệu nào phù hợp</span>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedBrands.map((brand) => {
                  const isActive = brand.isActive !== false;
                  const isSelected = selectedBrands.includes(brand.id);

                  return (
                    <tr
                      key={brand.id}
                      className={`transition-colors cursor-pointer border-b last:border-0 ${isSelected ? "bg-sky-50" : isActive ? 'hover:bg-gray-50' : 'bg-gray-50 opacity-75'}`}
                      onClick={() => handleSelectBrand(brand.id)}
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectBrand(brand.id)}
                          onClick={(e) => e.stopPropagation()}
                          className={`w-4 h-4 rounded border-gray-300 ${!isActive ? "text-gray-400" : "text-[#2B6377] focus:ring-[#2B6377]"}`}
                        />
                      </td>
                      <td className="p-4">
                        <div className={`w-12 h-12 rounded-lg border border-gray-200 overflow-hidden bg-white p-1 ${!isActive ? 'grayscale' : ''}`}>
                          <img
                            src={brand.logo || brand.imageUrl || "https://placehold.co/100?text=No+Img"}
                            alt={brand.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </td>
                      <td className={`p-4 font-medium ${isActive ? 'text-gray-900' : 'text-gray-500 line-through'}`}>
                        <div className="flex flex-col">
                          <span>{brand.name}</span>
                          <span className="text-[11px] font-normal text-gray-500">
                            {brandCounts[brand.id] !== undefined ? `${brandCounts[brand.id]} sản phẩm` : '...'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-gray-600 max-w-xs truncate">
                        {brand.description || <span className="text-gray-400 italic">Không có mô tả</span>}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${isActive ? 'bg-green-100 text-green-700' : 'bg-gray-300 text-gray-700'}`}>
                          {isActive ? 'Hoạt động' : 'Vô hiệu hóa'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          {isActive && (
                            <button
                              onClick={() => handleViewDetail(brand)}
                              className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 hover:text-blue-700 transition-colors"
                              title="Xem chi tiết"
                            >
                              <Eye size={18} />
                            </button>
                          )}
                          {isActive && (
                            <button
                              onClick={() => handleOpenModal(brand)}
                              className="p-1.5 rounded-lg hover:bg-[#ccdfe3] text-amber-600 hover:text-amber-700 transition-colors"
                              title="Chỉnh sửa"
                            >
                              <Pencil size={18} />
                            </button>
                          )}
                          <button
                            onClick={() => handleToggleStatus(brand)}
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

        {filteredBrands.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredBrands.length / itemsPerPage)}
            onPageChange={handlePageChange}
            totalItems={filteredBrands.length}
            itemsPerPage={itemsPerPage}
            className="border-0 border-t border-gray-200 rounded-none shadow-none"
          />
        )}
      </div>

      <BrandModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveBrand}
        brand={currentBrand}
      />

      <BrandDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        brand={detailBrand}
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
