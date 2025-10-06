import axiosInstance from '../../lib/axiosInstance';

// Lấy giỏ hàng của user
export const getCart = async () => {
  try {
    const response = await axiosInstance.get('/cart');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Thêm sản phẩm vào giỏ hàng
export const addToCart = async (cartData) => {
  try {
    const response = await axiosInstance.post('/cart', cartData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Cập nhật số lượng sản phẩm trong giỏ hàng
export const updateCartItem = async (itemId, quantity) => {
  try {
    const response = await axiosInstance.put('/cart/item', {
      itemId,
      quantity
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Xóa sản phẩm khỏi giỏ hàng
export const removeFromCart = async (itemId) => {
  try {
    const response = await axiosInstance.delete(`/cart/item/${itemId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Xóa toàn bộ giỏ hàng
export const clearCart = async () => {
  try {
    const response = await axiosInstance.delete('/cart');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
