import axiosInstance from "../../lib/axiosInstance";

// Get all blog posts with pagination and filters
export const getBlogPosts = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/blog', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get single blog post by slug
export const getBlogPostBySlug = async (slug) => {
  try {
    const response = await axiosInstance.get(`/blog/post/${slug}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get all blog categories
export const getBlogCategories = async () => {
  try {
    const response = await axiosInstance.get('/blog/categories');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get blog posts by category
export const getBlogPostsByCategory = async (categorySlug, params = {}) => {
  try {
    const response = await axiosInstance.get(`/blog/category/${categorySlug}`, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get featured blog posts
export const getFeaturedBlogPosts = async (limit = 6) => {
  try {
    const response = await axiosInstance.get('/blog/featured', { 
      params: { limit } 
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

