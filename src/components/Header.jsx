import {
  Search,
  Heart,
  ShoppingCart,
  User,
  ChevronDown,
  MapPin,
  LogOut,
  LogIn,
  X,
} from "lucide-react";

import { LiaShippingFastSolid } from "react-icons/lia";
import { FaLeaf, FaHeart } from "react-icons/fa";
import { FaUserDoctor, FaStore } from "react-icons/fa6";

import { useAuth } from "../context/AuthContext";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { getAllProducts } from "../services/productService";
import { getCartData } from '../services/cartService';
export default function Header() {
  const { user, logout, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const displayUserName = user ? user.name : 'Guest';

  // --- THÊM STATE CART COUNT ---
  const [cartCount, setCartCount] = useState(0);

  // --- HÀM CẬP NHẬT SỐ LƯỢNG ---
  const updateCartCount = async () => {
    // Nếu chưa đăng nhập thì không gọi API
    const userStored = localStorage.getItem('user');
    if (!userStored) {
      setCartCount(0);
      return;
    }

    try {
      const cart = await getCartData();
      if (cart && cart.items) {
        // Tính tổng số lượng sản phẩm (quantity)
        const count = cart.items.reduce((sum, item) => sum + item.quantity, 0);
        setCartCount(count);
      } else {
        setCartCount(0);
      }
    } catch (error) {
      console.error("Lỗi lấy số lượng giỏ hàng", error);
      setCartCount(0);
    }
  };

  // --- USE EFFECT LẮNG NGHE SỰ KIỆN ---
  useEffect(() => {
    // 1. Gọi ngay khi load trang
    updateCartCount();

    // 2. Đăng ký lắng nghe sự kiện 'cart-updated' từ cartService
    window.addEventListener('cart-updated', updateCartCount);

    // 3. Cleanup khi component bị hủy
    return () => {
      window.removeEventListener('cart-updated', updateCartCount);
    };
  }, [user]); // Chạy lại khi user thay đổi (đăng nhập/đăng xuất)

  const dropdownRef = useRef(null);
  const searchBoxRef = useRef(null);

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // ==============================
  // SEARCH STATES
  // ==============================
  const [headerSearch, setHeaderSearch] = useState("");
  const [allProducts, setAllProducts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [history, setHistory] = useState([]);
  const [showSuggestBox, setShowSuggestBox] = useState(false);

  // ==============================
  // LOAD PRODUCTS
  // ==============================
  useEffect(() => {
    (async () => {
      const list = await getAllProducts();
      setAllProducts(list);
    })();
  }, []);

  // ==============================
  // LOAD SEARCH HISTORY
  // ==============================
  useEffect(() => {
    const h = JSON.parse(localStorage.getItem("search_history") || "[]");
    setHistory(h);
  }, []);

  // ==============================
  // SAVE HISTORY
  // ==============================
  const saveHistory = (keyword) => {
    let h = JSON.parse(localStorage.getItem("search_history") || "[]");
    h = h.filter((x) => x !== keyword);
    h.unshift(keyword);

    localStorage.setItem("search_history", JSON.stringify(h));
    setHistory(h);
  };

  // =================
  // CLICK OUTSIDE
  // ===============
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setShowSuggestBox(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  const handleGoToOrders = () => {
    setIsUserMenuOpen(false);
    navigate('/order');
  };
  // ==============================
  // HIGHLIGHT MATCHES
  // ==============================
  const highlight = (name, keyword) => {
    if (!keyword) return name;
    const regex = new RegExp(`(${keyword})`, "gi");
    return name.replace(
      regex,
      `<span class="text-teal-600 font-semibold">$1</span>`
    );
  };

  // ==============================
  // DEBOUNCE SEARCH
  // ==============================
  useEffect(() => {
    const text = headerSearch.trim();

    // Khi ô search rỗng
    if (text === "") {
      setSuggestions([]);

      // Hiện history nếu có
      if (history.length > 0) {
        setShowSuggestBox(true);
      } else {
        setShowSuggestBox(false);
      }

      return;
    }

    const timer = setTimeout(() => {
      const s = text.toLowerCase();

      const matched = allProducts
        .filter((p) => p.name.toLowerCase().includes(s))
        .slice(0, 7);

      setSuggestions(matched);
      setShowSuggestBox(true);
    }, 300);

    return () => clearTimeout(timer);
  }, [headerSearch, allProducts, history]);

  // ==================
  // EXECUTE SEARCH
  // ===============
  const executeSearch = (keyword) => {
    const kw = keyword.trim();

    if (kw === "") {
      navigate("/products");
      setShowSuggestBox(false);
      return;
    }

    saveHistory(kw);
    navigate(`/products?search=${kw}`);
    setShowSuggestBox(false);
  };

  const handleSearchKey = (e) => {
    if (e.key === "Enter") executeSearch(headerSearch);
  };

  // ==============================
  // LOGOUT
  // ==============================
  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate("/");
  };

  // ==============================
  // RENDER
  // ==============================
  return (
    <>
      <header className="bg-[#2B6377] text-white sticky top-0 z-50">
        <div className="flex items-center justify-between px-8 py-4">
          {/* LOGO */}
          <div
            onClick={() => navigate("/")}
            className="text-2xl font-bold cursor-pointer hover:text-teal-100 transition"
          >
            EMBROSIA
          </div>

          {/* NAV */}
          <nav className="flex items-center gap-8">
            <button
              onClick={() => navigate("/products")}
              className="hover:text-teal-100 transition font-medium"
            >
              Product
            </button>
            <button className="hover:text-teal-100 transition font-medium">
              Brands
            </button>
            <button className="hover:text-teal-100 transition font-medium">
              Sale
            </button>
            <button className="hover:text-teal-100 transition font-medium">
              About
            </button>
          </nav>

          {/* SEARCH + USER */}
          <div className="flex items-center gap-4">
            {/* ============================== */}
            {/* SEARCH BOX */}
            {/* ============================== */}
            <div className="relative" ref={searchBoxRef}>
              <input
                type="text"
                placeholder="Search products..."
                value={headerSearch}
                onChange={(e) => {
                  const value = e.target.value;
                  setHeaderSearch(value);

                  if (value.trim() === "") {
                    setSuggestions([]);

                    if (history.length > 0) setShowSuggestBox(true);
                    else setShowSuggestBox(false);

                    return;
                  }

                  setShowSuggestBox(true);
                }}
                onFocus={() => {
                  if (headerSearch.trim() === "") {
                    if (history.length > 0) setShowSuggestBox(true);
                  } else {
                    setShowSuggestBox(true);
                  }
                }}
                onKeyDown={handleSearchKey}
                className="bg-white text-gray-800 rounded-full py-2 px-4 pl-10 w-64 text-sm"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />

              {/* ============================== */}
              {/* AUTOCOMPLETE POPUP */}
              {/* ============================== */}
              {showSuggestBox &&
                (history.length > 0 || suggestions.length > 0) && (
                  <div className="absolute w-full bg-white text-gray-800 shadow-lg rounded-lg top-11 z-50 max-h-96 ">
                    {/* HISTORY */}
                    {history.length > 0 && headerSearch.trim() === "" && (
                      <div className="border-b p-2">
                        <p className="text-xs text-gray-500 px-2 mb-1">
                          Tìm kiếm gần đây
                        </p>

                        {history.map((item, index) => (
                          <div
                            key={index}
                            onClick={() => executeSearch(item)}
                            className="flex items-center justify-between px-3 py-2 hover:bg-gray-100 cursor-pointer"
                          >
                            <span>{item}</span>
                            <X
                              className="w-4 h-4 text-gray-400 hover:text-gray-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                const newH = history.filter((x) => x !== item);
                                setHistory(newH);
                                localStorage.setItem(
                                  "search_history",
                                  JSON.stringify(newH)
                                );
                              }}
                            />
                          </div>
                        ))}

                        <button
                          onClick={() => {
                            setHistory([]);
                            localStorage.removeItem("search_history");
                          }}
                          className="text-xs text-red-500 hover:underline px-3 mt-1"
                        >
                          Xóa tất cả lịch sử
                        </button>
                      </div>
                    )}

                    {/* SUGGESTIONS */}
                    {headerSearch && suggestions.length > 0 && (
                      <div className="p-2">
                        {suggestions.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => executeSearch(item.name)}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                            dangerouslySetInnerHTML={{
                              __html: highlight(item.name, headerSearch),
                            }}
                          />
                        ))}
                      </div>
                    )}

                    {/* NO RESULT */}
                    {headerSearch && suggestions.length === 0 && (
                      <div className="p-3 text-sm text-gray-500 text-center">
                        Không tìm thấy sản phẩm
                      </div>
                    )}
                  </div>
                )}
            </div>

            {/* WISHLIST */}
            <Heart className="w-6 h-6 cursor-pointer hover:text-teal-100 transition" />

            {/* CART ICON */}
            <div className="relative">
              <ShoppingCart
                onClick={() => navigate('/cart')}
                className="w-6 h-6 cursor-pointer hover:text-teal-100 transition"
              />
              {/* Chỉ hiện badge khi số lượng > 0 */}
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>

            {/* USER MENU */}
            <div className="relative" ref={dropdownRef}>
              <div
                className="flex items-center gap-2 cursor-pointer hover:text-teal-100 transition"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              >
                <User className="w-6 h-6" />
                <span className="text-sm">Hello, {user?.name || "Guest"}</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${isUserMenuOpen ? "rotate-180" : ""
                    }`}
                />
              </div>

              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white text-[#316f84] rounded-lg shadow-lg py-2 z-50">
                  <button className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-100 flex items-center gap-3">
                    <User className="w-4 h-4" /> Tài khoản của bạn
                  </button>

                  <button
                    onClick={() => navigate("/order")}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-100 flex items-center gap-3"
                  >
                    <ShoppingCart className="w-4 h-4" /> Quản lý đơn hàng
                  </button>

                  <button className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-100 flex items-center gap-3">
                    <FaStore className="w-4 h-4" /> Quản lý cửa hàng
                  </button>

                  <button className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-100 flex items-center gap-3">
                    <Heart className="w-4 h-4" /> Sản phẩm yêu thích
                  </button>

                  <button className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-100 flex items-center gap-3">
                    <MapPin className="w-4 h-4" /> Địa chỉ giao hàng
                  </button>

                  <hr className="my-2 border-gray-200" />

                  {isLoggedIn ? (
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
                    >
                      <LogOut className="w-4 h-4" /> Thoát
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate("/login")}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
                    >
                      <LogIn className="w-4 h-4" /> Đăng nhập
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* SUB HEADER */}
      <div className="bg-[#CCDFE3] text-[#2B6377] px-8 py-3 flex justify-around text-sm font-medium">
        <div className="flex items-center gap-2">
          <LiaShippingFastSolid className="w-5 h-5" />
          <span>Free Shipping Over $50</span>
        </div>
        <div className="flex items-center gap-2">
          <FaLeaf className="w-5 h-5" />
          <span>Natural Ingredients</span>
        </div>
        <div className="flex items-center gap-2">
          <FaHeart className="w-5 h-5" />
          <span>Cruelty-Free</span>
        </div>
        <div className="flex items-center gap-2">
          <FaUserDoctor className="w-5 h-5" />
          <span>Dermatologist Tested</span>
        </div>
      </div>
    </>
  );
}
