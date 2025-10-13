import express from "express";
import { 
  createOrder, 
  getUserOrders, 
  getOrderDetail, 
  cancelOrder 
} from "../../controllers/order/orderController.js";
import middlewareController from "../../middlewares/middlewareController.js";

const router = express.Router();

// Tạo đơn hàng mới (cần authentication)
router.post("/", middlewareController.verifyToken, createOrder);

// Lấy danh sách đơn hàng của user (cần authentication)
router.get("/", middlewareController.verifyToken, getUserOrders);

// Lấy chi tiết đơn hàng (cần authentication)
router.get("/:orderId", middlewareController.verifyToken, getOrderDetail);

// Hủy đơn hàng (cần authentication)
router.put("/:orderId/cancel", middlewareController.verifyToken, cancelOrder);

export default router;