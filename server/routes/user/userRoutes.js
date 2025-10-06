import userController from "../../controllers/user/userController.js";
import middlewareController from "../../middlewares/middlewareController.js";
import { Router } from "express";
const userRoute = Router();
userRoute.get(
  "/info",
  middlewareController.verifyToken,
  userController.getUserInfo
);
userRoute.put(
  "/update",
  middlewareController.verifyToken,
  userController.updateUserInfo
);
userRoute.put(
  "/change-password",
  middlewareController.verifyToken,
  userController.changePassword
);
export default userRoute;
