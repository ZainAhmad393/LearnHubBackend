import nodemailer from "nodemailer";
import User from "../models/User.js";

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // 1. Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({ message: "If this email exists, a reset link has been sent." });
    }

    // 2. Generate a fake reset token (later you'll make it secure)
    const resetToken = Math.random().toString(36).substring(2);
    const resetLink = `http://localhost:5173/reset-password/${resetToken}`;

    // 3. Setup Nodemailer transporter (Gmail SMTP)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "testingwebdev01@gmail.com", // 🔹 apna Gmail yahan likho
        pass: "esdudfbdsvoqtlnc", // 🔹 App Password (NOT normal password)
      },
    });

    // 4. Send email
    await transporter.sendMail({
      from: '"Learnhub Support" <testingwebdev01@gmail.com>',
      to: email,
      subject: "Password Reset Request",
      html: `
        <h3>Password Reset Requested</h3>
        <p>Hi ${user.name},</p>
        <p>You requested to reset your password. Click below to continue:</p>
        <a href="${resetLink}" target="_blank">Reset Password</a>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    });

    console.log("✅ Email sent to:", email);
    return res.status(200).json({ message: "Password reset email sent successfully!" });
  } catch (error) {
    console.error("❌ Forgot password error:", error.message);
    return res.status(500).json({ message: "Server error sending email" });
  }
};
