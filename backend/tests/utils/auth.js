import jwt from 'jsonwebtoken';

// Generate a mock token for testing protected routes
export const generateTestToken = (userId, role) => {
    const secret = 'fallback_secret_key';
    
    return jwt.sign(
        { id: userId, role: role },
        secret,
        { expiresIn: '1h' }
    );
};