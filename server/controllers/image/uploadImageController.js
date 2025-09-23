export const uploadImage = (req, res) => {
    try {
        if(!req.file) {
            return res.status(400).json({ message: "Không có file nào được tải lên." });
        }
        return res.status(200).json({
            message : "Tải ảnh thành công",
            imageUrl : req.file.path,
        });
    } catch (error) {
        return res.status(500).json({ message: "Lỗi upload", error: err.message });
    }
}