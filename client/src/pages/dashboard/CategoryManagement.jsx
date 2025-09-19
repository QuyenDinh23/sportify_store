import { useState } from 'react';
import { categories } from '../../data/mockData';
import { DataTable } from '../../components/dashboard/DataTable';
import { CategoryForm } from '../../components/dashboard/CategoryForm';
import { Badge } from '../../components/ui/badge';
import { useToast } from '../../hooks/use-toast';

const CategoryManagement = () => {
  const [categoryList, setCategoryList] = useState(categories);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(undefined);
  const { toast } = useToast();

  const columns = [
    {
      key: 'icon',
      label: 'Icon',
      render: (value) => <span className="text-2xl">{value}</span>,
    },
    { key: 'name', label: 'Tên danh mục', sortable: true },
    { key: 'id', label: 'Mã danh mục', sortable: true },
    {
      key: 'subcategories',
      label: 'Danh mục con',
      render: (value) => (
        <div className="flex flex-wrap gap-1">
          {value.slice(0, 3).map((sub, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {sub}
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

  const handleAdd = () => {
    setEditingCategory(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (categoryData) => {
    if (categoryData.id) {
      // Editing existing category
      setCategoryList(
        categoryList.map((cat) =>
          cat.id === categoryData.id ? { ...categoryData, id: categoryData.id } : cat
        )
      );
      toast({
        title: 'Đã cập nhật danh mục',
        description: `${categoryData.name} đã được cập nhật thành công`,
      });
    } else {
      // Adding new category
      const newCategory = {
        ...categoryData,
        id: `cat_${Date.now()}`,
      };
      setCategoryList([...categoryList, newCategory]);
      toast({
        title: 'Đã thêm danh mục',
        description: `${categoryData.name} đã được thêm thành công`,
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

  const handleView = (category) => {
    toast({
      title: 'Chi tiết danh mục',
      description: `Xem chi tiết ${category.name}`,
    });
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
        onOpenChange={setIsFormOpen}
        category={editingCategory}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
};

export default CategoryManagement;
