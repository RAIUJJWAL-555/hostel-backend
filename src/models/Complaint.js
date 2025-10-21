import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    studentName: { type: String, required: true },
    applicationNumber: { type: String, required: true }, 
    roomAllotted: { type: String, default: 'N/A' },
    
    category: { type: String, enum: ['Room Maintenance', 'Mess & Food', 'Washroom/Sanitation', 'Security & Safety', 'Other'], required: true },
    subject: { type: String, required: true, trim: true, maxlength: 100 },
    details: { type: String, required: true },
    
    status: { type: String, enum: ['Pending', 'In Progress', 'Resolved'], default: 'Pending' }, 
    filedAt: { type: Date, default: Date.now },
});

const Complaint = mongoose.model('Complaint', complaintSchema); 
export default Complaint;