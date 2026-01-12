import express from "express";
import {
  getWhyUs,
  createWhyUs,
  updateWhyUs,
  deleteWhyUs,
} from "../controllers/whyusController.js";

const router = express.Router();

router.get("/", getWhyUs);
router.post("/", createWhyUs);
router.patch("/:id", updateWhyUs);
router.delete("/:id", deleteWhyUs);

export default router;
