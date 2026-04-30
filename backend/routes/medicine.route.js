import express from 'express';
import { searchMedicines, getInventory, addMedicine, updateMedicine, deleteMedicine } from '../controllers/medicine.controller.js';
import { protect, pharmacyManager } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public
router.get('/search', searchMedicines);

// Inventory Management
router.get('/inventory', protect, pharmacyManager, getInventory);
router.post('/', protect, pharmacyManager, addMedicine);
router.put('/:id', protect, pharmacyManager, updateMedicine);
router.delete('/:id', protect, pharmacyManager, deleteMedicine);

export default router;