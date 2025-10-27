import axiosInstance from "../../lib/axiosInstance";

// Tạo yêu cầu bảo hành mới
export const createWarrantyRequest = async (data) => {
  const response = await axiosInstance.post("/warranty", data);
  return response.data;
};

// Lấy danh sách yêu cầu bảo hành (Admin)
export const getAllWarrantyRequests = async (params) => {
  const response = await axiosInstance.get("/warranty", { params });
  return response.data;
};

// Lấy chi tiết yêu cầu bảo hành
export const getWarrantyRequestById = async (id) => {
  const response = await axiosInstance.get(`/warranty/${id}`);
  return response.data;
};

// Lấy yêu cầu bảo hành của khách hàng
export const getMyWarrantyRequests = async (params) => {
  const response = await axiosInstance.get("/warranty/my-requests", { params });
  return response.data;
};

// Cập nhật trạng thái yêu cầu
export const updateWarrantyStatus = async (id, data) => {
  const response = await axiosInstance.patch(`/warranty/${id}/status`, data);
  return response.data;
};

// Xử lý yêu cầu (accept/reject)
export const processWarrantyRequest = async (id, data) => {
  const response = await axiosInstance.post(`/warranty/${id}/process`, data);
  return response.data;
};

// Xóa yêu cầu bảo hành
export const deleteWarrantyRequest = async (id) => {
  const response = await axiosInstance.delete(`/warranty/${id}`);
  return response.data;
};

// Lấy thống kê
export const getWarrantyStatistics = async () => {
  const response = await axiosInstance.get("/warranty/statistics");
  return response.data;
};
