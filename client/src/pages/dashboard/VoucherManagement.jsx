import { useEffect, useState, useCallback } from "react";
import { DataTable } from "../../components/dashboard/DataTable";
import { VoucherForm } from "../../components/dashboard/VoucherForm";
import { Badge } from "../../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { useToast } from "../../hooks/use-toast";
import { voucherApi } from "../../services/voucherApi";
import Pagination from "../../components/pagination/Pagination";

const VoucherManagement = () => {
  const [vouchers, setVouchers] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedDiscountType, setSelectedDiscountType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 10;
  const { toast } = useToast();

  // Định dạng tiền tệ
  const formatCurrency = (value) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);

  // Load danh sách voucher theo trang
  const loadVouchers = useCallback(async () => {
    try {
      const res = await voucherApi.getByPage(
        currentPage,
        itemsPerPage,
        searchTerm
      );
      setVouchers(res.vouchers);
      setTotalPages(res.totalPages);
    } catch (error) {
      toast({
        title: "Lỗi tải voucher",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [currentPage, itemsPerPage, searchTerm, toast]);

  useEffect(() => {
    loadVouchers();
  }, [loadVouchers]);

  // ✅ Khi thêm mới: đảm bảo reset form (xoá dữ liệu voucher cũ)
  const handleAdd = () => {
    setEditingVoucher(null);
    // mở form sau 1 tick để VoucherForm nhận props mới (tránh render cũ)
    setTimeout(() => setIsFormOpen(true), 0);
  };

  // Sửa voucher
  const handleEdit = (voucher) => {
    setEditingVoucher(voucher);
    setIsFormOpen(true);
  };

  // Xóa voucher
  const handleDelete = async (voucher) => {
    try {
      await voucherApi.delete(voucher._id);
      setVouchers((prev) => prev.filter((v) => v._id !== voucher._id));
      toast({
        title: "Đã xóa voucher",
        description: `${voucher.code} đã được xóa thành công.`,
      });
    } catch (error) {
      toast({
        title: "Lỗi xóa voucher",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Submit form
  const handleFormSubmit = async (data) => {
    try {
      if (editingVoucher) {
        const updated = await voucherApi.update(editingVoucher._id, data);
        toast({
          title: "Cập nhật voucher thành công",
          description: `${updated.voucher.code} đã được cập nhật.`,
        });
      } else {
        const created = await voucherApi.create(data);
        toast({
          title: "Tạo voucher thành công",
          description: `${created.voucher.code} đã được thêm.`,
        });
      }
      loadVouchers();
      // ✅ Đóng form và reset lại sau khi xử lý
      setIsFormOpen(false);
      setEditingVoucher(null);
    } catch (error) {
      toast({
        title: "Lỗi xử lý",
        description: error.message || "Có lỗi xảy ra",
        variant: "destructive",
      });
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Lọc theo trạng thái + loại giảm giá
  const filteredVouchers = vouchers.filter((v) => {
    const statusMatch =
      selectedStatus === "all" ||
      (selectedStatus === "active" && v.isActive) ||
      (selectedStatus === "inactive" && !v.isActive);
    const discountMatch =
      selectedDiscountType === "all" || v.discountType === selectedDiscountType;
    return statusMatch && discountMatch;
  });

  // Cấu hình cột bảng
  const columns = [
    { key: "code", label: "Mã Voucher", sortable: true },
    {
      key: "discountType",
      label: "Loại giảm giá",
      render: (value) =>
        value === "fixed" ? "Giảm theo số tiền" : "Giảm theo phần trăm",
    },
    {
      key: "discountValue",
      label: "Giá trị giảm",
      render: (value, item) =>
        item.discountType === "fixed" ? formatCurrency(value) : `${value}%`,
    },
    {
      key: "minOrderAmount",
      label: "Giá trị tối thiểu",
      render: (value) => formatCurrency(value),
    },
    {
      key: "usageLimit",
      label: "Giới hạn sử dụng",
      render: (value) => (value === 0 ? "Không giới hạn" : value),
    },
    {
      key: "startDate",
      label: "Thời gian áp dụng",
      render: (value, item) => (
        <div>
          {new Date(item.startDate).toLocaleDateString("vi-VN")} →{" "}
          {new Date(item.endDate).toLocaleDateString("vi-VN")}
        </div>
      ),
    },
    {
      key: "isActive",
      label: "Trạng thái",
      render: (value) => (
        <Badge variant={value ? "default" : "secondary"}>
          {value ? "Hoạt động" : "Hết hạn / Vô hiệu"}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Quản lý mã giảm giá</h1>
        <p className="text-muted-foreground">
          Quản lý tất cả voucher trong hệ thống
        </p>
      </div>

      {/* Bộ lọc */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc voucher</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Trạng thái</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="active">Hoạt động</SelectItem>
                  <SelectItem value="inactive">Không hoạt động</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Loại giảm giá</label>
              <Select
                value={selectedDiscountType}
                onValueChange={setSelectedDiscountType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại giảm giá" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="fixed">Giảm theo số tiền</SelectItem>
                  <SelectItem value="percentage">
                    Giảm theo phần trăm
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bảng voucher */}
      <DataTable
        title={`Danh sách mã giảm giá (${filteredVouchers.length})`}
        data={filteredVouchers}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchPlaceholder="Tìm kiếm mã giảm giá..."
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
      />

      {/* Form tạo / sửa */}
      <VoucherForm
        key={editingVoucher ? editingVoucher._id : "new"} // ✅ ép React remount form khi đổi mode
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingVoucher(null);
        }}
        onSubmit={handleFormSubmit}
        voucher={editingVoucher}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default VoucherManagement;
