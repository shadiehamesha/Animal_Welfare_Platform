import express from 'express';
import {
    registerUser,
    loginUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
} from '../controllers/user.controller.js';
import { protect, admin } from '../middleware/auth.middleware.js';

const router = express.Router();

// Authentication (Public)
router.post('/register', registerUser);
router.post('/login', loginUser);

// User Management CRUD
// Protected + Admin: Only system admins can view all users
router.get('/', protect, admin, getAllUsers);

// Protected: Users must be logged in to access/edit profiles
router.get('/:id', protect, getUserById);
router.put('/:id', protect, updateUser);

// Protected + Admin: Only system admins can delete users
router.delete('/:id', protect, admin, deleteUser);

export default router;