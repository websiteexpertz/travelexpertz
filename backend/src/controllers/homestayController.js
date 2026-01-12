import { Homestay } from "../models/homestay.js";

// Get all homestays
export const getAllHomestays = async (req, res) => {
  try {
    const query = req.query.admin === "true" ? {} : { active: true };
    const homestays = await Homestay.find(query).sort({
      popular: -1,
      createdAt: -1,
    });
    res.json(homestays);
  } catch (error) {
    console.error("Error fetching homestays:", error);
    res.status(500).json({ error: "Failed to fetch homestays" });
  }
};

// Get homestay by ID
export const getHomestayById = async (req, res) => {
  try {
    const { id } = req.params;
    const homestay = await Homestay.findById(id);
    if (!homestay) {
      return res.status(404).json({ error: "Homestay not found" });
    }
    res.json(homestay);
  } catch (error) {
    console.error("Error fetching homestay:", error);
    res.status(500).json({ error: "Failed to fetch homestay" });
  }
};

// Create new homestay
export const createHomestay = async (req, res) => {
  try {
    const homestay = new Homestay(req.body);
    await homestay.save();
    res.status(201).json(homestay);
  } catch (error) {
    console.error("Error creating homestay:", error);
    res.status(500).json({ error: "Failed to create homestay" });
  }
};

// Update homestay
export const updateHomestay = async (req, res) => {
  try {
    const { id } = req.params;
    const homestay = await Homestay.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!homestay) {
      return res.status(404).json({ error: "Homestay not found" });
    }
    res.json(homestay);
  } catch (error) {
    console.error("Error updating homestay:", error);
    res.status(500).json({ error: "Failed to update homestay" });
  }
};

// Delete homestay
export const deleteHomestay = async (req, res) => {
  try {
    const { id } = req.params;
    const homestay = await Homestay.findByIdAndDelete(id);
    if (!homestay) {
      return res.status(404).json({ error: "Homestay not found" });
    }
    res.json({ message: "Homestay deleted successfully" });
  } catch (error) {
    console.error("Error deleting homestay:", error);
    res.status(500).json({ error: "Failed to delete homestay" });
  }
};
