import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';

import userRoutes from './routes/user.route.js';
import contactRoutes from './routes/contact.route.js';
import hospitalRoutes from './routes/hospital.route.js';
import organizationRoutes from './routes/organization.route.js';
import petRoutes from './routes/pet.route.js';
import eventRoutes from './routes/event.route.js';
import taskRoutes from './routes/task.route.js';
import reportRoutes from './routes/report.route.js';
import communityRoutes from './routes/community.route.js';
import moderationRoutes from './routes/moderation.route.js';
import pharmacyRoutes from './routes/pharmacy.route.js';
import medicineRoutes from './routes/medicine.route.js';
import alertRoutes from './routes/alert.route.js';
import { startCronJobs } from './utils/cron.util.js';
import searchRoutes from './routes/search.route.js';

dotenv.config();
connectDB();

// Initialize automated jobs
startCronJobs();

const app = express();
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/moderation', moderationRoutes);
app.use('/api/pharmacies', pharmacyRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/search', searchRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'meoWoof Platform API' });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// 404 Error handling
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});