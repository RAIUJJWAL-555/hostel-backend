import Notice from "../models/Notice.js";

// Create a new notice
export const createNotice = async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required." });
    }

    const newNotice = new Notice({ title, content });
    await newNotice.save();

    res.status(201).json({ message: "Notice created successfully!", notice: newNotice });
  } catch (error) {
    console.error("Error creating notice:", error);
    res.status(500).json({ message: "Server error while creating notice." });
  }
};

// Get all notices (optionally filter by active status)
export const getNotices = async (req, res) => {
  try {
    const { activeOnly } = req.query;
    let query = {};
    if (activeOnly === "true") {
      query.isActive = true;
    }

    // Sort by newest first
    const notices = await Notice.find(query).sort({ createdAt: -1 });
    res.status(200).json(notices);
  } catch (error) {
    console.error("Error fetching notices:", error);
    res.status(500).json({ message: "Server error while fetching notices." });
  }
};

// Delete a notice
export const deleteNotice = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedNotice = await Notice.findByIdAndDelete(id);

    if (!deletedNotice) {
      return res.status(404).json({ message: "Notice not found." });
    }

    res.status(200).json({ message: "Notice deleted successfully." });
  } catch (error) {
    console.error("Error deleting notice:", error);
    res.status(500).json({ message: "Server error while deleting notice." });
  }
};

// Update a notice (e.g., toggle active status)
export const updateNotice = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedNotice = await Notice.findByIdAndUpdate(id, updates, { new: true });

    if (!updatedNotice) {
      return res.status(404).json({ message: "Notice not found." });
    }

    res.status(200).json({ message: "Notice updated successfully.", notice: updatedNotice });
  } catch (error) {
    console.error("Error updating notice:", error);
    res.status(500).json({ message: "Server error while updating notice." });
  }
};
