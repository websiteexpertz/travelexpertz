import express from "express";
import {
  getTestimonials,
  createTestimonial,
  verifyTestimonial,
} from "../controllers/testimonialController.js";

const router = express.Router();

router.get("/", getTestimonials);
router.post("/", createTestimonial);
router.patch("/:id/verify", verifyTestimonial);

export default router;
