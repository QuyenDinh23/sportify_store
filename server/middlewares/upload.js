import multer from "multer";
import {CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../utils/cloudinary.js";

const storage = new CloudinaryStorage({
    cloudinary,
    params : {
        folder : "sportifyStore", //tên folder trong cloudinary
        allowed_format : ["jpg", "png", "jpeg", "webp"],
    },
});

const upload = multer({storage});
export default upload;