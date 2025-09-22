import axiosInstance from "../../lib/axiosInstance";

//Lấy danh sách categories
export const fetchAllCategories = async () => {
  try {
    const response = await axiosInstance.get("/categories");
    return response.data;
  } catch (err) {
    console.error("Lỗi khi gọi API lấy danh sách category:", err);
    throw err;
  }
};
//Lấy category theo id
export const fetchCategoryById = async (id) => {
  try {
    const response = await axiosInstance.get(`/categories/${id}`);
    return response.data;
  } catch (err) {
    console.error(`Lỗi khi gọi API lấy category id=${id}:`, err);
    throw err;
  }
};
// Tạo category mới
export const createCategory = async (categoryData) => {
  try {
    const response = await axiosInstance.post("/categories", categoryData);
    return response.data;
  } catch (err) {
    console.error("Lỗi khi gọi API tạo category:", err);
    throw err;
  }
};
// Tạo category + subcategories
export const createCategoryWithSubcategories = async (data) => {
  try {
    const response = await axiosInstance.post("/categories", data);
    return response.data.category;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

