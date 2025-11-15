// Mock cart data - sẽ được thay thế bằng API calls từ Spring Boot backend
const mockCartData = {
  id: 'cart-123',
  items: [
    {
      id: 'cart-item-1',
      productId: 'prod-001',
      productName: 'Radiance Glow Serum',
      productImage: '/radiance-glow-serum-bottle.jpg',
      size: '30ml Rose Gold Edition',
      quantity: 1,
      originalPrice: 88.00,
      salePrice: 89.00,
    },
    {
      id: 'cart-item-2',
      productId: 'prod-001',
      productName: 'Radiance Glow Serum',
      productImage: '/radiance-glow-serum-bottle.jpg',
      size: '30ml Rose Gold Edition',
      quantity: 1,
      originalPrice: 88.00,
      salePrice: 89.00,
    },
    {
      id: 'cart-item-3',
      productId: 'prod-001',
      productName: 'Radiance Glow Serum',
      productImage: '/radiance-glow-serum-bottle.jpg',
      size: '30ml Rose Gold Edition',
      quantity: 1,
      originalPrice: 88.00,
      salePrice: 89.00,
    },
  ],
  subtotal: 261.00,
  shippingFee: 12.00,
  total: 293.88,
};

/**
 * Fetch cart data from backend
 * Replace this with actual API call: GET /api/carts/{cartId}
 */
export async function getCartData() {
  // TODO: Replace with real API call
  // return fetch(`${API_BASE_URL}/carts/${cartId}`).then(res => res.json());
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockCartData), 300);
  });
}

/**
 * Update cart item quantity
 * Replace this with actual API call: PUT /api/carts/{cartId}/items/{itemId}
 */
export async function updateCartItemQuantity(cartItemId, newQuantity) {
  // TODO: Replace with real API call
  // return fetch(`${API_BASE_URL}/carts/{cartId}/items/${cartItemId}`, {
  //   method: 'PUT',
  //   body: JSON.stringify({ quantity: newQuantity })
  // }).then(res => res.json());
  return new Promise((resolve) => {
    setTimeout(() => {
      const item = mockCartData.items.find(i => i.id === cartItemId);
      if (item) {
        item.quantity = newQuantity;
        mockCartData.subtotal = mockCartData.items.reduce((sum, i) => sum + (i.salePrice * i.quantity), 0);
        mockCartData.total = mockCartData.subtotal + mockCartData.shippingFee;
      }
      resolve(mockCartData);
    }, 200);
  });
}

/**
 * Remove item from cart
 * Replace this with actual API call: DELETE /api/carts/{cartId}/items/{itemId}
 */
export async function removeCartItem(cartItemId) {
  // TODO: Replace with real API call
  // return fetch(`${API_BASE_URL}/carts/{cartId}/items/${cartItemId}`, {
  //   method: 'DELETE'
  // }).then(res => res.json());
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockCartData.items.findIndex(i => i.id === cartItemId);
      if (index > -1) {
        mockCartData.items.splice(index, 1);
        mockCartData.subtotal = mockCartData.items.reduce((sum, i) => sum + (i.salePrice * i.quantity), 0);
        mockCartData.total = mockCartData.subtotal + mockCartData.shippingFee;
      }
      resolve(mockCartData);
    }, 200);
  });
}
