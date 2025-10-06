import mongoose from "mongoose";
const addressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    city: {
      code: { type: Number, required: true },
      name: { type: String, required: true },
    },
    district: {
      code: { type: Number, required: true },
      name: { type: String, required: true },
    },
    ward: {
      code: { type: Number, required: true },
      name: { type: String, required: true },
    },
    note: { type: String },
    type: { type: String },
    country: { type: String, default: "Vietnam" },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);
const Address = mongoose.model("Address", addressSchema);

export default Address;
