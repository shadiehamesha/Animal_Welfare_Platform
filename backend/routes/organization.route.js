import express from 'express';
import { getMyShelter, createOrUpdateShelter, getShelterAnalytics, getAllOrganizations, verifyOrganization, deleteOrganization, getPublicOrganizations } from '../controllers/organization.controller.js';
import { protect, shelterManager, admin } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/public', getPublicOrganizations);

// Shelter Manager Routes
router.get('/profile', protect, shelterManager, getMyShelter);
router.post('/profile', protect, shelterManager, createOrUpdateShelter);
router.get('/analytics', protect, shelterManager, getShelterAnalytics);

// Admin Routes
router.get('/', protect, admin, getAllOrganizations);
router.put('/:id/verify', protect, admin, verifyOrganization);
router.delete('/:id', protect, admin, deleteOrganization);

export default router;