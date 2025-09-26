import express from "express";
import { checkBrandName, createBrand, getBrands, getBrandsByPage, updateBrand } from "../../controllers/brand/brandController.js";

const router = express.Router();

router.get("/paging", getBrandsByPage);
router.get("/check-name-exist", checkBrandName);
router.post("/", createBrand); // Tạo brand
router.get("/", getBrands);    // Lấy danh sách brand
router.put("/:id", updateBrand);
export default router;
