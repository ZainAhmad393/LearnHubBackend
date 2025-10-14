const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors({
    origin:'http://localhost:5173',
    methods: ['GET','POST','PUT','DELETE'],
    credentials:true
}));

const connectMongoDb = async()=>{
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected successfully!');
    } catch (err) {
        console.error('MongoDB connection Failed',err.message);
        process.exit(1);
    }
}
connectMongoDb();
// Routes
// 1. Auth routes ko import karen
const authRoutes = require('./routes/auth'); 
app.use('/api/auth', authRoutes); // All auth routes will start with /api/auth

// Simple test route
app.get('/', (req, res) => res.send('API is running...'));

app.listen(PORT, ()=>console.log(`Server started on port ${PORT}`));