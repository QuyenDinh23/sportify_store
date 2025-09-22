import express from "express";
import { createCategory, createCategoryWithSubcategories, getCategories, getCategoryById } from "../../controllers/category/categoryController.js";


const router = express.Router();

router.get("/", getCategories);
router.get("/:id", getCategoryById);
router.post("/", createCategoryWithSubcategories);
// router.post("/", createCategory);
// router.put("/:id", updateCategory);
// router.delete("/:id", deleteCategory);

export default router;