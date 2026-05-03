import express from 'express';
import { createVolunteerTask, getTasks, updateTask, deleteTask, approveVolunteerTask, getPublicTasks, getUserTasks } from '../controllers/task.controller.js';
import { protect, shelterManager } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/public', getPublicTasks);

router.get('/my-volunteer-tasks', protect, getUserTasks);

// Shelter Manager Routes
router.post('/', protect, shelterManager, createVolunteerTask);
router.get('/my-tasks', protect, shelterManager, getTasks);
router.put('/:id', protect, shelterManager, updateTask);
router.delete('/:id', protect, shelterManager, deleteTask);
router.put('/:id/approve', protect, shelterManager, approveVolunteerTask);

export default router;