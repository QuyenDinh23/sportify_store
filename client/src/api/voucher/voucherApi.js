import api from '../../services/axios';

// Lấy danh sách voucher có thể sử dụng
export const getAvailableVouchers = async () => {
  try {
    const response = await api.get('/vouchers/available');
    console.log('Voucher API response:', response.data);
    // API trả về {success: true, data: [...]}
    return response.data.data || response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Áp dụng voucher
export const applyVoucher = async (voucherCode, orderAmount) => {
  try {
    const response = await api.post('/vouchers/apply', {
      code: voucherCode,
      orderAmount: orderAmount
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
