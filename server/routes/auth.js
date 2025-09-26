import authController from "../controllers/authController.js";  
import middlewareController from "../middlewares/middlewareController.js";
import { Router } from "express";

const authRoute = Router();

authRoute.post("/register", authController.registerUser);
authRoute.post("/login", authController.loginUser);
authRoute.get("/auth-me", middlewareController.verifyToken, authController.authMe);
authRoute.post("/refresh-token", authController.requestRefreshToken);
authRoute.post("/logout", middlewareController.verifyToken, authController.logoutUser);

export default authRoute;
