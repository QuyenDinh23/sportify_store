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
  fullName: z.string().trim().min(1, "Vui lòng nhập họ và tên"),
  email: z.string().email("Email không hợp lệ"),
  password: z
    .string()
    .optional()
    .superRefine((val, ctx) => {
      if (!val) return;
      const regex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
      if (!regex.test(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Mật khẩu phải tối thiểu 8 ký tự, gồm chữ cái thường, chữ cái hoa, chữ số và ký tự đặc biệt",
        });
      }
    }),

  phone: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true; // cho phép rỗng
        const regex = /^(0|\+84)(3|5|7|8|9)\d{8}$/;
        return regex.test(val);
      },
      { message: "Số điện thoại không hợp lệ (định dạng Việt Nam)" }
    ),

  dateOfBirth: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true; // cho phép rỗng
        const dob = new Date(val);
        const ageDifMs = Date.now() - dob.getTime();
        const ageDate = new Date(ageDifMs);
        const age = Math.abs(ageDate.getUTCFullYear() - 1970);
        return age >= 16 && age <= 100;
      },
      { message: "Tuổi phải từ 16 đến 100" }
    ),
  gender: z.enum(["male", "female", "other"]).superRefine((val, ctx) => {
    if (!val) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Vui lòng chọn giới tính",
      });
    }
  }),
  role: z
    .enum(["user", "admin", "staff-sale", "staff-content"])
    .superRefine((val, ctx) => {
      if (!val) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Vui lòng chọn vai trò",
        });
      }
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
    mode: "oncChange",

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
    setViewPassword(false);
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
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
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
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
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
            {errors.dateOfBirth && (
              <p className="text-sm text-destructive">
                {errors.dateOfBirth.message}
              </p>
            )}
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
            {errors.role && (
              <p className="text-sm text-destructive">
                {errors.role.message}
              </p>
            )}
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
