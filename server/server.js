import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import { URL, DB_NAME, PORT, HOST } from "./config.js";

//create server
const server = express();
server.use(cors({
  origin: "http://localhost:5173", // địa chỉ frontend
  credentials: true                // cho phép gửi cookie/token nếu cần
}));

server.use(express.json()); // Sử dụng middleware để parse JSON
server.use(cookieParser());

//connect tới DB
mongoose.connect(`${URL}${DB_NAME}`)
    .then(() => console.log("Connect to mongoseDB successfully"))
    .catch((err) => console.log(`Connect faile: ${err}`));
server.listen(PORT,HOST, () => {
    console.log(`Sever is running at http://${HOST}:${PORT}/`)
})