import multer from 'multer';
import streamifier from 'streamifier';
import cloudinary from '../config/cloudinary.js';
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
 * upload it to Cloudinary via stream, and pass the URL to the controller.
 */
export const processAndHashImage = async (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Please upload an image of the animal.' });
    }

    try {
        // Generate the perceptual hash from the memory buffer for deduplication
        const hash = await generateImageHash(req.file.buffer);
        
        // Attach the hash to the request body for the controller
        req.body.imageHash = hash;

        // Create a promise to handle the stream upload to Cloudinary
        const streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: 'meowoof_uploads' },
                    (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    }
                );
                // Convert the memory buffer into a readable stream
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };

        // Execute the upload
        const result = await streamUpload(req);

        // Store the secure Cloudinary URL in the payload.
        req.body.imageUrl = result.secure_url;

        next();
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        res.status(500).json({ message: 'Error processing image upload', error: error.message });
    }
};