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

// Lấy danh sách subcategory
export const getSubcategories = async () => {
  try {
    const response = await axiosInstance.get("/subcategories");
    return response.data;
  } catch (err) {
    console.error("Lỗi khi gọi API lấy danh sách subcategory:", err);
    throw err;
  }
};

// Cập nhật subcategory (bao gồm gán brands)
export const updateSubcategory = async (id, subcategoryData) => {
  try {
    const response = await axiosInstance.put(`/subcategories/${id}`, subcategoryData);
    return response.data;
  } catch (err) {
    console.error("Lỗi khi gọi API cập nhật subcategory:", err);
    throw err;
  }
};