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
userRoute.get(
  "/all-customers",
  middlewareController.verifyToken,
  userController.getAllCustomers
);
userRoute.get(
  "/all-staffs",
  middlewareController.verifyToken,
  userController.getAllStaffs
);
userRoute.post("/check-email", userController.checkEmailDuplicate);
userRoute.post(
  "/create",
  middlewareController.verifyToken,
  userController.checkEmailDuplicateMiddleware,
  userController.createAccount
);
userRoute.put(
  "/edit/:id",
  middlewareController.verifyToken,
  userController.editAccount
);
userRoute.put(
  "/user-status/:id",
  middlewareController.verifyToken,
  userController.toggleStatusCustomer
);

export default userRoute;
