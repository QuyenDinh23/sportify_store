import Category from "../../models/category/Category.js";
import SubCategory from "../../models/category/SubCategory.js";
import mongoose from 'mongoose';

//tạo subCategory
export const createSubCategoy = async (req, res) => {
    try {
        const {name, categoryId} = req.body;
        const sub = new SubCategory({name, categoryId});
        await sub.save();
        await Category.findByIdAndUpdate(categoryId, { $push: { subcategories: sub._id } });
        res.status(201).json(sub);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

// Lấy tất cả subcategory + populate category & brands
export const getSubcategories = async (req, res) => {
  try {
    const subcategories = await SubCategory.find()
      .populate("category")
      .populate("brands");
    res.json(subcategories);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};

// Cập nhật subcategory (bao gồm gán brands)
export const updateSubcategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, categoryId, brandIds } = req.body;

    const subcategory = await SubCategory.findByIdAndUpdate(
      id,
      {
        name,
        category: categoryId,
        brands: brandIds || [],
      },
      { new: true }
    ).populate(["category", "brands"]);

    if (!subcategory) {
      return res.status(404).json({ message: "Subcategory không tồn tại" });
    }

    res.json(subcategory);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};

// Lấy tất cả brands theo subcategoryId
export const getBrandsBySubcategory = async (req, res) => {
  try {
    const { subcategoryId } = req.params;

    const subcategory = await SubCategory.findById(subcategoryId).populate("brands");

    if (!subcategory) {
      return res.status(404).json({ message: "Subcategory không tồn tại" });
    }

    res.json(subcategory.brands);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};

//lấy danh sách subcategories theo phân trang , tìm kiếm , category
export const getSubcategoriesByPage = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const categoryId = req.query.categoryId; // lọc theo category

    const skip = (page - 1) * limit;

    // Tạo query lọc
    let query = {};
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }
    if (categoryId && mongoose.Types.ObjectId.isValid(categoryId) && categoryId !== "all") {
      query.category = categoryId;
    }

    const total = await SubCategory.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    const subcategories = await SubCategory.find(query)
      .populate("category", "name")
      .populate("brands", "name")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json({ subcategories, totalPages });
  } catch (error) {
    console.error("Lỗi khi lấy subcategories:", error);
    res.status(500).json({ message: "Lỗi server khi lấy subcategories" });
  }
};
