// export const uploadImage = (req, res) => {
//     try {
//         if(!req.file) {
//             return res.status(400).json({ message: "Không có file nào được tải lên." });
//         }
//         return res.status(200).json({
//             message : "Tải ảnh thành công",
//             imageUrl : req.file.path,
//         });
//     } catch (error) {
//         return res.status(500).json({ message: "Lỗi upload", error: err.message });
//     }
// }

import cloudinary from "../../utils/cloudinary.js"; // Cloudinary config
import multer from "multer";

// Multer memory storage (lưu tạm vào bộ nhớ trước khi upload)
const storage = multer.memoryStorage();
export const upload = multer({ storage });

export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Không có file nào được tải lên." });
    }

    // Upload lên Cloudinary
    const result = await cloudinary.uploader.upload_stream(
      {
        folder: "sportifyStore", // folder trên Cloudinary
      },
      (error, result) => {
        if (error) {
          console.error(error);
          return res.status(500).json({ message: "Upload thất bại3", error });
        }
        return res.status(200).json({
          message: "Tải ảnh thành công",
          url: result.secure_url,
        });
      }
    );

    // Pipe file từ buffer của multer vào cloudinary
    result.end(req.file.buffer);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};
