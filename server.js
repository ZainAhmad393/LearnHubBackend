const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ CORS Setup
const corsOptions = {
  origin: "*",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// MongoDB connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.log('⚠️ MongoDB connection failed but server running');
    console.error('MongoDB Error:', err.message);
  });

// Routes
const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/course');
const enrollmentRoutes = require('./routes/enrollment');

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);

// ✅ TEST ROUTES
app.get('/', (req, res) => {
  res.json({ 
    message: 'LearnHub Backend API is running! 🚀',
    status: 'Active',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API test endpoint is working! ✅',
    server: 'LearnHub Backend',
    version: '1.0',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server started on port ${PORT}`);
  console.log(`📍 URL: https://learnhubbackend-5wnv.onrender.com`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
});