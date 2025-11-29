import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import ProductsPage from './pages/ProductsPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'

// ADMIN
import AdminLayout from './components/admin/AdminLayout'
import Dashboard from './pages/admin/Dashboard'
import UserManagement from './pages/admin/UserManagement'
import AddEmployee from './pages/admin/AddEmployee'
import UserDetail from './pages/admin/UserDetail' 

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Trang khách */}
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />

        {/* ADMIN – DÙNG LAYOUT RIÊNG */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          
          <Route path="users" element={<UserManagement />} />
          <Route path="users/add" element={<AddEmployee />} />
    
          <Route path="users/:id" element={<UserDetail />} />

          {/* Sau này thêm */}
          {/* <Route path="products" element={<ProductManagement />} /> */}
        </Route>
      </Routes>
    </Router>
  )
}