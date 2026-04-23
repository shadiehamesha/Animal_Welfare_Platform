import express from 'express';
import { getHospitals, getHospitalById, createHospital, updateHospital, addHospitalReview, respondToReview, deleteHospitalReview } from '../controllers/hospital.controller.js';
import { protect, hospitalManager } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public Routes
router.get('/', getHospitals);
router.get('/:id', getHospitalById);

// Protected Routes (Normal Users can review)
router.post('/:id/reviews', protect, addHospitalReview);

// Protected Routes (Hospital Managers & Admins only)
router.post('/', protect, hospitalManager, createHospital);
router.put('/:id', protect, hospitalManager, updateHospital);
router.put('/:id/reviews/:reviewId/respond', protect, hospitalManager, respondToReview);
router.delete('/:id/reviews/:reviewId', protect, hospitalManager, deleteHospitalReview);

export default router;