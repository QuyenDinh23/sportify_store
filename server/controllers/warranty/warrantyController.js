import mongoose from "mongoose";
import Warranty from "../../models/warranty/Warranty.js";
import Order from "../../models/order/Order.js";
import Product from "../../models/product/Product.js";

/**
 * Bộ điều khiển (Controller) Bảo hành
 *
 * Cung cấp các handler cho các nghiệp vụ: tạo, truy vấn, xử lý và cập nhật yêu cầu bảo hành.
 * Phần điều chỉnh tồn kho được xử lý cẩn trọng để đảm bảo số lượng ở cả hai cấp:
 * - Cấp biến thể (colors.sizes.quantity)
 * - Tổng tồn kho của sản phẩm (stockQuantity)
 * luôn nhất quhttps://accounts.google.com/SignOutOptions?hl=vi&continue=https://www.google.com%3Fhl%3Dvi&ec=GBRA8wEán sau mỗi thao tác bảo hành.
 */

/**
 * Tạo yêu cầu bảo hành mới
 * - Xác thực quyền sở hữu đơn hàng, sự tồn tại của sản phẩm và thời hạn bảo hành.
 * - Ngăn trùng lặp yêu cầu ở trạng thái Chờ duyệt/Đang xử lý cho cùng đơn hàng & sản phẩm.
 * - Ghi nhận biến thể đã mua (màu/kích thước) từ đơn gốc để phục vụ xử lý tồn kho về sau.
 */
export const createWarrantyRequest = async (req, res) => {
  try {
    const { orderId, productId, reason, description, attachments, issueDate, contactInfo, bankAccountName, bankAccountNumber, bankName } = req.body;
    const customerId = req.user?.id;

    if (!customerId) {
      return res.status(401).json({ message: "Chưa đăng nhập" });
    }

    if (!orderId || !productId || !reason || !description || !attachments) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }

    if (!Array.isArray(attachments) || attachments.length === 0) {
      return res.status(400).json({ message: "Cần ít nhất 1 file đính kèm" });
    }

    if (!mongoose.Types.ObjectId.isValid(orderId) || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    if (order.userId.toString() !== customerId) {
      return res.status(403).json({ message: "Bạn không có quyền truy cập đơn hàng này" });
    }

    const productInOrder = order.items.find(
      item => item.productId.toString() === productId
    );
    if (!productInOrder) {
      return res.status(400).json({ message: "Sản phẩm không thuộc đơn hàng này" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    // Validate ngày tạo yêu cầu không được quá 7 ngày so với ngày mua đơn hàng
    const orderDate = new Date(order.createdAt);
    orderDate.setHours(0, 0, 0, 0);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const daysDiff = Math.floor((now - orderDate) / (1000 * 60 * 60 * 24));
    if (daysDiff > 7) {
      return res.status(400).json({ 
        message: "Đơn hàng đã quá hạn bảo hành" 
      });
    }

    // Validate ngày phát hiện lỗi không được là ngày trong tương lai
    if (issueDate) {
      const issueDateObj = new Date(issueDate);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // Set to end of today
      if (issueDateObj > today) {
        return res.status(400).json({ 
          message: "Ngày phát hiện lỗi không được là ngày trong tương lai" 
        });
      }
    }

    const deliveryDate = order.deliveredAt || order.createdAt;
    const warrantyPeriodMonths = product.warrantyPeriod || 12;
    const warrantyExpiryDate = new Date(deliveryDate);
    warrantyExpiryDate.setMonth(warrantyExpiryDate.getMonth() + warrantyPeriodMonths);

    if (now > warrantyExpiryDate) {
      return res.status(400).json({ 
        message: `Hết thời hạn bảo hành. Thời hạn bảo hành kết thúc vào ${warrantyExpiryDate.toLocaleDateString('vi-VN')}` 
      });
    }
      
    const existingWarranty = await Warranty.findOne({
      customerId,
      orderId,
      productId,
      status: { $in: ['pending', 'processing'] }
    });

    if (existingWarranty) {
      return res.status(400).json({ 
        message: "Đã có yêu cầu bảo hành đang xử lý cho sản phẩm này trong đơn hàng này" 
      });
    }

    const warrantyRequest = new Warranty({
      customerId,
      orderId,
      productId,
      selectedColor: productInOrder.selectedColor,
      selectedSize: productInOrder.selectedSize,
      reason,
      description,
      attachments,
      issueDate: issueDate ? new Date(issueDate) : new Date(),
      contactInfo,
      bankAccountName: bankAccountName || null,
      bankAccountNumber: bankAccountNumber || null,
      bankName: bankName || null,
      status: "pending",
    });

    const savedRequest = await warrantyRequest.save();
    
    const populatedRequest = await Warranty.findById(savedRequest._id)
      .populate("customerId", "fullName email")
      .populate("orderId", "orderNumber")
      .populate("productId", "name image warrantyPeriod");

    res.status(201).json({
      message: "Gửi yêu cầu bảo hành thành công",
      data: populatedRequest,
    });
  } catch (error) {
    console.error("Error creating warranty request:", error);
    res.status(500).json({ message: "Lỗi server khi tạo yêu cầu bảo hành" });
  }
};

/**
 * Lấy danh sách tất cả yêu cầu bảo hành (phạm vi quản trị)
 * Hỗ trợ lọc theo trạng thái, lý do và phân trang.
 */
export const getAllWarrantyRequests = async (req, res) => {
  try {
    const { status, reason, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (status) query.status = status;
    if (reason) query.reason = reason;

    const total = await Warranty.countDocuments(query);
    
    const requests = await Warranty.find(query)
      .populate({
        path: "customerId",
        select: "fullName email phone",
      })
      .populate("orderId", "orderNumber status")
      .populate("productId", "name image _id")
      .populate("actionBy", "fullName")
      .populate("replacementOrderId", "orderNumber")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      data: requests,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error getting warranty requests:", error);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách yêu cầu" });
  }
};

/**
 * Lấy chi tiết một yêu cầu bảo hành theo id, kèm populate các trường phục vụ UI.
 */
export const getWarrantyRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }

    const warrantyRequest = await Warranty.findById(id)
      .populate({
        path: "customerId",
        select: "fullName email phone",
      })
      .populate("orderId")
      .populate("productId")
      .populate("actionBy", "fullName email")
      .populate("replacementOrderId");

    if (!warrantyRequest) {
      return res.status(404).json({ message: "Không tìm thấy yêu cầu bảo hành" });
    }

    res.json(warrantyRequest);
  } catch (error) {
    console.error("Error getting warranty request by id:", error);
    res.status(500).json({ message: "Lỗi server khi lấy chi tiết yêu cầu" });
  }
};

