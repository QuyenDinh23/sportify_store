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

// Các route Bảo hành: được bảo vệ bởi middleware verifyToken
const router = express.Router();

// Tạo yêu cầu bảo hành (khách hàng)
router.post("/", middlewareController.verifyToken, createWarrantyRequest);
// Lấy yêu cầu của người dùng hiện tại
router.get("/my-requests", middlewareController.verifyToken, getMyWarrantyRequests); 
// Lấy thống kê tổng hợp (quản trị)
router.get("/statistics", middlewareController.verifyToken, getWarrantyStatistics);         
// Liệt kê tất cả yêu cầu (quản trị)
router.get("/", middlewareController.verifyToken, getAllWarrantyRequests); 
// Cập nhật trạng thái/kết quả, đồng bộ lại tồn kho
router.patch("/:id/status", middlewareController.verifyToken, updateWarrantyStatus); 
// Thực thi hành động theo máy trạng thái (chấp nhận/đổi hàng/từ chối)
router.post("/:id/process", middlewareController.verifyToken, processWarrantyRequest); 
// Lấy một yêu cầu theo id
router.get("/:id", middlewareController.verifyToken, getWarrantyRequestById); 
// Xóa một yêu cầu
router.delete("/:id", middlewareController.verifyToken, deleteWarrantyRequest); 

export default router;
