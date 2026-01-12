import { WhyUs } from "../models/whyus.js";

export const getWhyUs = async (req, res) => {
  try {
    const whyUs = await WhyUs.find({ active: true })
      .sort({ order: 1 })
      .lean();

    res.status(200).json({
      success: true,
      data: whyUs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching Why Us data",
      error: error.message,
    });
  }
};

export const createWhyUs = async (req, res) => {
  try {
    const { icon, title, description, order } = req.body;

    if (!icon || !title || !description) {
      return res.status(400).json({
        success: false,
        message: "Icon, title, and description are required",
      });
    }

    const whyUs = new WhyUs({
      icon,
      title,
      description,
      order: order || 0,
      active: true,
    });

    await whyUs.save();

    res.status(201).json({
      success: true,
      data: whyUs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating Why Us entry",
      error: error.message,
    });
  }
};

export const updateWhyUs = async (req, res) => {
  try {
    const { id } = req.params;
    const { icon, title, description, order, active } = req.body;

    const whyUs = await WhyUs.findByIdAndUpdate(
      id,
      { icon, title, description, order, active },
      { new: true }
    );

    if (!whyUs) {
      return res.status(404).json({
        success: false,
        message: "Why Us entry not found",
      });
    }

    res.status(200).json({
      success: true,
      data: whyUs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating Why Us entry",
      error: error.message,
    });
  }
};

export const deleteWhyUs = async (req, res) => {
  try {
    const { id } = req.params;

    const whyUs = await WhyUs.findByIdAndDelete(id);

    if (!whyUs) {
      return res.status(404).json({
        success: false,
        message: "Why Us entry not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Why Us entry deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting Why Us entry",
      error: error.message,
    });
  }
};
