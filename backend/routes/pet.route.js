import express from 'express';
import { getInventory, addPet, updatePetStatus, deletePet, bulkImportPets, getPublicPets, getRecommendations, getAllPetsAdmin, updatePetAdmin, deletePetAdmin, getUserPets, addUserPet, updateUserPet, deleteUserPet } from '../controllers/pet.controller.js';
import { protect, shelterManager, admin } from '../middleware/auth.middleware.js';
import { upload, processAndHashImage } from '../middleware/upload.middleware.js';

const router = express.Router();

const processImageIfPresent = (req, res, next) => {
    if (!req.file) return next();
    return processAndHashImage(req, res, next);
};

router.get('/public', getPublicPets);

// Recommendations
router.get('/recommendations', protect, getRecommendations);

// User specific routes
router.get('/user', protect, getUserPets);
router.post('/user', protect, upload.single('photo'), processImageIfPresent, addUserPet);
router.put('/user/:id', protect, upload.single('photo'), processImageIfPresent, updateUserPet);
router.delete('/user/:id', protect, deleteUserPet);

// Shelter specific routes
router.get('/inventory', protect, shelterManager, getInventory);
router.post('/', protect, shelterManager, upload.single('photo'), processImageIfPresent, addPet);
router.put('/:id', protect, shelterManager, upload.single('photo'), processImageIfPresent, updatePetStatus);
router.delete('/:id', protect, shelterManager, deletePet);
router.post('/bulk-import', protect, shelterManager, bulkImportPets);

// Admin Routes
router.get('/admin/all', protect, admin, getAllPetsAdmin);
router.put('/admin/:id', protect, admin, upload.single('photo'), processImageIfPresent, updatePetAdmin);
router.delete('/admin/:id', protect, admin, deletePetAdmin);

export default router;