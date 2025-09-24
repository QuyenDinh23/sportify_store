import axiosInstance from "../../lib/axiosInstance";

// Tạo brand mới
export const createBrand = async (brandData) => {
  try {
    const response = await axiosInstance.post("/brands", brandData);
    return response.data;
  } catch (err) {
    console.error("Lỗi khi gọi API tạo brand:", err);
    throw err;
  }
};

// Lấy danh sách brand
export const getBrands = async () => {
  try {
    const response = await axiosInstance.get("/brands");
    return response.data;
  } catch (err) {
    console.error("Lỗi khi gọi API lấy danh sách brand:", err);
    throw err;
  }
};

// Cập nhật brand
export const updateBrand = async (id, brandData) => {
  try {
    const response = await axiosInstance.put(`/brands/${id}`, brandData);
    return response.data;
  } catch (err) {
    console.error("Lỗi khi gọi API cập nhật brand:", err);
    throw err;
  }
};

// Gọi API phân trang
export const fetchBrandsByPage = async (page, limit, search) => {
  try {
    const response = await axiosInstance.get('/brands/paging', {
      params: { page, limit, search }
    });
    return response.data; // { brands, totalPages }
  } catch (err) {
    console.error("Lỗi khi lấy danh sách brand:", err);
    throw err;
  }
};

// Kiểm tra brand name có tồn tại không
export const checkBrandNameExist = async (name, id = null) => {
  try {
    const params = id ? { name, id } : { name };
    const response = await axiosInstance.get("/brands/check-name-exist", {params});
    return response.data.exists; 
  } catch (err) {
    console.error("Lỗi khi check brand name:", err);
    throw err;
  }
};