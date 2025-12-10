import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
    roomNumber: { type: String, required: true }, 
    capacity: { type: Number, required: true, min: 1 }, 
    type: { type: String, enum: ['Single', 'Double', 'Triple', 'Quad'], default: 'Double' }, 
    hostelType: { type: String, enum: ['Boys', 'Girls'], required: true },
    status: { type: String, enum: ['Available', 'Full', 'Maintenance'], default: 'Available' },
    occupancyCount: { type: Number, default: 0, min: 0 } 
});

// Create a compound unique index so (roomNumber + hostelType) must be unique
roomSchema.index({ roomNumber: 1, hostelType: 1 }, { unique: true });

const Room = mongoose.model('Room', roomSchema); 
export default Room;