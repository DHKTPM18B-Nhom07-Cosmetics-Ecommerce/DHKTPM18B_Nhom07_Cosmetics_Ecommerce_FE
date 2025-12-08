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

export const createProduct = async (productData) => {
    try {
        const response = await api.post('/api/products', productData);
        return response.data;
    } catch (error) {
        console.error('Error creating product:', error.response?.data || error.message);
        throw error;
    }
};

export const updateProduct = async (id, productData) => {
    try {
        const response = await api.put(`/api/products/${id}`, productData);
        return response.data;
    } catch (error) {
        console.error(`Error updating product ${id}:`, error);
        throw error;
    }
};

export const deleteProduct = async (id) => {
    try {
        await api.delete(`/api/products/${id}`);
    } catch (error) {
        console.error(`Error deleting product ${id}:`, error);
        throw error;
    }
};
