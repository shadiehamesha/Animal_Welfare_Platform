import request from 'supertest';
import app from '../server.js';
import { connectDB, closeDB, clearDB } from './setup/db.js';

beforeAll(async () => await connectDB());
afterEach(async () => await clearDB());
afterAll(async () => await closeDB());

describe('Organization Routes', () => {
    it('GET /api/organizations - Should return 200 and an array', async () => {
        const res = await request(app).get('/api/organizations/public');
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
    });
});