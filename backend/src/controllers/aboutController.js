import { About } from "../models/about.js";

// Get all about sections
export const getAllAbout = async (req, res) => {
  try {
    const sections = await About.find().sort({ section: 1, order: 1 });
    res.json(sections);
  } catch (error) {
    console.error("Error fetching about sections:", error);
    res.status(500).json({ error: "Failed to fetch about sections" });
  }
};

// Get about by section
export const getAboutBySection = async (req, res) => {
  try {
    const { section } = req.params;
    const items = await About.find({ section, active: true }).sort({ order: 1 });
    res.json(items);
  } catch (error) {
    console.error("Error fetching about section:", error);
    res.status(500).json({ error: "Failed to fetch about section" });
  }
};

// Create new about item
export const createAbout = async (req, res) => {
  try {
    const aboutItem = new About(req.body);
    await aboutItem.save();
    res.status(201).json(aboutItem);
  } catch (error) {
    console.error("Error creating about item:", error);
    res.status(500).json({ error: "Failed to create about item" });
  }
};

// Update about item
export const updateAbout = async (req, res) => {
  try {
    const { id } = req.params;
    const aboutItem = await About.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!aboutItem) {
      return res.status(404).json({ error: "About item not found" });
    }
    res.json(aboutItem);
  } catch (error) {
    console.error("Error updating about item:", error);
    res.status(500).json({ error: "Failed to update about item" });
  }
};

// Delete about item
export const deleteAbout = async (req, res) => {
  try {
    const { id } = req.params;
    const aboutItem = await About.findByIdAndDelete(id);
    if (!aboutItem) {
      return res.status(404).json({ error: "About item not found" });
    }
    res.json({ message: "About item deleted successfully" });
  } catch (error) {
    console.error("Error deleting about item:", error);
    res.status(500).json({ error: "Failed to delete about item" });
  }
};
