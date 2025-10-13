import mongoose from "mongoose";

const voucherSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true
  },
  discountValue: {
    type: Number,
    required: true,
    min: 0
  },
  minOrderAmount: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  usageLimit: {
    type: Number,
    required: true,
    min: 1
  },
  usagePerUser: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  usedCount: {
    type: Number,
    default: 0,
    min: 0
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  applicableUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  targetUserGroup: {
    type: String,
    enum: ['all', 'new_customers', 'vip_customers'],
    default: 'all'
  }
}, {
  timestamps: true
});

// Index for better performance
voucherSchema.index({ code: 1 });
voucherSchema.index({ isActive: 1, startDate: 1, endDate: 1 });

const Voucher = mongoose.model('Voucher', voucherSchema);

export default Voucher;
