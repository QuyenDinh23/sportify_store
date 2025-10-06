import middlewareController from "../../middlewares/middlewareController.js";
import addressController from "../../controllers/address/addressController.js";
import { Router } from "express";

const addressRouter = Router();

addressRouter.get(
  "/",
  middlewareController.verifyToken,
  addressController.getAdress
);
addressRouter.post(
  "/add",
  middlewareController.verifyToken,
  addressController.addAddress
);
addressRouter.delete(
  "/delete/:id",
  middlewareController.verifyToken,
  addressController.deleteAddress
);
addressRouter.put(
  "/update/:id",
  middlewareController.verifyToken,
  addressController.editAddress
);
export default addressRouter;
