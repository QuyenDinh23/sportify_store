import Category from "../../models/category/Category.js";
import SubCategory from "../../models/category/SubCategory.js";

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