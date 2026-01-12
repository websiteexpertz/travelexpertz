import { Service } from "../models/service.js";

export const getServices = async (req, res) => {
  try {
    const services = await Service.find({ active: true }).sort({ order: 1 });

    res.status(200).json({
      success: true,
      data: services,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching services",
      error: error.message,
    });
  }
};

export const createService = async (req, res) => {
  try {
    const { icon, title, description, href, image, order } = req.body;

    if (!icon || !title || !description || !href || !image) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const service = new Service({
      icon,
      title,
      description,
      href,
      image,
      order: order || 0,
      active: true,
    });

    await service.save();

    res.status(201).json({
      success: true,
      message: "Service created successfully",
      data: service,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating service",
      error: error.message,
    });
  }
};

export const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const service = await Service.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Service updated successfully",
      data: service,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating service",
      error: error.message,
    });
  }
};

export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findByIdAndDelete(id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Service deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting service",
      error: error.message,
    });
  }
};
