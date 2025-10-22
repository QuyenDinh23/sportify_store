import express from "express";
import voucherController from "../../controllers/voucher/voucherController.js";
import middlewareController from "../../middlewares/middlewareController.js";

const router = express.Router();

// Public routes (phải đặt trước routes có parameters)
router.get("/available", voucherController.getAvailableVouchers);

// Admin routes (require authentication)
router.post("/", middlewareController.verifyToken, voucherController.createVoucher);
router.get("/", middlewareController.verifyToken, voucherController.getAllVouchers);
    router.get("/paging", middlewareController.verifyToken, voucherController.getVouchersByPage);
router.get("/:id", middlewareController.verifyToken, voucherController.getVoucherById);
router.put("/:id", middlewareController.verifyToken, voucherController.updateVoucher);
router.delete("/:id", middlewareController.verifyToken, voucherController.deleteVoucher);
router.post("/deactivate-expired", voucherController.deactivateExpiredVouchers);

// User routes (require authentication)
router.post("/apply", middlewareController.verifyToken, voucherController.applyVoucher);

export default router;