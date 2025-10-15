// backend/utils/sendEmail.js

const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // 1. Transporter banayen
    const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE, // Example: 'gmail', 'outlook', 'hotmail'
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        // Agar Gmail use kar rahe hain aur masla aa raha hai, to yeh options add kar sakte hain:
        // host: 'smtp.gmail.com', // agar service: 'gmail' kaam na kare
        // port: 465, // ya 587
        // secure: true, // ya false for 587
    });

    // 2. Email options define karen
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: options.email,
        subject: options.subject,
        html: options.message,
    };

    // 3. Email send karen
    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${options.email}`);
    } catch (error) {
        console.error(`Error sending email to ${options.email}:`, error);
        throw new Error("Email could not be sent. Please try again later.");
    }
};

module.exports = sendEmail;