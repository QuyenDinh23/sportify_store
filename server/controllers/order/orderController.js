import Order from "../../models/order/Order.js";
import Cart from "../../models/cart/Cart.js";
import Voucher from "../../models/voucher/Voucher.js";
import Product from "../../models/product/Product.js";
import { createPaymentUrl, verifySecureHash, VNPAY_RETURN_URL, VNPAY_IPN_URL } from "../../utils/vnpay.js";

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
    const { shippingAddress, paymentMethod, notes, voucherCode, selectedItemIds } = req.body;

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
    const validPaymentMethods = ['cod', 'bank_transfer', 'credit_card', 'vnpay'];
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

    // Filter cart items nếu có selectedItemIds (chỉ lấy những items được chọn)
    let cartItems = cart.items;
    if (selectedItemIds && Array.isArray(selectedItemIds) && selectedItemIds.length > 0) {
      cartItems = cart.items.filter(item => 
        selectedItemIds.some(id => id.toString() === item._id.toString())
      );
      
      if (cartItems.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Không có sản phẩm nào được chọn"
        });
      }
      
      console.log(`Filtering cart items: ${cart.items.length} total, ${cartItems.length} selected`);
    }

    console.log("Cart items:", cartItems);

    // Validate cart items
    for (let i = 0; i < cartItems.length; i++) {
      const item = cartItems[i];
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
    const orderItems = cartItems.map((item, index) => {
      try {
        console.log(`Processing cart item ${index}:`, item);
        const itemTotal = item.priceAtAdd * item.quantity;
        subtotal += itemTotal;
        
        // Get product data
        const product = item.productId;
        
        // Get color name (could be string or object)
        let colorName = item.selectedColor;
        if (typeof item.selectedColor === 'object' && item.selectedColor.name) {
          colorName = item.selectedColor.name;
        }
        
        // Find the selected color in product colors to get its images
        let productImage = product.image || null; // fallback to main image
        
        if (product.colors && product.colors.length > 0 && colorName) {
          // Try to find the selected color and get its first image
          const selectedColorObj = product.colors.find(c => 
            c.name === colorName || c.name === item.selectedColor
          );
          
          if (selectedColorObj && selectedColorObj.images && selectedColorObj.images.length > 0) {
            productImage = selectedColorObj.images[0];
          }
        }
        
        const orderItem = {
          productId: product._id,
          name: product.name,
          price: item.priceAtAdd,
          quantity: item.quantity,
          selectedColor: colorName,
          selectedSize: item.selectedSize,
          image: productImage
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

    // Kiểm tra số lượng sản phẩm trước khi tạo đơn hàng
    console.log("Checking product quantities before creating order...");
    for (let i = 0; i < cartItems.length; i++) {
      const item = cartItems[i];
      const product = item.productId;
      
      // Get color name (could be string or object)
      let colorName = item.selectedColor;
      if (typeof item.selectedColor === 'object' && item.selectedColor.name) {
        colorName = item.selectedColor.name;
      }
      
      const selectedSize = item.selectedSize;
      const orderedQuantity = item.quantity;
      
      // Tìm product trong database (cần lấy bản mới nhất)
      const productDoc = await Product.findById(product._id);
      if (!productDoc) {
        throw new Error(`Sản phẩm không tồn tại: ${product.name}`);
      }
      
      // Tìm màu tương ứng
      const colorIndex = productDoc.colors.findIndex(
        c => c.name === colorName
      );
      
      if (colorIndex === -1) {
        throw new Error(`Màu ${colorName} không tồn tại trong sản phẩm ${product.name}`);
      }
      
      // Tìm size tương ứng trong màu đó
      const sizeIndex = productDoc.colors[colorIndex].sizes.findIndex(
        s => s.size === selectedSize
      );
      
      if (sizeIndex === -1) {
        throw new Error(`Size ${selectedSize} không tồn tại trong màu ${colorName} của sản phẩm ${product.name}`);
      }
      
      // Kiểm tra số lượng có đủ không
      const currentQuantity = productDoc.colors[colorIndex].sizes[sizeIndex].quantity;
      if (currentQuantity < orderedQuantity) {
        throw new Error(`Không đủ số lượng sản phẩm: ${product.name} - ${colorName} - ${selectedSize}. Còn lại: ${currentQuantity}, bạn đặt: ${orderedQuantity}`);
      }
    }
    console.log("All product quantities are sufficient");

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

    // Trừ số lượng sản phẩm theo size sau khi đơn hàng được tạo thành công
    console.log("Deducting product quantities...");
    try {
      for (let i = 0; i < cartItems.length; i++) {
        const item = cartItems[i];
        const product = item.productId;
        
        // Get color name (could be string or object)
        let colorName = item.selectedColor;
        if (typeof item.selectedColor === 'object' && item.selectedColor.name) {
          colorName = item.selectedColor.name;
        }
        
        const selectedSize = item.selectedSize;
        const orderedQuantity = item.quantity;
        
        console.log(`Processing product ${i}:`, {
          productId: product._id,
          productName: product.name,
          colorName,
          selectedSize,
          orderedQuantity
        });
        
        // Tìm product trong database (cần lấy bản mới nhất)
        const productDoc = await Product.findById(product._id);
        if (!productDoc) {
          console.error(`Product ${product._id} not found`);
          continue;
        }
        
        // Tìm màu tương ứng
        const colorIndex = productDoc.colors.findIndex(
          c => c.name === colorName
        );
        
        if (colorIndex === -1) {
          console.error(`Color ${colorName} not found in product ${product._id}`);
          continue;
        }
        
        // Tìm size tương ứng trong màu đó
        const sizeIndex = productDoc.colors[colorIndex].sizes.findIndex(
          s => s.size === selectedSize
        );
        
        if (sizeIndex === -1) {
          console.error(`Size ${selectedSize} not found in color ${colorName} of product ${product._id}`);
          continue;
        }
        
        // Kiểm tra số lượng có đủ không
        const currentQuantity = productDoc.colors[colorIndex].sizes[sizeIndex].quantity;
        if (currentQuantity < orderedQuantity) {
          console.error(`Insufficient quantity for product ${product._id}, color ${colorName}, size ${selectedSize}. Available: ${currentQuantity}, Ordered: ${orderedQuantity}`);
          // Có thể throw error hoặc chỉ log warning tùy theo yêu cầu
          // Ở đây tôi sẽ throw error để đảm bảo tính toàn vẹn dữ liệu
          throw new Error(`Không đủ số lượng sản phẩm: ${product.name} - ${colorName} - ${selectedSize}. Còn lại: ${currentQuantity}`);
        }
        
        // Trừ số lượng
        productDoc.colors[colorIndex].sizes[sizeIndex].quantity -= orderedQuantity;
        
        // Lưu product (middleware pre-save sẽ tự động cập nhật stockQuantity)
        await productDoc.save();
        
        console.log(`Successfully deducted ${orderedQuantity} from product ${product._id}, color ${colorName}, size ${selectedSize}. Remaining: ${productDoc.colors[colorIndex].sizes[sizeIndex].quantity}`);
      }
      console.log("All product quantities deducted successfully");
    } catch (quantityError) {
      console.error("Error deducting product quantities:", quantityError);
      // Nếu có lỗi trừ số lượng, có thể rollback order hoặc chỉ log warning
      // Ở đây tôi sẽ throw error để đảm bảo tính toàn vẹn
      throw new Error(`Lỗi khi trừ số lượng sản phẩm: ${quantityError.message}`);
    }

    // Xóa các sản phẩm đã đặt khỏi giỏ hàng (chỉ xóa những items được chọn)
    console.log("Removing ordered items from cart for user:", userId);
    try {
      if (selectedItemIds && Array.isArray(selectedItemIds) && selectedItemIds.length > 0) {
        // Lấy lại cart để có bản mới nhất
        const updatedCart = await Cart.findOne({ userId });
        if (updatedCart) {
          // Filter ra những items không được chọn
          updatedCart.items = updatedCart.items.filter(item => 
            !selectedItemIds.some(id => id.toString() === item._id.toString())
          );
          await updatedCart.save();
          console.log(`Removed ${selectedItemIds.length} ordered items from cart. Remaining: ${updatedCart.items.length}`);
          
          // Nếu cart trống sau khi xóa, có thể xóa cart hoặc để lại (tùy logic)
          if (updatedCart.items.length === 0) {
            console.log("Cart is now empty");
          }
        }
      } else {
        // Nếu không có selectedItemIds, xóa toàn bộ giỏ hàng (backward compatibility)
        await Cart.findOneAndDelete({ userId });
        console.log("Cart deleted successfully");
      }
    } catch (cartError) {
      console.error("Error removing items from cart:", cartError);
      // Don't throw error here as order is already saved
      console.log("Warning: Cart update failed but order was saved");
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

    // Nếu là VNPay, tạo payment URL
    let paymentUrl = null;
    if (paymentMethod === 'vnpay') {
      try {
        // Lấy IP client
        const clientIp = req.headers['x-forwarded-for'] || 
                        req.connection.remoteAddress || 
                        req.socket.remoteAddress ||
                        (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
                        '127.0.0.1';
        
        // Tạo payment URL
        paymentUrl = createPaymentUrl({
          orderId: order.orderNumber,
          amount: totalAmount,
          orderDescription: `Thanh toan don hang ${order.orderNumber}`,
          orderType: 'other',
          locale: 'vn',
          ipAddr: Array.isArray(clientIp) ? clientIp[0] : clientIp.split(',')[0].trim()
        });
        
        console.log("VNPay payment URL created for order:", order.orderNumber);
        console.log("Payment URL:", paymentUrl);
      } catch (vnpayError) {
        console.error("Error creating VNPay URL:", vnpayError);
        throw new Error(`Lỗi khi tạo URL thanh toán VNPay: ${vnpayError.message}`);
      }
    }

    const responseData = {
      ...order.toObject(),
      ...(paymentUrl && { paymentUrl })
    };

    res.status(201).json({
      success: true,
      message: paymentMethod === 'vnpay' ? "Vui lòng thanh toán qua VNPay" : "Đặt hàng thành công",
      data: responseData
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

// Lấy tất cả đơn hàng (Admin)
export const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;

    const query = {};
    
    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    // Search by order number or customer name
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'shippingAddress.fullName': { $regex: search, $options: 'i' } }
      ];
    }

    const orders = await Order.find(query)
      .populate('userId', 'fullName email phone')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

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
    console.error("Get all orders error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách đơn hàng",
      error: error.message
    });
  }
};

// Cập nhật trạng thái đơn hàng (Admin)
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, trackingNumber, estimatedDelivery } = req.body;

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái không hợp lệ"
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng"
      });
    }

    order.status = status;
    
    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }
    
    if (estimatedDelivery) {
      order.estimatedDelivery = new Date(estimatedDelivery);
    }

    if (status === 'delivered' && !order.deliveredAt) {
      order.deliveredAt = new Date();
    }

    if (status === 'cancelled' && !order.cancelledAt) {
      order.cancelledAt = new Date();
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái đơn hàng thành công",
      data: order
    });

  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật trạng thái đơn hàng",
      error: error.message
    });
  }
};

