import express from "express";
import {
  getCategories,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";

const router = express.Router();

// Get all active categories
router.get("/", getCategories);

// Get all categories (including inactive)
router.get("/all", getAllCategories);

// Create new category
router.post("/", createCategory);

// Update category
router.put("/:id", updateCategory);

// Delete category
router.delete("/:id", deleteCategory);

export default router;
