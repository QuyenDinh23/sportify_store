import api from "./axios";
import { setCredentials } from "../store/authSlice";
import { toast } from "../hooks/use-toast";

export const userApi = {
  updateUserInfo: async (data, dispatch) => {
    try {
      const res = await api.put("/users/update", data);
      dispatch(setCredentials({ ...res.data }));
      return res.data;
    } catch (error) {
      console.error("Updated User failed:", error.response.data);
      if (error.response.data.codeName === "DuplicateKey") {
        toast({
          title: "Cập nhật thất bại",
          description: "Email đã tồn tại!",
          variant: "destructive",
        });
      }
      throw error.response.data.error;
    }
  },
  ChangePassword: async (currentPassword, newPassword) => {
    try {
      const res = await api.put("/users/change-password", {
        currentPassword,
        newPassword,
      });
      return res.data;
    } catch (error) {
      console.error("Updated User failed:", error.response.data);
      throw error.response.data.error;
    }
  },
  getAllCustomers: async (params = {}) => {
    try {
      const res = await api.get("/users/all-customers", { params });

      return res.data;
    } catch (error) {
      console.error("Failed to get all customers:", error.response.data);
      throw error.response.data.error;
    }
  },
  getAllStaffs: async (params = {}) => {
    try {
      const res = await api.get("/users/all-staffs", { params });
      return res.data;
    } catch (error) {
      console.error("Failed to get all staffs:", error.response.data);
      throw error.response.data.error;
    }
  },
  checkEmailDuplicate: async (email) => {
    try {
      const res = await api.post("/users/check-email", { email });
      return res.data; // { exists: true/false, message: "..." }
    } catch (error) {
      console.error("Check email failed:", error.response?.data || error);
      throw error.response?.data?.message || "Lỗi khi kiểm tra email";
    }
  },

  // ✅ Tạo tài khoản
  createAccount: async (formData) => {
    try {
      const res = await api.post("/users/create", formData);
      return res.data; // { message, user: {...} }
    } catch (error) {
      console.error("Create account failed:", error.response?.data || error);
      throw error.response?.data?.message || "Lỗi khi tạo tài khoản";
    }
  },
  editAccount: async (id, formData) => {
    try {
      const res = await api.put("/users/edit/" + id, formData);
      return res.data; // { message, user: {...} }
    } catch (error) {
      console.error("Create account failed:", error.response?.data || error);
      throw error.response?.data?.message || "Lỗi khi sửa tài khoản";
    }
  },
  toggleStatusCustomer: async (id) => {
    try {
      const res = await api.put("/users/user-status/" + id, {});
      return res.data;
    } catch (error) {
      console.error("Create account failed:", error.response?.data || error);
      throw error.response?.data?.message || "Lỗi khi sửa tài khoản";
    }
  },
};
