import cloudinary from '../config/cloudinary.js';

/**
 * Extracts the public ID from a secure Cloudinary URL
 * Example: https://res.cloudinary.com/.../meowoof_uploads/sample.jpg -> meowoof_uploads/sample
 */
export const getPublicIdFromUrl = (url) => {
    if (!url) return null;
    try {
        const parts = url.split('/');
        const fileWithExt = parts.pop(); // "sample.jpg"
        const folder = parts.pop();      // "meowoof_uploads"
        const filename = fileWithExt.split('.')[0]; // "sample"
        
        return `${folder}/${filename}`;
    } catch (error) {
        console.error('Error extracting public ID:', error);
        return null;
    }
};

/**
 * Deletes an image from Cloudinary using its URL
 */
export const deleteImageFromCloudinary = async (url) => {
    const publicId = getPublicIdFromUrl(url);
    if (publicId) {
        try {
            await cloudinary.uploader.destroy(publicId);
        } catch (error) {
            console.error(`Failed to delete image from Cloudinary (${publicId}):`, error);
        }
    }
};