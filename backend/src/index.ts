// Load environment variables FIRST - before any other imports
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import connectDB from './config/database';
import { configurePassport } from './config/passport';
import authRoutes from './routes/authRoutes';
import courseRoutes from './routes/courseRoutes';
import videoRoutes from './routes/videoRoutes';
import progressRoutes from './routes/progressRoutes';
import analyticsRoutes from './routes/analyticsRoutes';

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for large payloads
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize Passport (after env variables are loaded)
const passport = configurePassport();
app.use(passport.initialize());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api', videoRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 IntelliSense Backend Server running on port ${PORT}`);
});
