import { Package } from "../models/package.js";

export const getPackages = async (req, res) => {
  try {
    const packages = await Package.find({ active: true }).sort({
      featured: -1,
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      data: packages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching packages",
      error: error.message,
    });
  }
};

export const getPackageById = async (req, res) => {
  try {
    const { id } = req.params;

    const tourPackage = await Package.findById(id);

    if (!tourPackage) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
      });
    }

    res.status(200).json({
      success: true,
      data: tourPackage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching package",
      error: error.message,
    });
  }
};

export const createPackage = async (req, res) => {
  try {
    const {
      title,
      description,
      fullDescription,
      image,
      price,
      currency,
      duration,
      location,
      highlights,
      itinerary,
      inclusions,
      exclusions,
      bestTime,
      difficulty,
      groupSize,
      featured,
    } = req.body;

    if (
      !title ||
      !description ||
      !fullDescription ||
      !image ||
      !price ||
      !duration ||
      !location
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    const tourPackage = new Package({
      title,
      description,
      fullDescription,
      image,
      price,
      currency: currency || "₹",
      duration,
      location,
      highlights: highlights || [],
      itinerary: itinerary || [],
      inclusions: inclusions || [],
      exclusions: exclusions || [],
      bestTime,
      difficulty,
      groupSize,
      featured: featured || false,
      active: true,
    });

    await tourPackage.save();

    res.status(201).json({
      success: true,
      message: "Package created successfully",
      data: tourPackage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating package",
      error: error.message,
    });
  }
};

export const updatePackage = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const tourPackage = await Package.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!tourPackage) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Package updated successfully",
      data: tourPackage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating package",
      error: error.message,
    });
  }
};

export const deletePackage = async (req, res) => {
  try {
    const { id } = req.params;

    const tourPackage = await Package.findByIdAndDelete(id);

    if (!tourPackage) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Package deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting package",
      error: error.message,
    });
  }
};
