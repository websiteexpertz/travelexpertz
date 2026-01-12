import express from "express";
import {
  getBookings,
  getBookingById,
  createBooking,
  updateBookingStatus,
  updatePaymentStatus,
  checkAvailability,
  getBlockedDates,
  processRefund,
} from "../controllers/bookingController.js";

const router = express.Router();

router.get("/", getBookings);
router.get("/check-availability", checkAvailability);
router.get("/blocked-dates", getBlockedDates);
router.get("/:id", getBookingById);
router.post("/", createBooking);
router.patch("/:id/status", updateBookingStatus);
router.patch("/:id/payment", updatePaymentStatus);
router.post("/:id/refund", processRefund);

export default router;
