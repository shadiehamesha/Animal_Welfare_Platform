import sharp from 'sharp';
import imghash from 'imghash';

/**
 * Optimizes an image buffer and generates a perceptual hash.
 * @param {Buffer} imageBuffer - The raw uploaded image buffer.
 * @returns {Promise<string>} - The generated binary or hex hash.
 */
export const generateImageHash = async (imageBuffer) => {
    try {
        // 1. Optimize the image: resize to a small square and convert to grayscale.
        // We ignore the aspect ratio to ensure the hash represents the core structure uniformly.
        const optimizedBuffer = await sharp(imageBuffer)
            .resize(256, 256, { fit: 'fill' })
            .grayscale()
            .toBuffer();

        // 2. Generate the perceptual hash from the optimized buffer.
        // A 16-bit hash provides a good balance between accuracy and collision detection.
        const hash = await imghash.hash(optimizedBuffer, 16);
        
        return hash;
    } catch (error) {
        console.error('Error generating image hash:', error);
        throw new Error('Failed to process image for deduplication.');
    }
};