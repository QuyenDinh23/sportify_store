import axiosInstance from "../../lib/axiosInstance";

// Blog Posts Admin API
export const getAllBlogPosts = async (params = {}) => {
  try {
    const response = await axiosInstance.get("/blog/admin/posts", { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getBlogPostById = async (id) => {
  try {
    const response = await axiosInstance.get(`/blog/admin/posts/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createBlogPost = async (postData) => {
  try {
    const response = await axiosInstance.post("/blog/admin/posts", postData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateBlogPost = async (id, postData) => {
  try {
    const response = await axiosInstance.put(
      `/blog/admin/posts/${id}`,
      postData
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteBlogPost = async (id) => {
  try {
    const response = await axiosInstance.delete(`/blog/admin/posts/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Blog Categories Admin API
export const createBlogCategory = async (categoryData) => {
  try {
    const response = await axiosInstance.post(
      "/blog/admin/categories",
      categoryData
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateBlogCategory = async (id, categoryData) => {
  try {
    const response = await axiosInstance.put(
      `/blog/admin/categories/${id}`,
      categoryData
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteBlogCategory = async (id) => {
  try {
    const response = await axiosInstance.delete(`/blog/admin/categories/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
