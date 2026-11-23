import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from './config/db.js';
import seedInitialDatabase from './data/seedData.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import seatRoutes from './routes/seatRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import superadminRoutes from './routes/superadminRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-session-token', 'x-superadmin-id', 'x-superadmin-password'],
}));

// Body Parser
app.use(express.json());

// API Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    app: 'membiQ SaaS REST API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    freeTierArchitecture: true,
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/seats', seatRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/superadmin', superadminRoutes);

// Root Fallback
app.get('/', (req, res) => {
  res.send('membiQ REST API Server is running. Access endpoints via /api/...');
});

// Start Server
const startServer = async () => {
  try {
    const dbResult = await connectDB();
    if (dbResult.type === 'mongodb') {
      await seedInitialDatabase();
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`===============================================`);
      console.log(`🚀 membiQ API Backend active on port ${PORT}`);
      console.log(`📡 URL: http://localhost:${PORT}/api/health`);
      console.log(`===============================================`);
    });
  } catch (err) {
    console.error('Server startup error:', err);
  }
};

startServer();
