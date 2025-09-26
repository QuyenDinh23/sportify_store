import multer from "multer";
import cloudinary from "../utils/cloudinary.js";
import { Readable } from "stream";

const storage = multer.memoryStorage(); // Lưu file tạm vào memory

export const upload = multer({ storage });

export const uploadToCloudinary = (fileBuffer, folder = "sportifyStore") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    const readable = new Readable();
    readable._read = () => {}; // noop
    readable.push(fileBuffer);
    readable.push(null);
    readable.pipe(stream);
  });
};
