import axios from 'axios';

// Lấy thông tin cấu hình Cloudinary từ biến môi trường
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

/**
 * Upload an image file to Cloudinary.
 * Uses unsigned upload with a preset for security.
 * @param {File} file - The file to upload.
 * @param {string} folderName - folder to append to the preset's folder (default: 'product').
 * @returns {Promise<string>} - The secure URL of the uploaded image.
 */
export const uploadImage = async (file, folderName = 'product', publicId = null) => {

    if (!CLOUD_NAME || !UPLOAD_PRESET) {
        console.error("Cloudinary configuration missing! Check VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in .env");
        throw new Error("Cloudinary configuration missing.");
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    if (folderName) {
        formData.append('folder', folderName);
    }

    if (publicId) {
        formData.append('public_id', publicId);
    }

    try {
        const response = await axios.post(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
            formData
        );
        return response.data.secure_url;
    } catch (error) {
        console.error("Cloudinary upload failed:", error.response?.data || error.message);
        throw error;
    }
};
