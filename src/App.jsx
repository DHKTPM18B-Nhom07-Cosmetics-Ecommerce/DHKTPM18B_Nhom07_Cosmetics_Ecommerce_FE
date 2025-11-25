import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import ProductsPage from './pages/ProductsPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import Header from './components/Header'
import Footer from './components/Footer'
import CheckoutPage from './pages/CheckoutPage' 

export default function App() {
  return (
    <Router>
      {/* Header luôn xuất hiện */}
      <Header />

      <main className="min-h-screen">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
        </Routes>
      </main>

      {/* Footer luôn xuất hiện */}
      <Footer />
    </Router>
  )
}