/**
 * Lấy danh sách yêu cầu bảo hành của người dùng hiện tại, có thể lọc theo trạng thái.
 */
export const getMyWarrantyRequests = async (req, res) => {
  try {
    const customerId = req.user?.id;

    if (!customerId) {
      return res.status(401).json({ message: "Chưa đăng nhập" });
    }

    const { status } = req.query;
    const query = { customerId };
    if (status) query.status = status;

    const requests = await Warranty.find(query)
      .populate("orderId", "orderNumber status createdAt")
      .populate("productId", "name image warrantyPeriod")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error("Error getting my warranty requests:", error);
    res.status(500).json({ message: "Lỗi server khi lấy yêu cầu của bạn" });
  }
};

/**
 * Cập nhật trạng thái bảo hành và (ngầm định) kết quả xử lý
 *
 * Điều chỉnh tồn kho:
 * - Khi chuyển từ Đang xử lý -> Hoàn thành và kết quả hiệu lực là "completed":
 *   hoàn trả số lượng bằng đúng số đã mua đối với biến thể màu/kích thước tương ứng.
 * - Khi kết quả là "replaced":
 *   trừ số lượng hàng lỗi (tối đa bằng tồn hiện tại), và nếu có đơn thay thế
 *   thì cộng số lượng tương ứng theo từng mặt hàng trong đơn thay thế.
 */
