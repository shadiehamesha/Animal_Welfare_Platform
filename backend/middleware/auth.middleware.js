import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

// Protect routes - verifies token
export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, JWT_SECRET);

            // Get user from the token
            req.user = await User.findById(decoded.id).select('-passwordHash');

            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// Admin routes - checks role
export const admin = (req, res, next) => {
    if (req.user && req.user.role === 'system admin') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as system admin' });
    }
};

// Hospital Manager routes - checks role
export const hospitalManager = (req, res, next) => {
    if (req.user && (req.user.role === 'hospitals/veterinarians' || req.user.role === 'system admin')) {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as hospital manager' });
    }
};

// Organization/Shelter Manager routes - checks role
export const shelterManager = (req, res, next) => {
    if (req.user && (req.user.role === 'organizations/shelters' || req.user.role === 'system admin')) {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as organization/shelter manager' });
    }
};

// Pharmacy Manager routes - checks role
export const pharmacyManager = (req, res, next) => {
    if (req.user && (req.user.role === 'pharmacies' || req.user.role === 'system admin')) {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as pharmacy manager' });
    }
};