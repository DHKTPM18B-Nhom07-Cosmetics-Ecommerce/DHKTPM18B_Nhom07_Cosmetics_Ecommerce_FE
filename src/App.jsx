import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ScrollToTop from "./components/ScrollToTop";
import { ToastContainer } from "react-toastify";

import Header from "./components/Header";
import Footer from "./components/Footer";
import AdminLayout from "./components/admin/AdminLayout";

// client pages
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import BrandsPage from "./pages/BrandsPage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import WishlistPage from "./pages/WishlistPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import AddAddressPage from "./pages/AddAddressPage";
import OrderPage from "./pages/OrderPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import ProductReviewPage from "./pages/ProductReviewPage";
import NotFound from "./pages/NotFound";

// admin pages
import Dashboard from "./pages/admin/Dashboard";
import UserManagement from "./pages/admin/UserManagement";
import Stats from "./pages/admin/Stats.jsx";
import AddEmployee from "./pages/admin/AddEmployee";
import UserDetail from "./pages/admin/UserDetail";
import CategoryManagement from "./pages/admin/CategoryManagement";
import BrandManagement from "./pages/admin/BrandManagement";
import ProductManagement from "./pages/admin/ProductManagement";
import OrderManagement from "./pages/admin/OrderManagement";
import OrderDetailManagement from "./pages/admin/OrderDetailManagement";
import VoucherManagement from "./pages/admin/VoucherManagement";
import VoucherCreatePage from "./pages/admin/VoucherCreatePage";
import VoucherEditPage from "./pages/admin/VoucherEditPage";

import "react-toastify/dist/ReactToastify.css";
import "react-datepicker/dist/react-datepicker.css";

/* ✅ COMPONENT BỌC */
function LayoutWrapper({ children }) {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <>
      {!isAdmin && <Header />}
      {children}
      {!isAdmin && <Footer />}
    </>
  );
}

import AddressPage from "./pages/AddressPage";
import ProfilePage from "./pages/ProfilePage";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />

        <LayoutWrapper>
          <Routes>
            {/* CLIENT */}
            <Route path="/" element={<HomePage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/brands" element={<BrandsPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/order-success" element={<OrderSuccessPage />} />
            <Route path="/add-address" element={<AddAddressPage />} />
            <Route path="/order" element={<OrderPage />} />
            <Route path="/orders/:orderId" element={<OrderDetailPage />} />
            <Route path="/review-product" element={<ProductReviewPage />} />

            {/* ADMIN */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="users/add" element={<AddEmployee />} />
              <Route path="users/:id" element={<UserDetail />} />
              <Route path="brands" element={<BrandManagement />} />
              <Route path="stats" element={<Stats />} />
              <Route path="categories" element={<CategoryManagement />} />
              <Route path="products" element={<ProductManagement />} />
              <Route path="orders" element={<OrderManagement />} />
              <Route
                path="orders/:orderId"
                element={<OrderDetailManagement />}
              />
              <Route path="vouchers" element={<VoucherManagement />} />
              <Route path="vouchers/create" element={<VoucherCreatePage />} />
              <Route path="vouchers/:id/edit" element={<VoucherEditPage />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </LayoutWrapper>

        <ToastContainer position="top-right" autoClose={2000} />
      </Router>
    </AuthProvider>
  );
}
