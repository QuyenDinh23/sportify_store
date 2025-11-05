import mongoose from "mongoose";

/**
 * Schema Bảo hành
 *
 * Mô tả yêu cầu bảo hành của người dùng đối với một đơn hàng/sản phẩm và lưu lại
 * biến thể đã mua (màu/kích thước) để phục vụ việc điều chỉnh tồn kho chính xác.
 */

const WarrantySchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  selectedColor: { type: String },
  selectedSize: { type: String },
  reason: {
    type: String,
    enum: [
      "missing_item",
      "wrong_item",
      "broken_damaged",
      "defective_not_working",
      "expired",
      "different_from_description",
      "used_item",
      "fake_counterfeit",
      "intact_no_longer_needed"
    ],
    required: true,
  },
  description: { type: String, required: true },
  attachments: {
    type: [String],
    required: true,
    // Yêu cầu tối thiểu có 1 minh chứng (ảnh/video/…)
    validate: [arr => arr.length > 0, "Cần ít nhất một tệp đính kèm"],
  },
  issueDate: Date,
  contactInfo: String,
  status: {
    type: String,
    enum: ["pending", "processing", "completed", "rejected"],
    default: "pending",
  },
  submitDate: { type: Date, default: Date.now },
  lastUpdate: { type: Date, default: Date.now },
  result: {
    type: String,
    enum: ["completed", "replaced", "rejected", null],
    default: null,
  },
  resolutionDate: Date,
  resolutionNote: String,
  adminNote: String,
  rejectReason: String,
  replacementOrderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
  actionBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  responseDate: Date,
}, { timestamps: true });

// Duy trì trường lastUpdate để theo dõi lịch sử cập nhật
WarrantySchema.pre("save", function (next) {
  this.lastUpdate = new Date();
  next();
});

WarrantySchema.index({ customerId: 1 });
WarrantySchema.index({ orderId: 1 });
WarrantySchema.index({ status: 1 });
WarrantySchema.index({ createdAt: -1 });

export default mongoose.model("Warranty", WarrantySchema);
