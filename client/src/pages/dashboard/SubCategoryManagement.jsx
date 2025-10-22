import { useEffect, useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { subcategories, categories, brands } from '../../data/mockData';
import { DataTable } from '../../components/dashboard/DataTable';
import { SubcategoryForm } from '../../components/dashboard/SubCategoryForm';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Plus } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { deleteSubcategoryApi, fetchSubcategoriesByPage, updateSubcategory } from '../../api/category/subCategoryApi';
import { getBrands } from '../../api/brand/brandApi';
import { fetchAllCategories } from '../../api/category/categoryApi';
import Pagination from '../../components/pagination/Pagination';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '../../components/ui/alert-dialog';

const SubcategoryManagement = () => {
  const [subcategoryList, setSubcategoryList] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [categoryList, setCategoryList] = useState([]);
  const [brandList, setBrandList] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState(undefined);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [subcategoryToDelete, setSubcategoryToDelete] = useState(null);
  const itemsPerPage = 10;
  const { toast } = useToast();

  const columns = [
    { key: 'name', label: 'Tên danh mục con', sortable: true },
    {
      key: "category",
      label: "Danh mục chính",
      sortable: true,
      render: (value) => (value ? value.name : "N/A"),
    },
    {
      key: 'brands',
      label: 'Thương hiệu',
      render: (value) => (
        <div className="flex flex-wrap gap-1">
          {value.length > 0 ? (
            value.map((brand) => (
              <Badge key={brand.id} variant="secondary" className="text-xs">
                {brand.name}
              </Badge>
            ))
          ) : (
            <span className="text-muted-foreground">Chưa có thương hiệu</span>
          )}
        </div>
      ),
    },
  ];
  const loadSubcategories = async () => {
    try {
      const categoryFilter = selectedCategoryFilter !== "all" ? selectedCategoryFilter : "";
      console.log("categoryFilter", categoryFilter);
      const res = await fetchSubcategoriesByPage(currentPage, itemsPerPage, searchTerm, categoryFilter);

      setSubcategoryList(res.subcategories);
      setTotalPages(res.totalPages);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: `${error}`,
        variant: "destructive",
      });
    }
  };

  const loadBrands = async () => {
    try {
      const res = await getBrands();
      setBrandList(res);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: `${error}`,
        variant: "destructive",
      });
    }
  }
  const loadCategories = async () => {
    try {
      const res = await fetchAllCategories();
      setCategoryList(res);
      console.log("category list", categoryList);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: `${error}`,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadSubcategories();
    loadBrands();
    loadCategories();
  }, [currentPage, searchTerm, selectedCategoryFilter, toast]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // eslint-disable-next-line no-unused-vars
  const handleAdd = () => {
    setEditingSubcategory(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (subcategory) => {
    setEditingSubcategory(subcategory);
    setIsEditing(true);
    setIsReadOnly(false);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (subcategoryData) => {
    if (subcategoryData.id) {
      // Editing existing subcategory
      const updatedSub = await updateSubcategory(subcategoryData.id, subcategoryData);
      setSubcategoryList((prev) =>
        prev.map((sc) => (sc.id === updatedSub.id ? updatedSub : sc))
      );
      toast({
        title: 'Đã cập nhật danh mục con',
        description: `${subcategoryData.name} đã được cập nhật thành công`,
      });
    }
    loadSubcategories();
    loadBrands();
  };

  const handleDelete = (subcategory) => {
    setSubcategoryToDelete(subcategory);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!subcategoryToDelete) return;

    try {
      await deleteSubcategoryApi(subcategoryToDelete._id);
      loadSubcategories();
      toast({
        title: "Đã xóa danh mục con",
        description: `${subcategoryToDelete.name} đã được xóa khỏi danh sách`,
      });
      setDeleteDialogOpen(false);
      setSubcategoryToDelete(null);
    } catch (error) {
      if (error?.response?.status === 400 || error?.response?.status === 409) {
        toast({
          title: "Không thể xóa danh mục con",
          description: `${subcategoryToDelete.name} đang được sử dụng trong sản phẩm, không thể xóa`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Lỗi khi xóa danh mục con",
          description: error.message || "Có lỗi xảy ra, vui lòng thử lại",
          variant: "destructive",
        });
      }
      setDeleteDialogOpen(false);
      setSubcategoryToDelete(null);
    }
  };

  const handleView = (subcategory) => {
    setEditingSubcategory(subcategory);
    setIsFormOpen(true);
    setIsReadOnly(true);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Quản lý danh mục con</h1>
        <p className="text-muted-foreground">Quản lý danh mục con và gán thương hiệu</p>
      </div>

      <DataTable
        title={`Danh sách danh mục con (${subcategoryList.length})`}
        data={subcategoryList}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        searchPlaceholder="Tìm kiếm danh mục con..."
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
        headerActions={
          <div className="flex gap-2">
            <Select value={selectedCategoryFilter} onValueChange={setSelectedCategoryFilter}>
              <SelectTrigger className="w-48 bg-background">
                <SelectValue placeholder="Lọc theo danh mục" />
              </SelectTrigger>
              <SelectContent className="bg-background border shadow-md z-50">
                <SelectItem value="all">Tất cả danh mục</SelectItem>
                {categoryList.map((category) => (
                  <SelectItem key={category._id} value={category._id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* <Button onClick={handleAdd} variant="sport">
              <Plus className="h-4 w-4 mr-2" />
              Thêm mới
            </Button> */}
          </div>
        }
      />

      <SubcategoryForm
        open={isFormOpen}
        readonly={isReadOnly}
        editing={isEditing}
        onOpenChange={setIsFormOpen}
        subcategory={editingSubcategory}
        categories={categoryList}
        brands={brandList}
        onSubmit={handleFormSubmit}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa danh mục con</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa danh mục con "{subcategoryToDelete?.name}"?
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Xác nhận xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SubcategoryManagement;
