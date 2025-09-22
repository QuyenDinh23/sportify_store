import axiosInstance from "../../lib/axiosInstance";

// Tạo subcategory mới
export const createSubcategory = async (subcategoryData) => {
  try {
    const response = await axiosInstance.post("/subcategories", subcategoryData);
    return response.data;
  } catch (err) {
    console.error("Lỗi khi gọi API tạo subcategory:", err);
    throw err;
  }
};