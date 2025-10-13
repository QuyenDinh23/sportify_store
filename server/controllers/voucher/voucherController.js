import Voucher from "../../models/voucher/Voucher.js";

const voucherController = {
  createVoucher: async (req, res) => {
    try {
      const {
        code,
        description,
        discountType,
        discountValue,
        minOrderAmount,
        startDate,
        endDate,
        usageLimit,
        usagePerUser,
        isActive,
      } = req.body;

      // 1️⃣ Kiểm tra dữ liệu bắt buộc
      if (!code || !discountType || !discountValue || !startDate || !endDate) {
        return res.status(400).json({
          message: "Vui lòng nhập đầy đủ thông tin voucher bắt buộc.",
        });
      }

      // 2️⃣ Kiểm tra trùng code
      const existing = await Voucher.findOne({ code });
      if (existing) {
        return res.status(400).json({ message: "Mã voucher này đã tồn tại." });
      }

      // 3️⃣ Kiểm tra loại giảm giá hợp lệ
      if (!["percentage", "fixed"].includes(discountType)) {
        return res.status(400).json({ message: "Loại giảm giá không hợp lệ." });
      }

      // 4️⃣ Kiểm tra giá trị giảm hợp lệ
      if (
        discountType === "percentage" &&
        (discountValue <= 0 || discountValue > 100)
      ) {
        return res.status(400).json({
          message: "Giá trị phần trăm giảm giá phải nằm trong khoảng 1-100.",
        });
      }

      if (discountType === "fixed" && discountValue <= 0) {
        return res
          .status(400)
          .json({ message: "Giá trị giảm giá cố định phải lớn hơn 0." });
      }

      // 5️⃣ Kiểm tra ngày tháng hợp lệ
      if (new Date(startDate) >= new Date(endDate)) {
        return res
          .status(400)
          .json({ message: "Ngày bắt đầu phải nhỏ hơn ngày kết thúc." });
      }

      // 6️⃣ Kiểm tra usage
      if (usageLimit && usageLimit < 0) {
        return res
          .status(400)
          .json({ message: "Giới hạn lượt sử dụng không hợp lệ." });
      }
      if (usagePerUser && usagePerUser < 0) {
        return res
          .status(400)
          .json({ message: "Số lượt sử dụng mỗi người không hợp lệ." });
      }

      // 7️⃣ Tạo mới voucher
      const voucher = new Voucher({
        code,
        description,
        discountType,
        discountValue,
        minOrderAmount,
        startDate,
        endDate,
        usageLimit,
        usagePerUser,
        isActive: isActive ?? true, // Mặc định kích hoạt nếu không nhập
      });
      await voucher.save();
      res.status(201).json({ message: "Tạo voucher thành công", voucher });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  getAllVouchers: async (req, res) => {
    try {
      const vouchers = await Voucher.find().sort({ createdAt: -1 });
      res.status(200).json(vouchers);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getVoucherById: async (req, res) => {
    try {
      const voucher = await Voucher.findById(req.params.id);
      if (!voucher)
        return res.status(404).json({ message: "Không tìm thấy voucher" });
      res.status(200).json(voucher);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  updateVoucher: async (req, res) => {
    try {
      const voucher = await Voucher.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      if (!voucher)
        return res.status(404).json({ message: "Không tìm thấy voucher" });
      res.status(200).json({ message: "Cập nhật voucher thành công", voucher });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  deleteVoucher: async (req, res) => {
    try {
      const voucher = await Voucher.findByIdAndDelete(req.params.id);
      if (!voucher)
        return res.status(404).json({ message: "Không tìm thấy voucher" });
      res.status(200).json({ message: "Xóa voucher thành công" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  deactivateExpiredVouchers: async (req, res) => {
    try {
      const count = await Voucher.deactivateExpiredVouchers();
      res.status(200).json({ message: `Đã hủy ${count} voucher hết hạn` });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Lấy danh sách voucher khả dụng
  getAvailableVouchers: async (req, res) => {
    try {
      const currentDate = new Date();
      
      const vouchers = await Voucher.find({
        isActive: true,
        startDate: { $lte: currentDate },
        endDate: { $gte: currentDate },
        $expr: { $lt: ["$usedCount", "$usageLimit"] }
      }).select('-__v');

      res.status(200).json({
        success: true,
        data: vouchers
      });
    } catch (error) {
      console.error("Get available vouchers error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi lấy danh sách voucher",
        error: error.message
      });
    }
  },

  // Áp dụng voucher
  applyVoucher: async (req, res) => {
    try {
      const { code, orderAmount } = req.body;
      const userId = req.user.id;

      if (!code || !orderAmount) {
        return res.status(400).json({
          success: false,
          message: "Thiếu thông tin mã voucher hoặc số tiền đơn hàng"
        });
      }

      // Tìm voucher
      const voucher = await Voucher.findOne({ code, isActive: true });
      
      if (!voucher) {
        return res.status(404).json({
          success: false,
          message: "Mã voucher không tồn tại hoặc đã hết hạn"
        });
      }

      // Kiểm tra điều kiện
      const currentDate = new Date();
      if (currentDate < voucher.startDate || currentDate > voucher.endDate) {
        return res.status(400).json({
          success: false,
          message: "Mã voucher đã hết hạn"
        });
      }

      if (orderAmount < voucher.minOrderAmount) {
        return res.status(400).json({
          success: false,
          message: `Đơn hàng tối thiểu ${voucher.minOrderAmount.toLocaleString("vi-VN")}đ để sử dụng voucher này`
        });
      }

      if (voucher.usedCount >= voucher.usageLimit) {
        return res.status(400).json({
          success: false,
          message: "Mã voucher đã hết lượt sử dụng"
        });
      }

      // Tính toán giảm giá
      let discountAmount = 0;
      if (voucher.discountType === 'percentage') {
        discountAmount = (orderAmount * voucher.discountValue) / 100;
      } else if (voucher.discountType === 'fixed') {
        discountAmount = voucher.discountValue;
      }

      // Đảm bảo discount không vượt quá order amount
      discountAmount = Math.min(discountAmount, orderAmount);

      res.status(200).json({
        success: true,
        data: {
          voucher: voucher,
          discountAmount: discountAmount,
          finalAmount: orderAmount - discountAmount
        }
      });
    } catch (error) {
      console.error("Apply voucher error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi áp dụng voucher",
        error: error.message
      });
    }
  }
};

export default voucherController;