import { useEffect, useState } from "react";
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
// import {
//   createVoucher,
//   updateVoucher,
//   deleteVoucher,
//   getAllVouchers,
// } from "../../api/voucher/voucherApi";
import { voucherApi } from "../../services/voucherApi";

const VoucherManagement = () => {
  const [vouchers, setVouchers] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedDiscountType, setSelectedDiscountType] = useState("all");
  const { toast } = useToast();

  const formatCurrency = (value) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);

  const loadVouchers = async () => {
    try {
      const res = await voucherApi.getAll();
      setVouchers(res);
    } catch (error) {
      toast({
        title: "Lỗi tải voucher",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadVouchers();
  }, []);

  const handleAdd = () => {
    setEditingVoucher(null);
    setIsFormOpen(true);
  };

  const handleEdit = (voucher) => {
    setEditingVoucher(voucher);
    setIsFormOpen(true);
  };

  const handleDelete = async (voucher) => {
    try {
      await voucherApi.delete(voucher._id);
      setVouchers(vouchers.filter((v) => v._id !== voucher._id));
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

  const handleFormSubmit = async (data) => {
    try {
      if (editingVoucher) {
        const updated = await voucherApi.update(editingVoucher._id, data);
        setVouchers((prev) =>
          prev.map((v) => (v._id === updated._id ? updated : v))
        );
        toast({
          title: "Cập nhật voucher thành công",
          description: `${updated.code} đã được cập nhật.`,
        });
      } else {
        console.log("he");
        
        const created = await voucherApi.create(data);
        setVouchers([...vouchers, created]);
        toast({
          title: "Tạo voucher thành công",
          description: `${created.code} đã được thêm.`,
        });
      }
    } catch (error) {
      toast({
        title: "Lỗi xử lý",
        // description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredVouchers = vouchers.filter((v) => {
    const statusMatch =
      selectedStatus === "all" ||
      (selectedStatus === "active" && v.isActive) ||
      (selectedStatus === "inactive" && !v.isActive);
    const discountMatch =
      selectedDiscountType === "all" || v.discountType === selectedDiscountType;
    return statusMatch && discountMatch;
  });

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
          <div>
            {new Date(item.startDate).toLocaleDateString("vi-VN")} →{" "}
            {new Date(item.endDate).toLocaleDateString("vi-VN")}
          </div>
        </div>
      ),
    },
    {
      key: "isActive",
      label: "Trạng thái",
      render: (value, item) => (
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
      />

      {/* Form tạo / sửa */}
      <VoucherForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingVoucher(null);
        }}
        onSubmit={handleFormSubmit}
        // voucher={editingVoucher}
      />
    </div>
  );
};

export default VoucherManagement;
