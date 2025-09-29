import Category from "../../models/category/Category.js";
import Subcategory from "../../models/category/SubCategory.js";
import mongoose from 'mongoose';

// Lấy tất cả categories + subcategories
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find()
      .populate({
        path: "subcategories",
        populate: { path: "brands" }, // populate brands trong subcategories
      })
      .sort({ createdAt: -1 });
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// Lấy chi tiết category theo id
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id).populate("subcategories"); 

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json(category);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

//tạo category 
export const createCategory = async (req, res) => {
    try {
        const {name, icon} = req.body;
        const category = new Category({name,icon});
        const saved = await category.save();
        res.status(200).json(saved);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}
//
export const createCategoryWithSubcategories = async (req, res) => {
  try {
    const { name, icon, gender, type, subcategories } = req.body;

    // 1. Tạo Category
    const category = await Category.create({ name, icon, gender, type});

    // 2. Tạo Subcategories nếu có
    let createdSubcategories = [];
    if (subcategories && subcategories.length > 0) {
      createdSubcategories = await Promise.all(
        subcategories.map(sub =>
          Subcategory.create({ name: sub, category: category._id })
        )
      );

      // 3. Cập nhật category.subcategories
      category.subcategories = createdSubcategories.map(sub => sub._id);
      await category.save();
    }

    res.status(201).json({
      message: "Category và Subcategories được tạo thành công",
      category: await category.populate("subcategories")
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Cập nhật Category
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, icon, gender, type, subcategories } = req.body;
    // 1. Tìm category
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    // 2. Cập nhật thông tin cơ bản
    if (name) category.name = name;
    if (icon) category.icon = icon;
    if (gender) category.gender = gender;
    if (type) category.type = type;
    // 3. Nếu có truyền subcategories
    // if (subcategories) {
    //   // Xoá subcategories cũ
    //   await Subcategory.deleteMany({ category: id });
    //   // Tạo mới subcategories
    //   const createdSubs = await Promise.all(
    //     subcategories.map((sub) =>
    //       Subcategory.create({ name: sub, category: id })
    //     )
    //   );
    //   // Gán lại vào category
    //   category.subcategories = createdSubs.map((sub) => sub._id);
    // }
    if (subcategories) {
      // Lọc subcategories cũ và mới
      const oldSubs = subcategories.filter(sub => typeof sub === 'object' && sub !== null);
      const newSubs = subcategories.filter(sub => typeof sub === 'string');

      // 1. Giữ lại subcategories cũ
      const keptSubIds = oldSubs.map(sub => sub._id);

      // 2. Tạo subcategories mới
      const createdSubs = await Promise.all(
        newSubs.map(subName => Subcategory.create({ name: subName, category: id }))
      );
      const newSubIds = createdSubs.map(sub => sub._id);

      // 3. Gán lại vào category
      category.subcategories = [...keptSubIds, ...newSubIds];
    }
    // 4. Lưu lại
    await category.save();
    res.status(200).json({
      message: "Category updated successfully",
      category: await category.populate("subcategories"),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const checkCategoryName = async (req, res) => {
  try {
    const { name, id } = req.query;
    if (!name) {
      return res.status(400).json({ message: "Tên danh mục là bắt buộc" });
    }

    let query = { name };

    // Nếu có id và là ObjectId hợp lệ thì loại bỏ category hiện tại
    if (id && mongoose.Types.ObjectId.isValid(id)) {
      query._id = { $ne: id };
    }

    const existingCategory = await Category.findOne(query);

    res.status(200).json({ exists: !!existingCategory });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Lấy danh sách category theo phân trang
export const getCategoriesByPage = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const skip = (page - 1) * limit;
    const query = search
      ? { name: { $regex: search, $options: "i" } }
      : {};

    const total = await Category.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    const categories = await Category.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate("subcategories", "name");

    res.json({ categories, totalPages });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server khi lấy danh mục" });
  }
};


