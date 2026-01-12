import express from "express";
import {
  getAllHomestays,
  getHomestayById,
  createHomestay,
  updateHomestay,
  deleteHomestay,
} from "../controllers/homestayController.js";

const router = express.Router();

router.get("/", getAllHomestays);
router.get("/:id", getHomestayById);
router.post("/", createHomestay);
router.put("/:id", updateHomestay);
router.delete("/:id", deleteHomestay);

export default router;
