import mongoose from "mongoose";
import Product from "../../models/product/Product.js";
import Subcategory from "../../models/category/SubCategory.js"
import Cart from "../../models/cart/Cart.js";

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
      sizes,
      colors,
      materials,
      technicalSpecs,
    } = req.body;
    console.log("Sport", sport);
    const existing = await Product.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: "Sản phẩm đã tồn tại" });
    }

    //Chuẩn hóa dữ liệu colors (đảm bảo mỗi color có mảng sizes và quantity)
    const normalizedColors = (colors || []).map((color) => ({
      name: color.name,
      hex: color.hex,
      images: color.images || [],
      sizes: (color.sizes || []).map((s) => ({
        size: s.size,
        quantity: Number(s.quantity) || 0,
      })),
    }));

    const totalStock = normalizedColors.reduce((sum, color) => {
      const colorTotal = color.sizes.reduce(
        (acc, s) => acc + (s.quantity || 0),
        0
      );
      return sum + colorTotal;
    }, 0);

    const discountedPrice =
      discountPercentage > 0
        ? price - (price * discountPercentage) / 100
        : price;

    const mainImage =
      normalizedColors.length > 0 && normalizedColors[0].images.length > 0
        ? normalizedColors[0].images[0]
        : "";

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
      discountedPrice,
      stockQuantity: totalStock,
      sizes: [
        ...new Set(
          normalizedColors.flatMap((color) =>
            color.sizes.map((s) => s.size)
          )
        ),
      ], // tổng hợp tất cả size có trong sản phẩm
      colors: normalizedColors,
      materials,
      technicalSpecs,
      image: mainImage,
    });
    const savedProduct = await product.save();

    res.status(201).json({
      message: "Tạo sản phẩm thành công",
      product: savedProduct,
    });
  } catch (error) {
    console.error("Lỗi khi tạo sản phẩm:", error);
    res.status(500).json({ message: "Server error khi tạo sản phẩm" });
  }
};

