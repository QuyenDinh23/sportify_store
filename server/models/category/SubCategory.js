import mongoose from "mongoose";

const subcategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  brands: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Brand", 
      },
    ],
}, {
  timestamps: true,
});

export default mongoose.model("Subcategory", subcategorySchema);