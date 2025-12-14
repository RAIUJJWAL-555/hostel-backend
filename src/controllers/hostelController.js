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
            let targetHostelType = 'Boys';
            if (studentToUpdate.gender === 'Female') targetHostelType = 'Girls';

            await Room.updateOne(
                { roomNumber: roomToVacate, hostelType: targetHostelType, occupancyCount: { $gt: 0 } },
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
        
        let targetHostelType = 'Boys';
        if (student.gender === 'Female') targetHostelType = 'Girls';
        // You might want to handle 'Other' case or default, assuming Boys for now or error out

        const room = await Room.findOne({ roomNumber, hostelType: targetHostelType });
        if (!room || room.status === 'Maintenance') {
            return res.status(400).json({ message: `Room ${roomNumber} in ${targetHostelType} Hostel is unavailable or does not exist.` });
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
            { _id: room._id },
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
        const { roomNumber, capacity, type, status, hostelType } = req.body;
        
        // Check if room with same number AND same hostel type exists
        const existingRoom = await Room.findOne({ roomNumber, hostelType });
        if (existingRoom) {
            return res.status(400).json({ message: `Room ${roomNumber} already exists in ${hostelType} Hostel.` });
        }
        const newRoom = new Room({ roomNumber, capacity, type, status, hostelType, occupancyCount: 0 });
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
        // Updated projection to include monthsDue and messFeePerMonth
        const feeData = await Student.find({}, 'name applicationNumber roomAllotted feeStatus feeAmountDue feeDueDate monthsDue messFeePerMonth');
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
            const feePerMonth = student.messFeePerMonth || 3500; // Fallback to default if undefined
            feeAmountToSet = newMonthsDue * feePerMonth; 
            updates.feeAmountDue = feeAmountToSet;
        } 
        
        // --- NEW LOGIC: If marking as Paid, clear the dues ---
        if (updates.feeStatus === 'Paid') {
            updates.feeAmountDue = 0;
            updates.monthsDue = 0;
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


// --- Student Management (Edit/Delete) ---

export const updateStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        // Prevent updating immutable fields if necessary, currently allowing all non-id fields
        delete updates._id;

        const updatedStudent = await Student.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
        
        if (!updatedStudent) {
            return res.status(404).json({ message: 'Student not found!' });
        }

        res.status(200).json({ message: 'Student details updated successfully!', student: updatedStudent });

    } catch (err) {
        console.error('Error updating student:', err);
        res.status(500).json({ message: 'Failed to update student.', error: err.message });
    }
};

export const deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const student = await Student.findById(id);

        if (!student) {
            return res.status(404).json({ message: 'Student not found!' });
        }

        // If student has a room, vacate it
        if (student.roomAllotted) {
            // Find the room - Resolve ambiguity using gender
             let targetHostelType = 'Boys';
             if (student.gender === 'Female') targetHostelType = 'Girls';

             const room = await Room.findOne({ roomNumber: student.roomAllotted, hostelType: targetHostelType });
             if (room) {
                 // Decrement occupancy
                 const newOccupancy = Math.max(0, room.occupancyCount - 1);
                 let newStatus = room.status;
                 if (newStatus === 'Full' && newOccupancy < room.capacity) {
                     newStatus = 'Available';
                 } else if(newStatus === 'Maintenance') {
                     // Keep maintenance
                 } else {
                    // Default to available if not full/maintenance
                    newStatus = 'Available'; 
                 }

                 await Room.updateOne(
                     { _id: room._id },
                     { $set: { occupancyCount: newOccupancy, status: newStatus } }
                 );
             }
        }

        await Student.findByIdAndDelete(id);

        res.status(200).json({ message: 'Student deleted successfully!' });

    } catch (err) {
        console.error('Error deleting student:', err);
        res.status(500).json({ message: 'Failed to delete student.', error: err.message });
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