import Voucher from "../../models/voucher/Voucher.js";

// Lấy danh sách voucher khả dụng
export const getAvailableVouchers = async (req, res) => {
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
};

// Áp dụng voucher
export const applyVoucher = async (req, res) => {
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
};
