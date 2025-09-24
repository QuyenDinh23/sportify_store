import express from "express";
import { checkCategoryName, createCategory, createCategoryWithSubcategories, getCategories, getCategoriesByPage, getCategoryById, updateCategory } from "../../controllers/category/categoryController.js";


const router = express.Router();

router.get("/paging", getCategoriesByPage);
router.get("/", getCategories);
router.get("/check-name-exist", checkCategoryName);
router.get("/:id", getCategoryById);
router.post("/", createCategoryWithSubcategories);
router.put("/:id", updateCategory);
// router.get("/check-name-exist", checkCategoryName);
// router.delete("/:id", deleteCategory);

export default router;