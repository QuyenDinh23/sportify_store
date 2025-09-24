import { useEffect, useState } from 'react';
import { subcategories, categories, brands } from '../../data/mockData';
import { DataTable } from '../../components/dashboard/DataTable';
import { SubcategoryForm } from '../../components/dashboard/SubCategoryForm';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Plus } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { getSubcategories } from '../../api/category/subCategoryApi';
import { getBrands } from '../../api/brand/brandApi';

const SubcategoryManagement = () => {
  const [subcategoryList, setSubcategoryList] = useState(subcategories);
  const [categoryList, setCategoryList] = useState(categories);
  const [brandList, setBrandList] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState(undefined);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  // Filter subcategories based on selected category
  // const filteredSubcategories =
  //   selectedCategoryFilter === 'all'
  //     ? subcategoryList
  //     : subcategoryList.filter((sc) => sc.categoryId === selectedCategoryFilter);

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
      const res = await getSubcategories(); 
      setSubcategoryList(res); 
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
      console.log("brand data", res);
      setBrandList(res);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: `${error}`,
        variant: "destructive",
      });
    }
  }

  useEffect(() => {
    loadSubcategories();
    loadBrands();
  }, [toast]);

  const handleAdd = () => {
    setEditingSubcategory(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (subcategory) => {
    setEditingSubcategory(subcategory);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (subcategoryData) => {
    if (subcategoryData.id) {
      // Editing existing subcategory
      setSubcategoryList(
        subcategoryList.map((sc) =>
          sc.id === subcategoryData.id ? { ...subcategoryData, id: subcategoryData.id } : sc
        )
      );

      // Update brands' subcategoryId
      setBrandList(
        brandList.map((brand) => {
          if (subcategoryData.brands.some((b) => b.id === brand.id)) {
            return { ...brand, subcategoryId: subcategoryData.id };
          }
          if (
            brand.subcategoryId === subcategoryData.id &&
            !subcategoryData.brands.some((b) => b.id === brand.id)
          ) {
            return { ...brand, subcategoryId: '' };
          }
          return brand;
        })
      );

      toast({
        title: 'Đã cập nhật danh mục con',
        description: `${subcategoryData.name} đã được cập nhật thành công`,
      });
    } else {
      // Adding new subcategory
      const newSubcategory = {
        ...subcategoryData,
        id: `subcategory_${Date.now()}`,
      };
      setSubcategoryList([...subcategoryList, newSubcategory]);

      // Update brands' subcategoryId
      setBrandList(
        brandList.map((brand) =>
          subcategoryData.brands.some((b) => b.id === brand.id)
            ? { ...brand, subcategoryId: newSubcategory.id }
            : brand
        )
      );

      toast({
        title: 'Đã thêm danh mục con',
        description: `${subcategoryData.name} đã được thêm thành công`,
      });
    }
  };

  const handleDelete = (subcategory) => {
    setSubcategoryList(subcategoryList.filter((sc) => sc.id !== subcategory.id));

    // Remove subcategoryId from brands
    setBrandList(
      brandList.map((brand) =>
        brand.subcategoryId === subcategory.id ? { ...brand, subcategoryId: '' } : brand
      )
    );

    toast({
      title: 'Đã xóa danh mục con',
      description: `${subcategory.name} đã được xóa khỏi danh sách`,
    });
  };

  const handleView = (subcategory) => {
    console.log("subcategory", subcategory);
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
        headerActions={
          <div className="flex gap-2">
            <Select value={selectedCategoryFilter} onValueChange={setSelectedCategoryFilter}>
              <SelectTrigger className="w-48 bg-background">
                <SelectValue placeholder="Lọc theo danh mục" />
              </SelectTrigger>
              <SelectContent className="bg-background border shadow-md z-50">
                <SelectItem value="all">Tất cả danh mục</SelectItem>
                {categoryList.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
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
    </div>
  );
};

export default SubcategoryManagement;
