import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true }, 
  role: { type: String, required: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false }, 
  otp: String, 
  otpExpires: Date, 
});

const Admin = mongoose.model('Admin', adminSchema);
export default Admin;