import api from './api';

// --- HÀM HELPER: BẮN TÍN HIỆU CẬP NHẬT HEADER ---
const triggerCartUpdate = () => {
    window.dispatchEvent(new Event('cart-updated'));
};

// Hàm helper: Chuyển đổi dữ liệu từ Backend -> Frontend
const transformCartData = (backendCart) => {
  if (!backendCart) return null;

  return {
    id: backendCart.id,
    
    items: (backendCart.items || []).map(item => {
        
        // --- LOGIC LẤY ẢNH CHUẨN (LIST STRING) ---
        
        // 1. Lấy mảng ảnh từ Variant (Tên field bên Java là imageUrls)
        const variantImages = item.productVariant.imageUrls || [];
        
        // 2. Lấy mảng ảnh từ Product (Tên field bên Java là images)
        const productImages = item.productVariant.product?.images || [];
        
        // 3. Chọn ảnh: Ưu tiên ảnh variant, nếu không có thì lấy ảnh product
        let finalImage = "https://placehold.co/400"; // Ảnh mặc định

        if (variantImages.length > 0) {
            finalImage = variantImages[0]; // Lấy thẳng chuỗi, KHÔNG .imageUrl
        } else if (productImages.length > 0) {
            finalImage = productImages[0]; // Lấy thẳng chuỗi
        }

        return {
            id: item.id,
            variantId: item.productVariant.id,
            productId: item.productVariant.product?.id,
            productName: item.productVariant.product?.name || 'Sản phẩm',
            size: item.productVariant.variantName,
            
            productImage: finalImage, // <--- Ảnh chuẩn đây
            
            quantity: item.quantity,
            originalPrice: item.productVariant.price,
            salePrice: item.productVariant.price,
        };
    }),
    
    subtotal: backendCart.totalPrice || 0,
    shippingFee: 0,
    total: backendCart.totalPrice || 0,
  };
};

export const getCartData = async () => {
    try {
        const userStored = localStorage.getItem('user');
        if (!userStored) return null; 

        const user = JSON.parse(userStored);
        const response = await api.get(`/api/carts/user/${user.id}`);
        
        return transformCartData(response.data);
    } catch (error) {
        // console.error('Error fetching cart data:', error);
        return null;
    }
};

export const addToCart = async (accountId, variantId, quantity) => {
    try {
        const response = await api.post('/api/carts/add', {
            accountId,
            variantId,
            quantity
        });
        
        triggerCartUpdate(); // Bắn tín hiệu
        
        return response.data;
    } catch (error) {
        console.error('Error adding item to cart:', error);
        throw error;
    }
};

export const updateCartItemQuantity = async (cartItemId, quantity) => {
    try {
        const response = await api.put(`/api/cart-items/${cartItemId}`, {
            quantity: quantity
        });
        
        triggerCartUpdate(); // Bắn tín hiệu
        
        return response.data;
    } catch (error) {
        console.error(`Error updating quantity for item ${cartItemId}:`, error);
        throw error;
    }
};

export const removeCartItem = async (cartItemId) => {
    try {
        const response = await api.delete(`/api/cart-items/${cartItemId}`);
        
        triggerCartUpdate(); // Bắn tín hiệu
        
        return response.data;
    } catch (error) {
        console.error(`Error removing cart item ${cartItemId}:`, error);
        throw error;
    }
};

// Xóa các items đã được đặt hàng thành công
export const clearOrderedItems = async (orderedItems) => {
    try {
        if (!orderedItems || orderedItems.length === 0) {
            return;
        }

        // Xóa từng item trong order từ giỏ hàng
        await Promise.all(
            orderedItems.map(item => removeCartItem(item.id))
        );
        
        triggerCartUpdate(); // Bắn tín hiệu cập nhật giỏ hàng
        console.log('✅ Các items đã đặt hàng đã được xóa khỏi giỏ hàng');
    } catch (error) {
        console.error('❌ Lỗi khi xóa items khỏi giỏ hàng:', error);
        // Không throw error, vì clear items không critical - order đã thành công
    }
};