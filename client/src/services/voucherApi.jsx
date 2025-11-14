import api from "./axios";
import { toast } from "../hooks/use-toast";

export const voucherApi = {
  getAll: async (data) => {
    try {
      const res = await api.get("/vouchers", data);
      return res.data;
    } catch (error) {
      console.error("Updated User failed:", error.response.data);
      throw error.response.data.error;
    }
  },
  getByPage: async (page, limit, search) => {
    try {
      const res = await api.get("/vouchers/paging", {
        params: { page, limit, search },
      });
      return res.data;
    } catch (error) {
      console.error("Get vouchers by page failed:", error.response.data);
      throw error.response.data.error;
    }
  },
  getById: async (id) => {
    try {
      const res = await api.get(`/vouchers/${id}`);
      return res.data;
    } catch (error) {
      console.error("Updated User failed:", error.response.data);
      throw error.response.data.error;
    }
  },
  create: async (data) => {
    try {
      const res = await api.post(`/vouchers`, data);
      return res.data;
    } catch (error) {
      toast({
        title: "Tạo voucher thất bại",
        description: error.response.data.message || "",
        variant: "destructive",
      });
      console.error("Updated User failed:", error.response.data);
      throw error.response.data.error;
    }
  },
  update: async (id, data) => {
    try {
      const res = await api.put(`/vouchers/${id}`, data);
      return res.data;
    } catch (error) {
      console.error("Updated User failed:", error.response.data);
      throw error.response.data.error;
    }
  },
  delete: async (id) => {
    try {
      const res = await api.delete(`/vouchers/${id}`);
      return res.data;
    } catch (error) {
      console.error("Updated User failed:", error.response.data);
      throw error.response.data.error;
    }
  },
  getByCode: async (code) => {
    try {
      const res = await api.get(`/vouchers/code/${code}`);
      return res.data;
    } catch (error) {
      if (error.response?.status === 404) {
        // Không tìm thấy voucher -> return null để tạo mới
        return null;
      }
      console.error("Get voucher by code failed:", error.response.data);
      throw error.response.data.error;
    }
  },
  deactivateExpiredVouchers: async () => {
    try {
      const res = await api.post(`/vouchers/deactivate-expired`);
      toast({
        title: "Đã vô hiệu hóa tất cả voucher hết hạn",
        variant: "default",
      });
      return res.data;
    } catch (error) {
      console.error("Updated User failed:", error.response.data);
      throw error.response.data.error;
    }
  },
};
