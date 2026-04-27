import multer from 'multer';
import { generateImageHash } from '../utils/hash.util.js';

// Configure multer to use memory storage
const storage = multer.memoryStorage();

// Basic file filter to ensure only images are uploaded
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload an image.'), false);
    }
};

export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

/**
 * Middleware to intercept the uploaded file, generate the hash, 
 * and simulate cloud upload before passing to the controller.
 */
export const processAndHashImage = async (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Please upload an image of the animal.' });
    }

    try {
        // Generate the perceptual hash from the memory buffer
        const hash = await generateImageHash(req.file.buffer);
        
        // Attach the hash to the request body for the controller
        req.body.imageHash = hash;

        // TODO: In a production environment, you would upload req.file.buffer to AWS S3, 
        // Cloudinary, or Firebase Storage here, and retrieve the public URL.
        // For now, we mock the uploaded URL:
        req.body.imageUrl = `/uploads/mock-url-${Date.now()}.jpg`;

        next();
    } catch (error) {
        res.status(500).json({ message: 'Error processing image upload', error: error.message });
    }
};