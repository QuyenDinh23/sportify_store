import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import { URL, DB_NAME, PORT, HOST } from "./config.js";

// Set default values if env vars are not set
const PORT_NUM = PORT || 3000;
const HOST_NAME = HOST || 'localhost';
const DB_URL = URL || 'mongodb://localhost:27017/';
const DB_NAME_VAL = DB_NAME || 'sportify_store';
import authRoute from "./routes/authentication/auth.js";
import categoryRoutes from "./routes/category/categoryRoutes.js";
import subcategoryRoutes from "./routes/category/subCategoryRoutes.js";
import imageRoutes from "./routes/image/imageRoutes.js";
import brandRoutes from "./routes/brand/brandRoutes.js";
import sportRoutes from "./routes/sport/sportRoutes.js";
import productRoutes from "./routes/product/productRoutes.js";
import cartRoutes from "./routes/cart/cartRoutes.js";
import orderRoutes from "./routes/order/orderRoutes.js";

import userRoute from "./routes/user/userRoutes.js";
import addressRouter from "./routes/address/addressRoute.js";
import voucherRoute from "./routes/voucher/voucherRoute.js";
import blogRoutes from "./routes/blog/blogRoutes.js";
import warrantyRoutes from "./routes/warranty/warrantyRoutes.js";

//create server
const server = express();
// Cấu hình CORS - cho phép cả localhost, local IP và ngrok
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  // Cho phép tất cả các ngrok URLs
  /^https:\/\/.*\.ngrok-free\.dev$/,
  /^https:\/\/.*\.ngrok\.io$/,
  // Cho phép local IP addresses (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
  /^http:\/\/192\.168\.\d+\.\d+:5173$/,
  /^http:\/\/10\.\d+\.\d+\.\d+:5173$/,
  /^http:\/\/172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+:5173$/,
  // Có thể thêm origin từ environment variable
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : [])
];

server.use(
  cors({
    origin: function (origin, callback) {
      // Cho phép requests không có origin (như mobile apps hoặc Postman)
      if (!origin) {
        console.log('CORS: Request without origin, allowing');
        return callback(null, true);
      }
      
      console.log(`CORS: Checking origin: ${origin}`);
      
      // Kiểm tra xem origin có trong danh sách allowed không
      const isAllowed = allowedOrigins.some(allowedOrigin => {
        if (typeof allowedOrigin === 'string') {
          const matches = origin === allowedOrigin;
          if (matches) console.log(`CORS: Matched string origin: ${allowedOrigin}`);
          return matches;
        } else if (allowedOrigin instanceof RegExp) {
          const matches = allowedOrigin.test(origin);
          if (matches) console.log(`CORS: Matched regex: ${allowedOrigin.toString()}`);
          return matches;
        }
        return false;
      });
      
      if (isAllowed) {
        console.log(`CORS: Allowing origin: ${origin}`);
        callback(null, true);
      } else {
        console.log(`CORS: Blocked origin: ${origin}`);
        console.log(`CORS: Allowed origins:`, allowedOrigins);
        callback(new Error('Not allowed by CORS'));
      }
    },
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
server.use("/api/cart", cartRoutes);
server.use("/api/orders", orderRoutes);

server.use("/api/users", userRoute);
server.use("/api/address", addressRouter);
server.use("/api/vouchers", voucherRoute);
server.use("/api/blog", blogRoutes);
server.use("/api/warranty", warrantyRoutes);

//connect tới DB
mongoose
  .connect(`${DB_URL}${DB_NAME_VAL}`)
  .then(() => console.log("Connect to mongoseDB successfully"))
  .catch((err) => console.log(`Connect faile: ${err}`));
server.listen(PORT_NUM, '0.0.0.0', () => {
  console.log(`Sever is running at http://localhost:${PORT_NUM}/`);
});
