import Student from '../models/Student.js';
import Room from '../models/Room.js';
import Complaint from '../models/Complaint.js';

// --- Student Applications (Admin) ---

export const getAllApplications = async (req, res) => {
  try {
    // Both endpoints /applications and /applications-student will use this
    const applications = await Student.find({});
    res.status(200).json(applications);
  } catch (err) {
    console.error('Error fetching applications:', err);
    res.status(500).json({ message: 'Error fetching applications', error: err.message });
  }
};

// --- Update Application Status (Approve/Reject) ---
export const updateApplicationStatus = async (req, res) => {
    try {
        const { applicationNumber } = req.params;
        const { status } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status provided.' });
        }
        
        const studentToUpdate = await Student.findOne({ applicationNumber });
        if (!studentToUpdate) {
            return res.status(404).json({ message: 'Application not found!' });
        }

        const updateData = { status: status };
        let roomToVacate = null;
        
        if (status === 'rejected' && studentToUpdate.roomAllotted) {
            roomToVacate = studentToUpdate.roomAllotted;
            updateData.roomAllotted = null; 
        }

        const updatedApplication = await Student.findOneAndUpdate(
            { applicationNumber: applicationNumber },
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (roomToVacate) {
            await Room.updateOne(
                { roomNumber: roomToVacate, occupancyCount: { $gt: 0 } },
                { $inc: { occupancyCount: -1 }, $set: { status: 'Available' } }
            );
        }

        res.status(200).json({ message: `Application ${status} successfully!`, application: updatedApplication });
    } catch (err) {
        console.error('Error updating application status:', err);
        res.status(500).json({ message: 'Error updating application status', error: err.message });
    }
};

// --- Room Allotment ---
export const allotRoom = async (req, res) => {
    try {
        const { applicationNumber } = req.params;
        const { roomNumber } = req.body;

        if (!roomNumber) {
            return res.status(400).json({ message: 'Room number is required for allotment.' });
        }

        const student = await Student.findOne({ applicationNumber });

        if (!student || student.status !== 'approved' || student.roomAllotted) {
            const message = !student 
                ? 'Student application not found!' 
                : student.status !== 'approved' 
                    ? 'Only approved applications can be allotted a room.' 
                    : `Student already allotted room ${student.roomAllotted}. Unallot first.`;
            return res.status(400).json({ message: message });
        }
        
        const room = await Room.findOne({ roomNumber });
        if (!room || room.status === 'Maintenance') {
            return res.status(400).json({ message: 'The selected room is unavailable or does not exist.' });
        }
        
        if (room.occupancyCount >= room.capacity) {
            return res.status(400).json({ message: `Room ${roomNumber} is already full.` });
        }

        const updatedApplication = await Student.findOneAndUpdate(
            { applicationNumber: applicationNumber },
            { $set: { roomAllotted: roomNumber } },
            { new: true }
        );

        const newOccupancyCount = room.occupancyCount + 1;
        let newRoomStatus = room.status;

        if (newOccupancyCount >= room.capacity) {
            newRoomStatus = 'Full';
        } else if (room.status !== 'Maintenance') {
            newRoomStatus = 'Available';
        }
        
        await Room.updateOne(
            { roomNumber: roomNumber },
            { $inc: { occupancyCount: 1 }, $set: { status: newRoomStatus } }
        );

        res.status(200).json({ 
            message: `Room ${roomNumber} allotted successfully to ${applicationNumber}!`, 
            application: updatedApplication 
        });

    } catch (err) {
        console.error('Error during room allotment:', err);
        res.status(500).json({ message: 'Room allotment failed.', error: err.message });
    }
};


// --- Room Inventory ---

export const addRoom = async (req, res) => {
    try {
        const { roomNumber, capacity, type, status } = req.body;
        const existingRoom = await Room.findOne({ roomNumber });
        if (existingRoom) {
            return res.status(400).json({ message: 'Room number already exists.' });
        }
        const newRoom = new Room({ roomNumber, capacity, type, status, occupancyCount: 0 });
        await newRoom.save();
        res.status(201).json({ message: 'Room added successfully!', room: newRoom });
    } catch (err) {
        console.error('Error adding room:', err);
        res.status(500).json({ message: 'Failed to add room.', error: err.message });
    }
};

