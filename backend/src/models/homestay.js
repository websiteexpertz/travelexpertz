import mongoose from "mongoose";

const homestayRoomSchema = new mongoose.Schema({
  id: String,
  type: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: Number,
  maxGuests: { type: Number, default: 2 },
  bedType: String,
  size: Number,
  amenities: [String],
  images: [String],
  availability: { type: Number, default: 1 },
  cancellationPolicy: String,
  mealPlan: String,
});

const homestayReviewSchema = new mongoose.Schema({
  id: String,
  userName: String,
  rating: Number,
  date: String,
  comment: String,
  helpful: { type: Number, default: 0 },
});

const homestaySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    rating: { type: Number, default: 4.5 },
    reviews: { type: Number, default: 0 },
    image: { type: String, required: true },
    images: [String],
    description: { type: String, required: true },
    amenities: [String],
    nearbyPlaces: [
      {
        name: String,
        distance: String,
      },
    ],
    hostName: { type: String, required: true },
    hostImage: String,
    hostDescription: String,
    checkInTime: { type: String, default: "2:00 PM" },
    checkOutTime: { type: String, default: "11:00 AM" },
    rooms: [homestayRoomSchema],
    userReviews: [homestayReviewSchema],
    policies: {
      cancellation: String,
      checkIn: String,
      checkOut: String,
      pets: String,
      smoking: String,
    },
    houseRules: [String],
    starCategory: { type: Number, default: 3, min: 1, max: 7 },
    popular: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    propertyType: {
      type: String,
      enum: ["Entire Place", "Private Room", "Shared Room", "Villa", "Flat", "Apartment", "Cottage", "Bungalow", "Farmhouse", "Penthouse"],
      default: "Entire Place",
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PropertyOwner",
    },
    customFields: [
      {
        label: String,
        value: String,
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Homestay =
  mongoose.models.Homestay || mongoose.model("Homestay", homestaySchema);
