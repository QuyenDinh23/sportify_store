import express from "express";
import { getAvailableVouchers, applyVoucher } from "../../controllers/voucher/voucherController.js";
import middlewareController from "../../middlewares/middlewareController.js";

const router = express.Router();

// Lấy danh sách voucher khả dụng (public)
router.get("/available", getAvailableVouchers);

// Áp dụng voucher (cần authentication)
router.post("/apply", middlewareController.verifyToken, applyVoucher);

export default router;
