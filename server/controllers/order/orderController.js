import Order from '../../models/order/Order.js';
import Cart from '../../models/cart/Cart.js';
import Product from '../../models/product/Product.js';

// Tạo đơn hàng mới
const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { shippingAddress, paymentMethod, notes } = req.body;

    // Lấy giỏ hàng của user
    const cart = await Cart.findOne({ userId: userId }).populate({
      path: 'items.productId',
      populate: {
        path: 'brand',
        model: 'Brand'
      }
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Giỏ hàng trống'
      });
    }

    // Kiểm tra tồn kho và cập nhật giá
    const orderItems = [];
    for (const cartItem of cart.items) {
      const product = cartItem.productId;
      
      // Kiểm tra tồn kho
      if (cartItem.quantity > product.stockQuantity) {
        return res.status(400).json({
          success: false,
          message: `Sản phẩm "${product.name}" chỉ còn ${product.stockQuantity} sản phẩm trong kho`
        });
      }

      // Tính giá hiện tại (có thể khác với lúc thêm vào giỏ)
      const currentPrice = product.discountPercentage > 0 
        ? product.price * (1 - product.discountPercentage / 100)
        : product.price;

      orderItems.push({
        productId: product._id,
        name: product.name,
        selectedColor: cartItem.selectedColor,
        selectedSize: cartItem.selectedSize,
        quantity: cartItem.quantity,
        priceAtOrder: currentPrice,
        subtotal: currentPrice * cartItem.quantity,
        images: cartItem.images
      });
    }

    // Tính tổng tiền
    const subtotal = orderItems.reduce((total, item) => total + item.subtotal, 0);
    const shippingFee = subtotal >= 500000 ? 0 : 30000; // Miễn phí ship từ 500k
    const totalAmount = subtotal + shippingFee;

    // Tạo đơn hàng
    const order = new Order({
      userId: userId,
      items: orderItems,
      totalQuantity: cart.totalQuantity,
      subtotal: subtotal,
      shippingFee: shippingFee,
      totalAmount: totalAmount,
      paymentMethod: paymentMethod || 'cod',
      shippingAddress: shippingAddress,
      notes: notes || '',
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 ngày
    });

    await order.save();

    // Cập nhật tồn kho sản phẩm
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stockQuantity: -item.quantity } }
      );
    }

    // Xóa giỏ hàng sau khi tạo đơn hàng thành công
    await Cart.findOneAndDelete({ userId: userId });

    // Populate để trả về đầy đủ thông tin
    await order.populate({
      path: 'items.productId',
      populate: {
        path: 'brand',
        model: 'Brand'
      }
    });

    res.status(201).json({
      success: true,
      message: 'Đặt hàng thành công',
      data: order
    });

  } catch (error) {
    console.error("Create Order Error:", error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo đơn hàng',
      error: error.message
    });
  }
};

// Lấy danh sách đơn hàng của user
const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    const query = { userId: userId };
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate({
        path: 'items.productId',
        populate: {
          path: 'brand',
          model: 'Brand'
        }
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        orders,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      }
    });

  } catch (error) {
    console.error("Get User Orders Error:", error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách đơn hàng',
      error: error.message
    });
  }
};

// Lấy chi tiết đơn hàng
const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({ _id: orderId, userId: userId })
      .populate({
        path: 'items.productId',
        populate: {
          path: 'brand',
          model: 'Brand'
        }
      });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error("Get Order Error:", error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin đơn hàng',
      error: error.message
    });
  }
};

// Hủy đơn hàng
const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({ _id: orderId, userId: userId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Chỉ có thể hủy đơn hàng đang chờ xử lý'
      });
    }

    // Cập nhật trạng thái đơn hàng
    order.status = 'cancelled';
    order.paymentStatus = 'refunded';
    await order.save();

    // Hoàn trả tồn kho
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stockQuantity: item.quantity } }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Hủy đơn hàng thành công',
      data: order
    });

  } catch (error) {
    console.error("Cancel Order Error:", error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi hủy đơn hàng',
      error: error.message
    });
  }
};

// Lấy tất cả đơn hàng (admin)
const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, paymentStatus } = req.query;

    const query = {};
    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const orders = await Order.find(query)
      .populate('userId', 'name email phone')
      .populate({
        path: 'items.productId',
        populate: {
          path: 'brand',
          model: 'Brand'
        }
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        orders,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      }
    });

  } catch (error) {
    console.error("Get All Orders Error:", error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách đơn hàng',
      error: error.message
    });
  }
};

// Cập nhật trạng thái đơn hàng (admin)
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, trackingNumber } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    order.status = status;
    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Cập nhật trạng thái đơn hàng thành công',
      data: order
    });

  } catch (error) {
    console.error("Update Order Status Error:", error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật trạng thái đơn hàng',
      error: error.message
    });
  }
};

export {
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus
};
