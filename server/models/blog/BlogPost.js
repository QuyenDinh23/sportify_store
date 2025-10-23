import mongoose from "mongoose";

const blockSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["paragraph", "image", "table", "quote", "video", "subtitle"],
      required: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed, // để linh hoạt chứa object với cấu trúc khác nhau
      required: true,
    },
  },
  { _id: false }
);

const sectionSchema = new mongoose.Schema(
  {
    title: { type: String, default: "" }, // có thể là tiêu đề phụ hoặc để trống
    blocks: { type: [blockSchema], default: [] },
  },
  { _id: false }
);

const blogPostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BlogCategory",
    required: true,
  },
  author: { type: String, default: "" },
  coverImage: { type: String, default: "" },
  summary: { type: String, default: "" },
  sections: { type: [sectionSchema], default: [] },
  isPublished: { type: Boolean, default: false },
  publishedAt: { type: Date },
}, { timestamps: true });

export const BlogPost = mongoose.model("BlogPost", blogPostSchema);
