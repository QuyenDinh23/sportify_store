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

// Cập nhật sản phẩm
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Kiểm tra id có hợp lệ không
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID sản phẩm không hợp lệ" });
    }

    const updateData = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true } // trả về document sau khi update
    )
      .populate("category", "name")
      .populate("subcategory", "name")
      .populate("brand", "name logo")
      .populate("sport", "name");

    if (!updatedProduct) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    res.json(updatedProduct);
  } catch (error) {
    console.error("Error update product:", error);
    res.status(500).json({ message: "Server error khi cập nhật sản phẩm" });
  }
};

//Filter + pagination
export const getProductsByFilter = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const { category, subcategory, brand, sport, search } = req.query;

    const skip = (page - 1) * limit;

    // Build query
    let query = {};

    if (category && category !== "all") {
      query.category = category;
    }
    if (subcategory && subcategory !== "all") {
      query.subcategory = subcategory;
    }
    if (brand && brand !== "all") {
      query.brand = brand;
    }
    if (sport && sport !== "all") {
      query.sport = sport;
    }
    if (search && search.trim() !== "") {
      query.name = { $regex: search, $options: "i" };
    }

    // Count total
    const total = await Product.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    // Get data
    const products = await Product.find(query)
      .populate("category", "name")
      .populate("subcategory", "name")
      .populate("brand", "name logo")
      .populate("sport", "name")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json({ products, totalPages });
  } catch (error) {
    console.error("Error filter products:", error);
    res.status(500).json({ message: "Lỗi server khi filter sản phẩm" });
  }
};