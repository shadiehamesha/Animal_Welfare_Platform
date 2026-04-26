import express from 'express';
import { createEvent, getShelterEvents, getPublicEvents, updateEvent, deleteEvent } from '../controllers/event.controller.js';
import { protect, shelterManager } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/public', getPublicEvents);

// Shelter Manager Routes
router.post('/', protect, shelterManager, createEvent);
router.get('/my-events', protect, shelterManager, getShelterEvents);
router.put('/:id', protect, shelterManager, updateEvent);
router.delete('/:id', protect, shelterManager, deleteEvent);

export default router;