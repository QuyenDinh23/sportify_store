import mongoose from "mongoose";

const voucherSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },

    // Loại giảm giá: phần trăm hoặc số tiền cố định
    discountType: {
      type: String,
      enum: ["fixed", "percentage"],
      required: true,
    },

    // Giá trị giảm (ví dụ 10% hoặc 100000 VND)
    discountValue: {
      type: Number,
      required: true,
      min: 1,
    },

    // Giá trị đơn hàng tối thiểu để áp dụng
    minOrderAmount: {
      type: Number,
      default: 0,
    },

    // Giới hạn sử dụng toàn hệ thống (VD: chỉ 1000 lượt)
    usageLimit: {
      type: Number,
      default: 0, // 0 = không giới hạn
    },

    // Mỗi user được dùng bao nhiêu lần
    usagePerUser: {
      type: Number,
      default: 1,
    },

    // Đếm số lượt đã dùng thực tế
    usedCount: {
      type: Number,
      default: 0,
    },

    // Giới hạn theo thời gian
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },

    // Giới hạn phạm vi áp dụng
    applicableUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // Trạng thái hoạt động
    isActive: {
      type: Boolean,
      default: true,
    },

    // Loại người dùng (tùy chọn)
    targetUserGroup: {
      type: String,
      enum: ["all", "new", "vip"],
      default: "all",
    },
  },
  {
    timestamps: true,
  }
);

// 🧠 Index để tăng tốc tra cứu voucher theo mã
voucherSchema.index({ code: 1 });
voucherSchema.index({ startDate: 1, endDate: 1 });

voucherSchema.pre("save", function (next) {
  const now = new Date();
  if (this.endDate < now) {
    this.isActive = false;
  } else if (this.startDate > now) {
    // Voucher chưa đến ngày hiệu lực => có thể cho phép, tùy yêu cầu
    this.isActive = false;
  } else {
    this.isActive = true;
  }
  next();
});

/**
 * 🧠 Static method: Quét toàn bộ voucher hết hạn và tắt tự động
 * => Có thể gọi từ cronjob hàng ngày hoặc thủ công từ admin dashboard
 */
voucherSchema.statics.deactivateExpiredVouchers = async function () {
  const now = new Date();
  const result = await this.updateMany(
    { endDate: { $lt: now }, isActive: true },
    { $set: { isActive: false } }
  );
  return result.modifiedCount;
};
const Voucher = mongoose.model("Voucher", voucherSchema);
export default Voucher;
