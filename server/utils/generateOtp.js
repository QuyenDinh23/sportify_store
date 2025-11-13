import Otp from "../models/otp/Otp.js";

/**
 * Sinh OTP, lưu vào DB, và tự động hết hạn sau X phút
 * @param {string} email - email người dùng
 * @param {number} expiryMinutes - số phút OTP còn hiệu lực
 * @returns {Promise<string>} mã OTP vừa tạo
 */
async function generateOtp(email, expiryMinutes = 1) {
  // Tạo OTP ngẫu nhiên 6 chữ số
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Xóa OTP cũ của email (nếu có)
  await Otp.deleteMany({ email });

  // Lưu OTP mới vào DB
  const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);
  await Otp.create({ email, otp, expiresAt });

  console.log(`✅ OTP for ${email}: ${otp} (expires in ${expiryMinutes} mins)`);
  return otp;
}

export default generateOtp;
