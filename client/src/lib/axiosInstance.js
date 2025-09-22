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
    if(token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;

}, (error) => {
    return Promise.reject(error);
})

export default axiosInstance;