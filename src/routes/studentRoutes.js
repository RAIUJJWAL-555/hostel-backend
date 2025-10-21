import express from 'express';
import { registerStudent, loginStudent, getStudentProfile, submitComplaint } from '../controllers/studentController.js';

const router = express.Router();

// Public routes
router.post('/register', registerStudent);
router.post('/login', loginStudent);

// Student Dashboard/Profile routes
router.get('/profile/:studentId', getStudentProfile);
router.post('/complaints', submitComplaint);

export default router;