export const getAllRooms = async (req, res) => {
    try {
        const rooms = await Room.find({});
        res.status(200).json(rooms);
    } catch (err) {
        console.error('Error fetching rooms:', err);
        res.status(500).json({ message: 'Failed to fetch rooms.', error: err.message });
    }
};

export const updateRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        delete updates.occupancyCount; 
        
        const updatedRoom = await Room.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
        if (!updatedRoom) {
            return res.status(404).json({ message: 'Room not found!' });
        }
        res.status(200).json({ message: 'Room updated successfully!', room: updatedRoom });
    } catch (err) {
        console.error('Error updating room:', err);
        res.status(500).json({ message: 'Failed to update room.', error: err.message });
    }
};

export const deleteRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const room = await Room.findById(id);
        
        if (!room) {
            return res.status(404).json({ message: 'Room not found!' });
        }

        if (room.occupancyCount > 0) {
            return res.status(400).json({ message: `Cannot delete room ${room.roomNumber}. It is currently occupied by ${room.occupancyCount} students.` });
        }
        
        await Room.findByIdAndDelete(id);

        res.status(200).json({ message: 'Room deleted successfully!' });
    } catch (err) {
        console.error('Error deleting room:', err);
        res.status(500).json({ message: 'Failed to delete room.', error: err.message });
    }
};


// --- Fee Management ---

export const getFeeData = async (req, res) => {
    try {
        const feeData = await Student.find({}, 'name applicationNumber roomAllotted feeStatus feeAmountDue feeDueDate');
        res.status(200).json(feeData);
    } catch (err) {
        console.error('Error fetching fee data:', err);
        res.status(500).json({ message: 'Failed to fetch fee data.', error: err.message });
    }
};

export const updateFeeDetails = async (req, res) => {
    try {
        const { applicationNumber } = req.params;
        const updates = req.body;
        
        const student = await Student.findOne({ applicationNumber: applicationNumber });
        if (!student) {
            return res.status(404).json({ message: 'Student not found!' });
        }

        let feeAmountToSet = updates.feeAmountDue;
        
        if (updates.monthsDue !== undefined) {
            const newMonthsDue = parseInt(updates.monthsDue);
            feeAmountToSet = newMonthsDue * student.messFeePerMonth; 
            updates.feeAmountDue = feeAmountToSet;
        } 
        
        const updatedStudent = await Student.findOneAndUpdate(
            { applicationNumber: applicationNumber },
            { $set: updates },
            { new: true, runValidators: true }
        );

        res.status(200).json({ 
            message: 'Fee details updated successfully!', 
            student: updatedStudent 
        });

    } catch (err) {
        console.error('Error updating fee status:', err);
        res.status(500).json({ message: 'Failed to update fee details.', error: err.message });
    }
};


// --- Complaint Management (Admin) ---

export const getAllComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find({}).sort({ filedAt: -1 }); 
        res.status(200).json(complaints);
    } catch (err) {
        console.error('Error fetching complaints:', err);
        res.status(500).json({ message: 'Failed to fetch complaints.', error: err.message });
    }
};

export const updateComplaintStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['Pending', 'In Progress', 'Resolved'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status value provided.' });
        }

        const updatedComplaint = await Complaint.findByIdAndUpdate(
            id,
            { $set: { status: status } },
            { new: true, runValidators: true }
        );

        if (!updatedComplaint) {
            return res.status(404).json({ message: 'Complaint not found.' });
        }

        res.status(200).json({ 
            message: `Complaint ${id} status updated to ${status}.`,
            complaint: updatedComplaint 
        });

    } catch (err) {
        console.error('Error updating complaint status:', err);
        res.status(500).json({ message: 'Failed to update complaint status.', error: err.message });
    }
};