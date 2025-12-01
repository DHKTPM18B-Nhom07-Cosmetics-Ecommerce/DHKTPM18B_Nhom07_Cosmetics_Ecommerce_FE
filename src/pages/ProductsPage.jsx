// src/pages/ProductsPage.jsx
import { useState, useEffect, useMemo, useRef } from "react";
import { Search, Check } from "lucide-react";
import Breadcrumb from "../components/Breadcrumb";
import ProductCard from "../components/ProductCard";
import Pagination from "../components/ui/Pagination";

import { filterProducts } from "../services/productFilterApi";
import { getAllCategories } from "../services/categoryService";
import { getAllBrands } from "../services/brandService";
import { getAllProducts, getProductVariants } from "../services/productService";

export default function ProductsPage() {
  // ---------------- STATE ----------------
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [rating, setRating] = useState(null);

  const MAX_PRICE = 2000000;
  const [price, setPrice] = useState([0, MAX_PRICE]);

  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [allProducts, setAllProducts] = useState([]);

  const [sort, setSort] = useState("newest");
  const [activeSortLabel, setActiveSortLabel] = useState("Mới nhất");

  const [page, setPage] = useState(0);
  const [displayLimit] = useState(12);

  const [data, setData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // ---------------- LOAD CATEGORY + BRAND + ALL PRODUCTS (GỢI Ý) ----------------
  useEffect(() => {
    (async () => {
      try {
        const [cateRes, brandRes, allRes] = await Promise.all([
          getAllCategories(),
          getAllBrands(),
          getAllProducts(),
        ]);

        setCategories(cateRes || []);
        setBrands(brandRes || []);
        setAllProducts(Array.isArray(allRes) ? allRes : []);
      } catch (err) {
        console.error("Lỗi load dữ liệu:", err);
      }
    })();
  }, []);

  // ---------------- MAIN FILTER API ----------------
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        const res = await filterProducts({
          search,
          category: selectedCategory,
          brand: selectedBrand,
          minPrice: price[0],
          maxPrice: price[1],
          rating,
          page,
          size: displayLimit,
          sort,
        });

        const items = res.content || [];

        // LẤY GIÁ Y NHƯ BẢN CŨ (fetch variants)
        const itemsWithPrice = await Promise.all(
          items.map(async (product) => {
            try {
              const variants = await getProductVariants(product.id);
              const price = variants.length > 0 ? variants[0].price : null;
              return { ...product, price, variants };
            } catch {
              return { ...product, price: null };
            }
          })
        );

        setData(itemsWithPrice);
        setTotalPages(res.totalPages || 1);
      } catch (err) {
        console.error("Lỗi filter:", err);
        setData([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [search, selectedCategory, selectedBrand, price, rating, page, sort]);

  // KHÔNG RESET PAGE KHI CHỌN RATING
  // Chỉ reset khi đổi category / brand / price / search
  useEffect(() => {
    setPage(0);
  }, [selectedCategory, selectedBrand, price, search, sort]);

  // ---------------- SEARCH SUGGESTIONS ----------------
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSuggestions([]);
      return;
    }
    const lower = searchTerm.toLowerCase();
    const matches = allProducts
      .filter((p) => p.name?.toLowerCase().includes(lower))
      .slice(0, 8);

    setSuggestions(matches);
  }, [searchTerm]);

  const handleSearchSubmit = () => {
    setSearch(searchTerm.trim());
    setPage(0);
  };

  const handleSuggestionClick = (p) => {
    setSearchTerm(p.name);
    setSearch(p.name);
    setSuggestions([]);
    setPage(0);
  };

  // ---------------- SORT ----------------
  const handleSortChange = (value) => {
    setSort(value);
    switch (value) {
      case "priceAsc":
        setActiveSortLabel("Giá thấp đến cao");
        break;
      case "priceDesc":
        setActiveSortLabel("Giá cao đến thấp");
        break;
      default:
        setActiveSortLabel("Mới nhất");
    }
  };

  // ---------------- RESET FILTER ----------------
  const resetFilter = () => {
    setSelectedCategory(null);
    setSelectedBrand(null);
    setRating(null);
    setPrice([0, MAX_PRICE]);
    setSearch("");
    setSearchTerm("");
    setSort("newest");
    setActiveSortLabel("Mới nhất");
    setPage(0);
  };

  // ---------------- SLIDER FILL ----------------
  const sliderFill = (price[1] / MAX_PRICE) * 100;

  // ---------------- JSX ----------------
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Breadcrumb category={selectedCategory} />

      <div className="flex flex-1 max-w-7xl mx-auto w-full gap-6 px-4 py-8">
        {/* SIDEBAR */}
        <aside className="w-64 flex-shrink-0">
          <div className="bg-white p-6 rounded-xl shadow-sm sticky top-24">
            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-semibold text-teal-700">Bộ lọc</h3>
              <button
                className="text-xs text-teal-700 hover:underline"
                onClick={resetFilter}
              >
                Xóa lọc
              </button>
            </div>

            {/* CATEGORY */}
            <div className="mb-6">
              <p className="font-medium text-gray-800 mb-2">Danh mục</p>
              {categories.map((cat) => (
                <label
                  key={cat.id}
                  className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === cat.id}
                    onChange={() =>
                      setSelectedCategory(
                        selectedCategory === cat.id ? null : cat.id
                      )
                    }
                  />
                  {cat.name}
                </label>
              ))}
            </div>

            {/* BRAND */}
            <div className="mb-6">
              <p className="font-medium text-gray-800 mb-2">Thương hiệu</p>
              {brands.map((b) => (
                <label
                  key={b.id}
                  className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="brand"
                    checked={selectedBrand === b.id}
                    onChange={() =>
                      setSelectedBrand(selectedBrand === b.id ? null : b.id)
                    }
                  />
                  {b.name}
                </label>
              ))}
            </div>

            {/* PRICE SLIDER */}
            <div className="mb-6">
              <p className="font-medium text-gray-800 mb-2">Khoảng giá</p>
              <div className="relative">
                <input
                  type="range"
                  min={0}
                  max={MAX_PRICE}
                  step={10000}
                  value={price[1]}
                  onChange={(e) =>
                    setPrice([0, Math.min(Number(e.target.value), MAX_PRICE)])
                  }
                  className="w-full appearance-none cursor-pointer bg-transparent"
                />

                <div className="absolute inset-0 h-1 bg-gray-200 rounded-full pointer-events-none" />
                <div
                  className="absolute left-0 top-0 h-1 bg-teal-600 rounded-full pointer-events-none transition-all"
                  style={{ width: `${sliderFill}%` }}
                />
              </div>

              <div className="flex justify-between text-xs text-gray-600 mt-2">
                <span>0đ</span>
                <span>{price[1].toLocaleString()}đ</span>
              </div>
            </div>

            {/* RATING */}
            <div>
              <p className="font-medium text-gray-800 mb-2">Đánh giá</p>
              {[5, 4, 3, 2, 1].map((r) => (
                <label
                  key={r}
                  className="flex items-center gap-2 text-sm cursor-pointer mb-1"
                  onClick={() => setRating(rating === r ? null : r)}
                >
                  <input type="radio" readOnly checked={rating === r} />
                  <span className="text-yellow-500">
                    {"★".repeat(r)}
                    {"☆".repeat(5 - r)}
                  </span>
                  <span className="text-xs text-gray-500">từ {r} sao</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <main className="flex-1">
          {/* SEARCH */}
          <div className="flex items-start justify-between mb-6">
            <div className="relative w-full max-w-xl">
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full border border-gray-300 rounded-md py-2 pl-9 pr-10 text-sm"
              />

              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <button
                onClick={handleSearchSubmit}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-teal-600 text-white px-3 py-1 rounded text-xs"
              >
                Tìm
              </button>

              {suggestions.length > 0 && (
                <div className="absolute w-full bg-white border mt-1 rounded-md shadow-lg z-50">
                  {suggestions.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleSuggestionClick(p)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Sắp xếp
              </label>
              <select
                value={sort}
                onChange={(e) => handleSortChange(e.target.value)}
                className="border border-gray-300 rounded-md text-sm px-3 py-2"
              >
                <option value="newest">Mới nhất</option>
                <option value="priceAsc">Giá thấp đến cao</option>
                <option value="priceDesc">Giá cao đến thấp</option>
              </select>
            </div>
          </div>

          {/* LIST */}
          {loading ? (
            <div className="py-10 text-center">Đang tải...</div>
          ) : data.length === 0 ? (
            <div className="py-10 text-center text-gray-500">
              Không tìm thấy sản phẩm phù hợp.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {data.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>

              {totalPages > 1 && (
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
