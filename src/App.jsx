import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import ProductsPage from './pages/ProductsPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import Header from './components/Header'
import Footer from './components/Footer'

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
        </Routes>
      </main>

      {/* Footer luôn xuất hiện */}
      <Footer />
    </Router>
  )
}
