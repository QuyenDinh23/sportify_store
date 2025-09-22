import { useEffect, useState } from 'react';
// import { categories } from '../../data/mockData';
import { DataTable } from '../../components/dashboard/DataTable';
import { CategoryForm } from '../../components/dashboard/CategoryForm';
import { Badge } from '../../components/ui/badge';
import { useToast } from '../../hooks/use-toast';
// eslint-disable-next-line no-unused-vars
import { createCategory, createCategoryWithSubcategories, fetchAllCategories, fetchCategoryById } from '../../api/category/categoryApi';

const CategoryManagement = () => {
  const [categoryList, setCategoryList] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [editingCategory, setEditingCategory] = useState(undefined);
  const { toast } = useToast();

  const genderMap = {
    male: "Nam",
    female: "Nữ",
    kids: "Trẻ em",
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
      render: (value) => <span className="text-2xl">{value}</span>,
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

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categories = await fetchAllCategories();
        console.log(categories);
        setCategoryList(categories);
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        toast({
          title: "Lỗi",
          description: "Không thể tải danh mục",
          variant: "destructive",
        });
      }
    };
    loadCategories();
  }, [toast]);

  const handleAdd = () => {
    setEditingCategory(undefined);
    setIsFormOpen(true);
    setIsReadOnly(false);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setIsFormOpen(true);
    setIsReadOnly(false);
  };

  const handleFormSubmit = async (categoryData) => {
    try {
      if (categoryData.id) {
      // Nếu bạn muốn có API update thì sẽ viết sau
      toast({
        title: "Cập nhật chưa được hỗ trợ",
        description: "API update sẽ được thêm sau",
      });
    } else {
      console.log(categoryData);
      const newCategory = await createCategoryWithSubcategories(categoryData);
      setCategoryList([...categoryList, newCategory]);
      toast({
        title: "Đã thêm danh mục",
        description: `${newCategory.name} đã được thêm thành công`,
      });
    }
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      console.log('error', error);
      toast({
        title: "Lỗi",
        description: "Không thể thêm danh mục" ,
        variant: "destructive",
      });
    }
  };

  const handleDelete = (category) => {
    setCategoryList(categoryList.filter((c) => c.id !== category.id));
    toast({
      title: 'Đã xóa danh mục',
      description: `${category.name} đã được xóa khỏi danh sách`,
    });
  };

  const handleView = async (category) => {
    console.log("View category:", category);
    setEditingCategory(category);
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
      />

      <CategoryForm
        open={isFormOpen}
        readonly={isReadOnly}
        onOpenChange={setIsFormOpen}
        category={editingCategory}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
};

export default CategoryManagement;
