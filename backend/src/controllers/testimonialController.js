import { Testimonial } from "../models/testimonial.js";

export const getTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ verified: true });

    // Shuffle testimonials randomly
    const shuffled = testimonials.sort(() => Math.random() - 0.5);

    res.status(200).json({
      success: true,
      data: shuffled,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching testimonials",
      error: error.message,
    });
  }
};

export const createTestimonial = async (req, res) => {
  try {
    const { name, location, image, rating, text } = req.body;

    if (!name || !location || !image || !rating || !text) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const testimonial = new Testimonial({
      name,
      location,
      image,
      rating,
      text,
      verified: false,
    });

    await testimonial.save();

    res.status(201).json({
      success: true,
      message: "Testimonial submitted successfully",
      data: testimonial,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating testimonial",
      error: error.message,
    });
  }
};

export const verifyTestimonial = async (req, res) => {
  try {
    const { id } = req.params;

    const testimonial = await Testimonial.findByIdAndUpdate(
      id,
      { verified: true },
      { new: true }
    );

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Testimonial verified",
      data: testimonial,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error verifying testimonial",
      error: error.message,
    });
  }
};
