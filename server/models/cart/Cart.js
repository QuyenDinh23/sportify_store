import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  selectedSize: {
    type: String,
    required: true
  },
  selectedColor: {
    type: Object,
    required: true
  },
  priceAtAdd: {
    type: Number,
    required: true
  },
  importPrice: {
    type: Number,
    required: true
  },
  discountPercentage: {
    type: Number,
    required: true
  },
  subtotal: {
    type: Number,
    required: true
  },
  images: [{
    type: String
  }],
  availableStock: {
    type: Number,
    default: 999  // Default high value if not set for old cart items
  }
});

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  totalQuantity: {
    type: Number,
    default: 0
  },
  totalPrice: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    default: 'active'
  }
}, {
  timestamps: true
});

// Middleware để tự động tính toán totalQuantity và totalPrice
cartSchema.pre('save', function(next) {
  this.totalQuantity = this.items.reduce((total, item) => total + item.quantity, 0);
  this.totalPrice = this.items.reduce((total, item) => total + item.subtotal, 0);
  next();
});

export default mongoose.model('Cart', cartSchema);
