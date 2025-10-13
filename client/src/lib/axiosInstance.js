import axios from "axios";
import { store } from "../store/index.jsx";
import { logout, setToken } from "../store/authSlice";

const axiosInstance = axios.create({
    baseURL : "http://localhost:3000/api",
    headers : {
        "Content-Type" : "application/json",
    },
    withCredentials: true
});

//Tự động thêm Authorization header nếu có token
axiosInstance.interceptors.request.use((config) => {
    const token = store.getState().auth.accessToken;
    console.log("=== AXIOS REQUEST DEBUG ===");
    console.log("URL:", config.url);
    console.log("Token from Redux:", token ? "Token exists" : "No token");
    
    if(token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log("Authorization header set:", config.headers.Authorization);
    } else {
        console.log("No token found, request will be sent without Authorization header");
    }
    return config;

}, (error) => {
    return Promise.reject(error);
})

// Response interceptor để xử lý lỗi 401 và refresh token
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      console.log("=== TOKEN REFRESH ATTEMPT ===");
      try {
        const refreshResponse = await axios.post('http://localhost:3000/api/auth/refresh-token', {}, {
          withCredentials: true
        });
        
        const newToken = refreshResponse.data.accessToken;
        store.dispatch(setToken({ accessToken: newToken }));
        
        console.log("Token refreshed successfully");
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
        
      } catch (refreshError) {
        console.log("Token refresh failed, redirecting to login");
        store.dispatch(logout());
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;