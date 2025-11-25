import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { getCartData, updateCartItemQuantity, removeCartItem } from '../services/cartService';
import CartItem from '../components/CartItem';
import CartSummary from '../components/CartSummary';

export default function CartPage() {
  const [cartData, setCartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const data = await getCartData();
      setCartData(data);
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await updateCartItemQuantity(cartItemId, newQuantity);
      loadCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const handleRemoveItem = async (cartItemId) => {
    try {
      await removeCartItem(cartItemId);
      loadCart();
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-lg">Đang tải...</div>;
  }

  if (!cartData || cartData.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <ShoppingBag className="w-20 h-20 text-gray-300 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-600 mb-3">Giỏ hàng trống</h2>
        <Link to="/products" className="text-teal-600 hover:underline">
          Tiếp tục mua hàng
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 text-sm text-gray-600">
          <Link to="/" className="hover:text-teal-600">Trang chủ</Link>
          <span className="mx-2">›</span>
          <span className="text-gray-900 font-medium">Giỏ hàng</span>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Giỏ hàng</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartData.items.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onQuantityChange={handleQuantityChange}
                onRemove={handleRemoveItem}
              />
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <CartSummary cartData={cartData} />
          </div>
        </div>

        <div className="mt-6">
          <Link 
            to="/products" 
            className="text-teal-600 hover:text-teal-700 flex items-center gap-2 font-medium"
          >
            ← Tiếp tục mua hàng
          </Link>
        </div>
      </div>
    </div>
  );
}
