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

// Lấy brands theo subcategoryId
export const getBrandsBySubcategory = async (subcategoryId) => {
  try {
    const response = await axiosInstance.get(`/subcategories/${subcategoryId}/brands`);
    return response.data; // trả về mảng brands
  } catch (err) {
    console.error("Lỗi khi gọi API lấy brands theo subcategory:", err);
    throw err;
  }
};

// Gọi API phân trang subcategories
export const fetchSubcategoriesByPage = async (page, limit, search, categoryId) => {
  try {
    const response = await axiosInstance.get("/subcategories/paging", {
      params: { page, limit, search, categoryId }
    });
    return response.data;
  } catch (err) {
    console.error("Lỗi khi lấy subcategories:", err);
    throw err;
  }
};

// Gọi API xóa subcategory theo ID
export const deleteSubcategoryApi = async (id) => {
  try {
    const res = await axiosInstance.delete(`/subcategories/${id}`);
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

// Kiểm tra xem subcategory có đang được sử dụng trong sản phẩm không
export const checkSubcategoryUsageApi = async (id) => {
  try {
    const response = await axiosInstance.get(`/subcategories/check/${id}`);
    return response.data; // { inUse: true/false, message: "..." }
  } catch (err) {
    console.error("Lỗi khi gọi API kiểm tra subcategory:", err);
    throw err.response?.data || err;
  }
};
