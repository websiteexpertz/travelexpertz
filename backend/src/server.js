import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/database.js";
import testimonialRoutes from "./routes/testimonialRoutes.js";
import faqRoutes from "./routes/faqRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import packageRoutes from "./routes/packageRoutes.js";
import whyusRoutes from "./routes/whyusRoutes.js";
import aboutRoutes from "./routes/aboutRoutes.js";
import homestayRoutes from "./routes/homestayRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import categoryRoutes from "./routes/category.js";

dotenv.config({ path: ".env.local" });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/backend/testimonials", testimonialRoutes);
app.use("/api/backend/faqs", faqRoutes);
app.use("/api/backend/services", serviceRoutes);
app.use("/api/backend/packages", packageRoutes);
app.use("/api/backend/whyus", whyusRoutes);
app.use("/api/backend/about", aboutRoutes);
app.use("/api/backend/homestays", homestayRoutes);
app.use("/api/backend/bookings", bookingRoutes);
app.use("/api/backend/categories", categoryRoutes);

// Health check
app.get("/api/backend/health", (req, res) => {
  res.status(200).json({ status: "Server is running" });
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
