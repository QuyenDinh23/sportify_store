import express from "express";
import { 
  createOrder, 
  getUserOrders, 
  getOrderDetail, 
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  getOrderStatistics,
  getRevenueByMonth,
  getOrdersByStatus,
  vnpayIPN,
  vnpayReturn
} from "../../controllers/order/orderController.js";
import middlewareController from "../../middlewares/middlewareController.js";

const router = express.Router();

// Tạo đơn hàng mới (cần authentication)
router.post("/", middlewareController.verifyToken, createOrder);

// Lấy danh sách đơn hàng của user (cần authentication)
router.get("/", middlewareController.verifyToken, getUserOrders);

// Lấy tất cả đơn hàng (Admin only - no userId filter)
router.get("/admin/all", middlewareController.verifyToken, getAllOrders);

// Lấy thống kê đơn hàng và doanh thu (Admin)
router.get("/admin/statistics", middlewareController.verifyToken, getOrderStatistics);

// Lấy doanh thu theo tháng (Admin)
router.get("/admin/revenue-by-month", middlewareController.verifyToken, getRevenueByMonth);

// Lấy đơn hàng theo trạng thái (Admin)
router.get("/admin/orders-by-status", middlewareController.verifyToken, getOrdersByStatus);

// Lấy chi tiết đơn hàng (cần authentication)
router.get("/:orderId", middlewareController.verifyToken, getOrderDetail);

// Cập nhật trạng thái đơn hàng (Admin only)
router.put("/:orderId/status", middlewareController.verifyToken, updateOrderStatus);

// Hủy đơn hàng (cần authentication)
router.put("/:orderId/cancel", middlewareController.verifyToken, cancelOrder);

// VNPay IPN URL - Server-to-server (không cần authentication)
// VNPay sẽ gọi URL này để thông báo kết quả thanh toán
// Phải trả về JSON với RspCode và Message
router.get("/payment/vnpay-ipn", vnpayIPN);

// VNPay Return URL - Browser redirect (không cần authentication)
// Browser redirect về URL này sau khi thanh toán
// Chỉ để hiển thị kết quả, không cập nhật database
router.get("/payment/vnpay-return", vnpayReturn);

export default router;