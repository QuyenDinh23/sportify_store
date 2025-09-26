import express from "express";
import { createSubCategoy, getBrandsBySubcategory, getSubcategories, getSubcategoriesByPage, updateSubcategory } from "../../controllers/category/subCategoryController.js";


const router = express.Router();

router.get("/paging", getSubcategoriesByPage);
router.post("/", createSubCategoy);
router.get("/", getSubcategories);
router.put("/:id", updateSubcategory);
router.get("/:subcategoryId/brands", getBrandsBySubcategory);

export default router;