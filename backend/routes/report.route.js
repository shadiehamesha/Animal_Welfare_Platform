import express from 'express';
import { submitReport, getPublicReports, getHeatmapAnalytics, claimReport, getAllReportsAdmin, deleteReportAdmin, reviewClaim, getUserReports } from '../controllers/report.controller.js';
import { protect, admin } from '../middleware/auth.middleware.js';
import { upload, processAndHashImage } from '../middleware/upload.middleware.js';

const router = express.Router();

// Public Routes
router.post('/', upload.single('image'), processAndHashImage, submitReport); 
router.get('/public', getPublicReports);

// User Routes
router.post('/:id/claim', protect, upload.single('image'), processAndHashImage, claimReport);
router.get('/my-reports', protect, getUserReports);

// Protected Analytics Route
router.get('/analytics/heatmap', protect, getHeatmapAnalytics);

// Admin Management Routes
router.get('/admin/all', protect, admin, getAllReportsAdmin);
router.delete('/admin/:id', protect, admin, deleteReportAdmin);
router.put('/admin/:id/claim', protect, admin, reviewClaim);

export default router;