// models/Category.js
import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  icon: {
    type: String,
    default: "",
  },
  type: {
    type: String,
    enum: ["clothing", "shoes", "accessories"],
    required: true,
  },
  gender: {
      type: String,
      enum: ["male", "female", "kids"],
      required: true,
  },
  subcategories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subcategory",
    },
  ],
}, {
  timestamps: true,
});

export default mongoose.model("Category", categorySchema);