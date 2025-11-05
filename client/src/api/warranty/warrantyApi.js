import axiosInstance from "../../lib/axiosInstance";

// API Bảo hành
// Các hàm mỏng (thin wrapper) quanh axiosInstance; luôn trả về response.data từ server

// Tạo yêu cầu bảo hành mới
// Body gồm: orderId, productId, reason, description, attachments, issueDate?, contactInfo?
export const createWarrantyRequest = async (data) => {
  const response = await axiosInstance.post("/warranty", data);
  return response.data;
};

// Lấy danh sách yêu cầu bảo hành (Quản trị)
// Hỗ trợ params: status?, reason?, page?, limit?
export const getAllWarrantyRequests = async (params) => {
  const response = await axiosInstance.get("/warranty", { params });
  return response.data;
};

// Lấy chi tiết một yêu cầu bảo hành theo id
export const getWarrantyRequestById = async (id) => {
  const response = await axiosInstance.get(`/warranty/${id}`);
  return response.data;
};

// Lấy danh sách yêu cầu bảo hành của chính người dùng hiện tại
// Hỗ trợ params: status?
export const getMyWarrantyRequests = async (params) => {
  const response = await axiosInstance.get("/warranty/my-requests", { params });
  return response.data;
};

// Cập nhật trạng thái/kết quả (sẽ kích hoạt đồng bộ tồn kho ở phía server)
export const updateWarrantyStatus = async (id, data) => {
  const response = await axiosInstance.patch(`/warranty/${id}/status`, data);
  return response.data;
};

// Thực thi hành động theo máy trạng thái: approve (chấp nhận) / replace (đổi hàng) / reject (từ chối)
export const processWarrantyRequest = async (id, data) => {
  const response = await axiosInstance.post(`/warranty/${id}/process`, data);
  return response.data;
};

// Xóa một yêu cầu bảo hành theo id
export const deleteWarrantyRequest = async (id) => {
  const response = await axiosInstance.delete(`/warranty/${id}`);
  return response.data;
};

// Lấy thống kê tổng hợp theo trạng thái và lý do
export const getWarrantyStatistics = async () => {
  const response = await axiosInstance.get("/warranty/statistics");
  return response.data;
};
