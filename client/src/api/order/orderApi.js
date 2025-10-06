import axiosInstance from '../../lib/axiosInstance';

// Tạo đơn hàng mới
export const createOrder = async (orderData) => {
  try {
    const response = await axiosInstance.post('/orders', orderData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Lấy danh sách đơn hàng của user
export const getUserOrders = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/orders/my-orders', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Lấy chi tiết đơn hàng
export const getOrderById = async (orderId) => {
  try {
    const response = await axiosInstance.get(`/orders/${orderId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Hủy đơn hàng
export const cancelOrder = async (orderId) => {
  try {
    const response = await axiosInstance.patch(`/orders/${orderId}/cancel`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Lấy tất cả đơn hàng (admin)
export const getAllOrders = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/orders/admin/all', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Cập nhật trạng thái đơn hàng (admin)
export const updateOrderStatus = async (orderId, statusData) => {
  try {
    const response = await axiosInstance.patch(`/orders/admin/${orderId}/status`, statusData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
