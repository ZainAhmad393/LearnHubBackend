const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // User model import karen

// Middleware to protect routes
const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header (format: 'Bearer <token>')
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from token ID and attach to request object (excluding password)
            req.user = await User.findById(decoded.id).select('-password');

            next();
        } catch (error) {
            console.error('Token verification failed:', error);
            // Token verification fail hone par, unauthorized response bhej den
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        // If token is missing from the header
        return res.status(401).json({ message: 'Not authorized, no token' }); // --- FIX: Added return ---
    }
};


// JWT token generate karne ka function
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d', // Token 30 din tak valid rahega
    });
};

// @route   POST /api/auth/signup
// @desc    Register new user & return token
router.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        user = await User.create({
            name,
            email,
            password,
        });

        // Registration successful, token generate karen aur wapas bhej den
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});


// @route   POST /api/auth/login
// @desc    Authenticate user & return token
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            // Password match ho gaya, token bhej den
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});


// @route   GET /api/auth/user (Protected Route)
// @desc    Get user data using token (Profile fetch karne ke liye)
router.get('/user', protect, (req, res) => {
    // req.user is set by the 'protect' middleware
    res.json({
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
    });
});
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(200).json({ message: "If this email exists, a reset link has been sent." });
        }

        console.log(`Password reset requested for: ${email}`);
        return res.status(200).json({ message: "Password reset link sent to your email!" });
    } catch (error) {
        console.error("Forgot password error:", error.message);
        return res.status(500).json({ message: "Server error" });
    }
};

router.post('/forgotpassword', forgotPassword);

module.exports = router;