import Category from "../../models/category/Category.js";
import Subcategory from "../../models/category/SubCategory.js";
// Lấy tất cả categories + subcategories
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().populate("subcategories");
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