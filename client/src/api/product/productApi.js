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
