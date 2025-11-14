import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { getAllBlogPosts, deleteBlogPost } from "../../api/blog/blogAdminApi";
import { getBlogCategories } from "../../api/blog/blogApi";
import Pagination from "../../components/pagination/Pagination";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select.jsx";
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
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Calendar,
  User,
  BookOpen,
} from "lucide-react";
import { useToast } from "../../hooks/use-toast";
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


const BlogManagement = () => {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  // const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPublished, setSelectedPublished] = useState("all");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [postToDelete, setPostToDelete] = useState(null);
  const itemsPerPage = 10;
  const { toast } = useToast();

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, [
    currentPage,
    itemsPerPage,
    searchTerm,
    selectedCategory,
    selectedPublished,
  ]);

  const handleToggleStatus = (post) => {
    setPostToDelete(post);
    setDeleteDialogOpen(true);
  };
  const fetchPosts = useCallback(async () => {
    try {
      const filters = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        category: selectedCategory === "all" ? "" : selectedCategory,
        published: selectedPublished === "all" ? "" : selectedPublished,
      };
      const response = await getAllBlogPosts(filters);
      setPosts(response.data);
      setPagination(response.pagination);
      setTotalPages(response.pagination.pages);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách bài viết",
        variant: "destructive",
      });
    }
  }, [
    currentPage,
    itemsPerPage,
    searchTerm,
    selectedCategory,
    selectedPublished,
    toast,
  ]);

  const fetchCategories = async () => {
    try {
      const response = await getBlogCategories();
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteBlogPost(id);
      toast({
        title: "Thành công",
        description: "Bài viết đã được xóa",
      });
      fetchPosts();
    } catch (error) {
      console.error("Error deleting blog post:", error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa bài viết",
        variant: "destructive",
      });
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    setCurrentPage(1);
  };

  const handlePublishedChange = (value) => {
    setSelectedPublished(value);
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (isPublished) => {
    return isPublished ? (
      <Badge className="bg-green-100 text-green-800">Đã xuất bản</Badge>
    ) : (
      <Badge variant="secondary">Bản nháp</Badge>
    );
  };

  // if (loading) {
  //   return (
  //     <div className="space-y-6">
  //       <div className="flex justify-between items-center">
  //         <Skeleton className="h-8 w-48" />
  //         <Skeleton className="h-10 w-32" />
  //       </div>
  //       <Card>
  //         <CardContent className="p-6">
  //           <div className="space-y-4">
  //             {Array.from({ length: 5 }).map((_, index) => (
  //               <Skeleton key={index} className="h-16 w-full" />
  //             ))}
  //           </div>
  //         </CardContent>
  //       </Card>
  //     </div>
  //   );
  // }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Quản lý Blog</h1>
          <p className="text-muted-foreground">
            Quản lý bài viết và danh mục blog
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link to="/staff-content/dashboard/blog/categories">
              <BookOpen className="w-4 h-4 mr-2" />
              Quản lý danh mục
            </Link>
          </Button>
          <Button asChild>
            <Link to="/staff-content/dashboard/blog/create">
              <Plus className="w-4 h-4 mr-2" />
              Tạo bài viết mới
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Tìm kiếm bài viết..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1); // Reset to first page when searching
                  }}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={selectedCategory}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Tất cả danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả danh mục</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category._id} value={category._id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={selectedPublished}
              onValueChange={handlePublishedChange}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="true">Đã xuất bản</SelectItem>
                <SelectItem value="false">Bản nháp</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Posts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách bài viết ({pagination.total})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tiêu đề</TableHead>
                <TableHead>Danh mục</TableHead>
                <TableHead>Tác giả</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className="w-[100px]">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {post.coverImage ? (
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                          <BookOpen className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium line-clamp-1">
                          {post.title}
                        </div>
                        {post.summary && (
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {post.summary}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {post.categoryId ? (
                      <Badge variant="outline">{post.categoryId.name}</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span>{post.author || "Chưa có"}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(post.isPublished)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{formatDate(post.publishedAt)}</span>
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
                        <DropdownMenuItem asChild>
                          <Link to={`/blog/${post.slug}`}>
                            <Eye className="w-4 h-4 mr-2" />
                            Xem
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={`/staff-content/dashboard/blog/edit/${post._id}`}>
                            <Edit className="w-4 h-4 mr-2" />
                            Chỉnh sửa
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleToggleStatus(post)}
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

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </CardContent>
      </Card>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa bài viết</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa bài viết "{postToDelete?.title}"? Sau
              khi xóa sẽ khônng thể khôi phục. <br />
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDelete(postToDelete._id)}>
              Xác nhận
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>

  );
};

export default BlogManagement;
