import { BlogPost } from "../../models/blog/BlogPost.js";
import { BlogCategory } from "../../models/blog/BlogCategory.js";

// Get all published blog posts with pagination
export const getBlogPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category;
    const search = req.query.search;
    const skip = (page - 1) * limit;

    let query = { isPublished: true };

    if (category) {
      query.categoryId = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { summary: { $regex: search, $options: "i" } },
      ];
    }

    const posts = await BlogPost.find(query)
      .populate("categoryId", "name slug")
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await BlogPost.countDocuments(query);

    res.json({
      success: true,
      data: posts,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching blog posts",
      error: error.message,
    });
  }
};

// Get single blog post by slug
export const getBlogPostBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const post = await BlogPost.findOne({ slug, isPublished: true }).populate(
      "categoryId",
      "name slug"
    );

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found",
      });
    }

    res.json({
      success: true,
      data: post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching blog post",
      error: error.message,
    });
  }
};

// Get all blog categories
export const getBlogCategories = async (req, res) => {
  try {
    const categories = await BlogCategory.find().sort({ name: 1 });

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching blog categories",
      error: error.message,
    });
  }
};

// Get blog posts by category
export const getBlogPostsByCategory = async (req, res) => {
  try {
    const { categorySlug } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const category = await BlogCategory.findOne({ slug: categorySlug });
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const posts = await BlogPost.find({
      categoryId: category._id,
      isPublished: true,
    })
      .populate("categoryId", "name slug")
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await BlogPost.countDocuments({
      categoryId: category._id,
      isPublished: true,
    });

    res.json({
      success: true,
      data: posts,
      category: category,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching blog posts by category",
      error: error.message,
    });
  }
};

// Get featured/recent blog posts for homepage
export const getFeaturedBlogPosts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;

    const posts = await BlogPost.find({ isPublished: true })
      .populate("categoryId", "name slug")
      .sort({ publishedAt: -1 })
      .limit(limit);

    res.json({
      success: true,
      data: posts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching featured blog posts",
      error: error.message,
    });
  }
};

// Admin/Staff CRUD operations

// Create new blog post
export const createBlogPost = async (req, res) => {
  try {
    const {
      title,
      slug,
      categoryId,
      author,
      coverImage,
      summary,
      sections,
      isPublished,
    } = req.body;

    const existingPost = await BlogPost.findOne({ slug });
    if (existingPost) {
      return res.status(400).json({
        success: false,
        message: "url bài viết đã tồn tại",
      });
    }
    const existingTitle = await BlogPost.findOne({ title });
    if (existingTitle) {
      return res.status(400).json({
        success: false,
        message: "Tiêu đề bài viết đã tồn tại",
      });
    }
    const post = new BlogPost({
      title,
      slug,
      categoryId,
      author,
      coverImage,
      summary,
      sections,
      isPublished: isPublished || false,
      publishedAt: isPublished ? new Date() : null,
    });

    await post.save();
    await post.populate("categoryId", "name slug");

    res.status(201).json({
      success: true,
      data: post,
      message: "Blog post created successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating blog post",
      error: error.message,
    });
  }
};

// Update blog post
export const updateBlogPost = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      slug,
      categoryId,
      author,
      coverImage,
      summary,
      sections,
      isPublished,
    } = req.body;

    const updateData = {
      title,
      slug,
      categoryId,
      author,
      coverImage,
      summary,
      sections,
      isPublished,
      publishedAt: isPublished ? new Date() : null,
    };

    const post = await BlogPost.findByIdAndUpdate(id, updateData, {
      new: true,
    }).populate("categoryId", "name slug");

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found",
      });
    }

    res.json({
      success: true,
      data: post,
      message: "Blog post updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating blog post",
      error: error.message,
    });
  }
};

// Delete blog post
export const deleteBlogPost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await BlogPost.findByIdAndDelete(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found",
      });
    }

    res.json({
      success: true,
      message: "Blog post deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting blog post",
      error: error.message,
    });
  }
};

// Get all blog posts for admin (including unpublished)
export const getAllBlogPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category;
    const search = req.query.search;
    const published = req.query.published;
    const skip = (page - 1) * limit;

    let query = {};

    if (category) {
      query.categoryId = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { summary: { $regex: search, $options: "i" } },
      ];
    }

    if (published) {
      query.isPublished = published === "true";
    }
    console.log(query);
    const posts = await BlogPost.find(query)
      .populate("categoryId", "name slug")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await BlogPost.countDocuments(query);
    console.log(total);

    res.json({
      success: true,
      data: posts,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching blog posts",
      error: error.message,
    });
  }
};

// Get single blog post by ID for admin
export const getBlogPostById = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await BlogPost.findById(id).populate(
      "categoryId",
      "name slug"
    );

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found",
      });
    }

    res.json({
      success: true,
      data: post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching blog post",
      error: error.message,
    });
  }
};

// Blog Category CRUD operations

// Create blog category
export const createBlogCategory = async (req, res) => {
  try {
    const { name, slug, description, thumbnail } = req.body;
    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        message: "Name and slug are required",
      });
    }
    const existingCategory = await BlogCategory.findOne({ slug });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Danh mục với slug này đã tồn tại",
      });
    }
    const existingCategoryByName = await BlogCategory.findOne({ name });
    if (existingCategoryByName) {
      return res.status(400).json({
        success: false,
        message: "Danh mục với tên này đã tồn tại",
      });
    }
    const category = new BlogCategory({
      name,
      slug,
      description,
      thumbnail,
    });

    await category.save();

    res.status(201).json({
      success: true,
      data: category,
      message: "Blog category created successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating blog category",
      error: error.message,
    });
  }
};

// Update blog category
export const updateBlogCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description, thumbnail } = req.body;

    const category = await BlogCategory.findByIdAndUpdate(
      id,
      { name, slug, description, thumbnail },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Blog category not found",
      });
    }

    res.json({
      success: true,
      data: category,
      message: "Blog category updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating blog category",
      error: error.message,
    });
  }
};

// Delete blog category
export const deleteBlogCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category has posts
    const postsCount = await BlogPost.countDocuments({ categoryId: id });
    if (postsCount > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete category with existing posts",
      });
    }

    const category = await BlogCategory.findByIdAndDelete(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Blog category not found",
      });
    }

    res.json({
      success: true,
      message: "Blog category deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting blog category",
      error: error.message,
    });
  }
};
