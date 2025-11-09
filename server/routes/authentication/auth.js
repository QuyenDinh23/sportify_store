import authController from "../../controllers/authentication/authController.js";
import userController from "../../controllers/user/userController.js";
import middlewareController from "../../middlewares/middlewareController.js";
import { Router } from "express";

const authRoute = Router();

authRoute.post(
  "/register",
  userController.checkEmailDuplicateMiddleware,
  authController.registerUser
);
authRoute.post("/login", authController.loginUser);
authRoute.get(
  "/auth-me",
  middlewareController.verifyToken,
  authController.authMe
);
authRoute.post("/refresh-token", authController.requestRefreshToken);
authRoute.post(
  "/logout",
  middlewareController.verifyToken,
  authController.logoutUser
);
authRoute.post("/login-fb", authController.loginWithFb);
authRoute.post("/send-otp", authController.sendOtp);
authRoute.post("/verify-otp", authController.verifyOtp);
authRoute.post("/reset-password", authController.resetPassword);
export default authRoute;
