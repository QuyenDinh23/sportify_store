import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
  {
    userNumber: { type: String, unique: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: {
      type: String,
      enum: ["user", "admin", "staff-sale", "staff-content"],
      default: "user",
    },
    fbId: { type: String },
    googleId: { type: String },
    phone: { type: String },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ["male", "female", "other"] },
    status: {
      type: String,
      enum: ["active", "inactive", "banned"],
      default: "active",
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (this.isNew && !this.userNumber) {
    let newNumber;
    let exists = true;

    while (exists) {
      // 🧮 Sinh 13 chữ số
      // Dựa trên timestamp hiện tại (13 số) + random nhỏ để giảm khả năng trùng
      const timestamp = Date.now(); // 13 chữ số (vd: 1728061494644)
      newNumber = timestamp.toString();

      // ✅ Kiểm tra trùng trong DB
      exists = await mongoose.models.User.findOne({ userNumber: newNumber });

      // Nếu trùng (trường hợp cực hiếm, 2 user tạo đúng cùng ms), thêm random nhỏ
      if (exists) {
        const rand = Math.floor(Math.random() * 90 + 10); // 2 số random
        newNumber = `${timestamp.toString().slice(0, 11)}${rand}`; // vẫn 13 số
        exists = await mongoose.models.User.findOne({ userNumber: newNumber });
      }
    }

    this.userNumber = newNumber;
  }
  next();
});
const User = mongoose.model("User", userSchema);

export default User;
