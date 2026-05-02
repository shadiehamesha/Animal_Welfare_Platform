import express from 'express';
import { getPublicAlerts, getUserAlerts, createAlert, getAllAlertsAdmin, deleteAlertAdmin } from '../controllers/alert.controller.js';
import { protect, hospitalManager, admin } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/public', getPublicAlerts);

// Personal alerts for logged in users (Vaccines)
router.get('/personal', protect, getUserAlerts);

router.post('/', protect, hospitalManager, createAlert);

// Admin Routes
router.get('/admin/all', protect, admin, getAllAlertsAdmin);
router.delete('/admin/:id', protect, admin, deleteAlertAdmin);

export default router;