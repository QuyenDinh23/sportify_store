import express from "express";
import { createBrand, getBrands, getBrandsByPage, updateBrand } from "../../controllers/brand/brandController.js";

const router = express.Router();

router.get("/paging", getBrandsByPage)
router.post("/", createBrand); // Tạo brand
router.get("/", getBrands);    // Lấy danh sách brand
router.put("/:id", updateBrand);
export default router;
