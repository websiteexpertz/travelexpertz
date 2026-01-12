import { FAQ } from "../models/faq.js";

export const getFAQs = async (req, res) => {
  try {
    const faqs = await FAQ.find({ active: true })
      .sort({ order: 1 })
      .lean();

    res.status(200).json({
      success: true,
      data: faqs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching FAQs",
      error: error.message,
    });
  }
};

export const createFAQ = async (req, res) => {
  try {
    const { question, answer, category, order } = req.body;

    if (!question || !answer || !category) {
      return res.status(400).json({
        success: false,
        message: "Question, answer, and category are required",
      });
    }

    const faq = new FAQ({
      question,
      answer,
      category,
      order: order || 0,
      active: true,
    });

    await faq.save();

    res.status(201).json({
      success: true,
      message: "FAQ created successfully",
      data: faq,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating FAQ",
      error: error.message,
    });
  }
};

export const updateFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer, category, order, active } = req.body;

    const faq = await FAQ.findByIdAndUpdate(
      id,
      { question, answer, category, order, active },
      { new: true }
    );

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: "FAQ not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "FAQ updated successfully",
      data: faq,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating FAQ",
      error: error.message,
    });
  }
};

export const deleteFAQ = async (req, res) => {
  try {
    const { id } = req.params;

    const faq = await FAQ.findByIdAndDelete(id);

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: "FAQ not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "FAQ deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting FAQ",
      error: error.message,
    });
  }
};
