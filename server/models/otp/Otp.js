import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true }, // hoặc phone nếu bạn dùng số điện thoại
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true }, // thời gian hết hạn OTP
  },
  { timestamps: true }
);
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 60 });
const Otp = mongoose.model("Otp", otpSchema);

export default Otp;
