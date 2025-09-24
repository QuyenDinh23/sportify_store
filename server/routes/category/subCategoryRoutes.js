import express from "express";
import { createSubCategoy } from "../../controllers/category/subCategoryController.js";


const router = express.Router();

router.post("/", createSubCategoy);
// router.put("/:id", updateSubcategory);
// router.delete("/:id", deleteSubcategory);

export default router;