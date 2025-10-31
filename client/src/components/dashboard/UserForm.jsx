import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../components/ui/select";
import { Eye, EyeOff } from "lucide-react";
import { userApi } from "../../services/userApi";

// ✅ Schema xác thực dữ liệu
const userSchema = z.object({
  fullName: z.string().min(1, "Vui lòng nhập họ và tên"),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().optional(),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["male", "female", "other"], {
    errorMap: () => ({ message: "Vui lòng chọn giới tính" }),
  }),
  role: z.enum(["user", "admin", "staff-sale", "staff-content"], {
    errorMap: () => ({ message: "Vui lòng chọn vai trò" }),
  }),
});

export const UserForm = ({ isOpen, onClose, onSubmit, user, readonly }) => {
  const [viewPassword, setViewPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      phone: "",
      dateOfBirth: "",
      gender: "",
      role: "",
    },
  });

  const togglePassword = () => {
    if (!viewPassword) {
      setViewPassword(true);
    }
    if (viewPassword) {
      setViewPassword(false);
    }
  };

  // ✅ gọi API check email khi blur
  const handleCheckEmail = async (email) => {
    if (!email) return true;

    try {
      const res = await userApi.checkEmailDuplicate(email);
      if (!res.exists) {
        return res.exists;
      }
    } catch (error) {
      console.error(error);
      setEmailError(error);
      return true;
    }
  };

  useEffect(() => {
    setViewPassword(false)
    if (user) {
      reset({
        fullName: user.fullName || "",
        email: user.email || "",
        password: "",
        phone: user.phone || "",
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split("T")[0] : "",
        gender: user.gender || "",
        role: user.role || "",
      });
    } else {
      reset({});
    }
  }, [user, isOpen, onClose]);

  const onFormSubmit = async (data) => {
    if (!user) {
      const check = await handleCheckEmail(data.email);
      if (check) return;
    }
    onSubmit(data);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {readonly
              ? "Xem thông tin người dùng"
              : user
              ? "Chỉnh sửa người dùng"
              : "Thêm người dùng mới"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            {/* Họ và tên */}
            <div style={{ flex: 1, marginRight: "5px" }}>
              <Label>Họ và tên</Label>
              <Controller
                name="fullName"
                control={control}
                render={({ field }) => <Input {...field} disabled={readonly} />}
              />
              {errors.fullName && (
                <p className="text-sm text-destructive">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div style={{ flex: 1, marginLeft: "5px" }}>
              <Label>Email</Label>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    disabled={readonly || !!user}
                    onInput={() => setEmailError("")}
                  />
                )}
              />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
              {emailError && (
                <p className="text-sm text-destructive">{emailError}</p>
              )}
            </div>
          </div>

          {/* Password (chỉ khi thêm mới hoặc muốn đổi) */}
          {!readonly && (
            <div style={{ position: "relative" }}>
              <Label>Mật khẩu</Label>
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type={viewPassword ? "text" : "password"}
                    placeholder={
                      user ? "Để trống nếu không đổi" : "Nhập mật khẩu"
                    }
                    style={{ paddingRight: "40px" }}
                  />
                )}
              />
              <div
                onClick={togglePassword}
                style={{
                  position: "absolute",
                  top: "50%",
                  right: "10px",
                  cursor: "pointer",
                  color: "#6b7280", // text-gray-500
                }}
              >
                {viewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </div>
            </div>
          )}

          {/* Phone */}
          <div>
            <Label>Số điện thoại</Label>
            <Controller
              name="phone"
              control={control}
              render={({ field }) => <Input {...field} disabled={readonly} />}
            />
          </div>

          {/* Ngày sinh */}
          <div>
            <Label>Ngày sinh</Label>
            <Controller
              name="dateOfBirth"
              control={control}
              render={({ field }) => (
                <Input type="date" {...field} disabled={readonly} />
              )}
            />
          </div>

          {/* Giới tính */}
          <div>
            <Label>Giới tính</Label>
            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={readonly}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn giới tính" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Nam</SelectItem>
                    <SelectItem value="female">Nữ</SelectItem>
                    <SelectItem value="other">Khác</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.gender && (
              <p className="text-sm text-destructive">
                {errors.gender.message}
              </p>
            )}
          </div>

          {/* Vai trò */}
          <div>
            <Label>Vai trò</Label>
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={readonly}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn vai trò" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Người dùng</SelectItem>
                    <SelectItem value="admin">Quản trị viên</SelectItem>
                    <SelectItem value="staff-sale">
                      Nhân viên bán hàng
                    </SelectItem>
                    <SelectItem value="staff-content">
                      Nhân viên nội dung
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            {!readonly && (
              <Button type="submit">{user ? "Cập nhật" : "Thêm mới"}</Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
