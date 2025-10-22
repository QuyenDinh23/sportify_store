import Sport from "../../models/sport/Sport.js";
import Product from "../../models/product/Product.js";
import mongoose from "mongoose";

// Lấy danh sách
export const getSports = async (req, res) => {
  try {
    const sports = await Sport.find().sort({ createdAt: -1 });
    res.status(200).json(sports);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách", error });
  }
};

// Thêm mới
export const createSport = async (req, res) => {
  try {
    const { name, icon, description } = req.body;

    const newSport = new Sport({ name, icon, description });
    await newSport.save();

    res.status(201).json(newSport);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi tạo môn thể thao", error });
  }
};

// Cập nhật
export const updateSport = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, icon, description } = req.body;

    const updatedSport = await Sport.findByIdAndUpdate(
      id,
      { name, icon, description },
      { new: true }
    );

    if (!updatedSport) {
      return res.status(404).json({ message: "Không tìm thấy môn thể thao" });
    }

    res.status(200).json(updatedSport);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi cập nhật môn thể thao", error });
  }
};

// Lấy danh sách sport theo phân trang và tìm kiếm
export const getSportsByPage = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const skip = (page - 1) * limit;
    const query = search ? { name: { $regex: search, $options: "i" } } : {};

    const total = await Sport.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    const sports = await Sport.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json({ sports, totalPages });
  } catch (error) {
    console.error("Lỗi server khi lấy danh sách sport:", error);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách sport" });
  }
};

// Check sport name tồn tại chưa
export const checkSportName = async (req, res) => {
  try {
    const { name, id } = req.query;
    if (!name) {
      return res.status(400).json({ message: "Tên môn thể thao là bắt buộc" });
    }

    let query = { name };

    // Nếu có id hợp lệ thì loại bỏ sport hiện tại khi update
    if (id && mongoose.Types.ObjectId.isValid(id)) {
      query._id = { $ne: id };
    }

    const existingSport = await Sport.findOne(query);

    res.status(200).json({ exists: !!existingSport });
  } catch (error) {
    console.error("Lỗi check sport name:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Xóa sport (chỉ khi chưa được gán vào sản phẩm)
export const deleteSport = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID môn thể thao không hợp lệ" });
    }

    // Kiểm tra sport có đang được gán vào product nào không
    const linkedProduct = await Product.findOne({ sport: id });

    if (linkedProduct) {
      return res.status(400).json({ message: "Môn thể thao đang được sử dụng trong sản phẩm, không thể xóa" });
    }

    const deletedSport = await Sport.findByIdAndDelete(id);

    if (!deletedSport) {
      return res.status(404).json({ message: "Không tìm thấy môn thể thao" });
    }

    res.status(200).json({ message: "Xóa môn thể thao thành công" });
  } catch (error) {
    console.error("Lỗi khi xóa môn thể thao:", error);
    res.status(500).json({ message: "Lỗi server khi xóa môn thể thao" });
  }
};
