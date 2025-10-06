import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} from '../../controllers/cart/cartController.js';
import middlewareController from '../../middlewares/middlewareController.js';

const router = express.Router();

// Tất cả routes đều cần authentication
router.use(middlewareController.verifyToken);

// GET /api/cart - Lấy giỏ hàng của user
router.get('/', getCart);

// POST /api/cart - Thêm sản phẩm vào giỏ hàng
router.post('/', addToCart);

// PUT /api/cart/item - Cập nhật số lượng sản phẩm trong giỏ hàng
router.put('/item', updateCartItem);

// DELETE /api/cart/item/:itemId - Xóa sản phẩm khỏi giỏ hàng
router.delete('/item/:itemId', removeFromCart);

// DELETE /api/cart - Xóa toàn bộ giỏ hàng
router.delete('/', clearCart);

export default router;
