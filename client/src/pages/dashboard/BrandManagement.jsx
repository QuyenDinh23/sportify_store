import { useEffect, useState } from 'react';
import { DataTable } from '../../components/dashboard/DataTable';
import { BrandForm } from '../../components/dashboard/BrandForm';
import { Badge } from '../../components/ui/badge';
import { useToast } from '../../hooks/use-toast';
import { createBrand, fetchBrandsByPage, updateBrand } from '../../api/brand/brandApi';
import Pagination from '../../components/pagination/Pagination';

const BrandManagement = () => {
  const [brandList, setBrandList] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState();
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 10;
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
            className="w-20 h-20 object-contain rounded-md"
          />
        ) : (
          <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center text-xs">
            No Logo
          </div>
        ),
    },
    { key: 'name', label: 'Tên thương hiệu', sortable: true },
    {
      key: 'description',
      label: 'Mô tả',
      render: (value) =>
        value
          ? value.length > 100
            ? value.substring(0, 100) + "..."
            : value
          : "Chưa có mô tả",
    },
  ];

  const loadBrands = async () => {
    try {
      //Gọi API phân trang
      const res = await fetchBrandsByPage(currentPage, itemsPerPage, searchTerm);
      setBrandList(res.brands);
      setTotalPages(res.totalPages);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: `${error}`,
        variant: "destructive",
      });
    }
  }
  useEffect(() => {
      loadBrands();
  }, [currentPage, searchTerm, toast]);
  
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  const handleAdd = () => {
    setEditingBrand(undefined);
    setIsEditing(false);
    setIsReadOnly(false);
    setIsFormOpen(true);
  };

  const handleEdit = (brand) => {
    setEditingBrand(brand);
    setIsEditing(true);
    setIsFormOpen(true);
    setIsReadOnly(false);
  };

  const handleFormSubmit = async (brandData) => {
    try {
      if (brandData.id) {
        // Editing existing brand
        const updatedBrand = await updateBrand(brandData.id, brandData);
        //Cập nhật lại state brandList
        setBrandList((prev) =>
          prev.map((b) => (b.id === updatedBrand.id ? updatedBrand : b))
        );
        toast({
          title: 'Đã cập nhật thương hiệu',
          description: `${brandData.name} đã được cập nhật thành công`,
        });
      } else {
        // Adding new brand
        const newBrand = await createBrand(brandData);
        setBrandList([...brandList, newBrand]);
        toast({
          title: 'Đã thêm thương hiệu',
          description: `${brandData.name} đã được thêm thành công`,
        });
      }
      loadBrands();
    } catch (error) {
      console.log('error', error);
      toast({
        title: "Lỗi",
        description: `${error}` ,
        variant: "destructive",
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
    setEditingBrand(brand);
    setIsEditing(false);
    setIsReadOnly(true);
    setIsFormOpen(true);
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
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
      />

      <BrandForm
        open={isFormOpen}
        readonly={isReadOnly}
        editing={isEditing}
        onOpenChange={setIsFormOpen}
        brand={editingBrand}
        onSubmit={handleFormSubmit}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default BrandManagement;
