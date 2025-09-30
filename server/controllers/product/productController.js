import mongoose from "mongoose";
import Product from "../../models/product/Product.js";

// Tạo sản phẩm mới
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      status,
      description,
      category,
      subcategory,
      brand,
      sport,
      importPrice,
      price,
      discountPercentage,
      stockQuantity,
      sizes,
      colors,
      materials,
      technicalSpecs,
    } = req.body;

    // kiểm tra trùng tên sản phẩm (nếu cần)
    const existing = await Product.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: "Sản phẩm đã tồn tại" });
    }

    const product = new Product({
      name,
      status,
      description,
      category,
      subcategory,
      brand,
      sport,
      importPrice,
      price,
      discountPercentage,
      stockQuantity,
      sizes,
      colors,
      materials,
      technicalSpecs,
    });

    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error("Error create product:", error);
    res.status(500).json({ message: "Server error khi tạo sản phẩm" });
  }
};

// Lấy danh sách sản phẩm (có populate)
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("category", "name")
      .populate("subcategory", "name")
      .populate("brand", "name logo")
      .populate("sport", "name")
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    console.error("Error get products:", error);
    res.status(500).json({ message: "Server error khi lấy danh sách sản phẩm" });
  }
};

// Lấy sản phẩm theo ID
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // Kiểm tra id có hợp lệ không
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID sản phẩm không hợp lệ" });
    }

    const product = await Product.findById(id)
      .populate("category", "name")
      .populate("subcategory", "name")
      .populate("brand", "name logo")
      .populate("sport", "name");

    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    res.json(product);
  } catch (error) {
    console.error("Error get product by id:", error);
    res.status(500).json({ message: "Server error khi lấy sản phẩm" });
  }
};
