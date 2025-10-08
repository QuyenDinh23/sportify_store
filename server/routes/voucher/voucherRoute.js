import voucherController from "../../controllers/voucher/voucherController.js";
import middlewareController from "../../middlewares/middlewareController.js";
import { Router } from "express";
const voucherRoute = Router();
voucherRoute.post(
  "/",
  middlewareController.verifyToken,
  voucherController.createVoucher
);
voucherRoute.get(
  "/",
  middlewareController.verifyToken,
  voucherController.getAllVouchers
);
voucherRoute.get(
  "/:id",
  middlewareController.verifyToken,
  voucherController.getVoucherById
);
voucherRoute.put(
  "/:id",
  middlewareController.verifyToken,
  voucherController.updateVoucher
);
voucherRoute.delete(
  "/:id",
  middlewareController.verifyToken,
  voucherController.deleteVoucher
);
voucherRoute.post(
  "/deactivate-expired",
  voucherController.deactivateExpiredVouchers
);
export default voucherRoute;
