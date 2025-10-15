const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User"); // User model import karen
const sendEmail = require("../utils/sendEmail"); // ✅ sendEmail utility import karen
const crypto = require("crypto"); // Built-in Node.js module for generating tokens

// Middleware to protect routes
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header (format: 'Bearer <token>')
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token ID and attach to request object (excluding password)
      req.user = await User.findById(decoded.id).select("-password");

      next();
    } catch (error) {
      console.error("Token verification failed:", error);
      // Token verification fail hone par, unauthorized response bhej den
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    // If token is missing from the header
    return res.status(401).json({ message: "Not authorized, no token" }); // --- FIX: Added return ---
  }
};

// JWT token generate karne ka function
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d", // Token 30 din tak valid rahega
  });
};

// @route   POST /api/auth/signup
// @desc    Register new user & return token
router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ message: "User already exists" });
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
    res.status(500).send("Server Error");
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & return token
router.post("/login", async (req, res) => {
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
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET /api/auth/user (Protected Route)
// @desc    Get user data using token (Profile fetch karne ke liye)
router.get("/user", protect, (req, res) => {
  // req.user is set by the 'protect' middleware
  res.json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
  });
});
router.post("/forgotpassword", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      // Security: Always send a generic message to prevent email enumeration
      return res.status(200).json({
        message:
          "If an account with that email exists, a password reset link has been sent.",
      });
    }

    // 1. Reset Token Create Karen
    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // Token 10 minutes tak valid rahega

    await user.save(); // User ko update karen

    // 2. Reset Link Banayen
    // Make sure yeh URL aapke frontend ke reset password page ka ho
    const resetUrl = `${process.env.CLIENT_URL}/resetpassword/${resetToken}`;

    const message = `
            <h1>You have requested a password reset</h1>
            <p>Please go to this link to reset your password:</p>
            <a href="${resetUrl}" clicktracking=off>${resetUrl}</a>
            <p>This link will expire in 10 minutes.</p>
        `;

    // 3. Email Bhejen
    try {
      await sendEmail({
        email: user.email,
        subject: "LearnHub: Password Reset Request",
        message: message,
      });

      console.log(`Password reset email sent to: ${user.email}`);
      return res
        .status(200)
        .json({ message: "Password reset link sent to your email!" });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save(); // Agar email nahi ja paaye, to token clear kar den.

      console.error("Error sending password reset email:", error);
      return res
        .status(500)
        .json({ message: "Email could not be sent. Please try again later." });
    }
  } catch (error) {
    console.error("Forgot password API error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
});

// @route   PUT /api/auth/resetpassword/:resetToken
// @desc    Reset user's password using the token
router.put('/resetpassword/:resetToken', async (req, res) => {
    const { resetToken } = req.params;
    const { password } = req.body;

    // Hash the token received from URL for comparison
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    try {
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() } // Token abhi expire na hua ho
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token.' });
        }

        // Set new password
        user.password = password; // User model ke pre-save hook se yeh hash ho jayega
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(200).json({ message: 'Password has been reset successfully!' });

    } catch (error) {
        console.error("Reset password API error:", error.message);
        res.status(500).json({ message: "Server error during password reset." });
    }
});

module.exports = router;
