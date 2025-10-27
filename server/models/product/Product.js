import mongoose from "mongoose";

// Schema cho từng biến thể size trong màu
const SizeVariantSchema = new mongoose.Schema({
  size: { type: String, required: true },
  quantity: { type: Number, required: true, default: 0 }
});

// Schema cho từng biến thể màu
const ColorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  hex: { type: String, required: true },
  images: [{ type: String }], // mảng URL hình ảnh
  sizes: [SizeVariantSchema]   // mỗi màu có thể có nhiều size và số lượng riêng
});

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  description: { type: String, default: "" },

  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  subcategory: { type: mongoose.Schema.Types.ObjectId, ref: "Subcategory", required: true },
  brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand", required: true },
  sport: { type: mongoose.Schema.Types.ObjectId, ref: "Sport" },

  importPrice: { type: Number, required: true },
  price: { type: Number, required: true },
  discountPercentage: { type: Number, default: 0 },
  discountedPrice: { type: Number },

  stockQuantity: { type: Number, default: 0 },

  sizes: [{ type: String }],       // tổng hợp tất cả size của sản phẩm
  colors: [ColorSchema],           // danh sách các màu sắc, mỗi màu chứa nhiều size
  materials: [{ type: String }],   // danh sách vật liệu
  technicalSpecs: { type: Map, of: String }, // thông số kỹ thuật dạng key-value

  image: { type: String, default: "" }, // ảnh đại diện (ảnh đầu tiên của màu đầu tiên)
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  isNew: { type: Boolean, default: true },
  isOnSale: { type: Boolean, default: false },
  
  warrantyPeriod: { type: Number, default: 12 },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Middleware: tự động tính discountedPrice và cập nhật ngày
ProductSchema.pre("save", function (next) {
  if (this.discountPercentage > 0) {
    this.discountedPrice = this.price - (this.price * this.discountPercentage) / 100;
    this.isOnSale = true;
  } else {
    this.discountedPrice = this.price;
    this.isOnSale = false;
  }

  // Tổng số lượng tồn = tổng quantity của tất cả màu và size
  if (this.colors && this.colors.length > 0) {
    this.stockQuantity = this.colors.reduce((total, color) => {
      const colorTotal = (color.sizes || []).reduce((sum, s) => sum + (s.quantity || 0), 0);
      return total + colorTotal;
    }, 0);
  }

  this.updatedAt = new Date();
  next();
});

export default mongoose.model("Product", ProductSchema);
