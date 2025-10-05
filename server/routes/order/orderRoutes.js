import express from 'express';
import {
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus
} from '../../controllers/order/orderController.js';
import middlewareController from '../../middlewares/middlewareController.js';

const router = express.Router();

// Routes cho user
router.post('/', middlewareController.verifyToken, createOrder);
router.get('/my-orders', middlewareController.verifyToken, getUserOrders);
router.get('/:orderId', middlewareController.verifyToken, getOrderById);
router.patch('/:orderId/cancel', middlewareController.verifyToken, cancelOrder);

// Routes cho admin (cần thêm middleware check admin role)
router.get('/admin/all', middlewareController.verifyToken, getAllOrders);
router.patch('/admin/:orderId/status', middlewareController.verifyToken, updateOrderStatus);

export default router;
