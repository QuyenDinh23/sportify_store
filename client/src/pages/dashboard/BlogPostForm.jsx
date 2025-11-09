import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createBlogPost,
  updateBlogPost,
  getBlogPostById,
} from "../../api/blog/blogAdminApi";
import { getBlogCategories } from "../../api/blog/blogApi";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Checkbox } from "../../components/ui/checkbox";
import { Badge } from "../../components/ui/badge";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Eye,
  Type,
  Image,
  Quote,
  Video,
  Heading2,
  BookOpen,
} from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import { uploadToBackend } from "../../api/image/uploadImageApi";

const BlogPostForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    categoryId: "",
    author: "",
    coverImage: "",
    summary: "",
    isPublished: false,
    sections: [],
  });
  const validateForm = () => {
    const errors = [];

    if (!formData.title.trim()) errors.push("Tiêu đề không được để trống.");
    if (!formData.slug.trim()) errors.push("Slug không được để trống.");

    // Regex kiểm tra slug hợp lệ (chỉ chữ, số và dấu '-')
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (formData.slug && !slugRegex.test(formData.slug)) {
      errors.push("Slug chỉ được chứa chữ thường, số và dấu gạch nối (-).");
    }

    if (!formData.categoryId) errors.push("Vui lòng chọn danh mục.");
    if (!formData.summary.trim()) errors.push("Vui lòng nhập tóm tắt ngắn.");
    if (!formData.coverImage)
      errors.push("Vui lòng chọn ảnh bìa cho bài viết.");

    // Validate nội dung
    if (!formData.sections.length) {
      errors.push("Bài viết cần có ít nhất một phần nội dung.");
    } else {
      for (const [i, section] of formData.sections.entries()) {
        if (!section.blocks.length) {
          errors.push(`Phần ${i + 1} cần có ít nhất một khối nội dung.`);
        }
      }
    }

    if (errors.length > 0) {
      toast({
        title: "Lỗi xác thực",
        description: (
          <ul className="list-disc list-inside space-y-1">
            {errors.map((err, index) => (
              <li key={index}>{err}</li>
            ))}
          </ul>
        ),
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  useEffect(() => {
    fetchCategories();
    if (isEdit) {
      fetchPost();
    }
  }, [isEdit, id]);

  const fetchCategories = async () => {
    try {
      const response = await getBlogCategories();
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await getBlogPostById(id);
      const post = response.data;
      setFormData({
        title: post.title,
        slug: post.slug,
        categoryId: post.categoryId?._id || "",
        author: post.author,
        coverImage: post.coverImage,
        summary: post.summary,
        isPublished: post.isPublished,
        sections: post.sections || [],
      });
    } catch (error) {
      console.error("Error fetching post:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin bài viết",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Auto-generate slug from title
    if (field === "title" && !isEdit) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      setFormData((prev) => ({
        ...prev,
        slug,
      }));
    }
  };

  const addSection = () => {
    setFormData((prev) => ({
      ...prev,
      sections: [...prev.sections, { title: "", blocks: [] }],
    }));
  };

  const updateSection = (sectionIndex, field, value) => {
    setFormData((prev) => ({
      ...prev,
      sections: prev.sections.map((section, index) =>
        index === sectionIndex ? { ...section, [field]: value } : section
      ),
    }));
  };

  const addBlock = (sectionIndex, type) => {
    const newBlock = {
      type,
      data:
        type === "paragraph"
          ? { text: "" }
          : type === "subtitle"
          ? { text: "" }
          : type === "image"
          ? { url: "", caption: "" }
          : type === "quote"
          ? { text: "", author: "" }
          : type === "video"
          ? { url: "" }
          : { text: "" },
    };

    setFormData((prev) => ({
      ...prev,
      sections: prev.sections.map((section, index) =>
        index === sectionIndex
          ? { ...section, blocks: [...section.blocks, newBlock] }
          : section
      ),
    }));
  };

  const updateBlock = (sectionIndex, blockIndex, field, value) => {
    setFormData((prev) => ({
      ...prev,
      sections: prev.sections.map((section, sIndex) =>
        sIndex === sectionIndex
          ? {
              ...section,
              blocks: section.blocks.map((block, bIndex) =>
                bIndex === blockIndex
                  ? { ...block, data: { ...block.data, [field]: value } }
                  : block
              ),
            }
          : section
      ),
    }));
  };

  const removeBlock = (sectionIndex, blockIndex) => {
    setFormData((prev) => ({
      ...prev,
      sections: prev.sections.map((section, sIndex) =>
        sIndex === sectionIndex
          ? {
              ...section,
              blocks: section.blocks.filter(
                (_, bIndex) => bIndex !== blockIndex
              ),
            }
          : section
      ),
    }));
  };

  const removeSection = (sectionIndex) => {
    setFormData((prev) => ({
      ...prev,
      sections: prev.sections.filter((_, index) => index !== sectionIndex),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;
    try {
      setLoading(true);

      // Upload ảnh bìa nếu là file local
      if (formData.coverImage instanceof File) {
        console.log(formData.coverImage);
        
        const url = await uploadToBackend(formData.coverImage);
        formData.coverImage = url;
      }

      // Upload ảnh trong các block
      for (const section of formData.sections) {
        for (const block of section.blocks) {
          if (block.type === "image" && block.data.url instanceof File) {
            const uploadedUrl = await uploadToBackend(block.data.url);
            block.data.url = uploadedUrl;
          }
        }
      }

      if (isEdit) {
        await updateBlogPost(id, formData);
        toast({
          title: "Thành công",
          description: "Bài viết đã được cập nhật",
        });
      } else {
        await createBlogPost(formData);
        toast({ title: "Thành công", description: "Bài viết đã được tạo" });
      }

      navigate("/staff-content/dashboard/blog");
    } catch (error) {
      console.error("Error saving post:", error);
      toast({
        title: "Lỗi",
        description: "Không thể lưu bài viết",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderBlockEditor = (block, sectionIndex, blockIndex) => {
    switch (block.type) {
      case "paragraph":
        return (
          <div key={blockIndex} className="space-y-2">
            <Label>Đoạn văn</Label>
            <Textarea
              value={block.data.text}
              onChange={(e) =>
                updateBlock(sectionIndex, blockIndex, "text", e.target.value)
              }
              placeholder="Nhập nội dung đoạn văn..."
              rows={4}
            />
          </div>
        );
      case "subtitle":
        return (
          <div key={blockIndex} className="space-y-2">
            <Label>Tiêu đề phụ</Label>
            <Input
              value={block.data.text}
              onChange={(e) =>
                updateBlock(sectionIndex, blockIndex, "text", e.target.value)
              }
              placeholder="Nhập tiêu đề phụ..."
            />
          </div>
        );
      case "image":
        return (
          <div key={blockIndex} className="space-y-2">
            <Label>Hình ảnh</Label>
            <div key={blockIndex} className="space-y-2">
              <Label>Hình ảnh</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    updateBlock(sectionIndex, blockIndex, "url", file);
                  }
                }}
              />
              {block.data.url && typeof block.data.url === "string" && (
                <img
                  src={block.data.url}
                  alt="Preview"
                  className="w-40 mt-2 rounded-md"
                />
              )}
              <Input
                value={block.data.caption}
                onChange={(e) =>
                  updateBlock(
                    sectionIndex,
                    blockIndex,
                    "caption",
                    e.target.value
                  )
                }
                placeholder="Chú thích hình ảnh..."
              />
            </div>

            <Input
              value={block.data.caption}
              onChange={(e) =>
                updateBlock(sectionIndex, blockIndex, "caption", e.target.value)
              }
              placeholder="Chú thích hình ảnh..."
            />
          </div>
        );
      case "quote":
        return (
          <div key={blockIndex} className="space-y-2">
            <Label>Trích dẫn</Label>
            <Textarea
              value={block.data.text}
              onChange={(e) =>
                updateBlock(sectionIndex, blockIndex, "text", e.target.value)
              }
              placeholder="Nội dung trích dẫn..."
              rows={3}
            />
            <Input
              value={block.data.author}
              onChange={(e) =>
                updateBlock(sectionIndex, blockIndex, "author", e.target.value)
              }
              placeholder="Tác giả trích dẫn..."
            />
          </div>
        );
      case "video":
        return (
          <div key={blockIndex} className="space-y-2">
            <Label>Video</Label>
            <Input
              value={block.data.url}
              onChange={(e) =>
                updateBlock(sectionIndex, blockIndex, "url", e.target.value)
              }
              placeholder="URL video..."
            />
          </div>
        );
      default:
        return null;
    }
  };

  if (loading && isEdit) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate("/staff-content/dashboard/blog")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {isEdit ? "Chỉnh sửa bài viết" : "Tạo bài viết mới"}
          </h1>
          <p className="text-muted-foreground">
            {isEdit ? "Cập nhật thông tin bài viết" : "Tạo bài viết blog mới"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin cơ bản</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Tiêu đề *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Nhập tiêu đề bài viết..."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => handleInputChange("slug", e.target.value)}
                  placeholder="url-bai-viet"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Danh mục *</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) =>
                    handleInputChange("categoryId", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="author">Tác giả</Label>
                <Input
                  id="author"
                  value={formData.author}
                  onChange={(e) => handleInputChange("author", e.target.value)}
                  placeholder="Tên tác giả..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="coverImage">Hình ảnh bìa</Label>
              <div className="space-y-2">
                <Label htmlFor="coverImage">Hình ảnh bìa</Label>
                <Input
                  id="coverImage"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setFormData((prev) => ({ ...prev, coverImage: file }));
                    }
                  }}
                />
                {formData.coverImage &&
                  typeof formData.coverImage === "string" && (
                    <img
                      src={formData.coverImage}
                      alt="Preview"
                      className="w-40 mt-2 rounded-md"
                    />
                  )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="summary">Tóm tắt</Label>
              <Textarea
                id="summary"
                value={formData.summary}
                onChange={(e) => handleInputChange("summary", e.target.value)}
                placeholder="Mô tả ngắn về bài viết..."
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPublished"
                checked={formData.isPublished}
                onCheckedChange={(checked) =>
                  handleInputChange("isPublished", checked)
                }
              />
              <Label htmlFor="isPublished">Xuất bản ngay</Label>
            </div>
          </CardContent>
        </Card>

        {/* Content Sections */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Nội dung bài viết</CardTitle>
              <Button type="button" onClick={addSection}>
                <Plus className="w-4 h-4 mr-2" />
                Thêm phần
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {formData.sections.map((section, sectionIndex) => (
              <Card key={sectionIndex} className="border-dashed">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <Input
                      value={section.title}
                      onChange={(e) =>
                        updateSection(sectionIndex, "title", e.target.value)
                      }
                      placeholder="Tiêu đề phần (tùy chọn)"
                      className="font-medium"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSection(sectionIndex)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {section.blocks.map((block, blockIndex) => (
                    <div key={blockIndex} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Badge variant="outline">
                          {block.type === "paragraph" && "Đoạn văn"}
                          {block.type === "subtitle" && "Tiêu đề phụ"}
                          {block.type === "image" && "Hình ảnh"}
                          {block.type === "quote" && "Trích dẫn"}
                          {block.type === "video" && "Video"}
                        </Badge>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeBlock(sectionIndex, blockIndex)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      {renderBlockEditor(block, sectionIndex, blockIndex)}
                    </div>
                  ))}

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addBlock(sectionIndex, "paragraph")}
                    >
                      <Type className="w-4 h-4 mr-2" />
                      Đoạn văn
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addBlock(sectionIndex, "subtitle")}
                    >
                      <Heading2 className="w-4 h-4 mr-2" />
                      Tiêu đề
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addBlock(sectionIndex, "image")}
                    >
                      <Image className="w-4 h-4 mr-2" />
                      Hình ảnh
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addBlock(sectionIndex, "quote")}
                    >
                      <Quote className="w-4 h-4 mr-2" />
                      Trích dẫn
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addBlock(sectionIndex, "video")}
                    >
                      <Video className="w-4 h-4 mr-2" />
                      Video
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {formData.sections.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Chưa có nội dung nào. Hãy thêm phần đầu tiên!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/staff-content/dashboard/blog")}
          >
            Hủy
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Đang lưu..." : "Lưu bài viết"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default BlogPostForm;
