import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage.jsx"
import BrandsPage from "./pages/BrandsPage.jsx";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import Header from "./components/Header";
import Footer from "./components/Footer";
import CheckoutPage from "./pages/CheckoutPage";
import AddAddressPage from "./pages/AddAddressPage";
import ProductReviewPage from "./pages/ProductReviewPage";
import OrderPage from "./pages/OrderPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import AdminLayout from "./components/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import UserManagement from "./pages/admin/UserManagement";
import Stats from "./pages/admin/Stats.jsx"
import { AuthProvider } from "./context/AuthContext";
import VoucherManagement from "./pages/admin/VoucherManagement";
import CategoryManagement from "./pages/admin/CategoryManagement";
import ProductManagement from "./pages/admin/ProductManagement";
import OrderManagement from "./pages/admin/OrderManagement";
import AddEmployee from "./pages/admin/AddEmployee";
import UserDetail from "./pages/admin/UserDetail";
import ScrollToTop from "./components/ScrollToTop";
import NotFound from "./pages/NotFound";
import OrderDetailManagement from "./pages/admin/OrderDetailManagement";
import "react-datepicker/dist/react-datepicker.css";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import VoucherCreatePage from "./pages/admin/VoucherCreatePage";
import VoucherEditPage from "./pages/admin/VoucherEditPage";

import OrderSuccessPage from "./pages/OrderSuccessPage";
import WishlistPage from "./pages/WishlistPage";

import AddressPage from './pages/AddressPage';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        {/* scroll auto về đầu mỗi khi đổi route */}
        <ScrollToTop />

        {/* Header */}
        <Header />

        <Routes>
          {/* Trang khách */}
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/" element={<HomePage />} />
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
          <Route path="/addresses" element={<AddressPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          {/* Admin */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="users/add" element={<AddEmployee />} />
            <Route path="users/:id" element={<UserDetail />} />
            <Route path="categories" element={<CategoryManagement />} />
            <Route path="products" element={<ProductManagement />} />
            <Route path="stats" element={<Stats />} />
            <Route path="orders" element={<OrderManagement />} />
            <Route path="orders/:orderId" element={<OrderDetailManagement />} />
            <Route path="vouchers" element={<VoucherManagement />} />
            <Route path="vouchers/create" element={<VoucherCreatePage />} />
            <Route path="vouchers/:id/edit" element={<VoucherEditPage />} />
          </Route>

          {/* 404 - Catch all undefined routes */}
          <Route path="*" element={<NotFound />} />
        </Routes>

        <ToastContainer
          position="top-right"
          autoClose={2000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          pauseOnHover
          theme="light"
        />

        {/* Footer */}
        <Footer />
      </Router>
    </AuthProvider>
  );
}
