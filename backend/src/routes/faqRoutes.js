import express from "express";
import {
  getFAQs,
  createFAQ,
  updateFAQ,
  deleteFAQ,
} from "../controllers/faqController.js";

const router = express.Router();

router.get("/", getFAQs);
router.post("/", createFAQ);
router.patch("/:id", updateFAQ);
router.delete("/:id", deleteFAQ);

export default router;
