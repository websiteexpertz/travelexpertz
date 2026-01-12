import mongoose from "mongoose";

const aboutSchema = new mongoose.Schema(
  {
    section: {
      type: String,
      required: true,
      enum: ['hero', 'story', 'mission', 'vision', 'values', 'statistics', 'team'],
      index: true,
    },
    title: {
      type: String,
      trim: true,
    },
    subtitle: {
      type: String,
      trim: true,
    },
    content: {
      type: String,
      trim: true,
    },
    icon: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    active: {
      type: Boolean,
      default: true,
    },
    // For story section
    paragraphs: [
      {
        text: String,
      }
    ],
    // For team members
    name: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      trim: true,
    },
    // For statistics
    number: {
      type: String,
      trim: true,
    },
    label: {
      type: String,
      trim: true,
    },
    // For values
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const About =
  mongoose.models.About || mongoose.model("About", aboutSchema);
