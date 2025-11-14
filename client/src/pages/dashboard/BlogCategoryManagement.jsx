import { useState, useEffect } from "react";
import {
  createBlogCategory,
  updateBlogCategory,
  deleteBlogCategory,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import {
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  BookOpen,
  Calendar,
} from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import { Skeleton } from "../../components/ui/skeleton";
import { uploadToBackend } from "../../api/image/uploadImageApi";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";

const BlogCategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    thumbnail: "",
  });

  useEffect(() => {
    fetchCategories();
  }, []);
  useEffect(() => {
    if (!dialogOpen) {
      // Reset form khi đóng dialog
      setEditingCategory(null);
      setFormData({
        name: "",
        slug: "",
        description: "",
        thumbnail: "",
      });
    }
  }, [dialogOpen]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await getBlogCategories();
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách danh mục",
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

    // Auto-generate slug from name
    if (field === "name") {
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      if (editingCategory) {
        if (formData.thumbnail instanceof File) {
          console.log(formData.thumbnail);

          const url = await uploadToBackend(formData.thumbnail);
          formData.thumbnail = url;
        }

        await updateBlogCategory(editingCategory._id, formData);
        toast({
          title: "Thành công",
          description: "Danh mục đã được cập nhật",
        });
      } else {
        if (formData.thumbnail instanceof File) {
          console.log(formData.thumbnail);

          const url = await uploadToBackend(formData.thumbnail);
          formData.thumbnail = url;
        }
        await createBlogCategory(formData);
        toast({
          title: "Thành công",
          description: "Danh mục đã được tạo",
        });
      }
      setDialogOpen(false);
      setEditingCategory(null);
      setFormData({ name: "", slug: "", description: "", thumbnail: "" });
      fetchCategories();
    } catch (error) {
      console.error("Error saving category:", error);
      toast({
        title: "Không thể lưu danh mục",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name || "",
      slug: category.slug || "",
      description: category.description || "",
      thumbnail: category.thumbnail || "",
    });
    setDialogOpen(true);
  };

  const handleToggleStatus = (category) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };
  const handleDelete = async (id) => {

    try {
      await deleteBlogCategory(id);
      toast({
        title: "Thành công",
        description: "Danh mục đã được xóa",
      });
      fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa danh mục",
        variant: "destructive",
      });
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingCategory(null);
    setFormData({ name: "", slug: "", description: "", thumbnail: "" });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading && categories.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Quản lý danh mục blog
          </h1>
          <p className="text-muted-foreground">
            Quản lý các danh mục bài viết blog
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Tạo danh mục mới
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? "Chỉnh sửa danh mục" : "Tạo danh mục mới"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tên danh mục *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Nhập tên danh mục..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => handleInputChange("slug", e.target.value)}
                  placeholder="ten-danh-muc"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Mô tả danh mục..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="thumbnail">Hình ảnh</Label>

                {formData.thumbnail && (
                  <div className="mb-2">
                    <img
                      src={formData.thumbnail}
                      alt="Preview"
                      className="w-24 h-24 object-cover rounded border"
                    />
                  </div>
                )}

                <Input
                  id="thumbnail"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFormData((prev) => ({
                          ...prev,
                          thumbnail: file,
                        }));
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDialogClose}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Đang lưu..." : "Lưu"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách danh mục ({categories.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Chưa có danh mục nào. Hãy tạo danh mục đầu tiên!</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên danh mục</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="w-[100px]">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {category.thumbnail ? (
                          <img
                            src={category.thumbnail}
                            alt={category.name}
                            className="w-10 h-10 object-cover rounded"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                            <BookOpen className="w-4 h-4 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{category.name}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-sm bg-muted px-2 py-1 rounded">
                        {category.slug}
                      </code>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">
                        {category.description || "-"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{formatDate(category.createdAt)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleEdit(category)}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleToggleStatus(category)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa danh mục</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa danh mục "{categoryToDelete?.name}"? Sau
              khi xóa sẽ khônng thể khôi phục. <br />
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDelete(categoryToDelete._id)}
            >
              Xác nhận
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BlogCategoryManagement;
