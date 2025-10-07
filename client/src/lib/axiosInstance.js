import axios from "axios";

const axiosInstance = axios.create({
    baseURL : "http://localhost:3000/api",
    headers : {
        "Content-Type" : "application/json",
    },
    withCredentials: true
});

//Tự động thêm Authorization header nếu có token
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    console.log("=== AXIOS REQUEST DEBUG ===");
    console.log("URL:", config.url);
    console.log("Token from localStorage:", token ? "Token exists" : "No token");
    console.log("Full token:", token);
    
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

// Response interceptor để xử lý lỗi 403 và refresh token
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      console.log("=== TOKEN REFRESH ATTEMPT ===");
      try {
        const refreshResponse = await axios.post('http://localhost:3000/api/auth/refresh-token', {}, {
          withCredentials: true
        });
        
        const newToken = refreshResponse.data.accessToken;
        localStorage.setItem("token", newToken);
        
        console.log("Token refreshed successfully");
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
        
      } catch (refreshError) {
        console.log("Token refresh failed, redirecting to login");
        localStorage.removeItem("token");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;