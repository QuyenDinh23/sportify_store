import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import { URL, DB_NAME, PORT, HOST } from "./config.js";
import authRoute from "./routes/authentication/auth.js";
import categoryRoutes from "./routes/category/categoryRoutes.js";
import subcategoryRoutes from "./routes/category/subCategoryRoutes.js";
import imageRoutes from "./routes/image/imageRoutes.js";
import brandRoutes from "./routes/brand/brandRoutes.js";
import sportRoutes from "./routes/sport/sportRoutes.js";
import productRoutes from "./routes/product/productRoutes.js";
import userRoute from "./routes/user/userRoutes.js";
import addressRouter from "./routes/address/addressRoute.js";

//create server
const server = express();
server.use(
  cors({
    origin: "http://localhost:5173", // địa chỉ frontend
    credentials: true, // cho phép gửi cookie/token nếu cần
  })
);

server.use(express.json()); // Sử dụng middleware để parse JSON
server.use(cookieParser());

//Routes
server.use("/api/auth", authRoute);
server.use("/api/categories", categoryRoutes);
server.use("/api/subcategories", subcategoryRoutes);
server.use("/api/upload", imageRoutes);
server.use("/api/brands", brandRoutes);
server.use("/api/sports", sportRoutes);
server.use("/api/products", productRoutes);
server.use("/api/users", userRoute);
server.use("/api/address", addressRouter);

//connect tới DB
mongoose
  .connect(`${URL}${DB_NAME}`)
  .then(() => console.log("Connect to mongoseDB successfully"))
  .catch((err) => console.log(`Connect faile: ${err}`));
server.listen(PORT, HOST, () => {
  console.log(`Sever is running at http://${HOST}:${PORT}/`);
});
