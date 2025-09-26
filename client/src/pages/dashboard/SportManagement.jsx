import { useEffect, useState } from 'react';
import { DataTable } from '../../components/dashboard/DataTable';
import { SportForm } from '../../components/dashboard/SportForm';
import { useToast } from '../../hooks/use-toast';
import { createSport, fetchSportsByPage, updateSport } from '../../api/sport/sportApi';
import Pagination from '../../components/pagination/Pagination';

const SportManagement = () => {
  const [sports, setSports] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSport, setEditingSport] = useState(null);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 10;
  const { toast } = useToast();

  const columns = [
    {
      key: 'icon',
      label: 'Icon',
      render: (value) => <span className="text-2xl">{value}</span>,
    },
    { key: 'name', label: 'Tên môn thể thao', sortable: true },
    { key: 'description', label: 'Mô tả', sortable: true },
  ];
  const loadSports = async () => {
    try {
      //Gọi API lấy danh sách sports
      const res = await fetchSportsByPage(currentPage, itemsPerPage, searchTerm);
      setSports(res.sports);
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
    loadSports();
  }, [currentPage, searchTerm, toast]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  const handleAdd = () => {
    setEditingSport(undefined);
    setIsEditing(false);
    setIsReadOnly(false);
    setIsFormOpen(true);
  };

  const handleEdit = (sport) => {
    setEditingSport(sport);
    setIsFormOpen(true);
    setIsReadOnly(false);
    setIsEditing(true);
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
    setEditingSport(sport);
    setIsFormOpen(true);
    setIsReadOnly(true);
    setIsEditing(false);
  };

  const handleFormSubmit = async (sportData) => {
    try {
      if (sportData.id) {
        // Update existing sport
        const updatedSport = await updateSport(sportData.id, sportData);
        //Cap nhap lai state
        setSports(sports.map((s) => (s.id === updatedSport.id ? updatedSport : s)));
        toast({
          title: 'Đã cập nhật môn thể thao',
          description: `${sportData.name} đã được cập nhật thành công`,
        });
      } else {
        // Add new sport
        const newSport = await createSport(sportData);
        setSports([...sports, newSport]);
        toast({
          title: 'Đã thêm môn thể thao',
          description: `${sportData.name} đã được thêm vào danh sách`,
        });
      }
      loadSports();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: `${error}` ,
        variant: "destructive",
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
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
      />

      <SportForm
        sport={editingSport}
        readonly={isReadOnly}
        editing={isEditing}
        isOpen={isFormOpen}
        onClose={handleFormClose}
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

export default SportManagement;
