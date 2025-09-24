import express from "express";
import { createSubCategoy, getSubcategories, updateSubcategory } from "../../controllers/category/subCategoryController.js";


const router = express.Router();

router.post("/", createSubCategoy);
router.get("/", getSubcategories);
router.put("/:id", updateSubcategory);

export default router;