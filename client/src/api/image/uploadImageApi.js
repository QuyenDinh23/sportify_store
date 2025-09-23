import axios from "axios";

export const uploadToBackend = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axios.post("/api/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data.url; // URL trả về từ backend
};
