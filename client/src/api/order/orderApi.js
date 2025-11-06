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

export const submitRefundInfo = async (orderId, payload) => {
  try {
    const response = await api.put(`/orders/${orderId}/refund-info`, payload);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const requestReturn = async (orderId) => {
  try {
    const response = await api.put(`/orders/${orderId}/return-request`);
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

// Admin functions
export const getAllOrdersAdmin = async (params = {}) => {
  try {
    const response = await api.get('/orders/admin/all', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateOrderStatusAdmin = async (orderId, statusData) => {
  try {
    const response = await api.put(`/orders/${orderId}/status`, statusData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getOrderStatistics = async () => {
  try {
    const response = await api.get('/orders/admin/statistics');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getRevenueByMonth = async () => {
  try {
    const response = await api.get('/orders/admin/revenue-by-month');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getOrdersByStatus = async () => {
  try {
    const response = await api.get('/orders/admin/orders-by-status');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const createReplacementOrderAdmin = async (payload) => {
  try {
    const response = await api.post('/orders/admin/replacement', payload);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};