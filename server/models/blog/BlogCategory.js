import mongoose from "mongoose";
const blogCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, default: "" },
  thumbnail: { type: String, default: "" },
}, { timestamps: true });

export const BlogCategory = mongoose.model("BlogCategory", blogCategorySchema);