export const updateWarrantyStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, result, resolutionNote, adminNote, rejectReason, replacementOrderId } = req.body;
    const adminId = req.user?.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }

    if (!adminId) {
      return res.status(401).json({ message: "Chưa đăng nhập" });
    }

    const warrantyRequest = await Warranty.findById(id);
    if (!warrantyRequest) {
      return res.status(404).json({ message: "Không tìm thấy yêu cầu bảo hành" });
    }

    // Lưu trạng thái cũ để kiểm tra thay đổi
    const oldStatus = warrantyRequest.status;
    const oldResult = warrantyRequest.result;

    if (status) warrantyRequest.status = status;
    if (result) warrantyRequest.result = result;
    if (resolutionNote) warrantyRequest.resolutionNote = resolutionNote;
    if (adminNote) warrantyRequest.adminNote = adminNote;
    if (rejectReason) warrantyRequest.rejectReason = rejectReason;
    if (replacementOrderId) warrantyRequest.replacementOrderId = replacementOrderId;

    if (status === "completed" || status === "rejected") {
      warrantyRequest.resolutionDate = new Date();
      warrantyRequest.responseDate = new Date();
    }

    warrantyRequest.actionBy = adminId;
    warrantyRequest.lastUpdate = new Date();

    // Xử lý cập nhật số lượng sản phẩm
    // Tải sản phẩm để điều chỉnh số lượng ở cấp biến thể và tổng tồn kho
    const product = await Product.findById(warrantyRequest.productId);
    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    // Suy luận kết quả (result) hiệu lực: ưu tiên result mới, nếu không có dùng result hiện tại
    const effectiveResult = result || warrantyRequest.result || null;

    // Nếu chuyển sang trạng thái "completed" mà chưa có result, mặc định gán "completed"
    if (warrantyRequest.status === "completed" && !effectiveResult) {
      warrantyRequest.result = "completed";
    }

    // Chỉ xử lý điều chỉnh tồn kho khi có đầy đủ selectedColor và selectedSize
    if (warrantyRequest.selectedColor && warrantyRequest.selectedSize) {
      // Lấy số lượng đã mua từ đơn hàng gốc (để hoàn/trừ đúng số lượng)
      let originalItemQuantity = 1;
      try {
        const originalOrder = await Order.findById(warrantyRequest.orderId);
        if (originalOrder) {
          const matchedItem = originalOrder.items.find((it) =>
            it.productId.toString() === warrantyRequest.productId.toString() &&
            it.selectedColor === warrantyRequest.selectedColor &&
            it.selectedSize === warrantyRequest.selectedSize
          );
          if (matchedItem && typeof matchedItem.quantity === 'number') {
            originalItemQuantity = matchedItem.quantity;
          }
        }
      } catch (_) {}
      // Tìm biến thể theo màu/kích thước trong product để cập nhật số lượng lồng nhau
      const colorIndex = product.colors.findIndex(c => c.name === warrantyRequest.selectedColor);
      
      if (colorIndex !== -1) {
        const colorObj = product.colors[colorIndex];
        const sizeIndex = colorObj.sizes.findIndex(s => s.size === warrantyRequest.selectedSize);

        if (sizeIndex !== -1) {
          // Trường hợp 1: Từ "processing" -> "completed" với result = "completed"
          // Tăng số lượng sản phẩm (hàng được trả lại kho)
          if (oldStatus === "processing" && status === "completed" && (effectiveResult === "completed" || !result)) {
            // Cập nhật colors.sizes.quantity
            product.colors[colorIndex].sizes[sizeIndex].quantity += originalItemQuantity;
            // Tính lại stockQuantity thủ công
            product.stockQuantity = product.colors.reduce((total, color) => {
              const colorTotal = (color.sizes || []).reduce((sum, s) => sum + (s.quantity || 0), 0);
              return total + colorTotal;
            }, 0);
            // Đánh dấu đã thay đổi để kích hoạt pre-save middleware
            product.markModified('colors');
            await product.save();
            console.log(`Đã tăng số lượng sản phẩm ${product.name} (${warrantyRequest.selectedColor} - ${warrantyRequest.selectedSize}) lên 1. stockQuantity: ${product.stockQuantity}`);
          }
          
          // Trường hợp 2: result = "replaced"
          // Giảm số lượng sản phẩm bị lỗi (nếu trước đó chưa trừ)
          // Đồng thời, nếu có đơn thay thế thì cộng số lượng cho sản phẩm thay thế
          if (effectiveResult === "replaced") {
            // Chỉ giảm nếu chưa được xử lý trước đó (oldResult !== "replaced")
            if (oldResult !== "replaced") {
              if (product.colors[colorIndex].sizes[sizeIndex].quantity > 0) {
                // Cập nhật colors.sizes.quantity
                const currentQty = product.colors[colorIndex].sizes[sizeIndex].quantity;
                const deductQty = Math.min(originalItemQuantity, currentQty);
                product.colors[colorIndex].sizes[sizeIndex].quantity = currentQty - deductQty;
                // Tính lại stockQuantity thủ công
                product.stockQuantity = product.colors.reduce((total, color) => {
                  const colorTotal = (color.sizes || []).reduce((sum, s) => sum + (s.quantity || 0), 0);
                  return total + colorTotal;
                }, 0);
                // Đánh dấu đã thay đổi để kích hoạt pre-save middleware
                product.markModified('colors');
                await product.save();
                console.log(`Đã giảm số lượng sản phẩm bị lỗi ${product.name} (${warrantyRequest.selectedColor} - ${warrantyRequest.selectedSize}) xuống 1. stockQuantity: ${product.stockQuantity}`);
              }

              // Tăng số lượng cho từng sản phẩm trong đơn thay thế nếu có replacementOrderId
              if (replacementOrderId && mongoose.Types.ObjectId.isValid(replacementOrderId)) {
                const replacementOrder = await Order.findById(replacementOrderId);
                if (replacementOrder && Array.isArray(replacementOrder.items)) {
                  // Duyệt từng item trong đơn thay thế và cộng số lượng tương ứng
                  for (const replacementItem of replacementOrder.items) {
                    const replacementProduct = await Product.findById(replacementItem.productId);
                    if (!replacementProduct) continue;

                    const replacementColorIndex = replacementProduct.colors.findIndex(
                      c => c.name === replacementItem.selectedColor
                    );
                    if (replacementColorIndex === -1) continue;

                    const replacementColorObj = replacementProduct.colors[replacementColorIndex];
                    const replacementSizeIndex = replacementColorObj.sizes.findIndex(
                      s => s.size === replacementItem.selectedSize
                    );
                    if (replacementSizeIndex === -1) continue;

                    replacementProduct.colors[replacementColorIndex].sizes[replacementSizeIndex].quantity += (replacementItem.quantity || 1);
                    replacementProduct.stockQuantity = replacementProduct.colors.reduce((total, color) => {
                      const colorTotal = (color.sizes || []).reduce((sum, s) => sum + (s.quantity || 0), 0);
                      return total + colorTotal;
                    }, 0);
                    replacementProduct.markModified('colors');
                    await replacementProduct.save();
                    console.log(`Đã tăng số lượng sản phẩm thay thế ${replacementProduct.name} (${replacementItem.selectedColor} - ${replacementItem.selectedSize}) lên ${replacementItem.quantity || 1}. stockQuantity: ${replacementProduct.stockQuantity}`);
                  }
                }
              }
            }
          }
        }
      }
    }

    const updatedRequest = await warrantyRequest.save();
    
    const populatedRequest = await Warranty.findById(updatedRequest._id)
      .populate("customerId", "fullName email")
      .populate("orderId", "orderNumber")
      .populate("productId", "name image")
      .populate("actionBy", "fullName")
      .populate("replacementOrderId", "orderNumber");

    res.json({
      message: "Cập nhật trạng thái thành công",
      data: populatedRequest,
    });
  } catch (error) {
    console.error("Error updating warranty status:", error);
    res.status(500).json({ message: "Lỗi server khi cập nhật trạng thái" });
  }
};

