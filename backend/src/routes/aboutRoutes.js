import express from "express";
import {
  getAllAbout,
  getAboutBySection,
  createAbout,
  updateAbout,
  deleteAbout,
} from "../controllers/aboutController.js";

const router = express.Router();

router.get("/", getAllAbout);
router.get("/section/:section", getAboutBySection);
router.post("/", createAbout);
router.put("/:id", updateAbout);
router.delete("/:id", deleteAbout);

export default router;
