import api from './api';

// Key để lưu trong Session Storage
const GUEST_CART_KEY = 'guest_cart';

const triggerCartUpdate = () => {
    window.dispatchEvent(new Event('cart-updated'));
};

// 1. Hàm map dữ liệu từ SessionStorage -> Format giống Backend
const transformGuestData = (localItems) => {
    let subtotal = 0;
    const items = localItems.map(item => {
        subtotal += item.price * item.quantity;
        return {
            id: item.variantId, // Dùng variantId làm key tạm
            variantId: item.variantId,
            productId: item.productId,
            
            productName: item.productName,
            size: item.sizeName,
            productImage: item.image,
            
            quantity: item.quantity,
            originalPrice: item.price,
            salePrice: item.price,
        };
    });

    return {
        id: 'guest-session',
        items: items,
        subtotal: subtotal,
        shippingFee: 0,
        total: subtotal
    };
};

// 2. Hàm map dữ liệu từ Backend 
const transformCartData = (backendCart) => {
  if (!backendCart) return null;
  return {
    id: backendCart.id,
    items: (backendCart.items || []).map(item => {
        const variantImages = item.productVariant.imageUrls || [];
        const productImages = item.productVariant.product?.images || [];
        
        let finalImage = "https://placehold.co/400";
        if (variantImages.length > 0) finalImage = variantImages[0];
        else if (productImages.length > 0) finalImage = productImages[0];

        return {
            id: item.id,
            variantId: item.productVariant.id,
            productId: item.productVariant.product?.id,
            productName: item.productVariant.product?.name || 'Sản phẩm',
            size: item.productVariant.variantName,
            productImage: finalImage,
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

// ================== CÁC HÀM CHÍNH ==================

export const getCartData = async () => {
    const userStored = localStorage.getItem('user');

    if (userStored) {
        // --- CÓ USER -> GỌI API ---
        try {
            const user = JSON.parse(userStored);
            const response = await api.get(`/api/carts/user/${user.id}`);
            return transformCartData(response.data);
        } catch (error) {
            return null;
        }
    } else {
        // --- KHÁCH VÃNG LAI -> LẤY TỪ SESSION STORAGE ---
        const guestCart = JSON.parse(sessionStorage.getItem(GUEST_CART_KEY)) || [];
        return transformGuestData(guestCart);
    }
};

export const addToCart = async (accountId, variantId, quantity, productInfo = null) => {
    if (accountId) {
        // --- CÓ USER -> GỌI API ---
        try {
            const response = await api.post('/api/carts/add', { accountId, variantId, quantity });
            triggerCartUpdate();
            return response.data;
        } catch (error) {
            console.error('API Add Error:', error);
            throw error;
        }
    } else {
        // --- KHÁCH VÃNG LAI -> LƯU SESSION ---
        let guestCart = JSON.parse(sessionStorage.getItem(GUEST_CART_KEY)) || [];
        
        // Check trùng
        const existingItem = guestCart.find(item => item.variantId === variantId);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            // Thêm mới (Cần productInfo từ ProductCard truyền sang)
            if (productInfo) {
                guestCart.push({ ...productInfo, variantId, quantity });
            }
        }
        
        sessionStorage.setItem(GUEST_CART_KEY, JSON.stringify(guestCart));
        triggerCartUpdate();
        return { message: "Saved to session" };
    }
};

export const updateCartItemQuantity = async (cartItemId, quantity) => {
    const userStored = localStorage.getItem('user');
    
    if (userStored) {
        // --- CÓ USER -> GỌI API ---
        const response = await api.put(`/api/cart-items/${cartItemId}`, { quantity });
        triggerCartUpdate();
        return response.data;
    } else {
        // --- KHÁCH VÃNG LAI -> SỬA SESSION ---
        // Lưu ý: Với khách vãng lai, 'cartItemId' chính là 'variantId' (do hàm transformGuestData gán)
        let guestCart = JSON.parse(sessionStorage.getItem(GUEST_CART_KEY)) || [];
        const item = guestCart.find(i => i.variantId === cartItemId);
        
        if (item) {
            item.quantity = quantity;
            sessionStorage.setItem(GUEST_CART_KEY, JSON.stringify(guestCart));
            triggerCartUpdate();
        }
        return { message: "Updated session" };
    }
};

export const removeCartItem = async (cartItemId) => {
    const userStored = localStorage.getItem('user');

    if (userStored) {
        // --- CÓ USER -> GỌI API ---
        const response = await api.delete(`/api/cart-items/${cartItemId}`);
        triggerCartUpdate();
        return response.data;
    } else {
        // --- KHÁCH VÃNG LAI -> XÓA SESSION ---
        let guestCart = JSON.parse(sessionStorage.getItem(GUEST_CART_KEY)) || [];
        const newCart = guestCart.filter(i => i.variantId !== cartItemId);
        
        sessionStorage.setItem(GUEST_CART_KEY, JSON.stringify(newCart));
        triggerCartUpdate();
        return { message: "Removed from session" };
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