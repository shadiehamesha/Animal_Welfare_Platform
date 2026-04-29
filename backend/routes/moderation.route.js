import express from 'express';
import { getPendingContent, reviewPost, reviewComment, deletePost, deleteComment } from '../controllers/moderation.controller.js';
import { protect, admin } from '../middleware/auth.middleware.js';

const router = express.Router();

// All moderation routes require admin access
router.use(protect, admin);
router.get('/pending', getPendingContent);

// Status Updates
router.put('/posts/:id', reviewPost);
router.put('/comments/:id', reviewComment);

router.delete('/posts/:id', deletePost);
router.delete('/comments/:id', deleteComment);

export default router;