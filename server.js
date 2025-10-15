const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

const corsOptions = {
  origin: [
    'http://localhost:3000', // Local development
    'https://learnhub-frontend.vercel.app', // Aap ka Vercel frontend URL
    'https://*.vercel.app' // All Vercel subdomains
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// MongoDB connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err.message));

// Routes
const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/course');
const enrollmentRoutes = require('./routes/enrollment'); // ✅ Only this one

// server.js mein
app.get('/api/users', (req, res) => {
  res.json({ message: 'Users route' });
});

app.post('/api/auth/login', (req, res) => {
  // Login logic
  res.json({ message: 'Login successful', token: 'jwt_token' });
});

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);

app.get('/', (req, res) => res.send('API is running...'));

app.listen(PORT, () => console.log(`🚀 Server started on port ${PORT}`));
