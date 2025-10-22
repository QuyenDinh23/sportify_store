import express from "express";
import {
  getBlogPosts,
  getBlogPostBySlug,
  getBlogCategories,
  getBlogPostsByCategory,
  getFeaturedBlogPosts,
  // Admin routes
  getAllBlogPosts,
  getBlogPostById,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  createBlogCategory,
  updateBlogCategory,
  deleteBlogCategory,
} from "../../controllers/blog/blogController.js";
import middlewareController from "../../middlewares/middlewareController.js";

const router = express.Router();

// Public routes - no authentication required
router.get("/", getBlogPosts);
router.get("/featured", getFeaturedBlogPosts);
router.get("/categories", getBlogCategories);
router.get("/category/:categorySlug", getBlogPostsByCategory);
router.get("/post/:slug", getBlogPostBySlug);

// Admin routes - require authentication
// router.use(middlewareController.verifyToken);

// Blog Posts Management
router.get("/admin/posts", middlewareController.verifyToken, getAllBlogPosts);
router.get("/admin/posts/:id", middlewareController.verifyToken, getBlogPostById);
router.post("/admin/posts", middlewareController.verifyToken, createBlogPost);
router.put("/admin/posts/:id", middlewareController.verifyToken, updateBlogPost);
router.delete("/admin/posts/:id", middlewareController.verifyToken, deleteBlogPost);

// Blog Categories Management
router.post("/admin/categories", middlewareController.verifyToken, createBlogCategory);
router.put("/admin/categories/:id", middlewareController.verifyToken, updateBlogCategory);
router.delete("/admin/categories/:id", middlewareController.verifyToken, deleteBlogCategory);

export default router;
