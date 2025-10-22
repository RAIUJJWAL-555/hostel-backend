// import nodemailer from 'nodemailer'; 
// import crypto from 'crypto'; 

// // --- Constants ---
// export const ADMIN_ACCESS_KEY = 'GPG1101@gmail.com'; 

// // --- ⚙️ Nodemailer Configuration ---
// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: process.env.EMAIL_USER || 'ur069119@gmail.com', // Replace with your actual email
//         pass: process.env.EMAIL_PASS || 'kaosnlfkhrxoxqci'   // Replace with your actual App Password
//     }
// });

// /**
//  * Helper function to send the OTP via email
//  */
// export const sendOTP = async (email, otp, purpose) => {
//     const subject = purpose === 'LOGIN' 
//         ? 'Admin Login Verification OTP' 
//         : 'Admin Registration Verification OTP';
        
//     const title = purpose === 'LOGIN' 
//         ? 'OTP Verification for Admin Login' 
//         : 'OTP Verification for Admin Registration';

//     const mailOptions = {
//         from: 'Admin System <ur069119@gmail.com>', 
//         to: email,
//         subject: subject,
//         html: `
//             <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
//                 <h2 style="color: #333;">${title}</h2>
//                 <p>Please use the following One-Time Password (OTP) to complete your action:</p>
//                 <p style="font-size: 24px; font-weight: bold; color: #007bff; background-color: #f4f4f4; padding: 10px; border-radius: 4px; text-align: center;">${otp}</p>
//                 <p>This OTP is valid for 10 minutes.</p>
//                 <p style="margin-top: 30px; font-size: 12px; color: #777;">Regards, <br>The System Administrator</p>
//             </div>
//         `
//     };

//     try {
//         await transporter.sendMail(mailOptions);
//         console.log(`${purpose} OTP sent successfully to ${email}`);
//     } catch (error) {
//         console.error(`Error sending email to ${email}:`, error);
//         throw new Error('Failed to send verification email.');
//     }
// };
// config/mailer.js

import sgMail from '@sendgrid/mail';

// --- Constants from Environment Variables ---
// अब यह सीधे कोड में नहीं है, बल्कि .env या Railway Variables से आएगा
export const ADMIN_ACCESS_KEY = process.env.ADMIN_ACCESS_KEY; 

// --- ⚙️ SendGrid Configuration ---
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// यह भी अब Environment Variable से आएगा। यह आपका SendGrid वेरिफाइड ईमेल होना चाहिए।
const EMAIL_FROM = process.env.EMAIL_FROM;

/**
 * Helper function to send the OTP via email
 */
export const sendOTP = async (email, otp, purpose) => {
    if (!EMAIL_FROM) {
        console.error('EMAIL_FROM is not set in environment variables. Please verify your sender identity in SendGrid and set it.');
        throw new Error('Server email configuration is incomplete.');
    }

    const subject = purpose === 'LOGIN' 
        ? 'Admin Login Verification OTP' 
        : 'Admin Registration Verification OTP';
        
    const title = purpose === 'LOGIN' 
        ? 'OTP Verification for Admin Login' 
        : 'OTP Verification for Admin Registration';

    const msg = {
        to: email,
        from: EMAIL_FROM, // अब यह आपके .env फ़ाइल से आएगा
        subject,
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                <h2 style="color: #333;">${title}</h2>
                <p>Please use the following One-Time Password (OTP) to complete your action:</p>
                <p style="font-size: 24px; font-weight: bold; color: #007bff; background-color: #f4f4f4; padding: 10px; border-radius: 4px; text-align: center;">${otp}</p>
                <p>This OTP is valid for 10 minutes.</p>
                <p style="margin-top: 30px; font-size: 12px; color: #777;">Regards, <br>The System Administrator</p>
            </div>
        `
    };

    try {
        await sgMail.send(msg);
        console.log(`${purpose} OTP sent successfully to ${email}`);
    } catch (error) {
        console.error(`Error sending email to ${email}:`, error);
        // SendGrid से मिले एरर को और बेहतर तरीके से दिखाते हैं
        if (error.response) {
            console.error(error.response.body);
        }
        throw new Error('Failed to send verification email via SendGrid.');
    }
};