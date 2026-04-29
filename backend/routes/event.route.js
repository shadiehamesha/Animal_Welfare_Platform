import express from 'express';
import { createEvent, getShelterEvents, getPublicEvents, updateEvent, deleteEvent, attendEvent, getAllEventsAdmin } from '../controllers/event.controller.js';
import { protect, shelterManager, admin } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public Routes
router.get('/public', getPublicEvents);

// User Action Routes
router.post('/:id/attend', protect, attendEvent);

// Shelter Manager Routes
router.post('/', protect, shelterManager, createEvent);
router.get('/my-events', protect, shelterManager, getShelterEvents);
router.put('/:id', protect, shelterManager, updateEvent);
router.delete('/:id', protect, shelterManager, deleteEvent);

// Admin Routes
router.get('/admin/all', protect, admin, getAllEventsAdmin);
router.delete('/admin/:id', protect, admin, deleteEvent);

export default router;