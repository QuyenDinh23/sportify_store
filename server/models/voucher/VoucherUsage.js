import mongoose from "mongoose";

const voucherUsageSchema = new mongoose.Schema(
  {
    voucherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Voucher",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    // Số tiền giảm cụ thể cho đơn này
    discountAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    usedAt: {
      type: Date,
      default: Date.now,
    },

    // Trạng thái của lần sử dụng
    status: {
      type: String,
      enum: ["completed", "refunded", "cancelled"],
      default: "completed",
    },
  },
  {
    timestamps: true,
  }
);

// 🧠 Index để tra cứu nhanh user đã dùng voucher nào
voucherUsageSchema.index({ voucherId: 1, userId: 1 });
voucherUsageSchema.index({ orderId: 1 });
const VoucherUsage = mongoose.model("VoucherUsage", voucherUsageSchema);
export default VoucherUsage;
