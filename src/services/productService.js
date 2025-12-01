import api from './api';

export const getAllProducts = async () => {
    try {
        const response = await api.get('/api/products');
        return response.data;
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
};

export const getProductById = async (id) => {
    try {
        const response = await api.get(`/api/products/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching product with id ${id}:`, error);
        throw error;
    }
};

export const getProductVariants = async (productId) => {
    try {
        const response = await api.get(`/api/variants/product/${productId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching variants for product ${productId}:`, error);
        throw error;
    }
};
