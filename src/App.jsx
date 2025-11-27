import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import ProductsPage from './pages/ProductsPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import OrderPage from './pages/OrderPage'
import OrderDetailPage from './pages/OrderDetailPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
          <Route path="/order" element={<OrderPage/>}/>
          <Route path="/orders/:orderId" element={<OrderDetailPage />} />
      </Routes>
    </Router>
  )
}
