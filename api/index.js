import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from '../server/config/db.js';
import seedInitialDatabase from '../server/data/seedData.js';

// Route Imports from server directory
import authRoutes from '../server/routes/authRoutes.js';
import seatRoutes from '../server/routes/seatRoutes.js';
import studentRoutes from '../server/routes/studentRoutes.js';
import paymentRoutes from '../server/routes/paymentRoutes.js';
import superadminRoutes from '../server/routes/superadminRoutes.js';

dotenv.config();

// Attempt connection on startup
connectDB()
  .then(() => seedInitialDatabase())
  .catch((err) => console.error('DB init notice:', err.message));

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-session-token', 'x-superadmin-id', 'x-superadmin-password'],
}));

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    app: 'membiQ SaaS REST API',
    platform: 'Vercel Serverless',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/seats', seatRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/superadmin', superadminRoutes);

export default app;
