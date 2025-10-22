import { useEffect, useState } from 'react';
// import { categories } from '../../data/mockData';
import { DataTable } from '../../components/dashboard/DataTable';
import { CategoryForm } from '../../components/dashboard/CategoryForm';
import { Badge } from '../../components/ui/badge';
import { useToast } from '../../hooks/use-toast';
// eslint-disable-next-line no-unused-vars
import { createCategory, createCategoryWithSubcategories, deleteCategoryById, fetchAllCategories, fetchCategoriesByPage, fetchCategoryById, updateCategory } from '../../api/category/categoryApi';
import { availableIcons } from '../../data/icons';
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

const CategoryManagement = () => {
  const [categoryList, setCategoryList] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCategory, setEditingCategory] = useState(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const itemsPerPage = 10;
  const { toast } = useToast();
  const genderMap = {
    male: "Nam",
    female: "Nữ",
    boy: "Bé trai (8-16 tuổi)",
    girl: "Bé gái (8-16 tuổi)",
  };

  const typeMap = {
    clothing: "Quần áo",
    shoes: "Giày dép",
    accessories: "Phụ kiện thể thao",
  };
  const columns = [
    {
      key: 'icon',
      label: 'Icon',
      render: (value) => {
        const iconData = availableIcons.find(icon => icon.name === value);
        if (!iconData) return null;
        const IconComponent = iconData.icon;
        return <IconComponent className="text-2xl" />;
      },
    },
    { key: 'name', label: 'Tên danh mục', sortable: true },
    {
      key: 'gender',
      label: 'Giới tính',
      sortable: true,
      render: (value) => genderMap[value] || value, // map DB value sang label
    },
    {
      key: 'type',
      label: 'Loại sản phẩm',
      sortable: true,
      render: (value) => typeMap[value] || value, // map DB value sang label
    },
    {
      key: 'subcategories',
      label: 'Danh mục con',
      render: (value) => (
        <div className="flex flex-wrap gap-1">
          {value.slice(0, 3).map((sub, index) => (
            <Badge key={sub._id || index} variant="secondary" className="text-xs">
              {sub.name}
            </Badge>
          ))}
          {value.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{value.length - 3} khác
            </Badge>
          )}
        </div>
      ),
    },
  ];

  const loadCategories = async () => {
    try {
      // Gọi API phân trang
      const res = await fetchCategoriesByPage(currentPage, itemsPerPage, searchTerm);
      setCategoryList(res.categories);
      setTotalPages(res.totalPages);
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      toast({
        title: "Lỗi",
        description: "Không thể tải danh mục",
        variant: "destructive",
      });
    }
  };
  useEffect(() => {
    loadCategories();
  }, [currentPage, searchTerm, toast]);
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };


  const handleAdd = () => {
    setEditingCategory(undefined);
    setIsEditing(false);
    setIsFormOpen(true);
    setIsReadOnly(false);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setIsEditing(true);
    setIsFormOpen(true);
    setIsReadOnly(false);
  };

  const handleFormSubmit = async (categoryData) => {
    try {
      if (categoryData.id) {
        const updatedCategory = await updateCategory(categoryData.id, categoryData);
        // Cập nhật lại state categoryList
        setCategoryList((prev) =>
          prev.map((cat) =>
            cat._id === updatedCategory._id ? updatedCategory : cat
          )
        );
        toast({
          title: "Đã cập nhật",
          description: `${updatedCategory.name} đã được cập nhật thành công`,
        });
      } else {
        const newCategory = await createCategoryWithSubcategories(categoryData);
        setCategoryList([...categoryList, newCategory]);
        toast({
          title: "Đã thêm danh mục",
          description: `${newCategory.name} đã được thêm thành công`,
        });
      }
      loadCategories();
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      console.log('error', error);
      toast({
        title: "Lỗi",
        description: `${error}`,
        variant: "destructive",
      });
    }
  };

  const handleDelete = (category) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;

    try {
      await deleteCategoryById(categoryToDelete._id);
      loadCategories();
      toast({
        title: "Đã xóa danh mục",
        description: `${categoryToDelete.name} đã được xóa khỏi danh sách`,
      });
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    } catch (error) {
      if (error?.response?.status === 400 || error?.response?.status === 409) {
        toast({
          title: "Không thể xóa danh mục",
          description: `${categoryToDelete.name} đang được sử dụng trong sản phẩm, không thể xóa`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Lỗi khi xóa danh mục",
          description: error.message || "Có lỗi xảy ra, vui lòng thử lại",
          variant: "destructive",
        });
      }
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    }
  };

  const handleView = async (category) => {
    setEditingCategory(category);
    setIsEditing(false);
    setIsReadOnly(true);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Quản lý danh mục</h1>
        <p className="text-muted-foreground">Quản lý danh mục và danh mục con sản phẩm</p>
      </div>

      <DataTable
        title={`Danh sách danh mục (${categoryList.length})`}
        data={categoryList}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        searchPlaceholder="Tìm kiếm danh mục..."
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
      />

      <CategoryForm
        open={isFormOpen}
        readonly={isReadOnly}
        editing={isEditing}
        onOpenChange={setIsFormOpen}
        category={editingCategory}
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
            <AlertDialogTitle>Xác nhận xóa danh mục</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa danh mục "{categoryToDelete?.name}"?
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Xác nhận xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div >
  );
};

export default CategoryManagement;
