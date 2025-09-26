import axiosInstance from "../../lib/axiosInstance";

// Tạo sport mới
export const createSport = async (sportData) => {
  try {
    const response = await axiosInstance.post("/sports", sportData);
    return response.data;
  } catch (err) {
    console.error("Lỗi khi gọi API tạo sport:", err);
    throw err;
  }
};

// Lấy danh sách sport
export const getSports = async () => {
  try {
    const response = await axiosInstance.get("/sports");
    return response.data;
  } catch (err) {
    console.error("Lỗi khi gọi API lấy danh sách sport:", err);
    throw err;
  }
};

// Cập nhật sport
export const updateSport = async (id, sportData) => {
  try {
    const response = await axiosInstance.put(`/sports/${id}`, sportData);
    return response.data;
  } catch (err) {
    console.error("Lỗi khi gọi API cập nhật sport:", err);
    throw err;
  }
};
// Gọi API phân trang Sport
export const fetchSportsByPage = async (page, limit, search) => {
  try {
    const response = await axiosInstance.get('/sports/paging', {
      params: { page, limit, search }
    });
    return response.data; // { sports, totalPages }
  } catch (err) {
    console.error("Lỗi khi lấy danh sách sport:", err);
    throw err;
  }
};

// Kiểm tra sport name có tồn tại không
export const checkSportNameExist = async (name, id = null) => {
  try {
    const params = id ? { name, id } : { name };
    const response = await axiosInstance.get("/sports/check-name-exist", { params });
    return response.data.exists;
  } catch (err) {
    console.error("Lỗi khi check sport name:", err);
    throw err;
  }
};