// Lấy danh sách sản phẩm (có populate)
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({status : "active"})
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

    const { category, subcategory, brand, sport, color, size, search } = req.query;

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
    const colorArr = color && color !== "all" ? color.split(",") : [];
    const sizeArr = size && size !== "all" ? size.split(",") : [];

    if (colorArr.length > 0 || sizeArr.length > 0) {
      query.$and = [];
      // Nếu có color
      if (colorArr.length > 0) {
        query.$and.push({
          "colors.name": { $in: colorArr }
        });
      }
      // Nếu có size
      if (sizeArr.length > 0) {
        // Có thể xuất hiện ở 2 cấp:
        // - Mảng sizes (tổng hợp)
        // - Hoặc trong từng colors.sizes.size
        query.$and.push({
          $or: [
            { sizes: { $in: sizeArr } },
            { "colors.sizes.size": { $in: sizeArr } }
          ]
        });
      }
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

// Kiểm tra tên sản phẩm đã tồn tại hay chưa
export const checkProductName = async (req, res) => {
  try {
    const { name, id } = req.query;

    if (!name) {
      return res.status(400).json({ message: "Tên sản phẩm là bắt buộc" });
    }

    let query = { name };

    // Nếu id hợp lệ (update) thì loại bỏ sản phẩm hiện tại
    if (id && mongoose.Types.ObjectId.isValid(id)) {
      query._id = { $ne: id };
    }

    const existingProduct = await Product.findOne(query);

    res.status(200).json({ exists: !!existingProduct });
  } catch (error) {
    console.error("Lỗi check product name:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Cập nhật trạng thái sản phẩm (active <-> inactive)
export const toggleProductStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // Kiểm tra ID hợp lệ
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID sản phẩm không hợp lệ" });
    }

    // Tìm sản phẩm
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    // Nếu trạng thái hiện tại là "active" (nghĩa là sắp bị ẩn), ta kiểm tra giỏ hàng
    if (product.status === "active") {
      const cartWithProduct = await Cart.findOne({
        "items.productId": id,
      });

      if (cartWithProduct) {
        return res.status(400).json({
          message: "Không thể ẩn sản phẩm vì sản phẩm đang tồn tại trong giỏ hàng của khách hàng.",
        });
      }
    }

    // Đảo trạng thái
    const newStatus = product.status === "active" ? "inactive" : "active";

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { status: newStatus, updatedAt: new Date() },
      { new: true }
    );

    return res.status(200).json({
      message: `Trạng thái sản phẩm đã được chuyển sang "${updatedProduct.status}"`,
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Lỗi khi toggle trạng thái sản phẩm:", error);
    return res.status(500).json({
      message: "Lỗi server khi cập nhật trạng thái sản phẩm",
    });
  }
};

// Lấy sản phẩm có subcategory chứa "Giày thể thao" (limit tuỳ chọn)
export const getSportsShoes = async (req, res) => {
  try {
    const { limit } = req.query;

    const subcategories = await Subcategory.find({
      name: { $regex: "Giày thể thao", $options: "i" }
    }).select("_id");

    if (!subcategories.length) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy danh mục có tên chứa 'Giày thể thao'" });
    }

    const subcategoryIds = subcategories.map((s) => s._id);

    const query = {
      subcategory: { $in: subcategoryIds },
      status: "active",
    };

    let productsQuery = Product.find(query)
      .populate("category", "name")
      .populate("subcategory", "name")
      .populate("brand", "name logo")
      .populate("sport", "name")
      .sort({ createdAt: -1 });

    if (limit && limit !== "all") {
      const parsedLimit = parseInt(limit);
      if (!isNaN(parsedLimit) && parsedLimit > 0) {
        productsQuery = productsQuery.limit(parsedLimit);
      }
    }

    const products = await productsQuery.exec();

    res.status(200).json(products);
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm Giày thể thao:", error);
    res.status(500).json({ message: "Server error khi lấy sản phẩm Giày thể thao" });
  }
};

// Lấy danh sách sản phẩm đang giảm giá
export const getDiscountedProducts = async (req, res) => {
  try {
    const { limit } = req.query;

    // Chỉ lấy sản phẩm có discountPercentage > 0 hoặc isOnSale = true
    const query = {
      status: "active",
      $or: [
        { discountPercentage: { $gt: 0 } },
        { isOnSale: true }
      ]
    };

    let productsQuery = Product.find(query)
      .populate("category", "name")
      .populate("subcategory", "name")
      .populate("brand", "name logo")
      .populate("sport", "name")
      .sort({ discountPercentage: -1, createdAt: -1 }); // ưu tiên giảm giá cao nhất

    // Giới hạn số lượng (nếu có)
    if (limit && limit !== "all") {
      const parsedLimit = parseInt(limit);
      if (!isNaN(parsedLimit) && parsedLimit > 0) {
        productsQuery = productsQuery.limit(parsedLimit);
      }
    }

    const products = await productsQuery.exec();

    if (!products.length) {
      return res.status(404).json({ message: "Không có sản phẩm giảm giá" });
    }

    res.status(200).json(products);
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm giảm giá:", error);
    res.status(500).json({ message: "Server error khi lấy sản phẩm giảm giá" });
  }
};

// Lấy sản phẩm theo sport
export const getProductsBySport = async (req, res) => {
  try {
    const { sportId, limit } = req.query;

    if (!sportId) {
      return res.status(400).json({ message: "Thiếu sportId" });
    }

    // Query sản phẩm có sport tương ứng và đang active
    let query = { sport: sportId, status: "active" };

    let productsQuery = Product.find(query)
      .populate("category subcategory brand sport")
      .sort({ createdAt: -1 });

    // Nếu có limit thì giới hạn số lượng
    if (limit && limit !== "all") {
      productsQuery = productsQuery.limit(Number(limit));
    }

    const products = await productsQuery;

    res.status(200).json(products);
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm theo sport:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Lấy 5 sản phẩm liên quan ngẫu nhiên theo sport hoặc category
export const getRelatedProducts = async (req, res) => {
  try {
    const { id } = req.params;

    // Tìm sản phẩm gốc
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    // Tìm các sản phẩm liên quan (cùng sport hoặc category), loại trừ chính nó
    const query = {
      _id: { $ne: id },
      $or: [
        { sport: product.sport },
        { category: product.category }
      ]
    };

    // Lấy ngẫu nhiên 5 sản phẩm
    const relatedProducts = await Product.aggregate([
      { $match: query },
      { $sample: { size: 5 } } // chọn ngẫu nhiên 5 sản phẩm
    ]);

    res.status(200).json(relatedProducts);
  } catch (error) {
    console.error("Error fetching related products:", error);
    res.status(500).json({ message: "Lỗi server khi lấy sản phẩm liên quan" });
  }
};