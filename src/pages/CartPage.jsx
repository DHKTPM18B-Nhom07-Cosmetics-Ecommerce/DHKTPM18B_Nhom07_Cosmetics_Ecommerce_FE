import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { getCartData, updateCartItemQuantity, removeCartItem } from '../services/cartService';
import CartItem from '../components/CartItem';
import CartSummary from '../components/CartSummary';

export default function CartPage() {
  const navigate = useNavigate();
  const [cartData, setCartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState(new Set()); // Track selected item IDs

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

  // Handle item selection
  const toggleItemSelection = (itemId) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  // Select all items
  const handleSelectAll = () => {
    if (selectedItems.size === cartData.items.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(cartData.items.map(item => item.id)));
    }
  };

  // Get selected items data for checkout
  const getSelectedItemsData = () => {
    return cartData.items.filter(item => selectedItems.has(item.id));
  };

  // Handle checkout with selected items
  const handleCheckoutSelected = () => {
    if (selectedItems.size === 0) {
      alert('Vui lòng chọn ít nhất một sản phẩm để thanh toán!');
      return;
    }

    const selected = getSelectedItemsData();
    const selectedCartData = {
      ...cartData,
      items: selected,
      subtotal: selected.reduce((sum, item) => sum + (item.salePrice || item.originalPrice) * item.quantity, 0)
    };

    // Navigate to checkout with selected items
    navigate('/checkout', { state: { selectedItems: selectedCartData, selectedItemIds: Array.from(selectedItems) } });
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
            {/* Select All Checkbox */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedItems.size === cartData.items.length && cartData.items.length > 0}
                onChange={handleSelectAll}
                className="w-5 h-5 text-teal-600 rounded cursor-pointer"
              />
              <label className="cursor-pointer font-medium text-gray-700 flex-1">
                Chọn tất cả ({selectedItems.size}/{cartData.items.length})
              </label>
            </div>

            {/* Cart Items */}
            {cartData.items.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
                <div className="flex gap-4 p-4">
                  {/* Checkbox */}
                  <div className="flex items-start pt-1">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item.id)}
                      onChange={() => toggleItemSelection(item.id)}
                      className="w-5 h-5 text-teal-600 rounded cursor-pointer"
                    />
                  </div>

                  {/* Item Content */}
                  <CartItem
                    item={item}
                    onQuantityChange={handleQuantityChange}
                    onRemove={handleRemoveItem}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Summary & Checkout */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-4">
              {/* Summary */}
              {selectedItems.size > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-700 font-medium">
                    ✓ Đã chọn {selectedItems.size} sản phẩm
                  </p>
                </div>
              )}

              <CartSummary 
                cartData={cartData}
                selectedCount={selectedItems.size}
                onCheckout={handleCheckoutSelected}
                isCheckoutDisabled={selectedItems.size === 0}
              />
            </div>
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
