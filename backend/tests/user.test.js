import request from 'supertest';
import app from '../server.js';
import { connectDB, closeDB, clearDB } from './setup/db.js';
import { generateTestToken } from './utils/auth.js';
import User from '../models/user.model.js';

process.env.NODE_ENV = 'test';

beforeAll(async () => await connectDB());
afterEach(async () => await clearDB());
afterAll(async () => await closeDB());

describe('User Authentication & Admin Routes', () => {
    
    const mockUser = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'normal user'
    };

    it('POST /api/users/register - Should register a new user', async () => {
        const res = await request(app).post('/api/users/register').send(mockUser);
        expect(res.statusCode).toEqual(201);
        expect(res.body.message).toBe('User registered successfully');
    });

    it('POST /api/users/login - Should login and return a JWT token', async () => {
        await request(app).post('/api/users/register').send(mockUser);
        const res = await request(app).post('/api/users/login').send({
            email: mockUser.email,
            password: mockUser.password
        });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
        expect(res.body).toHaveProperty('role', 'normal user');
    });

    it('GET /api/users - Should block normal users from viewing all users', async () => {
        const user = await User.create({ name: 'Normal', email: 'normal@test.com', passwordHash: 'hash', role: 'normal user' });
        const token = generateTestToken(user._id, 'normal user');
        
        const res = await request(app)
            .get('/api/users')
            .set('Authorization', `Bearer ${token}`);
            
        expect(res.statusCode).toEqual(403); 
    });

    it('GET /api/users - Should allow system admins to view all users', async () => {
        const admin = await User.create({ name: 'Admin', email: 'admin@test.com', passwordHash: 'hash', role: 'system admin' });
        const adminToken = generateTestToken(admin._id, 'system admin');
        
        const res = await request(app)
            .get('/api/users')
            .set('Authorization', `Bearer ${adminToken}`);
            
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
    });
});