import request from 'supertest';
import app from '../server.js';
import { connectDB, closeDB, clearDB } from './setup/db.js';
import { generateTestToken } from './utils/auth.js';
import User from '../models/user.model.js';

process.env.NODE_ENV = 'test';

beforeAll(async () => await connectDB());
afterEach(async () => await clearDB());
afterAll(async () => await closeDB());

describe('Report & Alert Routes', () => {
    it('GET /api/reports/public - Should fetch public, active reports', async () => {
        const res = await request(app).get('/api/reports/public');
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
    });

    it('GET /api/reports/admin/all - Should fail without admin privileges', async () => {
        const user = await User.create({ name: 'Normal', email: 'normal@test.com', passwordHash: 'hash', role: 'normal user' });
        const userToken = generateTestToken(user._id, 'normal user');
        
        const res = await request(app)
            .get('/api/reports/admin/all')
            .set('Authorization', `Bearer ${userToken}`);
            
        expect(res.statusCode).toEqual(403);
    });

    it('GET /api/reports/admin/all - Should succeed with admin privileges', async () => {
        const admin = await User.create({ name: 'Admin', email: 'admin@test.com', passwordHash: 'hash', role: 'system admin' });
        const adminToken = generateTestToken(admin._id, 'system admin');
        
        const res = await request(app)
            .get('/api/reports/admin/all')
            .set('Authorization', `Bearer ${adminToken}`);
            
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
    });
});