import express from "express";

import { checkProductName, createProduct, getDiscountedProducts, getProductById, getProducts, getProductsByFilter, getProductsBySport, getRelatedProducts, getSportsShoes, searchActiveProductsByName, toggleProductStatus, updateProduct } from "../../controllers/product/productController.js";


const router = express.Router();

router.get("/search", searchActiveProductsByName);
router.get("/:id/related", getRelatedProducts);
router.get("/sports-shoes", getSportsShoes);
router.get("/discounted", getDiscountedProducts);
router.get("/by-sport", getProductsBySport);
router.get("/check-name", checkProductName);
router.post("/", createProduct);
router.get("/paging", getProductsByFilter);
router.get("/", getProducts);
router.get("/:id", getProductById);
router.put("/:id", updateProduct); 
router.patch("/:id/toggle-status", toggleProductStatus); 
export default router;
