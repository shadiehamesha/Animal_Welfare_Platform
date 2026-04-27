import express from 'express';
import { submitReport, getPublicReports, getHeatmapAnalytics } from '../controllers/report.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { upload, processAndHashImage } from '../middleware/upload.middleware.js';

const router = express.Router();

// Public Routes
// Intercept 'image' field -> Store in memory -> Hash -> Pass to submitReport
router.post('/', upload.single('image'), processAndHashImage, submitReport); 
router.get('/public', getPublicReports);

// Protected Analytics Route
router.get('/analytics/heatmap', protect, getHeatmapAnalytics);

export default router;