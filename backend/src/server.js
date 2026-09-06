const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { sequelize, initDatabase } = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const testRoutes = require('./routes/testRoutes');
const questionRoutes = require('./routes/questionRoutes');
const questionBankRoutes = require('./routes/questionBankRoutes');
const courseRoutes = require('./routes/courseRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const gradebookRoutes = require('./routes/gradebookRoutes');
const proctoringRoutes = require('./routes/proctoringRoutes');
const gamificationRoutes = require('./routes/gamificationRoutes');
const communicationRoutes = require('./routes/communicationRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

// Load models and associations
require('./models');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Pariksha / Moodle Assessment Platform API'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/question-bank', questionBankRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/gradebook', gradebookRoutes);
app.use('/api/proctoring', proctoringRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/communication', communicationRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/analytics', analyticsRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found.` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start Server
const startServer = async () => {
  try {
    // 1. Check/create database in MySQL / Postgres
    await initDatabase();

    await sequelize.authenticate();
    console.log(`[Sequelize] ${sequelize.getDialect().toUpperCase()} database connected successfully.`);
    console.log('[Sequelize] Database schema ready.');

    if (process.env.VERCEL !== '1') {
      app.listen(PORT, () => {
        console.log(`[Server] Pariksha Backend running on http://localhost:${PORT}`);
      });
    }
  } catch (error) {
    console.error('[Server] Failed to initialize server:', error);
    if (process.env.VERCEL !== '1') {
      process.exit(1);
    }
  }
};

startServer();

module.exports = app;
