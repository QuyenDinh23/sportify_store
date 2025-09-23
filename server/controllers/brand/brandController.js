import mongoose from 'mongoose';
import Brand from '../../models/brand/Brand.js';

// tạo brand mới
export const createBrand = async (req, res) => {
  try {
    const { name, logo, description } = req.body;

    // Kiểm tra brand đã tồn tại chưa
    const existingBrand = await Brand.findOne({ name });
    if (existingBrand) {
      return res.status(400).json({ message: "Brand đã tồn tại" });
    }

    const brand = new Brand({
      name,
      logo,
      description,
    });

    const savedBrand = await brand.save();
    res.status(201).json(savedBrand);
  } catch (error) {
    console.error("Error create brand:", error);
    res.status(500).json({ message: "Server error khi tạo brand" });
  }
};

//lấy danh sách brand
export const getBrands = async (req, res) => {
  try {
    const brands = await Brand.find().sort({ createdAt: -1 });
    res.json(brands);
  } catch (error) {
    console.error("Error get brands:", error);
    res.status(500).json({ message: "Server error khi lấy danh sách brand" });
  }
};

// cập nhật brand
export const updateBrand = async (req, res) => {
  try {
    const { id } = req.params; 
    const { name, logo, description } = req.body;

    // kiểm tra brand có tồn tại không
    const brand = await Brand.findById(id);
    if (!brand) {
      return res.status(404).json({ message: "Brand không tồn tại" });
    }

    // kiểm tra tên mới có bị trùng không (ngoại trừ chính brand hiện tại)
    if (name && name !== brand.name) {
      const existingBrand = await Brand.findOne({ name });
      if (existingBrand) {
        return res.status(400).json({ message: "Tên brand đã tồn tại" });
      }
    }

    // cập nhật dữ liệu
    brand.name = name || brand.name;
    brand.logo = logo || brand.logo;
    brand.description = description || brand.description;

    const updatedBrand = await brand.save();
    res.json(updatedBrand);
  } catch (error) {
    console.error("Error update brand:", error);
    res.status(500).json({ message: "Server error khi cập nhật brand" });
  }
};

// Lấy danh sách brand theo phân trang và tìm kiếm
export const getBrandsByPage = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const skip = (page - 1) * limit;
    const query = search ? { name: { $regex: search, $options: "i" } } : {};

    const total = await Brand.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    const brands = await Brand.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json({ brands, totalPages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách brand" });
  }
};
