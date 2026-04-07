import express from 'express';
import rateLimit from 'express-rate-limit';
import { createMessage, getAllMessages, getUserMessages, updateMessageStatus, deleteMessage } from '../controllers/contact.controller.js';
import { protect, admin } from '../middleware/auth.middleware.js';

const router = express.Router();

// Rate limiter: Max 2 messages per minute per IP
const messageRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 2, 
    message: { message: 'You can only send 2 messages per minute. Please wait a moment.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Protected routes
router.post('/', protect, messageRateLimiter, createMessage);
router.get('/my-messages', protect, getUserMessages);

// Admin only routes
router.get('/', protect, admin, getAllMessages);
router.put('/:id', protect, admin, updateMessageStatus);
router.delete('/:id', protect, admin, deleteMessage);

export default router;