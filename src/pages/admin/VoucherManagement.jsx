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

import { getAllVouchers } from "../../services/voucherApi";

import CreateVoucherModal from "./CreateVoucherModal";
import EditVoucherModal from "./EditVoucherModal";
import VoucherDetailModal from "./VoucherDetailModal";
import VoucherStatusModal from "./VoucherStatusModal";
import BulkUploadModal from "./BulkUploadModal";

import "../../../styles/voucher.css";

export default function VoucherManagement() {
  const [vouchers, setVouchers] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [sortType, setSortType] = useState("");
  const [headerSort, setHeaderSort] = useState({ key: null, direction: "asc" });

  const [page, setPage] = useState(1);
  const pageSize = 8;

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);

  const [selectedVoucherId, setSelectedVoucherId] = useState(null);
  const [selectedVoucherData, setSelectedVoucherData] = useState(null);

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggest, setShowSuggest] = useState(false);

  // ================= LOAD DATA =================
  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
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
    } catch (err) {
      console.error("Load vouchers failed:", err);
    }
  }

  // ================= FILTER + SORT =================
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

  // ================= RESET =================
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

  // ================= MODALS =================
  const openDetail = (v) => {
    setSelectedVoucherData(v);
    setDetailOpen(true);
  };

  const openEdit = (v) => {
    setSelectedVoucherId(v.id);
    setEditOpen(true);
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
  };

  // ================= PAGINATION =================
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);
  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, filtered.length);

  // ================= BADGES =================
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

  const totalVouchers = vouchers.length;
  const activeVouchers = vouchers.filter((v) => v.status === "ACTIVE").length;
  const upcomingVouchers = vouchers.filter(
    (v) => v.status === "UPCOMING"
  ).length;
  const expiredVouchers = vouchers.filter((v) => v.status === "EXPIRED").length;

  // ============  ============
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

  // ============ UI ============
  return (
    <div className="voucher-wrapper p-6 max-w-7xl mx-auto space-y-6">
      {/* TITLE */}
      <div>
        <h1 className="text-2xl font-bold text-[#2b6377]">
          Quản lý khuyến mãi
        </h1>
        <p className="text-[#467b8c] mt-1">
          Quản lý mã giảm giá, điều kiện và trạng thái
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: "Tổng khuyến mãi", value: totalVouchers, icon: Package },
          { label: "Hoạt động", value: activeVouchers, icon: CheckCircle },
          { label: "Sắp có hiệu lực", value: upcomingVouchers, icon: Clock },
          { label: "Hết hạn", value: expiredVouchers, icon: XCircle },
        ].map((stat, i) => (
          <div key={i} className="pastel-card p-5 rounded-xl shadow-sm border">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-[#4b7480]">{stat.label}</p>
                <p className="text-3xl font-bold mt-2 text-[#2b6377]">
                  {stat.value}
                </p>
              </div>
              <div className="w-12 h-12 bg-[#ccdfe3] rounded-full flex items-center justify-center">
                <stat.icon className="w-6 h-6 text-[#2b6377]" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ACTIONS */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => setBulkOpen(true)}
          className="btn-light flex items-center gap-2"
        >
          <Upload className="w-4 h-4" /> Nhập từ file Excel
        </button>

        <button
          onClick={() => setCreateOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Tạo voucher
        </button>
      </div>

      {/* FILTER */}
      {/* FILTER */}
      <div className="pastel-card rounded-xl p-5 shadow-sm">
        <div className="grid grid-cols-12 gap-4">
          {/* SEARCH */}
          <div className="col-span-12 md:col-span-4">
            <label className="text-sm font-semibold text-[#2b6377] mb-1 block">
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
            <label className="text-sm font-semibold text-[#2b6377] mb-1 block">
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
              <option value="SHIPPING_FREE">Miễn phí ship</option>
            </select>
          </div>

          {/* STATUS */}
          <div className="col-span-6 md:col-span-2">
            <label className="text-sm font-semibold text-[#2b6377] mb-1 block">
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
            <label className="text-sm font-semibold text-[#2b6377] mb-1 block">
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

          {/* RESET BUTTON */}
          <div className="col-span-4 md:col-span-1 flex items-end">
            <button onClick={resetFilter} className="btn-reset w-full">
              Làm mới
            </button>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="pastel-card rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="table-head">
              <tr>
                <th
                  onClick={() => requestHeaderSort("code")}
                  className="table-th"
                >
                  Mã {getSortIcon("code")}
                </th>
                <th className="table-th text-center">Loại</th>
                <th className="table-th text-center">Giá trị</th>
                <th className="table-th">Trạng thái</th>
                <th className="table-th text-center w-32">Hành động</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#e5eef1]">
              {paginated.map((v) => (
                <tr key={v.id} className="hover:bg-[#f5fafb] transition">
                  <td className="td-cell font-medium">{v.code}</td>
                  <td className="td-cell text-center">{badgeType(v.type)}</td>
                  <td className="td-cell text-center font-medium">
                    {v.type === "PERCENT"
                      ? `${v.value}%`
                      : v.type === "AMOUNT"
                      ? `${Number(v.value).toLocaleString()}đ`
                      : "Miễn phí"}
                  </td>
                  <td className="td-cell">{badgeStatus(v.status)}</td>

                  <td className="td-cell">
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

                return num >= 1 && num <= totalPages ? (
                  <button
                    key={num}
                    onClick={() => setPage(num)}
                    className={`page-number ${
                      page === num ? "page-active" : ""
                    }`}
                  >
                    {num}
                  </button>
                ) : null;
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
      <CreateVoucherModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={load}
      />

      <EditVoucherModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        voucherId={selectedVoucherId}
        onUpdated={load}
      />

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
  );
}
