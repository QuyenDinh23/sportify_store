// controllers/voucherController.js

import Voucher from "../../models/voucher/voucher.js";

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
};
export default voucherController;
