// api/axios.js
import axios from "axios";
import { store } from "../store/index.jsx";
import { logout, setToken } from "../store/authSlice";

const apiUrl = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: apiUrl,
  withCredentials: true, // cho phép gửi cookie httpOnly
});

// Interceptor cho request: gắn accessToken
api.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.accessToken;
    if (token) {
      config.headers["authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor cho response: handle 401
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;
    if (err.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // gọi API refresh
        const res = await axios.post(
          `${apiUrl}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );
        const newAccessToken = await res.data;

        // update Redux
        store.dispatch(setToken(newAccessToken));

        // gắn lại token và retry request
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshErr) {
        store.dispatch(logout());
        return Promise.reject(refreshErr);
      }
    }
    return Promise.reject(err);
  }
);

export default api;
