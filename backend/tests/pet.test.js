import request from 'supertest';
import app from '../server.js';
import { connectDB, closeDB, clearDB } from './setup/db.js';
import { generateTestToken } from './utils/auth.js';
import User from '../models/user.model.js';

process.env.NODE_ENV = 'test';

beforeAll(async () => await connectDB());
afterEach(async () => await clearDB());
afterAll(async () => await closeDB());

describe('Pet Routes', () => {
    it('GET /api/pets/public - Should return public adoption listings', async () => {
        const res = await request(app).get('/api/pets/public');
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
    });

    it('POST /api/pets/user - Should allow a normal user to list a pet', async () => {
        const user = await User.create({ name: 'Normal', email: 'normal@test.com', passwordHash: 'hash', role: 'normal user' });
        const userToken = generateTestToken(user._id, 'normal user');
        
        const newPet = {
            name: 'Buddy',
            species: 'Dog',
            size: 'Medium',
            description: 'Friendly test dog'
        };

        const res = await request(app)
            .post('/api/pets/user')
            .set('Authorization', `Bearer ${userToken}`)
            .send(newPet);

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('name', 'Buddy');
        expect(res.body).toHaveProperty('owner', user._id.toString());
    });
});