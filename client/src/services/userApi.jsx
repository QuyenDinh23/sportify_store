import api from "./axios";
import { store } from "../store/index.jsx";
import { setCredentials } from "../store/authSlice";

export const userApi = {
  updateUserInfo: async (data) => {
    try {
      const res = await api.put("/users/update", data);
      store.dispatch(setCredentials(res.data));
      return res.data;
    } catch (error) {
      console.error("Updated User failed:", error.response.data);
      throw error.response.data.error;
    }
  },
};
