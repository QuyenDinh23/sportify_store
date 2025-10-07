import api from "./axios";

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
  //   toggleStatus: async (data) => {
  //     try {
  //       const res = await api.put(`/vouchers/${id}`);
  //       return res.data;
  //     } catch (error) {
  //       console.error("Updated User failed:", error.response.data);
  //       throw error.response.data.error;
  //     }
  //   },
};
