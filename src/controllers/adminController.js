import Admin from '../models/Admin.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto'; 
import { sendOTP, ADMIN_ACCESS_KEY } from '../config/mailer.js';

// --- Admin Registration (Step 1: Save unverified user & Send OTP) ---
export const registerAdmin = async (req, res) => {
    try {
        const { adminId, name, email, role, password } = req.body;
        if (adminId !== ADMIN_ACCESS_KEY) {
            return res.status(403).json({ message: 'Unauthorized. Invalid Admin Access Key.' });
        }
        let admin = await Admin.findOne({ email });
        if (admin && admin.isVerified) {
             return res.status(400).json({ message: 'Email already registered and verified!' });
        }

        const otpCode = crypto.randomInt(100000, 999999).toString(); 
        const otpExpires = new Date(Date.now() + 10 * 60000); 
        const hashedPassword = await bcrypt.hash(password, 10);

        if (admin) {
            admin.name = name;
            admin.role = role;
            admin.password = hashedPassword;
            admin.otp = otpCode;
            admin.otpExpires = otpExpires;
            admin.isVerified = false; 
            await admin.save();
        } else {
            admin = new Admin({
                name, email, role, password: hashedPassword, isVerified: false, otp: otpCode, otpExpires: otpExpires,
            });
            await admin.save();
        }
        
        await sendOTP(email, otpCode, 'REGISTER');

        res.status(202).json({ 
            message: 'Registration data saved, OTP sent for verification.',
            email: email
        });

    } catch (err) {
        console.error('Admin registration error:', err);
        res.status(500).json({ 
            message: err.message || 'Error saving Admin or sending OTP', 
            error: err.message 
        });
    }
};

// --- Admin Registration OTP Verification (Step 2) ---
export const verifyAdminRegistration = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const admin = await Admin.findOne({ email });

        if (!admin || admin.isVerified || admin.otp !== otp || admin.otpExpires < new Date()) {
            return res.status(400).json({ message: 'Invalid or expired OTP. Please try again.' });
        }

        admin.isVerified = true;
        admin.otp = undefined;
        admin.otpExpires = undefined;
        await admin.save();

        res.status(200).json({ message: 'Admin account successfully verified and activated!' });

    } catch (err) {
        console.error('OTP verification error:', err);
        res.status(500).json({ message: 'Error verifying OTP', error: err.message });
    }
};

// --- Send OTP for Login ---
export const sendLoginOTP = async (req, res) => {
    try {
        const { email } = req.body;
        const admin = await Admin.findOne({ email });
        if (!admin || !admin.isVerified) {
            return res.status(400).json({ message: 'Invalid email or unverified account.' });
        }

        const otpCode = crypto.randomInt(100000, 999999).toString(); 
        const otpExpires = new Date(Date.now() + 5 * 60000); 

        admin.otp = otpCode;
        admin.otpExpires = otpExpires;
        await admin.save();

        await sendOTP(email, otpCode, 'LOGIN');
        res.status(200).json({ message: 'Login OTP sent successfully.' });

    } catch (err) {
        console.error('Send Login OTP error:', err);
        res.status(500).json({ message: 'Failed to send login OTP.', error: err.message });
    }
};

// --- Verify OTP and complete Login ---
export const verifyOTPLogin = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const admin = await Admin.findOne({ email });

        if (!admin || !admin.isVerified) {
            return res.status(400).json({ message: 'Invalid email or unverified account.' });
        }

        if (admin.otp !== otp || !admin.otp || admin.otpExpires < new Date()) {
            if (admin.otpExpires < new Date()) {
                 admin.otp = undefined;
                 admin.otpExpires = undefined;
                 await admin.save();
            }
            return res.status(400).json({ message: 'Invalid or expired OTP.' });
        }

        admin.otp = undefined;
        admin.otpExpires = undefined;
        await admin.save();

        const { password, otp: otpData, otpExpires: expiryData, ...adminData } = admin.toObject(); 
        res.status(200).json({ message: 'Login successful!', admin: adminData });

    } catch (err) {
        console.error('Verify Login OTP error:', err);
        res.status(500).json({ message: 'OTP login failed', error: err.message });
    }
};

// --- Admin Password Login ---
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    
    if (!admin.isVerified) {
        return res.status(403).json({ message: 'Account not verified. Please check your email for the OTP.' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password!' });
    }

    admin.otp = undefined;
    admin.otpExpires = undefined;
    await admin.save();

    const { password: pwd, otp, otpExpires, ...adminData } = admin.toObject(); 
    res.status(200).json({ message: 'Login successful!', admin: adminData });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};