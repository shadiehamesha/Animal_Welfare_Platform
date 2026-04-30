import express from 'express';
import { getPharmacies, getPharmacyById, createPharmacy, updatePharmacy, addPharmacyReview, respondToReview, removeReviewReply, deletePharmacyReviewAdmin, deletePharmacyAdmin } from '../controllers/pharmacy.controller.js';
import { protect, pharmacyManager, admin } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public 
router.get('/', getPharmacies);
router.get('/:id', getPharmacyById);
router.post('/:id/reviews', protect, addPharmacyReview);

// Pharmacy Manager
router.post('/', protect, pharmacyManager, createPharmacy);
router.put('/:id', protect, pharmacyManager, updatePharmacy);
router.put('/:id/reviews/:reviewId/respond', protect, pharmacyManager, respondToReview);
router.put('/:id/reviews/:reviewId/remove-reply', protect, pharmacyManager, removeReviewReply);

// Admin ONLY
router.delete('/:id/reviews/:reviewId', protect, admin, deletePharmacyReviewAdmin);
router.delete('/:id', protect, admin, deletePharmacyAdmin);

export default router;