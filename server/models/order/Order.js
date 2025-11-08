import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  selectedColor: {
    type: String,
    required: true
  },
  selectedSize: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: null
  }
});

const shippingAddressSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  street: {
    type: String,
    required: true
  },
  city: {
    code: String,
    name: String
  },
  district: {
    code: String,
    name: String
  },
  ward: {
    code: String,
    name: String
  },
  note: {
    type: String,
    default: ''
  }
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: false // Will be set in pre-save hook
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  shippingAddress: shippingAddressSchema,
  paymentMethod: {
    type: String,
    enum: ['cod', 'bank_transfer', 'credit_card', 'vnpay'],
    required: true
  },
  status: {
    type: String,
    enum: [
      'pending',
      'confirmed',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
      'return_requested',
      'returned',
      'refund_requested',
      'refunded'
    ],
    default: 'pending'
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  shippingFee: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  voucherCode: {
    type: String,
    default: null
  },
  voucherDiscount: {
    type: Number,
    default: 0,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  notes: {
    type: String,
    default: ''
  },
  trackingNumber: {
    type: String,
    default: null
  },
  estimatedDelivery: {
    type: Date,
    default: null
  },
  deliveredAt: {
    type: Date,
    default: null
  },
  cancelledAt: {
    type: Date,
    default: null
  },
  cancelReason: {
    type: String,
    default: null
  },
  // Refund information for VNPay orders (when customer cancels paid order)
  refundInfo: {
    zaloPhone: { type: String, default: null },
    qrCode: { type: String, default: null }, // URL of uploaded QR code image
    bankAccountName: { type: String, default: null },
    bankAccountNumber: { type: String, default: null },
    bankName: { type: String, default: null },
    note: { type: String, default: null },
    condition: { type: String, enum: [null, 'intact', 'damaged'], default: null },
  },
  refundEligible: { type: Boolean, default: false },
  refundProcessedAt: { type: Date, default: null }
}, {
  timestamps: true
});

// Index for better performance
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ userId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

// Generate order number before saving
orderSchema.pre('save', async function(next) {
  console.log("=== ORDER PRE-SAVE HOOK ===");
  console.log("isNew:", this.isNew);
  console.log("orderNumber:", this.orderNumber);
  
  if (this.isNew && !this.orderNumber) {
    try {
      console.log("Generating order number...");
      const count = await this.constructor.countDocuments();
      this.orderNumber = `ORD${String(count + 1).padStart(6, '0')}`;
      console.log("Generated order number:", this.orderNumber);
    } catch (error) {
      console.error("Error generating order number:", error);
      // Fallback to timestamp-based order number
      this.orderNumber = `ORD${Date.now()}`;
      console.log("Fallback order number:", this.orderNumber);
    }
  }
  
  // Ensure orderNumber is set
  if (!this.orderNumber) {
    this.orderNumber = `ORD${Date.now()}`;
    console.log("Final fallback order number:", this.orderNumber);
  }
  
  next();
});

const Order = mongoose.model('Order', orderSchema);

export default Order;