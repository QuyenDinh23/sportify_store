import mongoose from "mongoose";

const WarrantySchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  reason: {
    type: String,
    enum: [
      "missing_item",
      "wrong_item",
      "broken_damaged",
      "defective_not_working",
      "expired",
      "different_from_description",
      "used_item",
      "fake_counterfeit",
      "intact_no_longer_needed"
    ],
    required: true,
  },
  description: { type: String, required: true },
  attachments: {
    type: [String],
    required: true,
    validate: [arr => arr.length > 0, "At least one attachment is required"],
  },
  issueDate: Date,
  contactInfo: String,
  status: {
    type: String,
    enum: ["pending", "processing", "completed", "rejected"],
    default: "pending",
  },
  submitDate: { type: Date, default: Date.now },
  lastUpdate: { type: Date, default: Date.now },
  result: {
    type: String,
    enum: ["completed", "replaced", "rejected", null],
    default: null,
  },
  resolutionDate: Date,
  resolutionNote: String,
  adminNote: String,
  rejectReason: String,
  replacementOrderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
  actionBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  responseDate: Date,
}, { timestamps: true });

WarrantySchema.pre("save", function (next) {
  this.lastUpdate = new Date();
  next();
});

WarrantySchema.index({ customerId: 1 });
WarrantySchema.index({ orderId: 1 });
WarrantySchema.index({ status: 1 });
WarrantySchema.index({ createdAt: -1 });

export default mongoose.model("Warranty", WarrantySchema);