// Xử lý IPN (Instant Payment Notification) từ VNPay
// Đây là nơi VNPay gọi để cập nhật trạng thái thanh toán (Server-to-Server)
// Phải trả về JSON với RspCode và Message
export const vnpayIPN = async (req, res) => {
  try {
    const vnp_Params = req.query;
    let returnData = {};
    
    const secureHash = vnp_Params['vnp_SecureHash'];
    const orderNumber = vnp_Params['vnp_TxnRef'];
    const responseCode = vnp_Params['vnp_ResponseCode'];
    const transactionStatus = vnp_Params['vnp_TransactionStatus'];
    const amount = parseInt(vnp_Params['vnp_Amount']) / 100; // VNPay trả về số tiền * 100

    // Kiểm tra chữ ký trước tiên (QUAN TRỌNG!)
    const isValidSignature = verifySecureHash(vnp_Params);
    
    if (!isValidSignature) {
      returnData['RspCode'] = '97';
      returnData['Message'] = 'Checksum failed';
      return res.status(200).json(returnData);
    }

    // Tìm đơn hàng trong database
    const order = await Order.findOne({ orderNumber });
    
    if (!order) {
      returnData['RspCode'] = '01';
      returnData['Message'] = 'Order not found';
      return res.status(200).json(returnData);
    }

    // Kiểm tra số tiền
    if (amount !== order.totalAmount) {
      returnData['RspCode'] = '04';
      returnData['Message'] = 'Amount invalid';
      return res.status(200).json(returnData);
    }

    // Kiểm tra trạng thái hiện tại của đơn hàng
    // Tránh cập nhật nhiều lần (idempotency)
    if (order.status === 'confirmed' || order.status === 'cancelled') {
      returnData['RspCode'] = '02';
      returnData['Message'] = 'Order already confirmed';
      return res.status(200).json(returnData);
    }

    // Chỉ cập nhật nếu đơn hàng đang ở trạng thái pending
    if (order.status === 'pending') {
      if (responseCode === '00' && transactionStatus === '00') {
        // Thanh toán thành công
        order.status = 'confirmed';
        await order.save();
        
        console.log(`VNPay IPN: Payment successful for order ${orderNumber}`);
        
        returnData['RspCode'] = '00';
        returnData['Message'] = 'Confirm Success';
      } else {
        // Thanh toán thất bại
        // Có thể giữ nguyên status pending hoặc đánh dấu failed
        // Tùy vào business logic của bạn
        console.log(`VNPay IPN: Payment failed for order ${orderNumber}. ResponseCode: ${responseCode}`);
        
        returnData['RspCode'] = '00';
        returnData['Message'] = 'Confirm Success'; // Vẫn trả về 00 để VNPay biết đã nhận được
      }
    }

    return res.status(200).json(returnData);

  } catch (error) {
    console.error("VNPay IPN error:", error);
    const returnData = {
      'RspCode': '99',
      'Message': 'Unknow error'
    };
    return res.status(200).json(returnData);
  }
};

