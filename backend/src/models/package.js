import mongoose from "mongoose";

const packageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    fullDescription: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "₹",
    },
    duration: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    highlights: [
      {
        type: String,
      },
    ],
    itinerary: [
      {
        day: Number,
        title: String,
        description: String,
      },
    ],
    inclusions: [
      {
        type: String,
      },
    ],
    exclusions: [
      {
        type: String,
      },
    ],
    bestTime: {
      type: String,
      default: "Year Round",
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Moderate", "Difficult"],
      default: "Moderate",
    },
    groupSize: {
      type: String,
      default: "2-15 People",
    },
    featured: {
      type: Boolean,
      default: false,
    },
    active: {
      type: Boolean,
      default: true,
    },
    customFields: [
      {
        id: String,
        section: {
          type: String,
          enum: ["overview", "itinerary", "inclusions", "essentials", "policies"],
        },
        fieldName: String,
        fieldType: {
          type: String,
          enum: ["text", "textarea", "list"],
        },
        value: mongoose.Schema.Types.Mixed, // Can be String or Array
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Package =
  mongoose.models.Package || mongoose.model("Package", packageSchema);
