import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Plus,
  Trash2,
  Pencil,
  Package,
  RotateCcw,
  AlertCircle,
  Archive,
  ShoppingCart,
  Upload,
  Eye,
  Download,
  Filter,
  ToggleLeft,
  ToggleRight
} from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductVariants,
} from "../../services/productService";
import { getAllCategories } from "../../services/categoryService";
import { getAllBrands } from "../../services/brandService";
import { filterProducts } from "../../services/productFilterApi";

import Pagination from "../../components/ui/Pagination";
import ProductModal from "../../components/admin/ProductModal";
import ProductDetailModal from "../../components/admin/ProductDetailModal";
// import { ExportButton } from "../../components/admin/ExcelButton"; 
import ExcelImportModal from "../../components/admin/ExcelImportModal";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import { exportToExcel } from "../../utils/excelHandler";

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const itemsPerPage = 12;

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // "", "active", "inactive"
  const [sortType, setSortType] = useState("newest"); // newest, oldest, priceAsc, priceDesc, az, za

  // Applied Filters to trigger fetch
  const [appliedFilters, setAppliedFilters] = useState({
    category: "",
    stock: "",
    status: ""
  });

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // View Detail Modal
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewProduct, setViewProduct] = useState(null);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    variant: "danger",
    confirmLabel: "Xóa"
  });

  // Selection
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isAllSelected, setIsAllSelected] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    outOfStockProducts: 0,
    totalInventory: 0,
  });

  // Data for Select options
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  // Ref to track if suggestion was clicked to prevent re-opening dropdown
  const isSuggestionClicked = useRef(false);


  const fetchData = async (overrideParams = {}) => {
    setLoading(true);
    try {
      const search = overrideParams.search !== undefined ? overrideParams.search : searchQuery;

      const [filterResult, categoriesData, brandsData] = await Promise.all([
        filterProducts({
          search: search,
          categories: appliedFilters.category,
          stocks: appliedFilters.stock === "Hết hàng" ? "out" : appliedFilters.stock === "Còn hàng" ? "in" : "",
          active: appliedFilters.status === "active" ? true : appliedFilters.status === "inactive" ? false : null,
          page: currentPage,
          size: itemsPerPage,
          sort: sortType,
        }),
        categories.length === 0 ? getAllCategories() : Promise.resolve(null),
        brands.length === 0 ? getAllBrands() : Promise.resolve(null),
      ]);

      if (categoriesData) setCategories(categoriesData);
      if (brandsData) setBrands(brandsData);

      const mappedProducts = (filterResult.content || []).map((product) => {
        const variants = product.variants || [];
        const totalQuantity = variants.reduce((sum, v) => sum + (v.quantity || 0), 0);
        const prices = variants.map(v => v.price || 0);
        const minPrice = prices.length ? Math.min(...prices) : (product.minPrice || 0);
        const maxPrice = prices.length ? Math.max(...prices) : (product.maxPrice || 0);

        return {
          ...product,
          quantity: totalQuantity,
          variantsCount: variants.length,
          minPrice,
          maxPrice,
          status: (product.isActive === false) ? "Vô hiệu hóa" : (totalQuantity > 0 ? "Hoạt động" : "Hết hàng"),
          categoryName: product.categoryName || "N/A",
        };
      });

      setProducts(mappedProducts);
      setTotalPages(filterResult.totalPages);
      setTotalElements(filterResult.totalElements);

    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Không thể tải dữ liệu sản phẩm.");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const allProducts = await getAllProducts();
      const mapped = allProducts.map((product) => {
        const variants = product.variants || [];
        const totalQuantity = variants.reduce(
          (sum, v) => sum + (v.quantity || 0),
          0
        );
        return {
          ...product,
          quantity: totalQuantity,
          status: (product.isActive === false)
            ? "Vô hiệu hóa"
            : (totalQuantity > 0 ? "Hoạt động" : "Hết hàng"),
        };
      });

      const totalProducts = mapped.length;
      const activeProducts = mapped.filter(p => p.status === "Hoạt động").length;
      const outOfStockProducts = mapped.filter(p => p.quantity === 0).length;
      const totalInventory = mapped.reduce((sum, p) => sum + p.quantity, 0);

      setStats({
        totalProducts,
        activeProducts,
        outOfStockProducts,
        totalInventory,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      // If the change was triggered by clicking a suggestion, ignore fetching new suggestions
      if (isSuggestionClicked.current) {
        isSuggestionClicked.current = false;
        return;
      }

      if (searchQuery.trim().length > 0) {
        try {
          const res = await filterProducts({ search: searchQuery, size: 5 });
          setSuggestions(res.content || []);
          setShowSuggestions(true);
        } catch (error) {
          console.error("Suggestion error", error);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  useEffect(() => {
    fetchData();
  }, [currentPage, sortType, appliedFilters]);

  useEffect(() => {
    setIsAllSelected(
      products.length > 0 && products.every((p) => selectedProducts.includes(p.id))
    );
  }, [products, selectedProducts]);


  const handleSearchSubmit = () => {
    setCurrentPage(0);
    fetchData();
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (name) => {
    isSuggestionClicked.current = true; // Set flag before updating state
    setSearchQuery(name);
    setShowSuggestions(false);
    setCurrentPage(0);
    fetchData({ search: name });
  };

  const handlePageChange = (page) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedProducts(products.map((p) => p.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (productId) => {
    setSelectedProducts((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const handleBulkDisable = () => {
    setConfirmModal({
      isOpen: true,
      title: "Xác nhận vô hiệu hóa",
      message: `Bạn có chắc chắn muốn vô hiệu hóa ${selectedProducts.length} sản phẩm đã chọn?`,
      variant: "danger",
      confirmLabel: "Vô hiệu hóa",
      onConfirm: async () => {
        try {
          // deleteProduct effectively does soft delete (disable)
          await Promise.all(selectedProducts.map(id => deleteProduct(id)));
          toast.success(`Đã vô hiệu hóa thành công ${selectedProducts.length} sản phẩm.`);
          fetchData();
          setSelectedProducts([]);
        } catch (error) {
          console.error("Error disabling products", error);
          toast.error("Có lỗi xảy ra khi vô hiệu hóa sản phẩm.");
        }
      }
    });
  };

  const handleBulkEnable = () => {
    const inactiveSelected = products.filter(p => selectedProducts.includes(p.id) && !p.isActive);
    if (inactiveSelected.length === 0) return;

    setConfirmModal({
      isOpen: true,
      title: "Xác nhận kích hoạt",
      message: `Bạn có chắc chắn muốn kích hoạt lại ${inactiveSelected.length} sản phẩm đã chọn?`,
      variant: "success",
      confirmLabel: "Kích hoạt",
      onConfirm: async () => {
        try {
          await Promise.all(inactiveSelected.map(async (p) => {
            const fullProduct = await getProductById(p.id);
            fullProduct.isActive = true;
            await updateProduct(p.id, fullProduct);
          }));
          toast.success(`Đã kích hoạt thành công ${inactiveSelected.length} sản phẩm.`);
          fetchData();
          setSelectedProducts([]);
        } catch (error) {
          console.error("Error enabling products", error);
          toast.error("Có lỗi xảy ra khi kích hoạt sản phẩm.");
        }
      }
    });
  };

  const handleToggleStatus = (product) => {
    const isActivating = !product.isActive;
    setConfirmModal({
      isOpen: true,
      title: isActivating ? "Kích hoạt sản phẩm" : "Vô hiệu hóa sản phẩm",
      message: isActivating
        ? "Bạn có chắc chắn muốn kích hoạt lại sản phẩm này?"
        : "Bạn có chắc chắn muốn vô hiệu hóa sản phẩm này?",
      variant: isActivating ? "success" : "danger",
      confirmLabel: isActivating ? "Kích hoạt" : "Vô hiệu hóa",
      onConfirm: async () => {
        try {
          if (isActivating) {
            const fullProduct = await getProductById(product.id);
            fullProduct.isActive = true;
            await updateProduct(product.id, fullProduct);
            toast.success("Kích hoạt sản phẩm thành công!");
          } else {
            await deleteProduct(product.id);
            toast.success("Vô hiệu hóa sản phẩm thành công!");
          }
          fetchData();
        } catch (error) {
          console.error("Error toggling product status", error);
          toast.error("Có lỗi xảy ra khi thay đổi trạng thái sản phẩm.");
        }
      }
    });
  };

  const handleViewDetail = async (id) => {
    try {
      const loadingToast = toast.loading("Đang tải thông tin...");
      const [productData, variantsData] = await Promise.all([
        getProductById(id),
        getProductVariants(id),
      ]);

      setViewProduct({ ...productData, variants: variantsData });
      setIsViewModalOpen(true);
      toast.dismiss(loadingToast);
    } catch (error) {
      console.error("Error fetching detail:", error);
      toast.error("Không thể tải thông tin chi tiết.");
    }
  };

  const handleApplyFilters = () => {
    setCurrentPage(0);
    setAppliedFilters({
      category: selectedCategory,
      stock: stockFilter,
      status: statusFilter
    });
    setSelectedProducts([]);
  };

  const handleRefresh = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setStockFilter("");
    setStatusFilter("");
    setSortType("newest");
    setCurrentPage(0);
    setAppliedFilters({
      category: "",
      stock: "",
      status: ""
    });
    setSelectedProducts([]);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (productData) => {
    let toastId = null;
    try {
      toastId = toast.loading("Đang xử lý...");

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
        toast.dismiss(toastId);
        toast.success("Cập nhật thành công!");
      } else {
        await createProduct(productData);
        toast.dismiss(toastId);
        toast.success("Thêm mới thành công!");
      }

      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error saving product", error);
      const msg = error.response?.data && typeof error.response.data === 'string'
        ? error.response.data
        : (error.message || 'Có lỗi xảy ra!');

      if (toastId) toast.dismiss(toastId);
      toast.error(msg);
    }
  };

  const handleExportAll = async () => {
    try {
      const loadingToast = toast.loading("Đang xuất dữ liệu...");

      // Fetch all products matching current filters (size=100000 ensures we get everything)
      const res = await filterProducts({
        search: searchQuery,
        categories: appliedFilters.category,
        stocks: appliedFilters.stock === "Hết hàng" ? "out" : appliedFilters.stock === "Còn hàng" ? "in" : "",
        active: appliedFilters.status === "active" ? true : appliedFilters.status === "inactive" ? false : null,
        page: 0,
        size: 100000,
        sort: sortType,
      });

      const allProducts = res.content || [];

      const exportData = allProducts.flatMap(p => {
        const common = {
          name: p.name,
          category: p.categoryName || "",
          brand: p.brandName || "",
          description: p.description || "",
          total_sold: p.totalSold || 0,
        };
        if (!p.variants || p.variants.length === 0) {
          return [{ ...common, variant: "Gốc", price: p.minPrice || 0, quantity: p.quantity || 0, image: "" }];
        }
        return p.variants.map(v => ({
          ...common,
          variant: v.variantName,
          price: v.price,
          quantity: v.quantity,
          image: v.imageUrls ? v.imageUrls.join(", ") : ""
        }));
      });

      exportToExcel(exportData, "Danh_sach_san_pham");

      toast.dismiss(loadingToast);
      toast.success(`Đã xuất ${exportData.length} dòng dữ liệu.`);
    } catch (error) {
      console.error("Export Error:", error);
      toast.error("Có lỗi xảy ra khi xuất file.");
    }
  };

  // Import handler with Grouping
  const handleImportProducts = async (jsonData) => {
    if (!jsonData || jsonData.length === 0) return;

    const loadingToast = toast.loading("Đang nhập dữ liệu...");
    let successCount = 0;
    let errorCount = 0;

    const groupedData = {};

    jsonData.forEach(item => {
      const normalizedItem = {};
      Object.keys(item).forEach(key => {
        normalizedItem[key.toLowerCase().trim()] = item[key];
      });

      const getVal = (keys) => {
        for (const k of keys) {
          if (normalizedItem[k] !== undefined) return normalizedItem[k];
        }
        return "";
      };

      const name = getVal(["name", "tên sản phẩm", "tên"]);
      if (!name) return;

      if (!groupedData[name]) {
        groupedData[name] = {
          rows: [],
          meta: {
            description: getVal(["description", "mô tả"]),
            catName: getVal(["category", "categoryname", "danh mục", "tên danh mục"]),
            brandName: getVal(["brand", "brandname", "thương hiệu", "hãng"])
          }
        };
      }
      groupedData[name].rows.push(normalizedItem);
    });

    const productNames = Object.keys(groupedData);

    for (const name of productNames) {
      try {
        const { rows, meta } = groupedData[name];

        let categoryId = categories.length > 0 ? categories[0].id : 1;
        if (meta.catName) {
          const foundCat = categories.find(c => c.name.toLowerCase() === String(meta.catName).toLowerCase());
          if (foundCat) categoryId = foundCat.id;
        }

        let brandId = brands.length > 0 ? brands[0].id : 1;
        if (meta.brandName) {
          const foundBrand = brands.find(b => b.name.toLowerCase() === String(meta.brandName).toLowerCase());
          if (foundBrand) brandId = foundBrand.id;
        }

        const variants = rows.map(row => {
          const getVal = (keys) => {
            for (const k of keys) {
              if (row[k] !== undefined) return row[k];
            }
            return "";
          };

          const variantName = getVal(["variant", "variantname", "biến thể", "loại"]);
          const price = getVal(["price", "giá", "giá tiền"]);
          const quantity = getVal(["quantity", "số lượng", "tồn kho"]);
          const imageRaw = getVal(["image", "imageurl", "ảnh", "hình ảnh"]);

          const imageUrls = imageRaw ? String(imageRaw).split(',').map(s => s.trim()).filter(s => s) : [];

          return {
            variantName: variantName || "Gốc",
            price: Number(price) || 0,
            quantity: Number(quantity) || 0,
            imageUrls: imageUrls
          };
        });

        const payload = {
          name: name,
          description: meta.description,
          categoryId: categoryId,
          brandId: brandId,
          isActive: true,
          variants: variants
        };

        await createProduct(payload);
        successCount++;
      } catch (err) {
        console.error("Import error for", name, err);
        errorCount++;
      }
    }

    toast.dismiss(loadingToast);
    if (successCount > 0) toast.success(`Nhập thành công ${successCount} sản phẩm!`);
    if (errorCount > 0) toast.error(`Lỗi ${errorCount} sản phẩm. Xem console.`);

    setIsImportModalOpen(false);
    fetchData();
  };


  const statCards = [
    { label: "Tổng sản phẩm", value: stats.totalProducts, icon: Package, color: "bg-purple-100 text-purple-600", border: "border-purple-200" },
    { label: "Đang bán", value: stats.activeProducts, icon: ShoppingCart, color: "bg-green-100 text-green-600", border: "border-green-200" },
    { label: "Hết hàng/Sắp hết", value: stats.outOfStockProducts, icon: AlertCircle, color: "bg-orange-100 text-orange-600", border: "border-orange-200" },
    { label: "Tổng tồn kho", value: stats.totalInventory, icon: Archive, color: "bg-blue-100 text-blue-600", border: "border-blue-200" },
  ];

  if (loading) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen">

        <div className="flex justify-center items-center h-[80vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#2B6377]">Quản lý sản phẩm</h1>
        <p className="text-gray-600 mt-1">Quản lý tất cả sản phẩm trong hệ thống</p>
      </div>

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
        product={editingProduct}
      />

      <ProductDetailModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        product={viewProduct}
        variants={viewProduct?.variants || []}
      />

      <ExcelImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportProducts}
        sampleColumns={["name", "category", "brand", "price", "quantity", "description", "variant", "image"]}
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div key={index} className="rounded-2xl p-6 shadow-sm border border-gray-100" style={{ background: "#D5E2E6" }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-700">{stat.label}</p>
                <p className="text-3xl font-bold mt-2 text-gray-900">{stat.value}</p>
              </div>
              <div className="w-12 h-12 bg-white/30 rounded-xl flex items-center justify-center text-2xl">
                <stat.icon className={`w-6 h-6 ${stat.color.split(" ")[1]}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-3 mb-8">
        <button
          onClick={() => setIsImportModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-xl font-medium border border-gray-300 bg-white shadow-sm hover:bg-gray-50 hover:border-[#2B6377] hover:text-[#2B6377] transition"
        >
          <Upload className="w-5 h-5" />
          Nhập Excel
        </button>

        <button
          onClick={handleExportAll}
          className="flex items-center gap-2 px-5 py-3 rounded-xl font-medium border border-gray-300 bg-white shadow-sm hover:bg-gray-50 hover:border-[#2B6377] hover:text-[#2B6377] transition"
        >
          <Download className="w-5 h-5" />
          Xuất Excel
        </button>

        <button
          onClick={handleCreate}
          className="bg-[#2B6377] flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-white shadow-md hover:shadow-lg hover:translate-y-0.5 hover:bg-[#2B6377]/80 transition"
        >
          <Plus className="w-5 h-5" />
          Thêm sản phẩm
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-8">
        <div className="flex items-end gap-4 w-full flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tìm kiếm sản phẩm</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Nhập tên sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2B6377] focus:border-transparent"
              />
              <Search
                className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer hover:text-[#2B6377]"
                onClick={handleSearchSubmit}
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-[40] w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-auto">
                  {suggestions.map((item) => (
                    <div
                      key={item.id}
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3 border-b last:border-0"
                      onClick={() => handleSuggestionClick(item.name)}
                    >
                      <img
                        src={(item.images && item.images[0]) || "https://placehold.co/40"}
                        alt=""
                        className="w-8 h-8 rounded object-cover"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.name}</p>
                        <p className="text-xs text-gray-500">
                          {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(item.minPrice || item.price || 0)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="w-44 shrink-0">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Danh mục</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2B6377] bg-white cursor-pointer"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="w-40 shrink-0">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tồn kho</label>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2B6377] bg-white cursor-pointer"
            >
              <option value="">Tất cả tồn kho</option>
              <option value="Còn hàng">Còn hàng</option>
              <option value="Hết hàng">Hết hàng</option>
            </select>
          </div>

          <div className="w-44 shrink-0">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Trạng thái</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2B6377] bg-white cursor-pointer"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Vô hiệu hóa</option>
            </select>
          </div>

          <div className="flex items-end pb-0.5">
            <button
              onClick={handleApplyFilters}
              className="h-[42px] px-4 bg-[#2B6377] text-white rounded-lg hover:bg-[#235161] transition-colors flex items-center gap-2 font-medium shadow-sm active:scale-95"
            >
              <Filter className="w-4 h-4" />
              Áp dụng
            </button>
          </div>

          <div className="w-40 shrink-0">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Sắp xếp</label>
            <select
              value={sortType}
              onChange={(e) => {
                setSortType(e.target.value);
                setSelectedProducts([]);
              }}
              className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2B6377] bg-white cursor-pointer"
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="bestSelling">Bán chạy</option>
              <option value="priceAsc">Giá: Thấp &rarr; Cao</option>
              <option value="priceDesc">Giá: Cao &rarr; Thấp</option>
              <option value="az">Tên: A &rarr; Z</option>
              <option value="za">Tên: Z &rarr; A</option>
            </select>
          </div>

          <div className="shrink-0">
            <button
              onClick={handleRefresh}
              className="p-3 border border-gray-300 rounded-xl hover:bg-[#ccdfe3] text-gray-600 hover:text-[#2B6377] transition-colors shadow-sm"
            >

              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-500">
          Hiển thị: <span className="font-semibold text-gray-900">{totalElements} sản phẩm</span>
        </div>
      </div>

      {selectedProducts.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900">
              Đã chọn: <span className="font-bold text-[#2B6377]">{selectedProducts.length}</span> sản phẩm
            </span>
          </div>
          <div className="flex items-center gap-3">
            {products.some(p => selectedProducts.includes(p.id) && !p.isActive) && (
              <button
                onClick={handleBulkEnable}
                className="flex items-center gap-2 px-4 py-2 bg-white text-green-600 border border-green-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors"
              >
                <ToggleRight size={18} />
                Kích hoạt ({products.filter(p => selectedProducts.includes(p.id) && !p.isActive).length})
              </button>
            )}
            {products.some(p => selectedProducts.includes(p.id) && p.isActive) && (
              <button
                onClick={handleBulkDisable}
                className="flex items-center gap-2 px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors"
              >
                <ToggleRight size={18} />
                Vô hiệu hóa ({products.filter(p => selectedProducts.includes(p.id) && p.isActive).length})
              </button>
            )}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#2B6377] text-white text-sm whitespace-nowrap">
                <th className="p-4 font-bold tracking-wider">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-[#2B6377] focus:ring-[#2B6377]"
                  />
                </th>
                <th className="p-4 font-bold tracking-wider">Sản phẩm</th>
                <th className="p-4 font-bold tracking-wider">Danh mục</th>
                <th className="p-4 font-bold tracking-wider">Giá</th>
                <th className="p-4 font-bold tracking-wider">Số lượng</th>
                <th className="p-4 font-bold tracking-wider">Đã bán</th>
                <th className="p-4 font-bold tracking-wider text-center">Trạng thái</th>
                <th className="p-4 font-bold tracking-wider">Ngày tạo</th>
                <th className="p-4 font-bold tracking-wider text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-400">
              {products.map((product) => {
                const isInactive = product.status === "Vô hiệu hóa";
                return (
                  <tr
                    key={product.id}
                    className={`transition-colors border-b last:border-0 ${selectedProducts.includes(product.id) ? "bg-blue-50" : isInactive ? "bg-gray-100 text-gray-500" : "hover:bg-gray-50 cursor-pointer"}`}
                    onClick={() => handleSelectProduct(product.id)}
                  >

                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => handleSelectProduct(product.id)}
                        onClick={(e) => e.stopPropagation()}
                        className={`w-4 h-4 rounded border-gray-300 ${isInactive ? "text-gray-400" : "text-[#2B6377] focus:ring-[#2B6377]"}`}
                      />
                    </td>
                    <td className="p-4">
                      <div className={`flex items-center gap-3 ${isInactive ? "opacity-60" : ""}`}>
                        <img
                          src={(product.images && product.images[0]) || "https://placehold.co/50"}
                          alt={product.name}
                          className="w-12 h-12 rounded-md object-contain border border-gray-200"
                          onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/50"; }}
                        />
                        <div className="max-w-xs">
                          <p className={`font-medium line-clamp-1 ${isInactive ? "line-through text-gray-500" : "text-gray-900"}`}>{product.name}</p>
                          <p className="text-xs text-gray-500">ID: {product.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className={`p-4 text-sm ${isInactive ? "line-through text-gray-400" : "text-[#2B6377]"}`}>{product.categoryName}</td>
                    <td className={`p-4 ${isInactive ? "line-through opacity-60" : ""}`}>
                      <div className="flex flex-col">
                        <span className={`font-medium ${isInactive ? "text-gray-500" : "text-[#2B6377]"}`}>
                          {product.minPrice === product.maxPrice
                            ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(product.minPrice || 0)
                            : `${new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(product.minPrice || 0)} - ${new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(product.maxPrice || 0)}`
                          }
                        </span>
                      </div>
                    </td>
                    <td className={`p-4 font-medium ${isInactive ? "line-through text-gray-400" : (product.quantity === 0 ? "text-red-600" : "text-gray-900")}`}>{product.quantity}</td>
                    <td className={`p-4 font-medium ${isInactive ? "line-through text-gray-400" : "text-gray-900"}`}>{product.totalSold || 0}</td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${isInactive ? "bg-gray-300 text-gray-700" : product.quantity > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-500">{product.createdAt ? new Date(product.createdAt).toLocaleDateString("vi-VN") : "N/A"}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        {!isInactive && (
                          <button onClick={() => handleViewDetail(product.id)} className="p-1 rounded-lg hover:bg-[#ccdfe3] text-blue-600 hover:text-blue-700 transition-colors">
                            <Eye size={16} />
                          </button>
                        )}
                        {!isInactive && (
                          <button onClick={() => handleEdit(product)} className="p-1 rounded-lg hover:bg-[#ccdfe3] text-amber-600 hover:text-amber-700 transition-colors">
                            <Pencil size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleStatus(product)}
                          className={`p-1 rounded-lg transition-colors hover:bg-[#ccdfe3] ${product.isActive ? 'text-green-600 hover:text-green-700' : 'text-gray-600 hover:text-gray-700'}`}
                          title={product.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
                        >
                          {product.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          totalItems={totalElements}
          itemsPerPage={itemsPerPage}
          className="border-0 border-t border-gray-200 rounded-none shadow-none"
        />
      </div>
    </div >
  );
};

export default ProductManagement;