// Xử lý Return URL từ VNPay
// Đây là nơi browser redirect về sau khi thanh toán (Browser redirect)
// Chỉ kiểm tra và hiển thị kết quả, KHÔNG cập nhật database
export const vnpayReturn = async (req, res) => {
  try {
    const vnp_Params = req.query;
    
    // Kiểm tra chữ ký để đảm bảo an toàn
    const isValidSignature = verifySecureHash(vnp_Params);
    
    if (!isValidSignature) {
      console.error("VNPay Return: Invalid signature");
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/vnpay-failure?error=invalid_signature`);
    }

    const orderNumber = vnp_Params['vnp_TxnRef'];
    const responseCode = vnp_Params['vnp_ResponseCode'];
    const transactionStatus = vnp_Params['vnp_TransactionStatus'];

    // Tìm đơn hàng để lấy orderId
    const order = await Order.findOne({ orderNumber });
    
    if (!order) {
      console.error("VNPay Return: Order not found:", orderNumber);
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/vnpay-failure?error=order_not_found`);
    }

    // Kiểm tra kết quả thanh toán
    if (responseCode === '00' && transactionStatus === '00') {
      // Thanh toán thành công
      console.log(`VNPay Return: Payment successful for order ${orderNumber}`);
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/order-detail/${order._id}?payment=success`);
    } else {
      // Thanh toán thất bại
      console.log(`VNPay Return: Payment failed for order ${orderNumber}. ResponseCode: ${responseCode}`);
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/order-detail/${order._id}?payment=failed&error=${responseCode}`);
    }

  } catch (error) {
    console.error("VNPay Return error:", error);
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/vnpay-failure?error=system_error`);
  }
};