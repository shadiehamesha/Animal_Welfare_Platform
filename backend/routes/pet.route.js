import express from 'express';
import { getInventory, addPet, updatePetStatus, deletePet, bulkImportPets, getPublicPets, getRecommendations, getAllPetsAdmin, updatePetAdmin, deletePetAdmin } from '../controllers/pet.controller.js';
import { protect, shelterManager, admin } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/public', getPublicPets);

// Recommendations
router.get('/recommendations', protect, getRecommendations);

// Shelter specific routes
router.get('/inventory', protect, shelterManager, getInventory);
router.post('/', protect, shelterManager, addPet);
router.put('/:id', protect, shelterManager, updatePetStatus);
router.delete('/:id', protect, shelterManager, deletePet);
router.post('/bulk-import', protect, shelterManager, bulkImportPets);

// Admin Routes
router.get('/admin/all', protect, admin, getAllPetsAdmin);
router.put('/admin/:id', protect, admin, updatePetAdmin);
router.delete('/admin/:id', protect, admin, deletePetAdmin);

export default router;