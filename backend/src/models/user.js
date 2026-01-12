import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: String,
    role: {
      type: String,
      enum: ["user", "host", "admin"],
      default: "user",
    },
    avatar: String,
    bio: String,
    isVerified: {
      type: Boolean,
      default: false,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    // Host-specific fields
    hostDetails: {
      languages: [String],
      yearsHosting: Number,
      responseRate: Number,
      responseTime: String,
      bankDetails: {
        accountHolder: String,
        accountNumber: String,
        ifscCode: String,
        bankName: String,
      },
    },
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Homestay",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.models.User || mongoose.model("User", userSchema);
