// api/authApi.js
import api from "./axios";
import { store } from "../store/index.jsx";
import { logout, setCredentials, setToken } from "../store/authSlice";
import { toast } from "../hooks/use-toast.jsx";

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
  loginWithFb: async (name, email, fbId) => {
    try {
      const res = await api.post("/auth/login-fb", { name, email, fbId });
      store.dispatch(setToken(res.data));
      return res.data;
    } catch (err) {
      // err.response chứa response từ server (nếu server trả lỗi 4xx/5xx)
      if (err.response) {
        if (err.response.status === 400) {
          toast({
            title: "Đăng nhập thất bại",
            description: err.response.data.message,
            variant: "destructive",
          });
          return {
            needEmail: true,
            name: err.response.data.name,
            fbId: err.response.data.fbId,
          };
        }
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
      // 401 là bình thường khi user chưa login - không cần log error
      if (err.response?.status === 401) {
        // User chưa đăng nhập - đây là expected behavior
        // Không log error để tránh noise trong console
        throw err.response.data?.error || new Error("Unauthorized");
      }
      // Chỉ log error khi là lỗi thực sự (không phải 401)
      console.error("AuthMe failed:", err.response?.data || err.message);
      throw err.response?.data?.error || err.message;
    }
  },

  refreshToken: async () => {
    const res = await api.post("/auth/refresh-token", {
      withCredentials: true,
    });
    store.dispatch(
      setCredentials({ accessToken: res.data.accessToken, user: null })
    );
    return res.data;
  },
  sendMail: async (email) => {
    try {
      const res = await api.post("/auth/send-otp", { email });
      return res;
    } catch (err) {
      console.error(err);
      // bạn có thể return null / false / custom object nếu muốn
      return err.response || { message: "Unknown error" };
    }
  },
  verifyOtp: async (data) => {
    try {
      const res = await api.post("/auth/verify-otp", data);
      return res;
    } catch (err) {
      console.error(err);
      // bạn có thể return null / false / custom object nếu muốn
      return err.response || { message: "Unknown error" };
    }
  },
  resetPassword: async (data) => {
    try {
      const res = await api.post("/auth/reset-password", data);
      return res;
    } catch (err) {
      console.error(err);
      return err.response || { message: "Unknown error" };
    }
  },
  loginWithGoogle: async (idToken) => {
    const res = await api.post("/auth/login-google", { googleId: idToken });
    store.dispatch(setToken(res.data));
    return res.data;
  },
};
