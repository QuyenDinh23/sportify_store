import api from '../../services/axios';

export const createOrder = async (orderData) => {
  try {
    const response = await api.post('/orders', orderData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getUserOrders = async (params = {}) => {
  try {
    const response = await api.get('/orders', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getOrderDetail = async (orderId) => {
  try {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const cancelOrder = async (orderId, reason) => {
  try {
    const response = await api.put(`/orders/${orderId}/cancel`, { reason });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};