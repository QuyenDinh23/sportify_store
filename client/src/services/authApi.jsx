// api/authApi.js
import api from "./axios";
import { store } from "../store/index.jsx";
import { logout, setCredentials, setToken } from "../store/authSlice";
import { toast } from "../hooks/use-toast.jsx";
import axios from "axios";

export const authApi = {
  register: async (fullName, email, password) => {
    try {
      const res = await api.post("/auth/register", {
        fullName,
        email,
        password,
      });
      return res.data;
    } catch (err) {
      // err.response chứa response từ server (nếu server trả lỗi 4xx/5xx)
      if (err.response) {
        toast({
          title: "Đăng ký thất bại",
          description: err.response.data,
          variant: "destructive",
        });
        console.error("Server error:", err.response.data);
        throw new Error(err.response.data.error || "Registration failed");
      } else if (err.request) {
        console.error("No response from server:", err.request);
        throw new Error("No response from server");
      } else {
        console.error("Error", err.message);
        throw new Error(err.message);
      }
    }
  },
  login: async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      store.dispatch(setToken(res.data));
      return res.data;
    } catch (err) {
      // err.response chứa response từ server (nếu server trả lỗi 4xx/5xx)
      if (err.response) {
        toast({
          title: "Đăng nhập thất bại",
          description: err.response.data,
          variant: "destructive",
        });
        console.error("Server error:", err.response.data);
        throw new Error(err.response.data.error || "Login failed");
      } else if (err.request) {
        console.error("No response from server:", err.request);
        throw new Error("No response from server");
      } else {
        console.error("Error", err.message);
        throw new Error(err.message);
      }
    }
  },
  logout: async () => {
    await api.post("/auth/logout");
    store.dispatch(logout());
  },
  authMe: async () => {
    try {
      const res = await api.get("/auth/auth-me"); // Axios call
      store.dispatch(setCredentials(res.data)); // lưu user + token (nếu cần)
      return res.data;
    } catch (err) {
      console.error("AuthMe failed:", err.response.data);
      throw err.response.data.error;
    }
  },

  refreshToken: async () => {
    const res = await axios.post("/auth/refresh-token", {
        withCredentials: true,
    });
    store.dispatch(
      setCredentials({ accessToken: res.data.accessToken, user: null })
    );
    return res.data;
  },
};
