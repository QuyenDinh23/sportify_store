import mongoose from "mongoose";

const ColorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  hex: { type: String, required: true },
  images: [{ type: String }] // mảng URL hình ảnh
});

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  description: { type: String, default: "" },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  subcategory: { type: mongoose.Schema.Types.ObjectId, ref: "Subcategory", required: true },
  brand: { type: mongoose.Schema.Types.ObjectId,ref:"Brand", required: true },
  sport: { type: mongoose.Schema.Types.ObjectId, ref: "Sport" },

  importPrice: { type: Number, required: true },
  price: { type: Number, required: true },
  discountPercentage: { type: Number, default: 0 },
  discountedPrice: { type: Number }, // có thể tính toán tự động

  stockQuantity: { type: Number, default: 0 },

  sizes: [{ type: String }],       // biến thể kích thước
  colors: [ColorSchema],           // biến thể màu sắc
  materials: [{ type: String }],   // danh sách vật liệu
  technicalSpecs: { type: Map, of: String }, // thông số kỹ thuật, ví dụ: key: value

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Middleware để tự động tính giá sau giảm khi save
ProductSchema.pre("save", function(next) {
  if (this.discountPercentage > 0) {
    this.discountedPrice = this.price - (this.price * this.discountPercentage) / 100;
  } else {
    this.discountedPrice = this.price;
  }
  this.updatedAt = new Date();
  next();
});

export default mongoose.model("Product", ProductSchema);