export const processWarrantyRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, adminNote, rejectReason, replacementOrderId } = req.body;
    const adminId = req.user?.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }

    if (!adminId) {
      return res.status(401).json({ message: "Chưa đăng nhập" });
    }

    if (!["approve", "replace", "reject", "refund"].includes(action)) {
      return res.status(400).json({ message: "Hành động không hợp lệ. Chọn: approve, replace, refund, hoặc reject" });
    }

    const warrantyRequest = await Warranty.findById(id);
    if (!warrantyRequest) {
      return res.status(404).json({ message: "Không tìm thấy yêu cầu bảo hành" });
    }

    if (warrantyRequest.status !== "pending") {
      return res.status(400).json({ 
        message: `Chỉ có thể xử lý yêu cầu ở trạng thái "Chờ duyệt". Yêu cầu hiện tại: ${warrantyRequest.status}` 
      });
    }

    if (action === "reject" && !rejectReason) {
      return res.status(400).json({ message: "Bắt buộc nhập lý do từ chối" });
    }

    if (action === "replace" && !replacementOrderId) {
      return res.status(400).json({ message: "Bắt buộc nhập mã đơn hàng thay thế" });
    }

    if (action === "replace" && replacementOrderId) {
      if (!mongoose.Types.ObjectId.isValid(replacementOrderId)) {
        return res.status(400).json({ message: "Mã đơn hàng thay thế không hợp lệ" });
      }
      const replacementOrder = await Order.findById(replacementOrderId);
      if (!replacementOrder) {
        return res.status(400).json({ message: "Mã đơn hàng thay thế không tồn tại" });
      }
    }

    if (action === "approve") {
      warrantyRequest.status = "processing";
      warrantyRequest.result = "completed";
    } else if (action === "replace") {
      warrantyRequest.status = "completed";
      warrantyRequest.result = "replaced";
      warrantyRequest.replacementOrderId = replacementOrderId;
      warrantyRequest.resolutionDate = new Date();
      warrantyRequest.resolutionNote = `Đổi sản phẩm mới. Mã đơn hàng thay thế: ${replacementOrderId}`;
    } else if (action === "refund") {
      warrantyRequest.status = "completed";
      warrantyRequest.result = "refunded";
      warrantyRequest.resolutionDate = new Date();
      warrantyRequest.resolutionNote = `Hoàn tiền cho khách hàng`;
    } else if (action === "reject") { 
      warrantyRequest.status = "rejected";
      warrantyRequest.result = "rejected";
      warrantyRequest.rejectReason = rejectReason;
      warrantyRequest.resolutionDate = new Date();
    }

    if (adminNote) warrantyRequest.adminNote = adminNote;
    warrantyRequest.actionBy = adminId;
    warrantyRequest.lastUpdate = new Date();
    warrantyRequest.responseDate = new Date();

    await warrantyRequest.save();
    
    const populatedRequest = await Warranty.findById(id)
      .populate({
        path: "customerId",
        select: "fullName email phone",
      })
      .populate("orderId", "orderNumber")
      .populate("productId", "name image")
      .populate("actionBy", "fullName")
      .populate("replacementOrderId", "orderNumber");

    const actionMessages = {
      approve: "đã được chấp nhận",
      replace: "đã được đổi sản phẩm mới",
      refund: "đã được hoàn tiền",
      reject: "đã bị từ chối",
    };

    res.json({
      message: `Yêu cầu ${actionMessages[action]}`,
      data: populatedRequest,
    });
  } catch (error) {
    console.error("Error processing warranty request:", error);
    res.status(500).json({ message: "Lỗi server khi xử lý yêu cầu" });
  }
};

export const deleteWarrantyRequest = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }

    const warrantyRequest = await Warranty.findByIdAndDelete(id);

    if (!warrantyRequest) {
      return res.status(404).json({ message: "Không tìm thấy yêu cầu bảo hành" });
    }

    res.json({ message: "Xóa yêu cầu bảo hành thành công" });
  } catch (error) {
    console.error("Error deleting warranty request:", error);
    res.status(500).json({ message: "Lỗi server khi xóa yêu cầu" });
  }
};

export const getWarrantyStatistics = async (req, res) => {
  try {
    const stats = await Warranty.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const total = await Warranty.countDocuments();
    
    const statsByReason = await Warranty.aggregate([
      {
        $group: {
          _id: "$reason",
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      total,
      byStatus: stats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      byReason: statsByReason.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
    });
  } catch (error) {
    console.error("Error getting warranty statistics:", error);
    res.status(500).json({ message: "Lỗi server khi lấy thống kê" });
  }
};
