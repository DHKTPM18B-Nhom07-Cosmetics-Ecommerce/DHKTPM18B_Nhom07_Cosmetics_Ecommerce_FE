import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import Breadcrumb from "../components/Breadcrumb";
import ProductCard from "../components/ProductCard";
import Pagination from "../components/ui/Pagination";

import { filterProducts } from "../services/productFilterApi";
import { getAllCategories } from "../services/categoryService";
import { getAllBrands } from "../services/brandService";

export default function ProductsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Lấy từ Header (search param)
  const initialSearch =
    new URLSearchParams(location.search).get("search") || "";

  // ===== DATA =====
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  // ===== MULTI FILTER =====
  const [pendingCategories, setPendingCategories] = useState([]);
  const [pendingBrands, setPendingBrands] = useState([]);
  const [pendingRatings, setPendingRatings] = useState([]);
  const [pendingStocks, setPendingStocks] = useState([]);
  const [pendingPrice, setPendingPrice] = useState([0, 3000000]);

  // ===== APPLIED FILTER =====
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [selectedStocks, setSelectedStocks] = useState([]);
  const [price, setPrice] = useState([0, 3000000]);

  // SORT
  const [sort, setSort] = useState("all");

  // PAGINATION
  const [data, setData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);

  // SEARCH
  const [search, setSearch] = useState(initialSearch);

  // LOADING
  const [loading, setLoading] = useState(true);

  // ---------------------------------------------------
  // LOAD categories + brands
  // ---------------------------------------------------
  useEffect(() => {
    (async () => {
      const [c, b] = await Promise.all([getAllCategories(), getAllBrands()]);
      setCategories(c);
      setBrands(b);
    })();
  }, []);

  // ---------------------------------------------------
  //  cập nhật state search khi search param thaty đổi
  // ---------------------------------------------------
  useEffect(() => {
    const q = new URLSearchParams(location.search).get("search") || "";
    setSearch(q);
    setPage(0);
  }, [location.search]);

  // ---------------------------------------------------
  // FETCH FILTERED PRODUCTS
  // ---------------------------------------------------
  useEffect(() => {
    (async () => {
      setLoading(true);

      // Nếu query rỗng thì load toàn bộ
      const realSearch = search?.trim() === "" ? null : search;

      const res = await filterProducts({
        search: realSearch,
        categories: selectedCategories.join(","),
        brands: selectedBrands.join(","),
        stocks: selectedStocks.join(","),
        minPrice: price[0],
        maxPrice: price[1],
        rating:
          selectedRatings.length > 0 ? Math.max(...selectedRatings) : null,
        page,
        size: 12,
        sort,
      });

      setData(res.content);
      setTotalElements(res.totalElements);
      setTotalPages(res.totalPages);

      setLoading(false);
    })();
  }, [
    search,
    selectedCategories,
    selectedBrands,
    selectedRatings,
    selectedStocks,
    price,
    page,
    sort,
  ]);

  // Smooth scroll
  useEffect(() => {
    if (!loading) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [data, loading]);

  // ---------------------------------------------------
  // APPLY FILTER
  // ---------------------------------------------------
  const applyFilter = () => {
    setSelectedCategories(pendingCategories);
    setSelectedBrands(pendingBrands);
    setSelectedRatings(pendingRatings);
    setSelectedStocks(pendingStocks);
    setPrice(pendingPrice);
    setPage(0);
  };

  // RESET FILTER
  const resetFilter = () => {
    setPendingCategories([]);
    setPendingBrands([]);
    setPendingRatings([]);
    setPendingStocks([]);
    setPendingPrice([0, 3000000]);

    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedRatings([]);
    setSelectedStocks([]);
    setPrice([0, 3000000]);

    // Reset về tất cả sản phẩm
    navigate("/products");
  };

  // TITLE
  let title = "Tất cả sản phẩm";
  if (search?.trim()) title = `Kết quả cho: "${search}"`;

  if (selectedCategories.length === 1) {
    const c = categories.find((x) => x.id === selectedCategories[0]);
    if (c) title = `Danh mục: ${c.name}`;
  }

  // ---------------------------------------------------
  // RENDER
  // ---------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-50">
      <Breadcrumb />

      <div className="max-w-7xl mx-auto flex gap-6 px-4 py-8">
        {/* ===================== SIDEBAR ===================== */}
        <aside className="w-64 flex-shrink-0 sticky top-28">
          <div className="bg-white rounded-2xl shadow p-6 border border-gray-100 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-[#2B6377]">Bộ lọc</h3>
              <button
                onClick={resetFilter}
                className="text-xs text-teal-600 hover:underline"
              >
                Xóa tất cả
              </button>
            </div>

            {/* CATEGORY */}
            <div>
              <p className="font-medium text-gray-800 mb-2">Danh mục</p>

              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {categories.map((c) => (
                  <label key={c.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={pendingCategories.includes(c.id)}
                      onChange={() => {
                        setPendingCategories((prev) =>
                          prev.includes(c.id)
                            ? prev.filter((id) => id !== c.id)
                            : [...prev, c.id]
                        );
                      }}
                      className="accent-teal-600 w-4 h-4"
                    />
                    {c.name}
                  </label>
                ))}
              </div>
            </div>

            <hr />

            {/* BRAND */}
            <div>
              <p className="font-medium text-gray-800 mb-2">Thương hiệu</p>

              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {brands.map((b) => (
                  <label key={b.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={pendingBrands.includes(b.id)}
                      onChange={() => {
                        setPendingBrands((prev) =>
                          prev.includes(b.id)
                            ? prev.filter((id) => id !== b.id)
                            : [...prev, b.id]
                        );
                      }}
                      className="accent-teal-600 w-4 h-4"
                    />
                    {b.name}
                  </label>
                ))}
              </div>
            </div>

            <hr />

            {/* PRICE */}
            <div>
              <p className="font-medium text-gray-800 mb-2">Khoảng giá</p>

              <input
                type="range"
                min={0}
                max={3000000}
                step={10000}
                value={pendingPrice[1]}
                onChange={(e) => setPendingPrice([0, Number(e.target.value)])}
                className="w-full cursor-pointer accent-teal-600"
              />

              <div className="flex justify-between text-xs text-gray-600">
                <span>0₫</span>
                <span>{pendingPrice[1].toLocaleString()}₫</span>
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                {[250000, 500000, 1000000].map((value) => (
                  <button
                    key={value}
                    onClick={() => setPendingPrice([0, value])}
                    className={`px-3 py-1 rounded-full text-xs border ${
                      pendingPrice[1] === value
                        ? "bg-[#2B6377] text-white"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    Dưới {value.toLocaleString()}₫
                  </button>
                ))}
              </div>
            </div>

            <hr />

            {/* RATING */}
            <div>
              <p className="font-medium text-gray-800 mb-2">Đánh giá</p>

              <div className="space-y-2">
                {[5, 4, 3].map((r) => (
                  <label key={r} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={pendingRatings.includes(r)}
                      onChange={() => {
                        setPendingRatings((prev) =>
                          prev.includes(r)
                            ? prev.filter((x) => x !== r)
                            : [...prev, r]
                        );
                      }}
                      className="accent-teal-600 w-4 h-4"
                    />
                    <span className="text-yellow-500">
                      {"★".repeat(r)}
                      {"☆".repeat(5 - r)}
                    </span>
                    <span className="text-xs text-gray-600">từ {r} sao</span>
                  </label>
                ))}
              </div>
            </div>

            <hr />

            {/* STOCK */}
            <div>
              <p className="font-medium text-gray-800 mb-2">Tồn kho</p>

              {[
                { id: "in", label: "Còn hàng" },
                { id: "low", label: "Sắp hết hàng" },
                { id: "out", label: "Hết hàng" },
              ].map((s) => (
                <label key={s.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={pendingStocks.includes(s.id)}
                    onChange={() => {
                      setPendingStocks((prev) =>
                        prev.includes(s.id)
                          ? prev.filter((x) => x !== s.id)
                          : [...prev, s.id]
                      );
                    }}
                    className="accent-teal-600 w-4 h-4"
                  />
                  {s.label}
                </label>
              ))}
            </div>

            {/* BUTTON APPLY */}
            <button
              onClick={applyFilter}
              className="w-full bg-[#2B6377] hover:bg-[#244f61] text-white py-2.5 rounded-xl font-semibold mt-4"
            >
              Áp dụng
            </button>
          </div>
        </aside>

        {/* ===================== MAIN ===================== */}
        <main className="flex-1">
          {/* SORT */}
          <div className="flex justify-end mb-4">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="border rounded-md text-sm px-3 py-2"
            >
              <option value="all">Tất cả</option>
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="priceAsc">Giá thấp → cao</option>
              <option value="priceDesc">Giá cao → thấp</option>
            </select>
          </div>

          {/* TITLE */}
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {title}{" "}
            <span className="text-base ml-2 text-gray-500">
              ({totalElements})
            </span>
          </h2>

          {/* LOADING */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="h-64 bg-gray-200 rounded-md animate-pulse"
                ></div>
              ))}
            </div>
          ) : data.length === 0 ? (
            <div className="text-center text-gray-500 py-16">
              Không tìm thấy sản phẩm
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {data.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </>
          )}
        </main>
      </div>
    </div>
  );
}
