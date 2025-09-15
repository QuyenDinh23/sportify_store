import dotenv from "dotenv";
dotenv.config(); //nạp các biến môi trường từ file .env vào process.env
export const PORT = process.env.PORT || 3000
export const HOST = process.env.HOST
export const URL = process.env.URL
export const DB_NAME = process.env.DB_NAME
export const JWT_SECRET = process.env.JWT_SECRET
// export const EMAIL_USER = process.env.EMAIL_USER
// export const EMAIL_PASS = process.env.EMAIL_PASS
// export const CLOUD_NAME = process.env.CLOUD_NAME
// export const CLOUD_API_KEY = process.env.CLOUD_API_KEY
// export const CLOUD_API_SECRET = process.env.CLOUD_API_SECRET