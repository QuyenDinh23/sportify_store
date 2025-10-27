import mongoose from "mongoose";
import Warranty from "../../models/warranty/Warranty.js";
import Order from "../../models/order/Order.js";
import Product from "../../models/product/Product.js";

export const createWarrantyRequest = async (req, res) => {
  try {
    const { orderId, productId, reason, description, attachments, issueDate, contactInfo } = req.body;
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

    const deliveryDate = order.deliveredAt || order.createdAt;
    const warrantyPeriodMonths = product.warrantyPeriod || 12;
    const warrantyExpiryDate = new Date(deliveryDate);
    warrantyExpiryDate.setMonth(warrantyExpiryDate.getMonth() + warrantyPeriodMonths);

    const now = new Date();
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
      reason,
      description,
      attachments,
      issueDate: issueDate ? new Date(issueDate) : new Date(),
      contactInfo,
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

    if (!["approve", "replace", "reject"].includes(action)) {
      return res.status(400).json({ message: "Hành động không hợp lệ. Chọn: approve, replace, hoặc reject" });
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
