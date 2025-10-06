import express from "express";
import { createProduct, getProductById, getProducts, getProductsByFilter, updateProduct } from "../../controllers/product/productController.js";

const router = express.Router();


router.post("/", createProduct);
router.get("/paging", getProductsByFilter);
router.get("/", getProducts);
router.get("/:id", getProductById);
router.put("/:id", updateProduct);  
export default router;
