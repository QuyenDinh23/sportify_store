import express from "express";
import {
  createWarrantyRequest,
  getAllWarrantyRequests,
  getWarrantyRequestById,
  getMyWarrantyRequests,
  updateWarrantyStatus,
  processWarrantyRequest,
  deleteWarrantyRequest,
  getWarrantyStatistics,
} from "../../controllers/warranty/warrantyController.js";
import middlewareController from "../../middlewares/middlewareController.js";

const router = express.Router();

router.post("/", middlewareController.verifyToken, createWarrantyRequest);
router.get("/my-requests", middlewareController.verifyToken, getMyWarrantyRequests); 
router.get("/statistics", middlewareController.verifyToken, getWarrantyStatistics);         
router.get("/", middlewareController.verifyToken, getAllWarrantyRequests); 
router.patch("/:id/status", middlewareController.verifyToken, updateWarrantyStatus); 
router.post("/:id/process", middlewareController.verifyToken, processWarrantyRequest); 
router.get("/:id", middlewareController.verifyToken, getWarrantyRequestById); 
router.delete("/:id", middlewareController.verifyToken, deleteWarrantyRequest); 

export default router;
