import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    homestayId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Homestay",
      required: true,
    },
    roomId: {
      type: String,
      required: true,
    },
    guestName: {
      type: String,
      required: true,
    },
    guestEmail: {
      type: String,
      required: true,
    },
    guestPhone: {
      type: String,
      required: true,
    },
    checkin: {
      type: Date,
      required: true,
    },
    checkout: {
      type: Date,
      required: true,
    },
    guests: {
      type: Number,
      required: true,
      default: 1,
    },
    nights: {
      type: Number,
      required: true,
    },
    basePrice: {
      type: Number,
      required: true,
    },
    taxes: {
      type: Number,
      default: 0,
    },
    platformFee: {
      type: Number,
      default: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paymentId: String,
    paymentMethod: String,
    bookingStatus: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
    cancellationReason: String,
    refundAmount: Number,
    refundStatus: {
      type: String,
      enum: ["none", "pending", "processed"],
      default: "none",
    },
    specialRequests: String,
    bookingReference: {
      type: String,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

// Generate booking reference before saving
bookingSchema.pre("save", function (next) {
  if (!this.bookingReference) {
    this.bookingReference = `BK${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
  next();
});

export const Booking =
  mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
