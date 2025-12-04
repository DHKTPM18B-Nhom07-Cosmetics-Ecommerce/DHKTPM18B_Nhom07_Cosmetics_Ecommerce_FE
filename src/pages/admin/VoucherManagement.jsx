import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Upload,
  Search,
  Eye,
  Pencil,
  ToggleLeft,
  ToggleRight,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Package,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { getAllVouchers } from "../../services/voucherApi";

import VoucherDetailModal from "./VoucherDetailModal";
import VoucherStatusModal from "./VoucherStatusModal";
import BulkUploadModal from "./BulkUploadModal";

import { notifySuccess } from "../../utils/toast";

import "../../../styles/voucher.css";
import "../../../styles/voucher-page.css";

export default function VoucherManagement() {
  const navigate = useNavigate();

  const [vouchers, setVouchers] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [sortType, setSortType] = useState("");
  const [headerSort, setHeaderSort] = useState({ key: null, direction: "asc" });

  const [page, setPage] = useState(1);
  const pageSize = 8;

  // MODALS
  const [detailOpen, setDetailOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);

  const [selectedVoucherData, setSelectedVoucherData] = useState(null);

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggest, setShowSuggest] = useState(false);

  // LOAD
  useEffect(() => {
    load();
  }, []);

  async function load() {
    const res = await getAllVouchers();
    let list = res.data || [];
    const now = new Date();

    list = list.map((v) => {
      const start = new Date(v.startAt);
      const end = new Date(v.endAt);

      let st = v.status;
      if (st !== "DISABLED") {
        if (now < start) st = "UPCOMING";
        else if (now > end) st = "EXPIRED";
        else st = "ACTIVE";
      }

      return { ...v, status: st };
    });

    setVouchers(list);
    setFiltered(list);
    setPage(1);
  }

  // FILTER + SORT
  const processedData = useMemo(() => {
    let data = [...vouchers];

    if (search.trim()) {
      data = data.filter((v) =>
        v.code.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (type) data = data.filter((v) => v.type === type);
    if (status) data = data.filter((v) => v.status === status);

    if (sortType) {
      if (sortType === "newest")
        data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      if (sortType === "oldest")
        data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

      if (sortType === "az") data.sort((a, b) => a.code.localeCompare(b.code));
      if (sortType === "za") data.sort((a, b) => b.code.localeCompare(a.code));
    } else if (headerSort.key) {
      const { key, direction } = headerSort;
      data.sort((a, b) => {
        const x = a[key] || "";
        const y = b[key] || "";
        if (x < y) return direction === "asc" ? -1 : 1;
        if (x > y) return direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return data;
  }, [vouchers, search, type, status, sortType, headerSort]);

  useEffect(() => {
    setFiltered(processedData);
    setPage(1);
  }, [processedData]);

  // RESET
  const resetFilter = () => {
    setSearch("");
    setType("");
    setStatus("");
    setSortType("");
    setHeaderSort({ key: null, direction: "asc" });
  };

  const requestHeaderSort = (key) => {
    if (sortType) return;

    const direction =
      headerSort.key === key && headerSort.direction === "asc" ? "desc" : "asc";

    setHeaderSort({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortType || headerSort.key !== key) return null;
    return headerSort.direction === "asc" ? (
      <ArrowUp className="w-3 h-3 inline ml-1" />
    ) : (
      <ArrowDown className="w-3 h-3 inline ml-1" />
    );
  };

  // MODAL HANDLERS
  const openDetail = (v) => {
    setSelectedVoucherData(v);
    setDetailOpen(true);
  };

  const openEdit = (v) => {
    navigate(`/admin/vouchers/${v.id}/edit`);
  };

  const openToggleStatus = (v) => {
    if (v.status === "EXPIRED") return;
    setSelectedVoucherData(v);
    setStatusModalOpen(true);
  };

  const updateLocalStatus = (id, newStatus) => {
    setVouchers((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: newStatus } : v))
    );

    notifySuccess("Cập nhật trạng thái voucher thành công!");
  };

  // PAGINATION
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);
  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, filtered.length);

  // BADGES
  const badgeType = (t) =>
    ({
      PERCENT: <span className="badge-percent">Giảm %</span>,
      AMOUNT: <span className="badge-amount">Giảm tiền</span>,
      SHIPPING_FREE: <span className="badge-ship">Miễn ship</span>,
    }[t]);

  const badgeStatus = (s) =>
    ({
      ACTIVE: <span className="badge-status status-active">Hoạt động</span>,
      UPCOMING: (
        <span className="badge-status status-upcoming">Sắp hiệu lực</span>
      ),
      EXPIRED: <span className="badge-status status-expired">Hết hạn</span>,
      DISABLED: (
        <span className="badge-status status-disabled">Vô hiệu hóa</span>
      ),
    }[s]);

  // AUTOCOMPLETE
  useEffect(() => {
    if (search.trim() === "") {
      setSuggestions([]);
      setShowSuggest(false);
      return;
    }

    const keyword = search.toLowerCase();

    const matched = vouchers
      .filter((v) => v.code.toLowerCase().includes(keyword))
      .slice(0, 5);

    setSuggestions(matched);
    setShowSuggest(true);
  }, [search, vouchers]);

  return (
    <div className="p-8 bg-gray-50 min-h-screen voucher-page">
      <div className="space-y-8">
        {/* TITLE */}
        <div>
          <h1 className="text-3xl font-bold text-[#2b6377]">
            Quản lý khuyến mãi
          </h1>
          <p className="text-gray-600 mt-1">
            Quản lý mã giảm giá, điều kiện và trạng thái
          </p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: "Tổng khuyến mãi", value: vouchers.length, icon: Package },
            {
              label: "Hoạt động",
              value: vouchers.filter((v) => v.status === "ACTIVE").length,
              icon: CheckCircle,
            },
            {
              label: "Sắp hiệu lực",
              value: vouchers.filter((v) => v.status === "UPCOMING").length,
              icon: Clock,
            },
            {
              label: "Hết hạn",
              value: vouchers.filter((v) => v.status === "EXPIRED").length,
              icon: XCircle,
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="rounded-2xl p-6 shadow-sm border border-gray-100"
              style={{ background: "#D5E2E6" }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-700">{stat.label}</p>
                  <p className="text-3xl font-bold mt-2 text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div className="w-12 h-12 bg-white/30 rounded-xl flex items-center justify-center">
                  <stat.icon className="w-7 h-7 text-[#2B6377]" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setBulkOpen(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-medium border border-gray-300 bg-white shadow-sm hover:bg-gray-50 transition"
          >
            <Upload className="w-4 h-4" />
            Nhập từ file Excel
          </button>

          <button
            onClick={() => navigate("/admin/vouchers/create")}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition"
            style={{ background: "#2B6377" }}
          >
            <Plus className="w-5 h-5" />
            Tạo voucher
          </button>
        </div>

        {/* FILTER BLOCK */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-8">
          <div className="grid grid-cols-12 gap-4 items-end">
            {/* SEARCH */}
            <div className="col-span-12 md:col-span-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tìm kiếm
              </label>

              <div className="relative">
                <div className="voucher-filter-box">
                  <Search className="w-4 h-4 text-[#7b9ca8]" />

                  <input
                    placeholder="Nhập mã voucher..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onFocus={() => search.trim() !== "" && setShowSuggest(true)}
                    onBlur={() => setTimeout(() => setShowSuggest(false), 150)}
                  />
                </div>

                {showSuggest && suggestions.length > 0 && (
                  <div className="suggest-dropdown">
                    {suggestions.map((item) => (
                      <div
                        key={item.id}
                        className="suggest-item"
                        onMouseDown={() => {
                          setSearch(item.code);
                          setShowSuggest(false);
                        }}
                      >
                        <span className="font-medium">{item.code}</span>
                        <span className="suggest-type">
                          {item.type === "PERCENT" && "Giảm %"}
                          {item.type === "AMOUNT" && "Giảm tiền"}
                          {item.type === "SHIPPING_FREE" && "Miễn ship"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* TYPE */}
            <div className="col-span-6 md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Loại
              </label>

              <select
                className="voucher-select-box"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="">Tất cả</option>
                <option value="PERCENT">Giảm %</option>
                <option value="AMOUNT">Giảm tiền</option>
                <option value="SHIPPING_FREE">Miễn ship</option>
              </select>
            </div>

            {/* STATUS */}
            <div className="col-span-6 md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Trạng thái
              </label>

              <select
                className="voucher-select-box"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">Tất cả</option>
                <option value="UPCOMING">Sắp hiệu lực</option>
                <option value="ACTIVE">Hoạt động</option>
                <option value="EXPIRED">Hết hạn</option>
                <option value="DISABLED">Vô hiệu hóa</option>
              </select>
            </div>

            {/* SORT */}
            <div className="col-span-8 md:col-span-3">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Sắp xếp
              </label>

              <select
                className="voucher-select-box"
                value={sortType}
                onChange={(e) => {
                  setSortType(e.target.value);
                  setHeaderSort({ key: null, direction: "asc" });
                }}
              >
                <option value="">Mặc định</option>
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="az">A → Z</option>
                <option value="za">Z → A</option>
              </select>
            </div>

            {/* RESET */}
            <div className="col-span-4 md:col-span-1 flex items-end">
              <button className="btn-reset w-full" onClick={resetFilter}>
                Làm mới
              </button>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th
                    onClick={() => requestHeaderSort("code")}
                    className="cursor-pointer select-none px-4 py-3 text-left text-gray-700"
                  >
                    Mã {getSortIcon("code")}
                  </th>
                  <th className="px-4 py-3 text-center text-gray-700">Loại</th>
                  <th className="px-4 py-3 text-center text-gray-700">
                    Giá trị
                  </th>
                  <th className="px-4 py-3 text-left text-gray-700">
                    Trạng thái
                  </th>
                  <th className="px-4 py-3 text-center text-gray-700 w-32">
                    Hành động
                  </th>
                </tr>
              </thead>

              <tbody>
                {paginated.map((v) => (
                  <tr
                    key={v.id}
                    className="border-t hover:bg-[#f5fafb] transition"
                  >
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {v.code}
                    </td>

                    <td className="px-4 py-3 text-center">
                      {badgeType(v.type)}
                    </td>

                    <td className="px-4 py-3 text-center font-medium">
                      {v.type === "PERCENT"
                        ? `${v.value}%`
                        : v.type === "AMOUNT"
                        ? `${Number(v.value).toLocaleString()}đ`
                        : "Miễn phí"}
                    </td>

                    <td className="px-4 py-3">{badgeStatus(v.status)}</td>

                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => openDetail(v)}
                          className="icon-btn text-blue-600 hover:text-blue-700"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => openEdit(v)}
                          className="icon-btn text-amber-600 hover:text-amber-700"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        {v.status === "ACTIVE" || v.status === "DISABLED" ? (
                          <button
                            onClick={() => openToggleStatus(v)}
                            className="icon-btn"
                          >
                            {v.status === "ACTIVE" ? (
                              <ToggleRight className="w-10 h-5 text-green-600" />
                            ) : (
                              <ToggleLeft className="w-10 h-5 text-gray-400" />
                            )}
                          </button>
                        ) : (
                          <ToggleLeft className="w-10 h-5 text-gray-300" />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="text-center py-12 text-[#6f8d96]">
                Không tìm thấy voucher phù hợp.
              </div>
            )}
          </div>

          {/* PAGINATION */}
          {filtered.length > 0 && (
            <div className="pagination-bar">
              <div className="text-[#4c7480] text-sm">
                Hiển thị{" "}
                <strong>
                  {startItem}-{endItem}
                </strong>{" "}
                / {filtered.length}
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="page-btn"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let num;

                  if (totalPages <= 5) num = i + 1;
                  else if (page <= 3) num = i + 1;
                  else if (page >= totalPages - 2) num = totalPages - 4 + i;
                  else num = page - 2 + i;

                  return (
                    num >= 1 &&
                    num <= totalPages && (
                      <button
                        key={num}
                        onClick={() => setPage(num)}
                        className={`page-number ${
                          page === num ? "page-active" : ""
                        }`}
                      >
                        {num}
                      </button>
                    )
                  );
                })}

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="page-btn"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* MODALS */}
        <VoucherDetailModal
          isOpen={detailOpen}
          onClose={() => setDetailOpen(false)}
          voucher={selectedVoucherData}
        />

        <VoucherStatusModal
          isOpen={statusModalOpen}
          onClose={() => setStatusModalOpen(false)}
          voucher={selectedVoucherData}
          onUpdated={updateLocalStatus}
        />

        <BulkUploadModal
          isOpen={bulkOpen}
          onClose={() => setBulkOpen(false)}
          onUploaded={load}
        />
      </div>
    </div>
  );
}
