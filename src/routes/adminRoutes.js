import express from 'express';
import { 
    registerAdmin, verifyAdminRegistration, 
    loginAdmin, sendLoginOTP, verifyOTPLogin 
} from '../controllers/adminController.js';

const router = express.Router();

// Registration
router.post('/register', registerAdmin);
router.post('/register/verify-otp', verifyAdminRegistration);

// Login (Password and OTP based)
router.post('/login', loginAdmin);
router.post('/login/send-otp', sendLoginOTP);
router.post('/login/verify-otp-login', verifyOTPLogin);

export default router;