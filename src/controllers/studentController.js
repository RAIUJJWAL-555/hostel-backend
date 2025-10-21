import Student from '../models/Student.js';
import Complaint from '../models/Complaint.js';
import bcrypt from 'bcryptjs';

// --- Student Registration ---
export const registerStudent = async (req, res) => {
  try {
    const { name, applicationNumber, email, dob, year, branch, distance, rank, counselingRound, password } = req.body;
    const existing = await Student.findOne({ applicationNumber });
    if (existing) {
      return res.status(400).json({ message: 'Application number already exists!' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newStudent = new Student({
      name, applicationNumber, email, dob, year, branch, distance, rank, counselingRound, password: hashedPassword,
    });
    await newStudent.save();
    res.status(201).json({ message: 'Student registered successfully!' });
  } catch (err) {
    console.error('Student registration error:', err); 
    res.status(500).json({ message: 'Error saving student', error: err.message });
  }
};

// --- Student Login ---
export const loginStudent = async (req, res) => {
  try {
    const { applicationNumber, password } = req.body;
    const student = await Student.findOne({ applicationNumber });
    if (!student) {
      return res.status(400).json({ message: 'Invalid application number or password!' });
    }
    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid application number or password!' });
    }
    const { password: pwd, ...studentData } = student.toObject();
    res.status(200).json({ message: 'Login successful!', student: studentData });
  } catch (err) {
    console.error('Student login error:', err);
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

// --- Fetch Student Profile ---
export const getStudentProfile = async (req, res) => {
    try {
        const { studentId } = req.params;
        const student = await Student.findById(studentId); 

        if (!student) {
            return res.status(404).json({ message: 'Student profile not found!' }); 
        }
        
        const { password, ...studentData } = student.toObject();
        res.status(200).json(studentData);

    } catch (err) {
        console.error('Error fetching student profile by ID:', err); 
        res.status(500).json({ message: 'Failed to fetch profile data.', error: err.message });
    }
};

// --- Submit Complaint (Student Side) ---
export const submitComplaint = async (req, res) => {
    try {
        const { studentId, studentName, applicationNumber, roomAllotted, category, subject, details } = req.body;
        
        if (!studentId || !studentName || !category || !subject || !details) {
            return res.status(400).json({ message: 'Missing required complaint fields.' });
        }

        const newComplaint = new Complaint({
            studentId, studentName, applicationNumber, roomAllotted, category, subject, details,
        });

        await newComplaint.save();

        res.status(201).json({ 
            message: 'Complaint filed successfully!', 
            complaint: newComplaint 
        });

    } catch (err) {
        console.error('Error submitting complaint:', err);
        res.status(500).json({ message: 'Failed to submit complaint.', error: err.message });
    }
};