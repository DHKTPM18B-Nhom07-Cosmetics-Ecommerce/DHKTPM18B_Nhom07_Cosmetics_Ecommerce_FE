import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import Header from './components/Header';
import Footer from './components/Footer';
import CheckoutPage from './pages/CheckoutPage';
import ProductReviewPage from './pages/ProductReviewPage';
import OrderPage from './pages/OrderPage';
import OrderDetailPage from './pages/OrderDetailPage';
// ADMIN
import AdminLayout from './components/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';

export default function App() {
    return (
        <Router>
            {/* Header luôn xuất hiện */}
            <Header />

            <Routes>
                {/* Trang khách */}
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/products/:id" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/order" element={<OrderPage />} />
                <Route path="/orders/:orderId" element={<OrderDetailPage />} />
                <Route path="/review-product" element={<ProductReviewPage />} />
                {/* ADMIN – DÙNG LAYOUT RIÊNG */}
                <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="users" element={<UserManagement />} />
                    {/* Sau này thêm */}
                    {/* <Route path="products" element={<ProductManagement />} /> */}
                </Route>
            </Routes>

            {/* Footer luôn xuất hiện */}
            <Footer />
        </Router>
    );
}
