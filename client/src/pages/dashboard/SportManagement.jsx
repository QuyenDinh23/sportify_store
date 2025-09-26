import { useState } from 'react';
import { sportCategories } from '../../data/mockData';
import { DataTable } from '../../components/dashboard/DataTable';
import { SportForm } from '../../components/dashboard/SportForm';
import { useToast } from '../../hooks/use-toast';

const SportManagement = () => {
  const [sports, setSports] = useState(sportCategories);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSport, setEditingSport] = useState(null);
  const { toast } = useToast();

  const columns = [
    {
      key: 'icon',
      label: 'Icon',
      render: (value) => <span className="text-2xl">{value}</span>,
    },
    { key: 'name', label: 'Tên môn thể thao', sortable: true },
    { key: 'id', label: 'Mã môn thể thao', sortable: true },
    { key: 'description', label: 'Mô tả', sortable: true },
  ];

  const handleAdd = () => {
    setEditingSport(null);
    setIsFormOpen(true);
  };

  const handleEdit = (sport) => {
    setEditingSport(sport);
    setIsFormOpen(true);
  };

  const handleDelete = (sport) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa môn thể thao "${sport.name}"?`)) {
      setSports(sports.filter((s) => s.id !== sport.id));
      toast({
        title: 'Đã xóa môn thể thao',
        description: `${sport.name} đã được xóa khỏi danh sách`,
      });
    }
  };

  const handleView = (sport) => {
    toast({
      title: 'Chi tiết môn thể thao',
      description: `Xem chi tiết ${sport.name}`,
    });
  };

  const handleFormSubmit = (sportData) => {
    if (editingSport) {
      // Update existing sport
      setSports(sports.map((s) => (s.id === editingSport.id ? sportData : s)));
      toast({
        title: 'Đã cập nhật môn thể thao',
        description: `${sportData.name} đã được cập nhật thành công`,
      });
    } else {
      // Add new sport
      setSports([...sports, sportData]);
      toast({
        title: 'Đã thêm môn thể thao',
        description: `${sportData.name} đã được thêm vào danh sách`,
      });
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingSport(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Quản lý môn thể thao</h1>
        <p className="text-muted-foreground">Quản lý các môn thể thao và phân loại</p>
      </div>

      <DataTable
        title={`Danh sách môn thể thao (${sports.length})`}
        data={sports}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        searchPlaceholder="Tìm kiếm môn thể thao..."
      />

      <SportForm
        sport={editingSport}
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
};

export default SportManagement;
