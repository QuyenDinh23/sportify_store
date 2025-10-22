import express from "express";
import { checkProductName, createProduct, getProductById, getProducts, getProductsByFilter, toggleProductStatus, updateProduct } from "../../controllers/product/productController.js";

const router = express.Router();

router.get("/check-name", checkProductName);
router.post("/", createProduct);
router.get("/paging", getProductsByFilter);
router.get("/", getProducts);
router.get("/:id", getProductById);
router.put("/:id", updateProduct); 
router.patch("/:id/toggle-status", toggleProductStatus); 
export default router;
