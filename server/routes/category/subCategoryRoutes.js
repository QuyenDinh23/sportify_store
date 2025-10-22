import express from "express";
import { checkSubcategoryUsage, createSubCategoy, deleteSubcategory, getBrandsBySubcategory, getSubcategories, getSubcategoriesByPage, updateSubcategory } from "../../controllers/category/subCategoryController.js";


const router = express.Router();

router.get("/check/:id", checkSubcategoryUsage);
router.get("/paging", getSubcategoriesByPage);
router.post("/", createSubCategoy);
router.get("/", getSubcategories);
router.put("/:id", updateSubcategory);
router.get("/:subcategoryId/brands", getBrandsBySubcategory);
router.delete("/:id", deleteSubcategory);

export default router;