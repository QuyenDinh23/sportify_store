import api from "./axios";
import { setCredentials } from "../store/authSlice";

export const userApi = {
  updateUserInfo: async (data, dispatch) => {
    try {
      const res = await api.put("/users/update", data);
      dispatch(setCredentials({ ...res.data }));
      return res.data;
    } catch (error) {
      console.error("Updated User failed:", error.response.data);
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
};
