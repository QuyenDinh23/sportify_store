import Order from "../../models/order/Order.js";
import Cart from "../../models/cart/Cart.js";
import Voucher from "../../models/voucher/Voucher.js";

// Tạo đơn hàng mới
export const createOrder = async (req, res) => {
  try {
    console.log("=== CREATE ORDER DEBUG ===");
    console.log("req.user:", req.user);
    console.log("req.body:", req.body);
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User not authenticated"
      });
    }
    
    const userId = req.user.id;
    const { shippingAddress, paymentMethod, notes, voucherCode } = req.body;

    // Validate required fields
    if (!shippingAddress || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin bắt buộc"
      });
    }
    
    // Validate shipping address structure
    console.log("Validating shipping address:", shippingAddress);
    if (!shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.street) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin địa chỉ giao hàng"
      });
    }
    
    // Validate payment method
    const validPaymentMethods = ['cod', 'bank_transfer', 'credit_card'];
    if (!validPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Phương thức thanh toán không hợp lệ"
      });
    }

    // Lấy giỏ hàng của user
    const cart = await Cart.findOne({ userId }).populate('items.productId');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Giỏ hàng trống"
      });
    }

    console.log("Cart items:", cart.items);

    // Validate cart items
    for (let i = 0; i < cart.items.length; i++) {
      const item = cart.items[i];
      console.log(`Validating cart item ${i}:`, {
        productId: item.productId,
        priceAtAdd: item.priceAtAdd,
        quantity: item.quantity,
        selectedColor: item.selectedColor,
        selectedSize: item.selectedSize
      });
      
      if (!item.productId) {
        throw new Error(`Cart item ${i} missing productId`);
      }
      if (!item.priceAtAdd || item.priceAtAdd <= 0) {
        throw new Error(`Cart item ${i} has invalid price: ${item.priceAtAdd}`);
      }
      if (!item.quantity || item.quantity <= 0) {
        throw new Error(`Cart item ${i} has invalid quantity: ${item.quantity}`);
      }
      if (!item.selectedSize) {
        throw new Error(`Cart item ${i} missing selectedSize`);
      }
      if (!item.selectedColor) {
        throw new Error(`Cart item ${i} missing selectedColor`);
      }
    }

    // Tính toán tổng tiền
    let subtotal = 0;
    const orderItems = cart.items.map((item, index) => {
      try {
        console.log(`Processing cart item ${index}:`, item);
        const itemTotal = item.priceAtAdd * item.quantity;
        subtotal += itemTotal;
        
        const orderItem = {
          productId: item.productId._id,
          name: item.productId.name,
          price: item.priceAtAdd,
          quantity: item.quantity,
          selectedColor: item.selectedColor?.name || item.selectedColor,
          selectedSize: item.selectedSize,
          image: item.productId.images?.[0] || null
        };
        
        console.log(`Created order item ${index}:`, orderItem);
        return orderItem;
      } catch (itemError) {
        console.error(`Error processing cart item ${index}:`, itemError);
        console.error("Item data:", item);
        throw itemError;
      }
    });

    // Tính phí ship
    const shippingFee = subtotal >= 500000 ? 0 : 30000;

    // Xử lý voucher nếu có
    let voucherDiscount = 0;
    if (voucherCode) {
      const voucher = await Voucher.findOne({ 
        code: voucherCode, 
        isActive: true 
      });
      
      if (voucher) {
        const currentDate = new Date();
        if (currentDate >= voucher.startDate && currentDate <= voucher.endDate) {
          if (subtotal >= voucher.minOrderAmount) {
            if (voucher.discountType === 'percentage') {
              voucherDiscount = (subtotal * voucher.discountValue) / 100;
            } else if (voucher.discountType === 'fixed') {
              voucherDiscount = voucher.discountValue;
            }
            voucherDiscount = Math.min(voucherDiscount, subtotal);
          }
        }
      }
    }

    const totalAmount = subtotal + shippingFee - voucherDiscount;

    // Validate order data before creating
    console.log("=== ORDER VALIDATION ===");
    console.log("userId:", userId);
    console.log("itemsCount:", orderItems.length);
    console.log("subtotal:", subtotal);
    console.log("shippingFee:", shippingFee);
    console.log("voucherDiscount:", voucherDiscount);
    console.log("totalAmount:", totalAmount);
    console.log("shippingAddress:", shippingAddress);
    console.log("paymentMethod:", paymentMethod);
    
    // Validate required fields
    if (!userId) {
      throw new Error("User ID is required");
    }
    if (!orderItems || orderItems.length === 0) {
      throw new Error("Order items are required");
    }
    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.street) {
      throw new Error("Complete shipping address is required");
    }
    if (!paymentMethod) {
      throw new Error("Payment method is required");
    }
    if (subtotal < 0) {
      throw new Error("Subtotal cannot be negative");
    }
    if (totalAmount < 0) {
      throw new Error("Total amount cannot be negative");
    }

    // Tạo đơn hàng
    console.log("Creating order with validated data...");
    
    const order = new Order({
      userId,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      subtotal,
      shippingFee,
      voucherCode: voucherCode || null,
      voucherDiscount,
      totalAmount,
      notes: notes || ''
    });

    console.log("Order object created, saving to database...");
    try {
      await order.save();
      console.log("Order saved successfully to database:", order._id);
      console.log("Order number:", order.orderNumber);
    } catch (saveError) {
      console.error("Error saving order to database:", saveError);
      throw new Error(`Failed to save order: ${saveError.message}`);
    }

    // Xóa giỏ hàng sau khi tạo đơn hàng thành công
    console.log("Deleting cart for user:", userId);
    try {
      await Cart.findOneAndDelete({ userId });
      console.log("Cart deleted successfully");
    } catch (cartError) {
      console.error("Error deleting cart:", cartError);
      // Don't throw error here as order is already saved
      console.log("Warning: Cart deletion failed but order was saved");
    }

    // Cập nhật số lần sử dụng voucher nếu có
    if (voucherCode && voucherDiscount > 0) {
      console.log("Updating voucher usage for:", voucherCode);
      try {
        await Voucher.findOneAndUpdate(
          { code: voucherCode },
          { $inc: { usedCount: 1 } }
        );
        console.log("Voucher usage updated");
      } catch (voucherError) {
        console.error("Error updating voucher usage:", voucherError);
        // Don't throw error here as order is already saved
        console.log("Warning: Voucher update failed but order was saved");
      }
    }

    res.status(201).json({
      success: true,
      message: "Đặt hàng thành công",
      data: order
    });

  } catch (error) {
    console.error("Create order error:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Lỗi khi tạo đơn hàng",
      error: error.message
    });
  }
};

// Lấy danh sách đơn hàng của user
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    const query = { userId };
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('items.productId', 'name images');

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error("Get user orders error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách đơn hàng",
      error: error.message
    });
  }
};

// Lấy chi tiết đơn hàng
export const getOrderDetail = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({ 
      _id: orderId, 
      userId 
    }).populate('items.productId', 'name images brand');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng"
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error("Get order detail error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy chi tiết đơn hàng",
      error: error.message
    });
  }
};

// Hủy đơn hàng
export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;

    const order = await Order.findOne({ 
      _id: orderId, 
      userId 
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng"
      });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: "Không thể hủy đơn hàng ở trạng thái này"
      });
    }

    order.status = 'cancelled';
    order.cancelledAt = new Date();
    order.cancelReason = reason || 'Khách hàng hủy';

    await order.save();

    res.status(200).json({
      success: true,
      message: "Hủy đơn hàng thành công",
      data: order
    });

  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi hủy đơn hàng",
      error: error.message
    });
  }
};