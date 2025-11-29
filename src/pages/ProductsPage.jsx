import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Check } from "lucide-react";
import { getAllProducts, getProductVariants } from "../services/productService";
import { getAllCategories } from "../services/categoryService";
import Breadcrumb from "../components/Breadcrumb";
import ProductCard from "../components/ProductCard";

export default function ProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [priceRange, setPriceRange] = useState([0, 10000]); // Increased max price

  const [activeSort, setActiveSort] = useState("Mới nhất");
  const [displayLimit, setDisplayLimit] = useState(12);
  const [isLimitDropdownOpen, setIsLimitDropdownOpen] = useState(false);

  // Brand data
  const brands = [
    { id: 1, name: "SKINMOOD", logo: "SKINMOOD" },
    { id: 2, name: "L'OREAL PARIS", logo: "L'OREAL PARIS" },
    { id: 3, name: "ANESSA", logo: "ANESSA" },
    { id: 4, name: "The Cocoon", logo: "the cocoon" },
    { id: 5, name: "SUNPLAY SKINAQUA", logo: "SUNPLAY SKINAQUA" },
    { id: 6, name: "beplain", logo: "beplain" },
    { id: 7, name: "MARTIDERM", logo: "MARTIDERM" },
    { id: 8, name: "VICHY", logo: "VICHY" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsData, categoriesData] = await Promise.all([
          getAllProducts(),
          getAllCategories(),
        ]);

        // Lấy variants cho mỗi sản phẩm để lấy giá
        const productsWithPrice = await Promise.all(
          productsData.map(async (product) => {
            try {
              const variants = await getProductVariants(product.id);
              const price = variants.length > 0 ? variants[0].price : null;
              return { ...product, price, variants };
            } catch (err) {
              console.error(
                `Lỗi khi lấy variants cho sản phẩm ${product.id}`,
                err
              );
              return { ...product, price: null };
            }
          })
        );

        console.log("Dữ liệu sản phẩm từ API:", productsWithPrice);
        setProducts(productsWithPrice);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Lọc sản phẩm
  // Tạm thời bỏ qua bộ lọc để hiển thị tất cả sản phẩm theo yêu cầu
  const filteredProducts = products;
  /*
  const filteredProducts = products.filter(product => {
    // Lưu ý: Backend Product entity ignore category, nên có thể không có thông tin category trong object product.
    // Nếu product.category là null, chúng ta không thể lọc theo category đúng cách trừ khi fetch chi tiết category hoặc backend được sửa.
    // Giả sử product.category có thể thiếu hoặc rỗng dựa trên code backend.
    // Chúng ta sẽ kiểm tra xem product.category có tồn tại và có tên không.
    const matchCategory = selectedCategory
      ? (product.category && product.category.name === selectedCategory)
      : true

    // Lọc theo giá
    // Nếu không có giá (price là null), tạm thời vẫn hiển thị hoặc có thể ẩn đi tùy logic.
    const matchPrice = product.price
      ? (product.price >= priceRange[0] && product.price <= priceRange[1])
      : true 

    return matchCategory && matchPrice
  })
  */

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Breadcrumb */}
      <Breadcrumb category={selectedCategory} />

      {/* Brand Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-8 overflow-x-auto pb-2">
            {brands.map((brand) => (
              <div
                key={brand.id}
                className="flex-shrink-0 h-16 flex items-center justify-center px-4 cursor-pointer hover:opacity-70 transition"
              >
                <span className="text-sm font-medium text-gray-600">
                  {brand.logo}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-1 max-w-7xl mx-auto w-full gap-6 px-4 py-8">
        {/* Sidebar Filters */}
        <aside className="w-64 flex-shrink-0">
          <div className="bg-white p-6 rounded-lg mb-6 shadow-sm">
            <h3 className="text-lg font-semibold text-teal-700 mb-4">Bộ lọc</h3>

            <div className="mb-6">
              <h4 className="font-medium text-gray-700 mb-3">Danh mục</h4>
              {categories.map((cat) => (
                <label
                  key={cat.id}
                  className="flex items-center gap-2 mb-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedCategory === cat.name}
                    onChange={() =>
                      setSelectedCategory(
                        cat.name === selectedCategory ? null : cat.name
                      )
                    }
                    className="rounded"
                  />
                  <span className="text-sm text-gray-600">{cat.name}</span>
                </label>
              ))}
            </div>

            <div className="mb-6">
              <h4 className="font-medium text-gray-700 mb-3">Giá</h4>
              <input
                type="range"
                min="0"
                max="10000"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([0, Number(e.target.value)])}
                className="w-full"
              />
              <div className="text-sm text-gray-600 mt-2">
                ${priceRange[0]} - ${priceRange[1]}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-white p-4 rounded-lg shadow-sm">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-700"></div>
            </div>
          ) : (
            <>
              {/* Sorting Bar */}
              <div className="mt-6 mb-6">
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {selectedCategory ? selectedCategory : "Tất cả sản phẩm"}
                    <span className="text-gray-500 font-normal ml-2 text-lg">
                      {" "}
                      ({filteredProducts.length})
                    </span>
                  </h2>
                </div>

                <div className="rounded-sm">
                  <div className="min-h-[49px] border-b border-b-[#DDDDDD] flex items-center justify-between w-full relative text-sm">
                    {/* Sort buttons */}
                    <div className="flex items-center gap-x-6">
                      {[
                        "Mới nhất",
                        "Bán chạy",
                        "Giá thấp đến cao",
                        "Giá cao đến thấp",
                      ].map((sort) => (
                        <button
                          key={sort}
                          onClick={() => setActiveSort(sort)}
                          className="min-h-[49px] px-5 bg-white rounded-sm relative transition-colors whitespace-nowrap"
                          style={{
                            color: activeSort === sort ? "#2B6377" : "#000000",
                          }}
                        >
                          {sort}
                          <span
                            className="absolute bottom-0 left-0 h-0.5 block transition-all duration-300"
                            style={{
                              width: activeSort === sort ? "100%" : "0%",
                              backgroundColor:
                                activeSort === sort ? "#2B6377" : "white",
                            }}
                          ></span>
                        </button>
                      ))}
                    </div>

                    {/* Display limit */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setIsLimitDropdownOpen(!isLimitDropdownOpen)
                        }
                        className="flex items-center gap-1.5 px-3 py-2 h-[28px] text-sm bg-white"
                      >
                        Hiển thị {displayLimit}
                        <svg width="16" height="16" viewBox="0 0 16 16">
                          <path
                            d="M12 6l-4 4-4-4"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          ></path>
                        </svg>
                      </button>

                      {isLimitDropdownOpen && (
                        <div className="absolute top-full right-0 mt-2 w-40 bg-white border border-gray-100 rounded-lg shadow-lg z-10 py-1">
                          {[12, 24, 36, 48].map((limit) => (
                            <div
                              key={limit}
                              className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                              onClick={() => {
                                setDisplayLimit(limit);
                                setIsLimitDropdownOpen(false);
                              }}
                            >
                              <span
                                className={
                                  displayLimit === limit
                                    ? "text-[#2B6377] font-medium"
                                    : "text-gray-700"
                                }
                              >
                                Hiển thị {limit}
                              </span>
                              {displayLimit === limit && (
                                <Check className="w-4 h-4 text-green-600" />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  Không tìm thấy sản phẩm nào.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}

              {/* Pagination (Static for now as API doesn't support pagination yet in this implementation) */}
              <div className="flex justify-center items-center gap-2">
                <button className="px-3 py-2 border rounded hover:bg-gray-100 transition">
                  ←
                </button>
                <button className="px-3 py-2 bg-teal-700 text-white rounded transition">
                  1
                </button>
                <button className="px-3 py-2 border rounded hover:bg-gray-100 transition">
                  →
                </button>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
