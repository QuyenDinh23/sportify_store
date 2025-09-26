import axiosInstance from '../../lib/axiosInstance'; // import instance của bạn

export const uploadToBackend = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await axiosInstance.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.url; // URL trả về từ backend
  } catch (err) {
    console.error("Upload thất bại:", err.response?.data?.message || err.message);
    throw err;
  }
};
