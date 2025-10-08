import api from "./axios";

export const addressApi = {
  getAddress: async () => {
    try {
      const res = await api.get("/address");
      return res.data;
    } catch (error) {
      console.error("Get Address failed:", error.response.data);
      throw error.response.data.error;
    }
  },
  getAddressById: async (id) => {
    try {
      const res = await api.get(`/address/${id}`);
      return res.data;
    } catch (error) {
      console.error("Get Address failed:", error.response.data);
      throw error.response.data.error;
    }
  },
  addAddress: async (data) => {
    try {
      const res = await api.post("/address/add", data);
      return res.data;
    } catch (error) {
      console.error("Add Address failed:", error.response.data);
      throw error.response.data.error;
    }
  },

  deleteAddress: async (id) => {
    try {
      const res = await api.delete("address/delete/" + id);
      return res.data;
    } catch (error) {
      console.error("Delete Address failed:", error.response.data);
      throw error.response.data.error;
    }
  },
  updateAddress: async (id, data) => {
    try {
      const res = await api.put("address/update/" + id, data);
      return res.data;
    } catch (error) {
      console.error("Update Address failed:", error.response.data);
      throw error.response.data.error;
    }
  },
  getProvines: async () => {
    try {
      const response = await fetch("https://provinces.open-api.vn/api/v1/p/");
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Get Provines failed:", error.response.data);
      throw error.response.data.error;
    }
  },
  getDistricts: async () => {
    try {
      const response = await fetch("https://provinces.open-api.vn/api/v1/d/");
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Get Districts failed:", error.response.data);
      throw error.response.data.error;
    }
  },
  getWards: async () => {
    try {
      const response = await fetch("https://provinces.open-api.vn/api/v1/w/");
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Get Wards failed:", error.response.data);
      throw error.response.data.error;
    }
  },
};
