import express from "express";
import upload from "../../middlewares/upload.js"; // Multer config
import { uploadImage } from "../../controllers/image/uploadImageController.js";

const router = express.Router();

router.post("/", upload.single("file"), uploadImage);

export default router;
