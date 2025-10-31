import { useEffect, useState } from "react";
import { DataTable } from "../../components/dashboard/DataTable";
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
import Pagination from "../../components/pagination/Pagination";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { userApi } from "../../services/userApi";
import { UserForm } from "../../components/dashboard/UserForm";

const UsersManagement = () => {
  const [typeUser, setTypeUser] = useState("customer");
  const [customers, setCustomers] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isReadOnly, setIsReadOnly] = useState(false);
  const itemsPerPage = 10;
  const [toggleDialogOpen, setToggleDialogOpen] = useState(false);
  const [userToToggle, setUserToToggle] = useState(null);
  const [selectedUserStatus, setSelectedUserStatus] = useState("active");
  const [selectedTypeStaff, setSelectedTypeStaff] = useState("all");
  const { toast } = useToast();

  const columns = [
    {
      key: "userNumber",
      label: "Mã người dùng",
      render: (value) => (
        <span className="font-medium text-sm">{value || "-"}</span>
      ),
    },
    {
      key: "fullName",
      label: "Họ và tên",
      sortable: true,
      render: (value) => <span className="font-medium">{value}</span>,
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
      render: (value) => (
        <span className="text-sm text-muted-foreground">{value}</span>
      ),
    },
    {
      key: "phone",
      label: "Số điện thoại",
      render: (value) => <span>{value || "-"}</span>,
    },
    {
      key: "gender",
      label: "Giới tính",
      render: (value) => {
        const genderMap = {
          male: "Nam",
          female: "Nữ",
          other: "Khác",
        };
        return <span>{genderMap[value] || "-"}</span>;
      },
    },
    {
      key: "dateOfBirth",
      label: "Ngày sinh",
      render: (value) => {
        if (!value) return "-";
        const date = new Date(value);
        return date.toLocaleDateString("vi-VN");
      },
    },
    {
      key: "role",
      label: "Vai trò",
      sortable: true,
      render: (value) => {
        const roleMap = {
          user: "Người dùng",
          admin: "Quản trị viên",
          "staff-sale": "Nhân viên bán hàng",
          "staff-content": "Nhân viên nội dung",
        };
        const variantMap = {
          admin: "default",
          "staff-sale": "secondary",
          "staff-content": "outline",
          user: "muted",
        };
        return (
          <Badge variant={variantMap[value] || "secondary"}>
            {roleMap[value]}
          </Badge>
        );
      },
    },
    {
      key: "status",
      label: "Trạng thái",
      render: (_, item) => (
        <Badge variant={item.status === "active" ? "default" : "secondary"}>
          {item.status === "active" ? "Hoạt động" : "Không hoạt động"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: "Ngày tạo",
      render: (value) => {
        if (!value) return "-";
        const date = new Date(value);
        return date.toLocaleString("vi-VN");
      },
    },
  ];

  const loadUsers = async () => {
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm || "",
      };
      if (selectedUserStatus !== "all") params.status = selectedUserStatus;
      // if (selectedSubcategory !== "all")
      //   params.subcategory = selectedSubcategory;
      // if (selectedBrand !== "all") params.brand = selectedBrand;
      // if (selectedSport !== "all") params.sport = selectedSport;
      const res = await userApi.getAllCustomers(params);
      setCustomers(res.customers);
      setTotalPages(res.totalPages);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: `${error.message || error}`,
        variant: "destructive",
      });
    }
  };
  const loadStaffs = async () => {
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm || "",
      };
      if (selectedUserStatus !== "all") params.status = selectedUserStatus;
      if (selectedTypeStaff !== "all") params.role = selectedTypeStaff;
      // if (selectedBrand !== "all") params.brand = selectedBrand;
      // if (selectedSport !== "all") params.sport = selectedSport;
      const res = await userApi.getAllStaffs(params);
      setCustomers(res.staffs);

      setTotalPages(res.totalPages);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: `${error.message || error}`,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (typeUser === "customer") {
      loadUsers();
    }
    if (typeUser === "staff") {
      loadStaffs();
    }
  }, [
    searchTerm,
    currentPage,
    typeUser,
    selectedUserStatus,
    selectedTypeStaff,
    userToToggle
  ]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  const handleAdd = () => {
    setEditingUser(undefined);
    setIsFormOpen(true);
    setIsReadOnly(false);
  };

  const handleEdit = (customer) => {
    setEditingUser(customer);
    setIsFormOpen(true);
    setIsReadOnly(false);
  };

  const handleToggleStatus = (user) => {
    setUserToToggle(user);
    setToggleDialogOpen(true);
  };

  const confirmToggleStatus = async () => {
    if (!userToToggle) return;

    try {
      const res = await userApi.toggleStatusCustomer(userToToggle._id);
      console.log(res);

      const updatedUser = res.updatedUser;
      setCustomers((prev) =>
        prev.map((u) => (u._id === updatedUser._id ? updatedUser : u))
      );

      toast({
        title: "Thành công",
        description: res.message,
      });

      setToggleDialogOpen(false);
      setUserToToggle(null);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật trạng thái sản phẩm",
        variant: "destructive",
      });
    }
  };

  const handleFormSubmit = async (userData) => {
    try {
      if (editingUser) {
        const updatedUser = await userApi.editAccount(
          editingUser._id,
          userData
        );
        setCustomers(
          customers.map((p) => (p._id === updatedUser._id ? updatedUser : p))
        );
        toast({
          title: "Đã cập nhật người dùng",
          description: `Người dùng số ${updatedUser.userNumber} đã được cập nhật thành công`,
        });
      } else {
        const newUser = await userApi.createAccount(userData);
        setCustomers([...customers, newUser]);
        toast({
          title: "Đã tạo tài khoản",
          description: `Người dùng số ${newUser.user.userNumber} đã được thêm vào danh sách`,
        });
      }
      if (typeUser === "customer") {
        loadUsers();
      }
      if (typeUser === "staff") {
        loadStaffs();
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: `${error}`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Quản lý người dùng</h1>
        <p className="text-muted-foreground">
          Quản lý tất cả người dùng trong hệ thông
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc người dùng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Trạng thái</label>
              <Select
                value={selectedUserStatus}
                onValueChange={(val) => {
                  setSelectedUserStatus(val);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái người dùng" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả người dùng</SelectItem>

                  <SelectItem key={1} value="active">
                    Hoạt động
                  </SelectItem>
                  <SelectItem key={2} value="inactive">
                    Không hoạt động
                  </SelectItem>
                  <SelectItem key={3} value="banned">
                    Bị cấm
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {typeUser === "staff" ? (
              <div>
                <label className="text-sm font-medium">Loại nhân viên</label>
                <Select
                  value={selectedTypeStaff}
                  onValueChange={(val) => {
                    setSelectedTypeStaff(val);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại nhân viên" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả nhân viên</SelectItem>

                    <SelectItem key={1} value="staff-sale">
                      Nhân viên bán hàng
                    </SelectItem>
                    <SelectItem key={2} value="staff-content">
                      Nhân viên nội dung
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : (
              ""
            )}
          </div>
        </CardContent>
      </Card>

      <div>
        <button
          onClick={() => setTypeUser("customer")}
          className=" border bg-card text-card-foreground shadow-sm"
          style={{
            width: "120px",
            height: "40px",
            backgroundColor: `${typeUser === "customer" ? "" : "#F0F0F0"}`,
          }}
        >
          Người dùng
        </button>
        <button
          onClick={() => setTypeUser("staff")}
          className=" border bg-card text-card-foreground shadow-sm"
          style={{
            width: "120px",
            height: "40px",
            backgroundColor: `${typeUser === "staff" ? "" : "#F0F0F0"}`,
          }}
        >
          Nhân viên
        </button>
      </div>
      <DataTable
        style={{
          paddingTop: "0",
          marginTop: "0px",
          borderTopLeftRadius: "0px",
        }}
        title={`${
          typeUser === "customer"
            ? "Danh sách người dùng"
            : "Danh sách nhân viên"
        } (${customers.length})`}
        data={customers}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onToggleStatus={handleToggleStatus}
        searchPlaceholder="Tìm kiếm người dùng..."
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
      />

      <UserForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingUser();
        }}
        onSubmit={handleFormSubmit}
        readonly={isReadOnly}
        user={editingUser}
        // categories={categories}
        // subcategories={subcategories}
        // onCategoryChange={handleCategoryChange}
        // brands={brands}
        // onSubCategoryChange={handleSubcategoryChange}
        // sports={sports}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      <AlertDialog open={toggleDialogOpen} onOpenChange={setToggleDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Xác nhận{" "}
              {userToToggle?.status === "active" ? "cấm tài khoản" : "bỏ cấm"}{" "}
              người dùng
            </AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn{" "}
              {userToToggle?.status === "active" ? "cấm tài khoản" : "bỏ cấm"}{" "}
              tài khoản số "{userToToggle?.userNumber}"?
              {userToToggle?.status === "active"
                ? " Tài khoản này sẽ bị chặn truy cập vào hệ thống."
                : " Tài khoản này sẽ được bỏ chặn và cho phép truy cập vào hệ thống."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmToggleStatus}>
              Xác nhận
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UsersManagement;
