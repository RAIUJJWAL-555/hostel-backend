import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  applicationNumber: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  dob:{type: String, required:true},
  year:{type: String, required:true},
  branch:{type: String, required:true},
  distance: { type: Number, required: true },
  rank: { type: Number, required: true },
  counselingRound: { type: String, required: true },
  password: { type: String, required: true },
  status: { type: String, required: true, default: 'pending' },
  roomAllotted: { type: String, default: null },
  messFeePerMonth: { type: Number, default: 3500 }, 
  monthsDue: { type: Number, default: 0 },     
  feeStatus: { 
    type: String, 
    enum: ['Paid', 'Pending', 'Overdue'], 
    default: 'Pending' 
  },
  feeAmountDue: { 
    type: Number, 
    default: 0 
  },
  feeDueDate: { 
    type: Date, 
    default: Date.now 
  },
});

const Student = mongoose.model('Student', studentSchema);
export default Student;