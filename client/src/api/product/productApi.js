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