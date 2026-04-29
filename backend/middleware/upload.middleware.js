import multer from 'multer';
import fs from 'fs/promises';
import path from 'path';
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
 * save it to the local filesystem, and pass to the controller.
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

        // Ensure the uploads directory exists
        const uploadsDir = path.join(process.cwd(), 'uploads');
        try {
            await fs.access(uploadsDir);
        } catch {
            await fs.mkdir(uploadsDir, { recursive: true });
        }

        // Generate a unique filename and save to disk
        const ext = path.extname(req.file.originalname) || '.jpg';
        const filename = `stray-${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
        const filepath = path.join(uploadsDir, filename);
        
        await fs.writeFile(filepath, req.file.buffer);

        // Store the real URL path in the payload
        req.body.imageUrl = `/uploads/${filename}`;

        next();
    } catch (error) {
        res.status(500).json({ message: 'Error processing image upload', error: error.message });
    }
};