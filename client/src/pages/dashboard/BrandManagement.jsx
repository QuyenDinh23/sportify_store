import { useState } from 'react';
import { brands, subcategories } from '../../data/mockData';
import { DataTable } from '../../components/dashboard/DataTable';
import { BrandForm } from '../../components/dashboard/BrandForm';
import { Badge } from '../../components/ui/badge';
import { useToast } from '../../hooks/use-toast';

const BrandManagement = () => {
  const [brandList, setBrandList] = useState(brands);
  const [subcategoryList] = useState(subcategories);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState();
  const { toast } = useToast();

  const columns = [
    {
      key: 'logo',
      label: 'Logo',
      render: (value) =>
        value ? (
          <img
            src={value}
            alt="Brand logo"
            className="w-12 h-12 object-cover rounded-md"
          />
        ) : (
          <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center text-xs">
            No Logo
          </div>
        ),
    },
    { key: 'name', label: 'Tên thương hiệu', sortable: true },
    {
      key: 'subcategoryId',
      label: 'Danh mục con',
      sortable: true,
      render: (value) => {
        const subcategory = subcategoryList.find((sc) => sc.id === value);
        return subcategory ? (
          <Badge variant="outline">{subcategory.name}</Badge>
        ) : (
          'N/A'
        );
      },
    },
    {
      key: 'subBrands',
      label: 'Dòng sản phẩm',
      render: (value = []) => (
        <div className="flex flex-wrap gap-1">
          {value.slice(0, 2).map((sub, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {sub.name}
            </Badge>
          ))}
          {value.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{value.length - 2} khác
            </Badge>
          )}
          {value.length === 0 && (
            <span className="text-muted-foreground text-sm">Chưa có</span>
          )}
        </div>
      ),
    },
    {
      key: 'description',
      label: 'Mô tả',
      render: (value) => value || 'Chưa có mô tả',
    },
  ];

  const handleAdd = () => {
    setEditingBrand(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (brand) => {
    setEditingBrand(brand);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (brandData) => {
    if (brandData.id) {
      // Editing existing brand
      setBrandList(
        brandList.map((b) =>
          b.id === brandData.id ? { ...brandData, id: brandData.id } : b
        )
      );
      toast({
        title: 'Đã cập nhật thương hiệu',
        description: `${brandData.name} đã được cập nhật thành công`,
      });
    } else {
      // Adding new brand
      const newBrand = {
        ...brandData,
        id: `brand_${Date.now()}`,
      };
      setBrandList([...brandList, newBrand]);
      toast({
        title: 'Đã thêm thương hiệu',
        description: `${brandData.name} đã được thêm thành công`,
      });
    }
  };

  const handleDelete = (brand) => {
    setBrandList(brandList.filter((b) => b.id !== brand.id));
    toast({
      title: 'Đã xóa thương hiệu',
      description: `${brand.name} đã được xóa khỏi danh sách`,
    });
  };

  const handleView = (brand) => {
    toast({
      title: 'Chi tiết thương hiệu',
      description: `Xem chi tiết ${brand.name}`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Quản lý thương hiệu</h1>
        <p className="text-muted-foreground">
          Quản lý thương hiệu được gán vào danh mục con
        </p>
      </div>

      <DataTable
        title={`Danh sách thương hiệu (${brandList.length})`}
        data={brandList}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        searchPlaceholder="Tìm kiếm thương hiệu..."
      />

      <BrandForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        brand={editingBrand}
        subcategories={subcategoryList}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
};

export default BrandManagement;
