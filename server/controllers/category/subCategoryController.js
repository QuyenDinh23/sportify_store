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