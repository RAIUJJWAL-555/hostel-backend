import express from 'express';
import { 
    getAllApplications, updateApplicationStatus, allotRoom,
    addRoom, getAllRooms, updateRoom, deleteRoom,
    getFeeData, updateFeeDetails,
    updateStudent, deleteStudent,
    getAllComplaints, updateComplaintStatus
} from '../controllers/hostelController.js';

const router = express.Router();

// --- Application Management ---
router.get('/applications', getAllApplications);
router.get('/applications-student', getAllApplications); // Duplicate route as per your original file
router.patch('/applications/:applicationNumber', updateApplicationStatus);
router.patch('/applications/:applicationNumber/allot-room', allotRoom);
router.patch('/students/:id', updateStudent);
router.delete('/students/:id', deleteStudent);

// --- Room Inventory ---
router.post('/rooms', addRoom);
router.get('/rooms', getAllRooms);
router.patch('/rooms/:id', updateRoom);
router.delete('/rooms/:id', deleteRoom);

// --- Fee Management ---
router.get('/fees', getFeeData);
router.patch('/fees/:applicationNumber', updateFeeDetails);

// --- Complaint Management ---
router.get('/complaints', getAllComplaints);
router.patch('/complaints/:id/status', updateComplaintStatus);


export default router;