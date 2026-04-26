import express from 'express';
import { getInventory, addPet, updatePetStatus, deletePet, bulkImportPets, getPublicPets } from '../controllers/pet.controller.js';
import { protect, shelterManager } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/public', getPublicPets);

// Shelter specific routes
router.get('/inventory', protect, shelterManager, getInventory);
router.post('/', protect, shelterManager, addPet);
router.put('/:id', protect, shelterManager, updatePetStatus);
router.delete('/:id', protect, shelterManager, deletePet);
router.post('/bulk-import', protect, shelterManager, bulkImportPets);

export default router;