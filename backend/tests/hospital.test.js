import request from 'supertest';
import app from '../server.js';
import { connectDB, closeDB, clearDB } from './setup/db.js';
import { generateTestToken } from './utils/auth.js';
import User from '../models/user.model.js';

beforeAll(async () => await connectDB());
afterEach(async () => await clearDB());
afterAll(async () => await closeDB());

describe('Hospital Routes', () => {
    it('GET /api/hospitals - Should return all hospitals', async () => {
        const res = await request(app).get('/api/hospitals');
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
    });

    it('POST /api/hospitals - Should fail to create without auth', async () => {
        const newHospital = { name: 'Test Vet', location: 'Galle' };
        const res = await request(app).post('/api/hospitals').send(newHospital);
        expect(res.statusCode).toEqual(401);
    });

    it('POST /api/hospitals - Should create a hospital with admin auth', async () => {
        const admin = await User.create({ name: 'Admin', email: 'admin@test.com', passwordHash: 'hash', role: 'system admin' });
        const token = generateTestToken(admin._id, 'system admin');
        
        const newHospital = { 
            name: 'Test Vet', 
            address: '123 Main St',
            city: 'Colombo',
            location: { lat: 6.9271, lng: 79.8612 },
            hours: { open: "08:00", close: "18:00", is24_7: false },
            contact: { phone: "0112345678" }
        };
        
        const res = await request(app)
            .post('/api/hospitals')
            .set('Authorization', `Bearer ${token}`)
            .send(newHospital);
            
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('name', 'Test Vet');
    });
});