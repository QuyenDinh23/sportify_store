import axiosInstance from "../../lib/axiosInstance";

//tạo product mới
export const createProduct = async (productData) => {
  try {
    const res = await axiosInstance.post("/products", productData);
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

//get danh sách product
export const getProducts = async () => {
  try {
    const res = await axiosInstance.get("/products");
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

// Lấy product theo id
export const getProductById = async (id) => {
  try {
    const res = await axiosInstance.get(`/products/${id}`);
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

// Cập nhật product
export const updateProduct = async (id, productData) => {
  try {
    const res = await axiosInstance.put(`/products/${id}`, productData);
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

// Lấy danh sách sản phẩm theo filter
export const getProductsByFilter = async (params) => {
  try {
    const res = await axiosInstance.get("/products/paging", { params });
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

// Kiểm tra tên sản phẩm đã tồn tại hay chưa
export const checkProductName = async (name, id = null) => {
  try {
    const params = { name };
    if (id) params.id = id;

    const res = await axiosInstance.get("/products/check-name", { params });
    return res.data.exists; // trả về true/false
  } catch (err) {
    console.error("Lỗi check product name:", err);
    throw err.response?.data || err;
  }
};

// API toggle status
export const toggleProductStatusApi = async (id) => {
  try {
    const res = await axiosInstance.patch(`/products/${id}/toggle-status`);
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};