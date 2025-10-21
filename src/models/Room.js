import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
    roomNumber: { type: String, required: true, unique: true }, 
    capacity: { type: Number, required: true, min: 1 }, 
    type: { type: String, enum: ['Single', 'Double', 'Triple', 'Quad'], default: 'Double' }, 
    status: { type: String, enum: ['Available', 'Full', 'Maintenance'], default: 'Available' },
    occupancyCount: { type: Number, default: 0, min: 0 } 
});

const Room = mongoose.model('Room', roomSchema); 
export default Room;